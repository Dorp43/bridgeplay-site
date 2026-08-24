import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, friendlyAuthError } from '../lib/firebase';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { openCheckout, PRICE_IDS } from '../lib/paddle';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import styles from './AccountPage.module.css';

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
}

/// Resolve when an active plan renews/expires from the user doc. Prefers the
/// exact period end the webhook stored (currentPeriodEnd); falls back to
/// purchaseDate + the plan interval for accounts that predate that field.
function renewalFor(data: Record<string, unknown>): { renewalLabel: string; renewalInfo: string } | null {
    const plan = data.plan as string | undefined;
    const isLifetime = plan === 'lifetime' || !data.paddleSubscriptionId;
    if (isLifetime) return { renewalLabel: 'Plan', renewalInfo: 'Lifetime — never expires' };

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const cpe = data.currentPeriodEnd as string | undefined;
    if (cpe) return { renewalLabel: 'Renews', renewalInfo: fmt(new Date(cpe)) };

    // Fallback: purchaseDate + interval.
    const pd = data.purchaseDate as string | undefined;
    if (pd && (plan === 'monthly' || plan === 'yearly')) {
        const end = new Date(pd);
        if (plan === 'monthly') end.setMonth(end.getMonth() + 1);
        else end.setFullYear(end.getFullYear() + 1);
        return { renewalLabel: 'Renews', renewalInfo: fmt(end) };
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

    // Load dashboard data when user is available
    const loadDashboard = useCallback(async (): Promise<{ license: LicenseData; memberSince: string } | null> => {
        if (!user) return null;
        try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (!snap.exists()) {
                return { license: { status: 'pending', label: 'New Account', pillClass: 'trial', planInfo: 'Open the app to activate your trial' }, memberSince: '' };
            }
            const data = snap.data();

            let memberSince = '';
            if (data.createdAt) {
                const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                memberSince = 'Member since ' + date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            }

            if (data.purchaseStatus === 'active') {
                const planLabel = data.plan === 'lifetime' || !data.paddleSubscriptionId
                    ? 'Lifetime license'
                    : data.plan === 'monthly' ? 'Monthly plan'
                    : data.plan === 'yearly' ? 'Yearly plan'
                    : 'Active subscription';
                const renewal = renewalFor(data);
                return {
                    license: {
                        status: 'licensed', label: 'Licensed', pillClass: 'licensed',
                        planInfo: planLabel, planColor: 'var(--green)',
                        ...(renewal ?? {}),
                    },
                    memberSince,
                };
            }

            if (data.trialStartDate) {
                const trialStart = data.trialStartDate.toDate ? data.trialStartDate.toDate() : new Date(data.trialStartDate);
                const daysPassed = Math.floor((Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
                const daysLeft = Math.max(0, 7 - daysPassed);

                if (daysLeft > 0) {
                    const isWarning = daysLeft <= 2;
                    return {
                        license: {
                            status: isWarning ? 'trial-warning' : 'trial',
                            label: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
                            pillClass: isWarning ? 'trialWarning' : 'trial',
                            trialInfo: `${daysLeft} of 7 days remaining`,
                            trialColor: isWarning ? 'var(--orange)' : 'var(--accent)',
                            planInfo: 'Free trial',
                        },
                        memberSince,
                    };
                }
                return { license: { status: 'expired', label: 'Trial Expired', pillClass: 'expired', trialInfo: 'Expired', trialColor: 'var(--danger)', planInfo: 'No active plan' }, memberSince };
            }

            if (data.trialEligible === false) {
                return { license: { status: 'noTrial', label: 'No Trial', pillClass: 'expired', planInfo: 'No active plan' }, memberSince };
            }
            return { license: { status: 'pending', label: 'Pending', pillClass: 'trial', planInfo: 'Sign in from the app to activate' }, memberSince };
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
    if (loading) {
        return (
            <main id="main-content" tabIndex={-1} className={styles.page}>
                <div className={styles.loading}><div className={styles.spinner} />Loading...</div>
            </main>
        );
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

                    <p className={styles.toggle}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <a onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>{isSignUp ? 'Sign In' : 'Sign Up'}</a>
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main id="main-content" tabIndex={-1} className={styles.page}>
            <div className={styles.dashboard}>
                <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>{(user.email || '?')[0].toUpperCase()}</div>
                    <div>
                        <h2 className={styles.profileEmail}>{user.email}</h2>
                        {memberSince && <div className={styles.memberSince}>{memberSince}</div>}
                    </div>
                </div>

                <div className={styles.statusCard}>
                    <h3>License</h3>
                    <div className={styles.statusRow}>
                        <span className={styles.statusLabel}>Status</span>
                        {license && <span className={`${styles.pill} ${styles[license.pillClass]}`}>{license.label}</span>}
                    </div>
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
                </div>

                <div className={styles.statusCard}>
                    <h3>Quick Actions</h3>
                    <div className={styles.actionsGrid}>
                        {license && (license.status === 'expired' || license.status === 'noTrial') && (
                            <>
                                {/* All three plans, not just yearly — same prices
                                    and price ids as the Pricing section. Yearly is
                                    the primary (most popular); monthly + lifetime
                                    are secondary. Each opens its own Paddle
                                    checkout with the signed-in uid. */}
                                <div className={styles.planPrompt}>Choose a plan</div>
                                <button onClick={() => openCheckout(PRICE_IDS.yearly, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionPrimary}`}>Yearly — $39.99/yr · Save 52%</button>
                                <button onClick={() => openCheckout(PRICE_IDS.monthly, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionSecondary}`}>Monthly — $6.99/mo</button>
                                <button onClick={() => openCheckout(PRICE_IDS.lifetime, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionSecondary}`}>Lifetime — $59.99 once</button>
                            </>
                        )}
                        {/* Stays a direct download — this visitor has already paid. */}
                        <a href="/BridgePlay.dmg" download className={`${styles.actionBtn} ${license && (license.status === 'expired' || license.status === 'noTrial') ? styles.actionSecondary : styles.actionPrimary}`}>Download BridgePlay</a>
                        <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={handleSignOut}>Sign Out</button>
                    </div>
                    {/* Reuses the auth card's quiet-link treatment rather than adding a
                        one-off style. */}
                    <p className={styles.toggle}>
                        Installing on a new Mac? <Link to="/download">Requirements, checksum and first-launch steps</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
