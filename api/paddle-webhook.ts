import type { IncomingMessage, ServerResponse } from 'http';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(h1));
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

            await db.collection('users').doc(uid).set({
                purchaseStatus: 'active',
                paddleSubscriptionId: subscriptionId,
                paddleTransactionId: transactionId,
                purchaseDate: new Date().toISOString(),
            }, { merge: true });

            console.log(`User ${uid} activated (transaction: ${transactionId})`);
        }

        if (eventType === 'subscription.canceled') {
            const customData = event.data?.custom_data;
            const uid = customData?.uid;

            if (uid) {
                await db.collection('users').doc(uid).set({
                    purchaseStatus: 'canceled',
                    canceledAt: new Date().toISOString(),
                }, { merge: true });

                console.log(`User ${uid} subscription canceled`);
            }
        }

        if (eventType === 'subscription.updated') {
            const customData = event.data?.custom_data;
            const uid = customData?.uid;
            const status = event.data?.status;

            if (uid && status === 'active') {
                await db.collection('users').doc(uid).set({
                    purchaseStatus: 'active',
                }, { merge: true });

                console.log(`User ${uid} subscription reactivated`);
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
