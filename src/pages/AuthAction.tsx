import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from 'firebase/auth';
import { CheckCircle2, XCircle } from 'lucide-react';
import { auth, friendlyAuthError } from '../lib/firebase';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useI18n } from '../i18n/useI18n';
import type { Dictionary } from '../i18n/types';
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

/* Takes the dictionary rather than reading context: it is called from an effect
   and from a submit handler, neither of which is a component. */
function actionCodeError(code: string, t: Dictionary): string {
    switch (code) {
        case 'auth/expired-action-code':
            return t.authAction.errExpired;
        case 'auth/invalid-action-code':
            return t.authAction.errInvalid;
        case 'auth/user-disabled':
            return t.authAction.errDisabled;
        case 'auth/user-not-found':
            return t.authAction.errNotFound;
        default:
            return friendlyAuthError(code, t);
    }
}

export default function AuthAction() {
    const [params] = useSearchParams();
    const mode = params.get('mode') || '';
    const oobCode = params.get('oobCode') || '';

    const [phase, setPhase] = useState<Phase>({ kind: 'checking' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { t } = useI18n();

    useDocumentMeta({
        title: t.meta.authAction.title,
        description: t.meta.authAction.description,
        canonicalPath: '/auth/action',
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!oobCode) {
                setPhase({ kind: 'invalid', body: t.authAction.errIncomplete });
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
                                title: t.authAction.doneVerifiedTitle,
                                body: t.authAction.doneVerifiedBody,
                            });
                        }
                        break;
                    }
                    case 'recoverEmail': {
                        await applyActionCode(auth, oobCode);
                        if (!cancelled) {
                            setPhase({
                                kind: 'done',
                                title: t.authAction.doneRevertedTitle,
                                body: t.authAction.doneRevertedBody,
                            });
                        }
                        break;
                    }
                    default:
                        setPhase({ kind: 'invalid', body: t.authAction.errUnrecognized });
                }
            } catch (err: unknown) {
                const code = (err as { code?: string }).code || '';
                if (!cancelled) setPhase({ kind: 'invalid', body: actionCodeError(code, t) });
            }
        })();
        return () => { cancelled = true; };
    }, [mode, oobCode, t]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const password = (form.elements.namedItem('new-password') as HTMLInputElement).value;
        const confirm = (form.elements.namedItem('confirm-password') as HTMLInputElement).value;

        if (password.length < 6) {
            setError(t.authAction.passwordTooShort);
            return;
        }
        if (password !== confirm) {
            setError(t.authAction.passwordsDoNotMatch);
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setPhase({
                kind: 'done',
                title: t.authAction.doneUpdatedTitle,
                body: t.authAction.doneUpdatedBody,
            });
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            setError(actionCodeError(code, t));
            setSubmitting(false);
        }
    };

    return (
        <main id="main-content" tabIndex={-1} className={styles.page}>
            {phase.kind === 'checking' && (
                <div className={styles.loading}><div className={styles.spinner} />{t.authAction.checking}</div>
            )}

            {phase.kind === 'reset-form' && (
                <div className={styles.card}>
                    <h1>{t.authAction.setNewPassword}</h1>
                    <p className={styles.subtitle}>
                        {t.authAction.forEmail} <strong>{phase.email}</strong>
                    </p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="new-password">{t.authAction.newPassword}</label>
                            <input
                                type="password"
                                id="new-password"
                                name="new-password"
                                placeholder={t.authAction.newPasswordPlaceholder}
                                autoComplete="new-password"
                                autoFocus
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="confirm-password">{t.authAction.confirmPassword}</label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirm-password"
                                placeholder={t.authAction.confirmPasswordPlaceholder}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                            {submitting ? t.authAction.updating : t.authAction.updatePassword}
                        </button>
                    </form>
                </div>
            )}

            {phase.kind === 'done' && (
                <div className={styles.card}>
                    <div className={styles.successIcon}><CheckCircle2 size={28} /></div>
                    <h1>{phase.title}</h1>
                    <p className={styles.subtitle}>{phase.body}</p>
                    <Link to="/account" className={styles.primaryBtn}>{t.authAction.goToSignIn}</Link>
                    <p className={styles.hint}>{t.authAction.doneHint}</p>
                </div>
            )}

            {phase.kind === 'invalid' && (
                <div className={styles.card}>
                    <div className={styles.failIcon}><XCircle size={28} /></div>
                    <h1>{t.authAction.invalidTitle}</h1>
                    <p className={styles.subtitle}>{phase.body}</p>
                    <Link to="/account" className={styles.primaryBtn}>{t.authAction.requestNewLink}</Link>
                    <p className={styles.hint}>
                        {t.authAction.invalidHintBefore} <em>{t.authAction.invalidHintForgot}</em>{' '}
                        {t.authAction.invalidHintAfter}
                    </p>
                </div>
            )}
        </main>
    );
}
