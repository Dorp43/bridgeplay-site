import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from 'firebase/auth';
import { CheckCircle2, XCircle } from 'lucide-react';
import { auth, friendlyAuthError } from '../lib/firebase';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import styles from './AuthAction.module.css';

/* Landing page for Firebase auth action links (the project's action URL points
   here instead of the default firebaseapp.com page). Handles:
     ?mode=resetPassword&oobCode=…  — the password-reset flow from the email
     ?mode=verifyEmail&oobCode=…    — email verification
     ?mode=recoverEmail&oobCode=…   — email-change reversal
   The oobCode is single-use and expires; every failure path lands on a card
   that routes the user back to /account to request a fresh link. */

type Phase =
    | { kind: 'checking' }
    | { kind: 'reset-form'; email: string }
    | { kind: 'done'; title: string; body: string }
    | { kind: 'invalid'; body: string };

function actionCodeError(code: string): string {
    switch (code) {
        case 'auth/expired-action-code':
            return 'This link has expired. Request a new one and use it within an hour.';
        case 'auth/invalid-action-code':
            return 'This link is invalid or has already been used.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'This account no longer exists.';
        default:
            return friendlyAuthError(code);
    }
}

export default function AuthAction() {
    const [params] = useSearchParams();
    const mode = params.get('mode') || '';
    const oobCode = params.get('oobCode') || '';

    const [phase, setPhase] = useState<Phase>({ kind: 'checking' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useDocumentMeta({
        title: 'Reset Password — BridgePlay',
        description: 'Set a new password for your BridgePlay account.',
        canonicalPath: '/auth/action',
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!oobCode) {
                setPhase({ kind: 'invalid', body: 'This link is incomplete. Open the most recent email and use its button, or request a new link.' });
                return;
            }
            try {
                switch (mode) {
                    case 'resetPassword': {
                        const email = await verifyPasswordResetCode(auth, oobCode);
                        if (!cancelled) setPhase({ kind: 'reset-form', email });
                        break;
                    }
                    case 'verifyEmail': {
                        await applyActionCode(auth, oobCode);
                        if (!cancelled) {
                            setPhase({
                                kind: 'done',
                                title: 'Email verified',
                                body: 'Your email address has been verified. You can close this page.',
                            });
                        }
                        break;
                    }
                    case 'recoverEmail': {
                        await applyActionCode(auth, oobCode);
                        if (!cancelled) {
                            setPhase({
                                kind: 'done',
                                title: 'Email change reverted',
                                body: 'Your account email has been restored. If you did not request the change, reset your password now.',
                            });
                        }
                        break;
                    }
                    default:
                        setPhase({ kind: 'invalid', body: 'This link is not recognized. Request a new one from the sign-in page.' });
                }
            } catch (err: unknown) {
                const code = (err as { code?: string }).code || '';
                if (!cancelled) setPhase({ kind: 'invalid', body: actionCodeError(code) });
            }
        })();
        return () => { cancelled = true; };
    }, [mode, oobCode]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const password = (form.elements.namedItem('new-password') as HTMLInputElement).value;
        const confirm = (form.elements.namedItem('confirm-password') as HTMLInputElement).value;

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setPhase({
                kind: 'done',
                title: 'Password updated',
                body: 'Your new password is active. Sign in with it in the BridgePlay app — or below to check your account.',
            });
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            setError(actionCodeError(code));
            setSubmitting(false);
        }
    };

    return (
        <main id="main-content" tabIndex={-1} className={styles.page}>
            {phase.kind === 'checking' && (
                <div className={styles.loading}><div className={styles.spinner} />Checking your link…</div>
            )}

            {phase.kind === 'reset-form' && (
                <div className={styles.card}>
                    <h1>Set a new password</h1>
                    <p className={styles.subtitle}>
                        for <strong>{phase.email}</strong>
                    </p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="new-password">New password</label>
                            <input
                                type="password"
                                id="new-password"
                                name="new-password"
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                autoFocus
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="confirm-password">Confirm password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirm-password"
                                placeholder="Repeat the password"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                            {submitting ? 'Updating…' : 'Update Password'}
                        </button>
                    </form>
                </div>
            )}

            {phase.kind === 'done' && (
                <div className={styles.card}>
                    <div className={styles.successIcon}><CheckCircle2 size={28} /></div>
                    <h1>{phase.title}</h1>
                    <p className={styles.subtitle}>{phase.body}</p>
                    <Link to="/account" className={styles.primaryBtn}>Go to Sign In</Link>
                    <p className={styles.hint}>
                        Using the Mac app? Open BridgePlay and sign in there with your new password.
                    </p>
                </div>
            )}

            {phase.kind === 'invalid' && (
                <div className={styles.card}>
                    <div className={styles.failIcon}><XCircle size={28} /></div>
                    <h1>Link not valid</h1>
                    <p className={styles.subtitle}>{phase.body}</p>
                    <Link to="/account" className={styles.primaryBtn}>Request a New Link</Link>
                    <p className={styles.hint}>
                        On the sign-in page, enter your email and click <em>Forgot password?</em> to
                        get a fresh link. Links are single-use and expire after a short time.
                    </p>
                </div>
            )}
        </main>
    );
}
