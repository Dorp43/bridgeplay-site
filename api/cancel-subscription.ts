import type { IncomingMessage, ServerResponse } from 'http';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Cancels the caller's Paddle subscription at the end of the period they have
// already paid for. Paddle Billing has no client-side cancel, so this must run
// server-side with an API key.
//
// The caller proves identity with a Firebase ID token, NOT a uid in the body:
// a uid is public to anyone who has seen it, and accepting one would let anyone
// cancel anyone's subscription. The subscription id is then read from the
// user's own Firestore doc, so a caller can only ever reach their own.
//
// Requires (Vercel env): FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL /
// FIREBASE_PRIVATE_KEY (already present), plus PADDLE_API_KEY — a key with the
// `subscription.write` scope. Until that key is configured this endpoint
// answers 501 and both clients show "not available right now" rather than
// pretending the cancellation worked.
//
// Cancelling does NOT revoke access immediately. Paddle keeps the subscription
// 'active' with a scheduled_change until the period ends, our webhook records
// that as cancelAtPeriodEnd, and the UI switches from "Renews <date>" to
// "Expires <date>". Access ends when Paddle stops billing.

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

function send(res: ServerResponse, status: number, payload: Record<string, unknown>): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== 'POST') {
        send(res, 405, { error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
        console.error('PADDLE_API_KEY not configured — cancellation unavailable');
        send(res, 501, { error: 'Cancellation is not configured' });
        return;
    }

    // Bearer ID token — the only accepted proof of identity.
    const authHeader = (req.headers['authorization'] as string | undefined) || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!idToken) {
        send(res, 401, { error: 'Missing credentials' });
        return;
    }

    let uid: string;
    try {
        uid = (await getAuth().verifyIdToken(idToken)).uid;
    } catch {
        // Don't echo the verification error — it distinguishes expired from
        // forged tokens, which is a probing aid and of no use to the client.
        send(res, 401, { error: 'Invalid credentials' });
        return;
    }

    // Body is read but not trusted for identity; it only carries options.
    let immediate = false;
    try {
        const raw = await readBody(req);
        if (raw) immediate = JSON.parse(raw)?.immediate === true;
    } catch {
        /* malformed body — fall back to the safe default (period end) */
    }

    const snap = await db.collection('users').doc(uid).get();
    const subscriptionId = snap.data()?.paddleSubscriptionId;
    if (!subscriptionId) {
        send(res, 400, { error: 'No active subscription to cancel' });
        return;
    }

    try {
        const resp = await fetch(`https://api.paddle.com/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            // Default: keep access through the period already paid for.
            body: JSON.stringify({ effective_from: immediate ? 'immediately' : 'next_billing_period' }),
        });
        const payload = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            const detail = payload?.error?.detail || payload?.error?.code || `HTTP ${resp.status}`;
            console.error(`Paddle cancel failed for user ${uid} (subscription ${subscriptionId}): ${detail}`);
            send(res, 502, { error: 'Could not cancel with the payment provider' });
            return;
        }

        // Paddle also emits subscription.updated / subscription.canceled, which
        // is what actually writes the licence state. Record the intent now so
        // the UI is correct even before that webhook lands.
        const scheduledAt = payload?.data?.scheduled_change?.effective_at || null;
        await db.collection('users').doc(uid).set({
            cancelAtPeriodEnd: !immediate,
            cancellationRequestedAt: new Date().toISOString(),
            ...(scheduledAt && { currentPeriodEnd: scheduledAt }),
        }, { merge: true });

        console.log(`User ${uid} cancelled subscription ${subscriptionId} (${immediate ? 'immediately' : 'at period end'})`);
        send(res, 200, { ok: true, effectiveAt: scheduledAt, immediate });
    } catch (err) {
        console.error('Cancellation error:', (err as Error).message);
        send(res, 502, { error: 'Could not cancel with the payment provider' });
    }
}
