import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, friendlyAuthError } from '../lib/firebase';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { openCheckout, readPriceOverride } from '../lib/paddle';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useI18n } from '../i18n/useI18n';
import type { Dictionary } from '../i18n/types';
import styles from './AccountPage.module.css';

/// The trial length, in days. Must match LicenseService.trialDurationDays in
/// the Mac app — the app claims the trial, the site only reports it.
const TRIAL_DURATION_DAYS = 7;

interface LicenseData {
    status: 'licensed' | 'trial' | 'trial-warning' | 'expired' | 'noTrial' | 'pending';
    label: string;
    pillClass: string;
    trialInfo?: string;
    trialColor?: string;
    planInfo: string;
    planColor?: string;
    renewalLabel?: string;   // "Renews" / "Expires" / "Plan"
    renewalInfo?: string;    // "August 23, 2027" / "Never expires"
    /// Trial only: "7-day trial · ends August 30, 2026".
    trialLength?: string;
    /// Set only when there is a subscription the user can actually cancel.
    /// Absent for lifetime, trials, and already-scheduled cancellations.
    cancellable?: boolean;
    /// Licensed via the one-time lifetime purchase — nothing left to buy.
    isLifetime?: boolean;
}

/// True when the doc describes a lifetime licence. An explicit monthly/yearly
/// plan always wins — a doc can lack paddleSubscriptionId for other reasons
/// (legacy/manual docs), and that absence alone must not relabel a subscriber.
function isLifetimeDoc(data: Record<string, unknown>): boolean {
    const plan = data.plan as string | undefined;
    if (plan === 'monthly' || plan === 'yearly') return false;
    return plan === 'lifetime' || !data.paddleSubscriptionId;
}

/// Resolve when an active plan renews/expires from the user doc. Prefers the
/// exact period end the webhook stored (currentPeriodEnd); falls back to
/// purchaseDate + the plan interval for accounts that predate that field.
/// Lifetime returns null — the Plan row already says "Lifetime license".
/// A cancellation scheduled for period end shows "Expires", not "Renews".
function renewalFor(data: Record<string, unknown>, t: Dictionary, bcp47: string): { renewalLabel: string; renewalInfo: string } | null {
    if (isLifetimeDoc(data)) return null;
    const plan = data.plan as string | undefined;
    const renewalLabel = data.cancelAtPeriodEnd ? t.account.rowExpires : t.account.rowRenews;

    const fmt = (d: Date) => d.toLocaleDateString(bcp47, { year: 'numeric', month: 'long', day: 'numeric' });
    // A date clearly in the past is stale (e.g. cancel + later reactivation
    // without a new charge yet) — showing it would be a lie either way, so
    // show nothing. 24h of grace covers a renewal mid-processing.
    const fresh = (d: Date) => d.getTime() > Date.now() - 24 * 60 * 60 * 1000;
    const cpe = data.currentPeriodEnd as string | undefined;
    if (cpe) {
        const end = new Date(cpe);
        return fresh(end) ? { renewalLabel, renewalInfo: fmt(end) } : null;
    }

    // Fallback: purchaseDate + interval.
    const pd = data.purchaseDate as string | undefined;
    if (pd && (plan === 'monthly' || plan === 'yearly')) {
        const end = new Date(pd);
        if (plan === 'monthly') end.setMonth(end.getMonth() + 1);
        else end.setFullYear(end.getFullYear() + 1);
        if (fresh(end)) return { renewalLabel, renewalInfo: fmt(end) };
    }
    return null;
}

export default function AccountPage() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgot, setIsForgot] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [forgotPrefill, setForgotPrefill] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [license, setLicense] = useState<LicenseData | null>(null);
    const [memberSince, setMemberSince] = useState('');
    const [confirmingCancel, setConfirmingCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const { t, bcp47 } = useI18n();

    useDocumentMeta({
        title: t.meta.account.title,
        description: t.meta.account.description,
        canonicalPath: '/account',
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        setError('');
        setSubmitting(true);

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast(t.account.toastAccountCreated, 'success');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                showToast(t.account.toastSignedIn, 'success');
            }
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            setError(friendlyAuthError(code, t));
            setSubmitting(false);
        }
    };

    /* Google sign-in via popup. Works for both sign-in and sign-up: Firebase
       creates the account on first use, and an existing email/password account
       with the same (verified) address keeps its uid — so trials and licences
       survive the switch. A closed popup is not an error worth showing. */
    const handleGoogleSignIn = async () => {
        setError('');
        setSubmitting(true);
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
            showToast(t.account.toastSignedInGoogle, 'success');
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
                setError(friendlyAuthError(code, t));
            }
            setSubmitting(false);
        }
    };

    /* Switch to the dedicated email-only reset form, carrying over whatever
       was already typed in the sign-in email field. */
    const openForgot = () => {
        const emailInput = document.getElementById('auth-email') as HTMLInputElement;
        setForgotPrefill(emailInput?.value.trim() || '');
        setIsForgot(true);
        setResetSent(false);
        setError('');
    };

    const handleForgotSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();

        setError('');
        setSubmitting(true);
        try {
            // Prefer the branded sender (our domain + template via
            // /api/password-reset — far better deliverability). Until
            // RESEND_API_KEY is configured it answers 501 and we fall back to
            // Firebase's own mailer.
            const custom = await fetch('/api/password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            }).catch(() => null);
            if (!custom || !custom.ok) {
                await sendPasswordResetEmail(auth, email);
            }
            setResetSent(true);
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            setError(friendlyAuthError(code, t));
        }
        setSubmitting(false);
    };

    const handleSignOut = async () => {
        await signOut(auth);
        showToast(t.account.toastSignedOut, 'success');
        setLicense(null);
        setMemberSince('');
    };

    /// Cancels at period end. Identity is the Firebase ID token, never a uid in
    /// the body — the endpoint reads the subscription from the caller's own doc.
    const handleCancelSubscription = async () => {
        if (!user || cancelling) return;
        setCancelling(true);
        try {
            const resp = await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${await user.getIdToken()}`,
                    'Content-Type': 'application/json',
                },
                body: '{}',
            });
            if (resp.ok) {
                showToast(t.account.toastCancelled, 'success');
                const refreshed = await loadDashboard();
                if (refreshed) setLicense(refreshed.license);
            } else if (resp.status === 501) {
                showToast(t.account.toastCancelUnavailable, 'error');
            } else {
                const body = await resp.json().catch(() => ({}));
                showToast(body.error || t.account.toastCancelFailed, 'error');
            }
        } catch {
            showToast(t.account.toastNetwork, 'error');
        }
        setCancelling(false);
        setConfirmingCancel(false);
    };

    // Load dashboard data when user is available
    const loadDashboard = useCallback(async (): Promise<{ license: LicenseData; memberSince: string } | null> => {
        if (!user) return null;
        try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (!snap.exists()) {
                // No user doc yet: the trial hasn't STARTED — and whether one
                // is even available depends on the Mac the app first runs on
                // (one trial per device), which this page cannot know. Say "no
                // plan" plainly and frame the trial as conditional, never as a
                // promise.
                return { license: { status: 'pending', label: t.account.statusNewAccount, pillClass: 'trial', planInfo: t.account.planNone, trialInfo: t.account.trialNotStartedNew, trialColor: 'var(--text-muted)' }, memberSince: '' };
            }
            const data = snap.data();

            let memberSince = '';
            if (data.createdAt) {
                const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                memberSince = t.account.memberSince(date.toLocaleDateString(bcp47, { month: 'long', year: 'numeric' }));
            }

            if (data.purchaseStatus === 'active') {
                const planLabel = data.plan === 'monthly' ? t.account.planMonthly
                    : data.plan === 'yearly' ? t.account.planYearly
                    : isLifetimeDoc(data) ? t.account.planLifetime
                    : t.account.planActive;
                const renewal = renewalFor(data, t, bcp47);
                // Cancellable only when a real subscription is running and a
                // cancellation isn't already scheduled — lifetime has nothing
                // to cancel, and cancelling twice is a confusing no-op.
                const cancellable = !isLifetimeDoc(data)
                    && !!data.paddleSubscriptionId
                    && !data.cancelAtPeriodEnd;
                return {
                    license: {
                        status: 'licensed', label: t.account.statusLicensed, pillClass: 'licensed',
                        planInfo: planLabel, planColor: 'var(--green)',
                        ...(renewal ?? {}),
                        ...(cancellable && { cancellable: true }),
                        ...(isLifetimeDoc(data) && { isLifetime: true }),
                    },
                    memberSince,
                };
            }

            if (data.trialStartDate) {
                const trialStart = data.trialStartDate.toDate ? data.trialStartDate.toDate() : new Date(data.trialStartDate);
                const daysPassed = Math.floor((Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
                const daysLeft = Math.max(0, TRIAL_DURATION_DAYS - daysPassed);

                if (daysLeft > 0) {
                    const isWarning = daysLeft <= 2;
                    // Trial length + the date it runs out. Shown only for
                    // trials; paid plans use the Renews/Expires row instead.
                    const trialEnd = new Date(trialStart);
                    trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);
                    const trialEndStr = trialEnd.toLocaleDateString(bcp47, { year: 'numeric', month: 'long', day: 'numeric' });
                    return {
                        license: {
                            status: isWarning ? 'trial-warning' : 'trial',
                            label: t.account.daysLeft(daysLeft),
                            pillClass: isWarning ? 'trialWarning' : 'trial',
                            trialInfo: t.account.daysRemaining(daysLeft, TRIAL_DURATION_DAYS),
                            trialColor: isWarning ? 'var(--orange)' : 'var(--accent)',
                            planInfo: t.account.planFreeTrial,
                            trialLength: t.account.trialLength(TRIAL_DURATION_DAYS, trialEndStr),
                        },
                        memberSince,
                    };
                }
                return { license: { status: 'expired', label: t.account.statusTrialExpired, pillClass: 'expired', trialInfo: t.account.trialExpired, trialColor: 'var(--danger)', planInfo: t.account.planNone }, memberSince };
            }

            if (data.trialEligible === false) {
                return { license: { status: 'noTrial', label: t.account.statusNoTrial, pillClass: 'expired', planInfo: t.account.planNone }, memberSince };
            }
            return { license: { status: 'pending', label: t.account.statusPending, pillClass: 'trial', planInfo: t.account.planNone, trialInfo: t.account.trialNotStarted, trialColor: 'var(--text-muted)' }, memberSince };
        } catch (err) {
            console.error('Failed to load user data:', err);
            return { license: { status: 'noTrial', label: t.account.statusErrorLoading, pillClass: 'expired', planInfo: '—' }, memberSince: '' };
        }
    }, [user, t, bcp47]);

    // Trigger dashboard load when user changes
    useEffect(() => {
        if (!user || license || loading) return;
        let cancelled = false;
        loadDashboard().then(result => {
            if (cancelled || !result) return;
            setLicense(result.license);
            if (result.memberSince) setMemberSince(result.memberSince);
        });
        return () => { cancelled = true; };
    }, [user, license, loading, loadDashboard]);

    /* Landmark + target for the skip link rendered in main.tsx. Every branch
       below is this route's whole page, so each one carries it — the skip link
       is the first focusable node on /account too, and without a
       <main id="main-content"> here it was a dead control. */
    /* Skeleton of the signed-in dashboard while auth resolves, and again while
       the licence doc loads for a known user — the page keeps its silhouette
       the whole time instead of popping spinner → content. */
    const dashboardSkeleton = (
        <main id="main-content" tabIndex={-1} className={`${styles.page} ${styles.pageWide}`} aria-busy="true">
            <div className={styles.skelHeader}>
                <div>
                    <div className={styles.skel} style={{ width: 64, height: 10, marginBottom: 10 }} />
                    <div className={styles.skel} style={{ width: 220, height: 18 }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <div className={styles.skel} style={{ width: 96, height: 28, borderRadius: 100 }} />
                    <div className={styles.skel} style={{ width: 74, height: 28 }} />
                </div>
            </div>
            {[2, 3].map((rows) => (
                <div key={rows} className={styles.statusCard}>
                    <div className={styles.skel} style={{ width: 80, height: 9, marginBottom: 14 }} />
                    {Array.from({ length: rows }, (_, i) => (
                        <div key={i} className={styles.skelCardRow}>
                            <div className={styles.skel} style={{ width: 60, height: 12 }} />
                            <div className={styles.skel} style={{ width: 150, height: 12 }} />
                        </div>
                    ))}
                </div>
            ))}
        </main>
    );

    if (loading || (user && !license && !isForgot)) {
        return dashboardSkeleton;
    }

    if (!user && isForgot) {
        return (
            <main id="main-content" tabIndex={-1} className={styles.page}>
                <div className={styles.authCard}>
                    <h1>{t.account.resetTitle}</h1>
                    <p className={styles.subtitle}>{t.account.resetSubtitle}</p>

                    {error && <div className={styles.error}>{error}</div>}
                    {resetSent && (
                        <div className={styles.successBanner}>
                            {t.account.resetSent}
                        </div>
                    )}

                    <form onSubmit={handleForgotSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="forgot-email">{t.account.email}</label>
                            <input
                                type="email"
                                id="forgot-email"
                                name="email"
                                placeholder={t.account.emailPlaceholder}
                                defaultValue={forgotPrefill}
                                autoFocus
                                required
                            />
                        </div>
                        <button type="submit" className={styles.authBtn} disabled={submitting}>
                            {submitting ? t.account.sendingResetLink : t.account.sendResetLink}
                        </button>
                    </form>

                    <p className={styles.toggle}>
                        <a onClick={() => { setIsForgot(false); setError(''); setResetSent(false); }}>{t.account.backToSignIn}</a>
                    </p>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main id="main-content" tabIndex={-1} className={styles.page}>
                <div className={styles.authCard}>
                    <h1>{isSignUp ? t.account.createAccount : t.account.signIn}</h1>
                    <p className={styles.subtitle}>
                        {isSignUp ? t.account.signUpSubtitle : t.account.signInSubtitle}
                    </p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="auth-email">{t.account.email}</label>
                            <input type="email" id="auth-email" name="email" placeholder={t.account.emailPlaceholder} required />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="auth-password">{t.account.password}</label>
                            <input type="password" id="auth-password" name="password" placeholder={t.account.passwordPlaceholder} required />
                        </div>
                        {!isSignUp && (
                            <button type="button" className={styles.forgotLink} onClick={openForgot}>{t.account.forgotPassword}</button>
                        )}
                        <button type="submit" className={styles.authBtn} disabled={submitting}>
                            {submitting ? (isSignUp ? t.account.creatingAccount : t.account.signingIn) : (isSignUp ? t.account.createAccount : t.account.signIn)}
                        </button>
                    </form>

                    <div className={styles.authDivider}><span>{t.account.or}</span></div>

                    <button type="button" className={styles.googleBtn} onClick={handleGoogleSignIn} disabled={submitting}>
                        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        {t.account.continueWithGoogle}
                    </button>

                    <p className={styles.toggle}>
                        {isSignUp ? t.account.haveAccount : t.account.noAccount}
                        <a onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>{isSignUp ? t.account.signIn : t.account.signUp}</a>
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main id="main-content" tabIndex={-1} className={`${styles.page} ${styles.pageWide}`}>
            <div className={styles.dashboard}>
                {/* Settings-style header: identity left, state + session right.
                    The status pill lives HERE (not as a card row), so the
                    licence card can be pure facts. */}
                <div className={styles.dashHeader}>
                    <div>
                        <span className={styles.dashEyebrow}>{t.account.eyebrow}</span>
                        <h2 className={styles.profileEmail}>{user.email}</h2>
                        {memberSince && <div className={styles.memberSince}>{memberSince}</div>}
                    </div>
                    <div className={styles.dashHeaderActions}>
                        {license && <span className={`${styles.pill} ${styles[license.pillClass]}`}>{license.label}</span>}
                        <button className={styles.signOutGhost} onClick={handleSignOut}>{t.account.signOut}</button>
                    </div>
                </div>

                <div className={styles.statusCard}>
                    <h3>{t.account.licenseCard}</h3>
                    {license?.trialInfo && (
                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>{t.account.rowTrial}</span>
                            <span className={styles.statusValue} style={{ color: license.trialColor }}>{license.trialInfo}</span>
                        </div>
                    )}
                    <div className={styles.statusRow}>
                        <span className={styles.statusLabel}>{t.account.rowPlan}</span>
                        <span className={styles.statusValue} style={{ color: license?.planColor || 'var(--text-secondary)' }}>{license?.planInfo || '—'}</span>
                    </div>
                    {license?.renewalInfo && (
                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>{license.renewalLabel || t.account.rowRenews}</span>
                            <span className={styles.statusValue}>{license.renewalInfo}</span>
                        </div>
                    )}
                    {/* Trial length + end date — trials only. Paid plans use the
                        Renews/Expires row above instead. */}
                    {license?.trialLength && (
                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>{t.account.rowLength}</span>
                            <span className={styles.statusValue}>{license.trialLength}</span>
                        </div>
                    )}
                </div>

                <div className={styles.statusCard}>
                    <h3>{t.account.quickActions}</h3>
                    <div className={styles.actionsGrid}>
                        {/* Anyone WITHOUT an active licence — trial, expired,
                            pending, no-trial — gets one clear door to the plans
                            page rather than an inline wall of price buttons.
                            The pricing section knows the signed-in uid, so
                            checkout still licenses the right account. */}
                        {license && license.status !== 'licensed' && (
                            <Link to="/plans" className={`${styles.actionBtn} ${styles.actionPrimary}`}>{t.account.choosePlan}</Link>
                        )}
                        {/* Unlisted-price checkout (internal testing) — an EXTRA
                            option beside the real plans, never a replacement. The
                            plan buttons above always charge the price they show;
                            only this button uses the override. Appears solely with
                            a well-formed ?price= in the URL, so no ordinary visitor
                            ever sees it, and Paddle displays the real amount before
                            any payment. */}
                        {license && readPriceOverride() && (
                            <button onClick={() => openCheckout(readPriceOverride()!, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionPrimary}`}>{t.appCheckout.testPlanAccount('$0.71')}</button>
                        )}
                        {/* Subscribers can switch or move up to lifetime on the
                            plans page. NOT shown for lifetime holders — nothing
                            left to buy. */}
                        {license?.status === 'licensed' && !license.isLifetime && (
                            <Link to="/plans" className={`${styles.actionBtn} ${styles.actionSecondary}`}>{t.account.changePlan}</Link>
                        )}
                        {/* Cancel — only with a live subscription and no cancellation
                            already scheduled. Two-step: the first click swaps in an
                            explicit confirm, so a stray click can't end a paid plan. */}
                        {license?.cancellable && !confirmingCancel && (
                            <button onClick={() => setConfirmingCancel(true)} className={`${styles.actionBtn} ${styles.actionSecondary}`}>{t.account.cancelSubscription}</button>
                        )}
                        {license?.cancellable && confirmingCancel && (
                            <>
                                <div className={styles.planPrompt}>
                                    {t.account.cancelPrompt(license.renewalInfo || t.account.cancelPromptFallback)}
                                </div>
                                <button onClick={handleCancelSubscription} disabled={cancelling} className={`${styles.actionBtn} ${styles.actionDanger}`}>
                                    {cancelling ? t.account.cancelling : t.account.yesCancel}
                                </button>
                                <button onClick={() => setConfirmingCancel(false)} disabled={cancelling} className={`${styles.actionBtn} ${styles.actionSecondary}`}>{t.account.keepSubscription}</button>
                            </>
                        )}
                        {/* Stays a direct download — this visitor has already paid. */}
                        <a href="/BridgePlay.dmg" download className={`${styles.actionBtn} ${license && (license.status === 'expired' || license.status === 'noTrial') ? styles.actionSecondary : styles.actionPrimary}`}>{t.account.downloadApp}</a>
                    </div>
                    {/* Card footer, visually separated from the action buttons
                        instead of blending into them. */}
                    <p className={styles.cardFootnote}>
                        {t.account.footnoteBefore} <Link to="/download">{t.account.footnoteLink}</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
