import type { IncomingMessage, ServerResponse } from 'http';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

// Initialize Firebase Admin (once)
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

function verifySignature(rawBody: string, signature: string | undefined, secret: string): boolean {
    if (!signature) return false;

    // Paddle signature format: ts=TIMESTAMP;h1=HASH
    const parts: Record<string, string> = {};
    for (const pair of signature.split(';')) {
        const [key, value] = pair.split('=');
        if (key && value) parts[key] = value;
    }

    const ts = parts['ts'];
    const h1 = parts['h1'];
    if (!ts || !h1) return false;

    const payload = `${ts}:${rawBody}`;
    const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const computedBuf = Buffer.from(computed);
    const providedBuf = Buffer.from(h1);

    // timingSafeEqual throws if lengths differ (malformed h1) — treat that as invalid, not a 500
    if (computedBuf.length !== providedBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, providedBuf);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('PADDLE_WEBHOOK_SECRET not configured');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server configuration error' }));
        return;
    }

    const rawBody = await readBody(req);
    const signature = req.headers['paddle-signature'] as string | undefined;

    if (!verifySignature(rawBody, signature, webhookSecret)) {
        console.error('Invalid webhook signature');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid signature' }));
        return;
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event.event_type;

    console.log(`Paddle webhook: ${eventType}`);

    const handledEvents = [
        'transaction.completed',
        'subscription.canceled',
        'subscription.paused',
        'subscription.updated',
        'adjustment.created',
        'adjustment.updated',
    ];
    if (!handledEvents.includes(eventType)) {
        console.log(`Event ${eventType} not handled, acknowledging`);
    }

    try {
        if (eventType === 'transaction.completed') {
            const customData = event.data?.custom_data;
            const uid = customData?.uid;

            if (!uid) {
                console.error('No uid in custom_data');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ received: true, note: 'No uid, skipped' }));
                return;
            }

            const subscriptionId = event.data?.subscription_id || null;
            const transactionId = event.data?.id || null;

            const userRef = db.collection('users').doc(uid);
            const userSnap = await userRef.get();
            const currentStatus = userSnap.data()?.purchaseStatus;

            // Keep every transaction id: adjustments (refunds/chargebacks) reference
            // the specific disputed transaction, which may be an earlier renewal.
            const update: Record<string, unknown> = {
                paddleSubscriptionId: subscriptionId,
                paddleTransactionId: transactionId,
            };
            if (transactionId) {
                update.paddleTransactionIds = FieldValue.arrayUnion(transactionId);
            }

            if (currentStatus === 'refunded') {
                // Sticky revocation: a late/retried transaction.completed must not
                // silently re-activate a refunded/charged-back user.
                console.error(`User ${uid} has purchaseStatus 'refunded'; transaction ${transactionId} recorded but activation withheld — manual review required`);
            } else {
                update.purchaseStatus = 'active';
                update.purchaseDate = new Date().toISOString();
            }

            await userRef.set(update, { merge: true });

            if (currentStatus !== 'refunded') {
                console.log(`User ${uid} activated (transaction: ${transactionId})`);
            }
        }

        if (eventType === 'subscription.canceled') {
            const customData = event.data?.custom_data;
            const uid = customData?.uid;

            if (uid) {
                await db.collection('users').doc(uid).set({
                    purchaseStatus: 'canceled',
                    subscriptionStatus: 'canceled',
                    canceledAt: new Date().toISOString(),
                }, { merge: true });

                console.log(`User ${uid} subscription canceled`);
            } else {
                console.log('subscription.canceled without uid in custom_data, skipped');
            }
        }

        if (eventType === 'subscription.paused') {
            const customData = event.data?.custom_data;
            const uid = customData?.uid;

            if (uid) {
                // Paddle stops billing while paused — revoke access until resumed
                await db.collection('users').doc(uid).set({
                    purchaseStatus: 'paused',
                    subscriptionStatus: 'paused',
                    pausedAt: new Date().toISOString(),
                }, { merge: true });

                console.log(`User ${uid} subscription paused (access revoked while unbilled)`);
            } else {
                console.log('subscription.paused without uid in custom_data, skipped');
            }
        }

        // Refunds and chargebacks are modeled as adjustments in Paddle Billing.
        // Chargebacks (and small auto-approved refunds) can arrive already 'approved'
        // on adjustment.created, so handle both events with the same idempotent logic.
        if (eventType === 'adjustment.created' || eventType === 'adjustment.updated') {
            const action = event.data?.action;
            const status = event.data?.status;
            const adjustmentType = event.data?.type; // 'full' | 'partial'
            const adjustmentId = event.data?.id || null;
            const transactionId = event.data?.transaction_id;
            const subscriptionId = event.data?.subscription_id;

            // Chargebacks revoke regardless of type (the disputed charge is clawed
            // back); refunds only revoke when the full amount is returned.
            const isRevocation = status === 'approved'
                && (action === 'chargeback' || (action === 'refund' && adjustmentType === 'full'));
            // A won dispute reinstates the customer.
            const isReinstatement = status === 'approved' && action === 'chargeback_reverse';

            if (action === 'refund' && status === 'approved' && adjustmentType !== 'full') {
                console.log(`Approved partial refund ${adjustmentId} (transaction: ${transactionId}) — access kept, no status change`);
            } else if (!isRevocation && !isReinstatement) {
                console.log(`${eventType} ignored (id: ${adjustmentId}, action: ${action}, status: ${status})`);
            } else if (!transactionId && !subscriptionId) {
                console.log(`${eventType} ${adjustmentId} approved ${action} but has no transaction_id or subscription_id, skipped`);
            } else {
                // Adjustments carry no custom_data — resolve the user via the
                // stored transaction ids, falling back to the older single-id
                // field and then the subscription id.
                let userDoc = null;
                if (transactionId) {
                    let snapshot = await db.collection('users')
                        .where('paddleTransactionIds', 'array-contains', transactionId)
                        .limit(1)
                        .get();
                    if (snapshot.empty) {
                        snapshot = await db.collection('users')
                            .where('paddleTransactionId', '==', transactionId)
                            .limit(1)
                            .get();
                    }
                    userDoc = snapshot.docs[0] ?? null;
                }
                if (!userDoc && subscriptionId) {
                    const snapshot = await db.collection('users')
                        .where('paddleSubscriptionId', '==', subscriptionId)
                        .limit(1)
                        .get();
                    userDoc = snapshot.docs[0] ?? null;
                }

                if (!userDoc) {
                    if (action === 'chargeback') {
                        // Ask Paddle to retry: a delayed activation write may still land.
                        console.error(`No user found for chargeback adjustment ${adjustmentId} (transaction: ${transactionId}, subscription: ${subscriptionId}) — returning 500 for retry`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'User not found for chargeback' }));
                        return;
                    }
                    console.error(`No user found for ${action} adjustment ${adjustmentId} (transaction: ${transactionId}, subscription: ${subscriptionId}), skipped`);
                } else if (isReinstatement) {
                    await userDoc.ref.set({
                        purchaseStatus: 'active',
                        chargebackReversedAt: new Date().toISOString(),
                        paddleAdjustmentId: adjustmentId,
                    }, { merge: true });

                    console.log(`User ${userDoc.id} reinstated after won dispute (adjustment: ${adjustmentId}, transaction: ${transactionId})`);
                } else {
                    await userDoc.ref.set({
                        purchaseStatus: 'refunded',
                        refundedAt: new Date().toISOString(),
                        paddleAdjustmentId: adjustmentId,
                    }, { merge: true });

                    console.log(`User ${userDoc.id} marked refunded (${action}, adjustment: ${adjustmentId}, transaction: ${transactionId})`);
                }
            }
        }

        if (eventType === 'subscription.updated') {
            const customData = event.data?.custom_data;
            const uid = customData?.uid;
            const status = event.data?.status;

            if (!uid) {
                console.log(`subscription.updated without uid in custom_data, skipped (status: ${status})`);
            } else if (status === 'active') {
                const userRef = db.collection('users').doc(uid);
                const userSnap = await userRef.get();

                if (userSnap.data()?.purchaseStatus === 'refunded') {
                    // Sticky revocation: subscription.updated fires for trivial
                    // changes and must not re-activate a refunded user.
                    console.error(`subscription.updated active for user ${uid} but purchaseStatus is 'refunded' — re-activation withheld, manual review required`);
                } else {
                    await userRef.set({
                        purchaseStatus: 'active',
                        subscriptionStatus: 'active',
                    }, { merge: true });

                    console.log(`User ${uid} subscription active (reactivated if previously canceled)`);
                }
            } else if (status === 'paused') {
                // Paddle stops billing while paused — revoke access until resumed
                await db.collection('users').doc(uid).set({
                    purchaseStatus: 'paused',
                    subscriptionStatus: 'paused',
                    pausedAt: new Date().toISOString(),
                }, { merge: true });

                console.log(`User ${uid} subscription paused (access revoked while unbilled)`);
            } else if (status === 'past_due') {
                // Keep access while Paddle retries payment; just record the state
                await db.collection('users').doc(uid).set({
                    subscriptionStatus: 'past_due',
                }, { merge: true });

                console.log(`User ${uid} subscription past_due (access kept)`);
            } else if (status === 'canceled') {
                await db.collection('users').doc(uid).set({
                    purchaseStatus: 'canceled',
                    subscriptionStatus: 'canceled',
                    canceledAt: new Date().toISOString(),
                }, { merge: true });

                console.log(`User ${uid} subscription canceled (via subscription.updated)`);
            } else {
                console.log(`subscription.updated with status '${status}' for user ${uid}, no action taken`);
            }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true }));
    } catch (err) {
        console.error('Webhook processing error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Processing failed' }));
    }
}
