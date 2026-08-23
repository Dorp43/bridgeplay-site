import type { IncomingMessage, ServerResponse } from 'http';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Branded password-reset emails, sent from our own domain instead of
// Firebase's default mailer (noreply@<project>.firebaseapp.com, which lands in
// spam). The link is generated server-side with the Admin SDK and rewritten to
// our /auth/action page, so this works regardless of the Firebase console's
// action-URL template setting.
//
// Requires (Vercel env): FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL /
// FIREBASE_PRIVATE_KEY (already present for the Paddle webhook), plus
// RESEND_API_KEY and optionally RESET_FROM (default
// "BridgePlay <noreply@bridgeplay.app>" — the domain must be verified in
// Resend or delivery fails). Until RESEND_API_KEY is configured this endpoint
// answers 501 and the account page falls back to Firebase's own mailer.

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

/* The Admin SDK returns a link on Firebase's domain; only its oobCode matters.
   Rebuilding the URL onto our own page keeps every email pointing at
   bridgeplay.app even if the console template is never touched. */
function rebrandResetLink(firebaseLink: string): string | null {
    const oobCode = new URL(firebaseLink).searchParams.get('oobCode');
    if (!oobCode) return null;
    return `https://bridgeplay.app/auth/action?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`;
}

function emailHTML(resetURL: string): string {
    return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0b0f17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f17;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="max-width:440px;width:100%;background:#121826;border:1px solid #232b3d;border-radius:16px;padding:36px 32px;">
        <tr><td style="padding-bottom:24px;">
          <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">Bridge<span style="color:#4a9eff;">Play</span></span>
        </td></tr>
        <tr><td style="color:#ffffff;font-size:22px;font-weight:800;padding-bottom:10px;letter-spacing:-0.4px;">
          Reset your password
        </td></tr>
        <tr><td style="color:#9aa5b8;font-size:14px;line-height:1.6;padding-bottom:28px;">
          Someone requested a password reset for your BridgePlay account.
          Click the button below to choose a new password. This link is
          single-use and expires in one hour.
        </td></tr>
        <tr><td align="center" style="padding-bottom:28px;">
          <a href="${resetURL}" style="display:inline-block;background:linear-gradient(135deg,#4a9eff,#3b82f6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;">
            Set New Password
          </a>
        </td></tr>
        <tr><td style="color:#5d6a80;font-size:12px;line-height:1.6;border-top:1px solid #232b3d;padding-top:20px;">
          If you didn't request this, you can safely ignore this email —
          your password stays unchanged.<br>
          Button not working? Paste this link into your browser:<br>
          <a href="${resetURL}" style="color:#4a9eff;word-break:break-all;">${resetURL}</a>
        </td></tr>
      </table>
      <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="max-width:440px;width:100%;">
        <tr><td style="color:#5d6a80;font-size:11px;padding:20px 8px;text-align:center;">
          BridgePlay — Play Windows games on your Mac · <a href="https://bridgeplay.app" style="color:#5d6a80;">bridgeplay.app</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
        // Not configured yet — the caller falls back to Firebase's own mailer.
        res.statusCode = 501;
        res.end(JSON.stringify({ error: 'Custom mail not configured' }));
        return;
    }

    let email = '';
    try {
        email = String(JSON.parse(await readBody(req)).email || '').trim().toLowerCase();
    } catch {
        /* fall through to the validation below */
    }
    if (!email || !email.includes('@') || email.length > 320) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'A valid email is required' }));
        return;
    }

    // Anti-enumeration: the response is identical whether or not an account
    // exists (mirrors Firebase's own email-enumeration protection, which this
    // project has enabled).
    try {
        const firebaseLink = await getAuth().generatePasswordResetLink(email);
        const resetURL = rebrandResetLink(firebaseLink);
        if (!resetURL) throw new Error('no oobCode in generated link');

        const sendResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: process.env.RESET_FROM || 'BridgePlay <noreply@bridgeplay.app>',
                to: [email],
                subject: 'Reset your BridgePlay password',
                html: emailHTML(resetURL),
            }),
        });
        if (!sendResp.ok) {
            // Provider trouble is OUR trouble, not the user's: signal the
            // caller to fall back to Firebase's mailer rather than lying with
            // a 200 that sent nothing.
            console.error('resend send failed:', sendResp.status, (await sendResp.text()).slice(0, 300));
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Mail provider error' }));
            return;
        }
    } catch (err: unknown) {
        const code = (err as { code?: string }).code || '';
        // Unknown accounts must return the SAME 200 as real ones, or the
        // status code leaks which emails are registered. firebase-admin's
        // generatePasswordResetLink reports a missing user inconsistently:
        // sometimes auth/user-not-found, but often the generic
        // auth/internal-error — treat all of these as "silently succeed".
        const unknownUser =
            code === 'auth/user-not-found' ||
            code === 'auth/email-not-found' ||
            code === 'auth/internal-error';
        if (!unknownUser) {
            console.error('password-reset error:', code || (err as Error).message);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Could not process reset' }));
            return;
        }
        // Unknown account: say nothing, return the same success as a real one.
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
}
