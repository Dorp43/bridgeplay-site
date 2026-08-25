import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, friendlyAuthError } from '../lib/firebase';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { openCheckout, PRICE_IDS, readPriceOverride } from '../lib/paddle';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
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
function renewalFor(data: Record<string, unknown>): { renewalLabel: string; renewalInfo: string } | null {
    if (isLifetimeDoc(data)) return null;
    const plan = data.plan as string | undefined;
    const renewalLabel = data.cancelAtPeriodEnd ? 'Expires' : 'Renews';

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

    useDocumentMeta({
        title: 'Account — BridgePlay',
        description: 'Sign in to your BridgePlay account to check your license status and manage your plan.',
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
                showToast('Account created! Welcome to BridgePlay.', 'success');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                showToast('Signed in successfully!', 'success');
            }
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            setError(friendlyAuthError(code));
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
            showToast('Signed in with Google!', 'success');
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
                setError(friendlyAuthError(code));
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
            setError(friendlyAuthError(code));
        }
        setSubmitting(false);
    };

    const handleSignOut = async () => {
        await signOut(auth);
        showToast('Signed out.', 'success');
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
                showToast('Subscription cancelled. Access continues until the end of the period you paid for.', 'success');
                const refreshed = await loadDashboard();
                if (refreshed) setLicense(refreshed.license);
            } else if (resp.status === 501) {
                showToast('Cancellation is not available right now. Email support and we will cancel it for you.', 'error');
            } else {
                const body = await resp.json().catch(() => ({}));
                showToast(body.error || 'Could not cancel the subscription. Please try again.', 'error');
            }
        } catch {
            showToast('Could not reach the server. Check your connection and try again.', 'error');
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
                return { license: { status: 'pending', label: 'New Account', pillClass: 'trial', planInfo: 'No active plan', trialInfo: 'Not started — sign in from the app to activate it. New Macs get 7 days free.', trialColor: 'var(--text-muted)' }, memberSince: '' };
            }
            const data = snap.data();

            let memberSince = '';
            if (data.createdAt) {
                const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                memberSince = 'Member since ' + date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            }

            if (data.purchaseStatus === 'active') {
                const planLabel = data.plan === 'monthly' ? 'Monthly plan'
                    : data.plan === 'yearly' ? 'Yearly plan'
                    : isLifetimeDoc(data) ? 'Lifetime license'
                    : 'Active subscription';
                const renewal = renewalFor(data);
                // Cancellable only when a real subscription is running and a
                // cancellation isn't already scheduled — lifetime has nothing
                // to cancel, and cancelling twice is a confusing no-op.
                const cancellable = !isLifetimeDoc(data)
                    && !!data.paddleSubscriptionId
                    && !data.cancelAtPeriodEnd;
                return {
                    license: {
                        status: 'licensed', label: 'Licensed', pillClass: 'licensed',
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
                    const trialEndStr = trialEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    return {
                        license: {
                            status: isWarning ? 'trial-warning' : 'trial',
                            label: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
                            pillClass: isWarning ? 'trialWarning' : 'trial',
                            trialInfo: `${daysLeft} of ${TRIAL_DURATION_DAYS} days remaining`,
                            trialColor: isWarning ? 'var(--orange)' : 'var(--accent)',
                            planInfo: 'Free trial',
                            trialLength: `${TRIAL_DURATION_DAYS}-day trial · ends ${trialEndStr}`,
                        },
                        memberSince,
                    };
                }
                return { license: { status: 'expired', label: 'Trial Expired', pillClass: 'expired', trialInfo: 'Expired', trialColor: 'var(--danger)', planInfo: 'No active plan' }, memberSince };
            }

            if (data.trialEligible === false) {
                return { license: { status: 'noTrial', label: 'No Trial', pillClass: 'expired', planInfo: 'No active plan' }, memberSince };
            }
            return { license: { status: 'pending', label: 'Pending', pillClass: 'trial', planInfo: 'No active plan', trialInfo: 'Not started — sign in from the app to activate it', trialColor: 'var(--text-muted)' }, memberSince };
        } catch (err) {
            console.error('Failed to load user data:', err);
            return { license: { status: 'noTrial', label: 'Error loading', pillClass: 'expired', planInfo: '—' }, memberSince: '' };
        }
    }, [user]);

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
                    <h1>Reset Password</h1>
                    <p className={styles.subtitle}>
                        Enter your email and we'll send you a link to reset your password.
                    </p>

                    {error && <div className={styles.error}>{error}</div>}
                    {resetSent && (
                        <div className={styles.successBanner}>
                            Reset link sent! Check your inbox and spam folder.
                        </div>
                    )}

                    <form onSubmit={handleForgotSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="forgot-email">Email</label>
                            <input
                                type="email"
                                id="forgot-email"
                                name="email"
                                placeholder="you@example.com"
                                defaultValue={forgotPrefill}
                                autoFocus
                                required
                            />
                        </div>
                        <button type="submit" className={styles.authBtn} disabled={submitting}>
                            {submitting ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <p className={styles.toggle}>
                        <a onClick={() => { setIsForgot(false); setError(''); setResetSent(false); }}>Back to Sign In</a>
                    </p>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main id="main-content" tabIndex={-1} className={styles.page}>
                <div className={styles.authCard}>
                    <h1>{isSignUp ? 'Create Account' : 'Sign In'}</h1>
                    <p className={styles.subtitle}>
                        {isSignUp ? 'Sign up to start your 7-day free trial.' : 'Sign in to view your account details.'}
                    </p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="auth-email">Email</label>
                            <input type="email" id="auth-email" name="email" placeholder="you@example.com" required />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="auth-password">Password</label>
                            <input type="password" id="auth-password" name="password" placeholder="Your password" required />
                        </div>
                        {!isSignUp && (
                            <button type="button" className={styles.forgotLink} onClick={openForgot}>Forgot password?</button>
                        )}
                        <button type="submit" className={styles.authBtn} disabled={submitting}>
                            {submitting ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className={styles.authDivider}><span>or</span></div>

                    <button type="button" className={styles.googleBtn} onClick={handleGoogleSignIn} disabled={submitting}>
                        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Continue with Google
                    </button>

                    <p className={styles.toggle}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <a onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>{isSignUp ? 'Sign In' : 'Sign Up'}</a>
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
                        <span className={styles.dashEyebrow}>Account</span>
                        <h2 className={styles.profileEmail}>{user.email}</h2>
                        {memberSince && <div className={styles.memberSince}>{memberSince}</div>}
                    </div>
                    <div className={styles.dashHeaderActions}>
                        {license && <span className={`${styles.pill} ${styles[license.pillClass]}`}>{license.label}</span>}
                        <button className={styles.signOutGhost} onClick={handleSignOut}>Sign out</button>
                    </div>
                </div>

                <div className={styles.statusCard}>
                    <h3>License</h3>
                    {license?.trialInfo && (
                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>Trial</span>
                            <span className={styles.statusValue} style={{ color: license.trialColor }}>{license.trialInfo}</span>
                        </div>
                    )}
                    <div className={styles.statusRow}>
                        <span className={styles.statusLabel}>Plan</span>
                        <span className={styles.statusValue} style={{ color: license?.planColor || 'var(--text-secondary)' }}>{license?.planInfo || '—'}</span>
                    </div>
                    {license?.renewalInfo && (
                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>{license.renewalLabel || 'Renews'}</span>
                            <span className={styles.statusValue}>{license.renewalInfo}</span>
                        </div>
                    )}
                    {/* Trial length + end date — trials only. Paid plans use the
                        Renews/Expires row above instead. */}
                    {license?.trialLength && (
                        <div className={styles.statusRow}>
                            <span className={styles.statusLabel}>Length</span>
                            <span className={styles.statusValue}>{license.trialLength}</span>
                        </div>
                    )}
                </div>

                <div className={styles.statusCard}>
                    <h3>Quick Actions</h3>
                    <div className={styles.actionsGrid}>
                        {/* Anyone WITHOUT an active licence — trial, expired,
                            pending, no-trial — can buy from here, not only the
                            locked-out. Same prices and price ids as the Pricing
                            section; each opens Paddle with the signed-in uid. */}
                        {license && license.status !== 'licensed' && (
                            <>
                                <div className={styles.planPrompt}>Choose a plan</div>
                                <button onClick={() => openCheckout(PRICE_IDS.yearly, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionPrimary}`}>Yearly — $39.99/yr · Save 52%</button>
                                <button onClick={() => openCheckout(PRICE_IDS.monthly, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionSecondary}`}>Monthly — $6.99/mo</button>
                                <button onClick={() => openCheckout(PRICE_IDS.lifetime, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionSecondary}`}>Lifetime — $59.99 once</button>
                            </>
                        )}
                        {/* Unlisted-price checkout (internal testing) — an EXTRA
                            option beside the real plans, never a replacement. The
                            plan buttons above always charge the price they show;
                            only this button uses the override. Appears solely with
                            a well-formed ?price= in the URL, so no ordinary visitor
                            ever sees it, and Paddle displays the real amount before
                            any payment. */}
                        {license && readPriceOverride() && (
                            <button onClick={() => openCheckout(readPriceOverride()!, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionPrimary}`}>Daily — $0.71/day · internal test</button>
                        )}
                        {/* Subscribers can move up to the one-time purchase. This is
                            a genuine upgrade path with no server work: lifetime is a
                            separate one-time charge, the webhook flips the plan, and
                            cancelling the old subscription afterwards keeps lifetime
                            access (the lapse handler protects it). NOT shown for
                            lifetime holders — nothing left to buy. */}
                        {license?.status === 'licensed' && !license.isLifetime && (
                            <>
                                <div className={styles.planPrompt}>Change plan</div>
                                <button onClick={() => openCheckout(PRICE_IDS.lifetime, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionSecondary}`}>Upgrade to Lifetime — $59.99 once</button>
                                <p className={styles.planHint}>One payment, no more renewals. After upgrading, cancel your subscription below — your lifetime access stays.</p>
                            </>
                        )}
                        {/* Cancel — only with a live subscription and no cancellation
                            already scheduled. Two-step: the first click swaps in an
                            explicit confirm, so a stray click can't end a paid plan. */}
                        {license?.cancellable && !confirmingCancel && (
                            <button onClick={() => setConfirmingCancel(true)} className={`${styles.actionBtn} ${styles.actionSecondary}`}>Cancel Subscription</button>
                        )}
                        {license?.cancellable && confirmingCancel && (
                            <>
                                <div className={styles.planPrompt}>
                                    Cancel your subscription? You keep access until {license.renewalInfo || 'the end of the period you paid for'}.
                                </div>
                                <button onClick={handleCancelSubscription} disabled={cancelling} className={`${styles.actionBtn} ${styles.actionDanger}`}>
                                    {cancelling ? 'Cancelling…' : 'Yes, cancel it'}
                                </button>
                                <button onClick={() => setConfirmingCancel(false)} disabled={cancelling} className={`${styles.actionBtn} ${styles.actionSecondary}`}>Keep my subscription</button>
                            </>
                        )}
                        {/* Stays a direct download — this visitor has already paid. */}
                        <a href="/BridgePlay.dmg" download className={`${styles.actionBtn} ${license && (license.status === 'expired' || license.status === 'noTrial') ? styles.actionSecondary : styles.actionPrimary}`}>Download BridgePlay</a>
                    </div>
                    {/* Card footer, visually separated from the action buttons
                        instead of blending into them. */}
                    <p className={styles.cardFootnote}>
                        Installing on a new Mac? <Link to="/download">Requirements, checksum and first-launch steps</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
