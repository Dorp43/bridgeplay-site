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

// Price id → human plan name for the receipt. Kept in sync with
// src/lib/paddle.ts PRICE_IDS.
const PLAN_NAMES: Record<string, string> = {
    pri_01kq6xc966dg5krhv67j0p3dpr: 'Monthly plan',
    pri_01kq6xh6gvfwr8csqbensbtkex: 'Yearly plan',
    pri_01kq6xk25va96vnhdm03mkaa33: 'Lifetime license',
};

// Price id → plan key stored on the user doc, so the app and website can show
// "Renews on…" / "Never expires" (lifetime).
const PLAN_KEYS: Record<string, 'monthly' | 'yearly' | 'lifetime'> = {
    pri_01kq6xc966dg5krhv67j0p3dpr: 'monthly',
    pri_01kq6xh6gvfwr8csqbensbtkex: 'yearly',
    pri_01kq6xk25va96vnhdm03mkaa33: 'lifetime',
};

interface PaddleTransactionData {
    id?: string;
    currency_code?: string;
    customer?: { email?: string };
    items?: { price?: { id?: string; name?: string } }[];
    details?: { totals?: { grand_total?: string; currency_code?: string } };
    billing_period?: { starts_at?: string; ends_at?: string };
}

/// "3999" + "USD" → "$39.99". Falls back to "<code> <amount>" for currencies
/// without a known symbol.
function formatAmount(minorUnits: string | undefined, currency: string | undefined): string {
    const cur = (currency || 'USD').toUpperCase();
    const cents = Number(minorUnits);
    if (!Number.isFinite(cents)) return '';
    const major = (cents / 100).toFixed(2);
    const symbol: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    return symbol[cur] ? `${symbol[cur]}${major}` : `${cur} ${major}`;
}

function receiptHTML(opts: { planName: string; amount: string; dateStr: string; orderId: string }): string {
    const { planName, amount, dateStr, orderId } = opts;
    const row = (label: string, value: string) =>
        `<tr><td style="padding:8px 0;color:#9aa5b8;font-size:13px">${label}</td><td style="padding:8px 0;color:#ffffff;font-size:13px;text-align:right;font-weight:600">${value}</td></tr>`;
    return `<!doctype html><html><body style="margin:0;padding:0;background:#0b0f17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f17;padding:40px 16px"><tr><td align="center">
    <table role="presentation" width="460" cellpadding="0" cellspacing="0" style="max-width:460px;width:100%;background:#121826;border:1px solid #232b3d;border-radius:16px;padding:36px 32px">
      <tr><td style="padding-bottom:8px"><span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px">Bridge<span style="color:#4a9eff">Play</span></span></td></tr>
      <tr><td style="color:#6dd5a0;font-size:13px;font-weight:700;letter-spacing:0.3px;text-transform:uppercase;padding-bottom:6px">Payment received</td></tr>
      <tr><td style="color:#ffffff;font-size:22px;font-weight:800;padding-bottom:10px;letter-spacing:-0.4px">Thank you for your purchase</td></tr>
      <tr><td style="color:#9aa5b8;font-size:14px;line-height:1.6;padding-bottom:24px">Your BridgePlay license is active. Open the app — it unlocks automatically, no code to enter.</td></tr>
      <tr><td style="padding:0 0 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #232b3d;border-bottom:1px solid #232b3d">
        ${row('Item', planName)}
        ${row('Amount paid', amount)}
        ${row('Date', dateStr)}
        ${row('Order ID', orderId)}
      </table></td></tr>
      <tr><td align="center" style="padding:28px 0 4px">
        <a href="https://bridgeplay.app/account" style="display:inline-block;background:linear-gradient(135deg,#4a9eff,#3b82f6);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 32px;border-radius:12px">Manage your account</a>
      </td></tr>
      <tr><td style="color:#5d6a80;font-size:12px;line-height:1.6;border-top:1px solid #232b3d;padding-top:20px;margin-top:20px">
        Paddle is our authorized reseller and merchant of record; a separate tax invoice from Paddle may also arrive. Questions? Just reply to this email.<br>7-day money-back guarantee.
      </td></tr>
    </table>
    <table role="presentation" width="460" cellpadding="0" cellspacing="0" style="max-width:460px;width:100%"><tr><td style="color:#5d6a80;font-size:11px;padding:20px 8px;text-align:center">BridgePlay — Play Windows games on your Mac · <a href="https://bridgeplay.app" style="color:#5d6a80">bridgeplay.app</a></td></tr></table>
  </td></tr></table>
</body></html>`;
}

/// Sends a branded purchase receipt via Resend. Best-effort: a failure here
/// must never fail the webhook (the licence is already active). Returns silently
/// if the mailer isn't configured.
async function sendReceiptEmail(to: string, data: PaddleTransactionData): Promise<void> {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || !to) return;

    const priceId = data.items?.[0]?.price?.id;
    const planName = (priceId && PLAN_NAMES[priceId]) || data.items?.[0]?.price?.name || 'BridgePlay license';
    const amount = formatAmount(data.details?.totals?.grand_total, data.details?.totals?.currency_code || data.currency_code);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const orderId = data.id || '—';

    try {
        const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: 'BridgePlay <noreply@bridgeplay.app>',
                to: [to],
                subject: 'Your BridgePlay receipt',
                html: receiptHTML({ planName, amount, dateStr, orderId }),
            }),
        });
        if (!resp.ok) {
            console.error('receipt email failed:', resp.status, (await resp.text()).slice(0, 200));
        }
    } catch (err) {
        console.error('receipt email error:', (err as Error).message);
    }
}

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
            const priceId: string | undefined = event.data?.items?.[0]?.price?.id;
            // Activation allowlist: catalog plans, plus any temporary test
            // prices announced via env (comma-separated ids). Once a test id is
            // removed from PADDLE_TEST_PRICE_IDS it becomes inert, so a leaked
            // test-checkout URL never turns into a standing cheap licence.
            const testPriceIds = (process.env.PADDLE_TEST_PRICE_IDS || '')
                .split(',').map((s) => s.trim()).filter(Boolean);
            const priceKnown = !!priceId && (priceId in PLAN_KEYS || testPriceIds.includes(priceId));

            const userRef = db.collection('users').doc(uid);
            const userSnap = await userRef.get();
            const currentStatus = userSnap.data()?.purchaseStatus;
            // Guard against a duplicate receipt when Paddle retries the webhook:
            // only a transaction id we have not seen before is a fresh purchase.
            const seenTxnIds: string[] = userSnap.data()?.paddleTransactionIds || [];
            const isNewTransaction = !!transactionId && !seenTxnIds.includes(transactionId);

            // Keep every transaction id: adjustments (refunds/chargebacks) reference
            // the specific disputed transaction, which may be an earlier renewal.
            const update: Record<string, unknown> = {
                paddleTransactionId: transactionId,
            };
            // A one-time purchase (lifetime, or an unlisted test price) carries
            // no subscription_id. Its absence must never null a subscriber's
            // stored id: the account page and the app read !paddleSubscriptionId
            // as "lifetime", and refund/chargeback lookup falls back to it.
            if (subscriptionId) update.paddleSubscriptionId = subscriptionId;
            if (transactionId) {
                update.paddleTransactionIds = FieldValue.arrayUnion(transactionId);
            }

            const activated = currentStatus !== 'refunded' && priceKnown;
            if (currentStatus === 'refunded') {
                // Sticky revocation: a late/retried transaction.completed must not
                // silently re-activate a refunded/charged-back user.
                console.error(`User ${uid} has purchaseStatus 'refunded'; transaction ${transactionId} recorded but activation withheld — manual review required`);
            } else if (!priceKnown) {
                // The transaction ids are still recorded above (refunds may
                // reference them), but a price we don't recognize never unlocks.
                console.error(`User ${uid} completed transaction ${transactionId} for unrecognized price ${priceId || 'unknown'} — activation withheld, manual review required`);
            } else {
                update.purchaseStatus = 'active';
                update.purchaseDate = new Date().toISOString();
                // Plan + renewal/expiry so the app and website can show
                // "Renews on…" or "Never expires" (lifetime). billing_period is
                // present for subscription charges and absent for the one-time
                // lifetime purchase.
                // A lifetime licence is terminal: a residual subscription
                // renewal (bought monthly, later bought lifetime, never
                // cancelled the sub) must not downgrade the stored plan.
                const planKey = priceId ? PLAN_KEYS[priceId] : undefined;
                if (planKey && userSnap.data()?.plan !== 'lifetime') update.plan = planKey;
                // Same guard as the subscription id: a one-time charge has no
                // billing_period, and must not blank a subscriber's period end.
                const periodEnd = event.data?.billing_period?.ends_at;
                if (periodEnd) update.currentPeriodEnd = periodEnd;
            }

            await userRef.set(update, { merge: true });

            if (activated) {
                // Include the price id: an activation through an unexpected or
                // unlisted price must be visible in the logs, not only in the
                // Paddle dashboard.
                console.log(`User ${uid} activated (transaction: ${transactionId}, price: ${priceId || 'unknown'})`);
                // Branded receipt — but only for a genuinely new purchase, so a
                // webhook retry doesn't email the customer twice. Prefer the
                // email Paddle sent, else the account's own email. Best-effort.
                if (isNewTransaction) {
                    const data = event.data as PaddleTransactionData;
                    const to = data.customer?.email || userSnap.data()?.email;
                    if (to) {
                        await sendReceiptEmail(to, data);
                    } else {
                        console.warn(`No email to send receipt for user ${uid}`);
                    }
                }
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
                    // A cancellation scheduled for period end arrives as
                    // status 'active' + scheduled_change; record it so the
                    // account page can say "Expires <date>" instead of
                    // promising a renewal that will never happen. Un-cancelling
                    // clears scheduled_change, so this self-heals.
                    await userRef.set({
                        purchaseStatus: 'active',
                        subscriptionStatus: 'active',
                        cancelAtPeriodEnd: event.data?.scheduled_change?.action === 'cancel',
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
