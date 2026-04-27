import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, friendlyAuthError } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { openCheckout, PRICE_IDS } from '../lib/paddle';
import styles from './AccountPage.module.css';

interface LicenseData {
    status: 'licensed' | 'trial' | 'trial-warning' | 'expired' | 'noTrial' | 'pending';
    label: string;
    pillClass: string;
    trialInfo?: string;
    trialColor?: string;
    planInfo: string;
    planColor?: string;
}

export default function AccountPage() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [license, setLicense] = useState<LicenseData | null>(null);
    const [memberSince, setMemberSince] = useState('');

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

    const handleForgot = async () => {
        const emailInput = document.getElementById('auth-email') as HTMLInputElement;
        const email = emailInput?.value.trim();
        if (!email) {
            setError('Enter your email address first, then click "Forgot password?"');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setError('');
            showToast('Password reset email sent! Check your inbox.', 'success');
        } catch (err: unknown) {
            const code = (err as { code?: string }).code || '';
            setError(friendlyAuthError(code));
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        showToast('Signed out.', 'success');
        setLicense(null);
        setMemberSince('');
    };

    // Load dashboard data when user is available
    const loadDashboard = async () => {
        if (!user) return;
        try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (!snap.exists()) {
                setLicense({ status: 'pending', label: 'New Account', pillClass: 'trial', planInfo: 'Open the app to activate your trial' });
                return;
            }
            const data = snap.data();

            if (data.createdAt) {
                const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                setMemberSince('Member since ' + date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
            }

            if (data.purchaseStatus === 'active') {
                setLicense({ status: 'licensed', label: 'Licensed', pillClass: 'licensed', planInfo: 'Active subscription', planColor: 'var(--green)' });
                return;
            }

            if (data.trialStartDate) {
                const trialStart = data.trialStartDate.toDate ? data.trialStartDate.toDate() : new Date(data.trialStartDate);
                const daysPassed = Math.floor((Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
                const daysLeft = Math.max(0, 7 - daysPassed);

                if (daysLeft > 0) {
                    const isWarning = daysLeft <= 2;
                    setLicense({
                        status: isWarning ? 'trial-warning' : 'trial',
                        label: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
                        pillClass: isWarning ? 'trialWarning' : 'trial',
                        trialInfo: `${daysLeft} of 7 days remaining`,
                        trialColor: isWarning ? 'var(--orange)' : 'var(--accent)',
                        planInfo: 'Free trial',
                    });
                } else {
                    setLicense({ status: 'expired', label: 'Trial Expired', pillClass: 'expired', trialInfo: 'Expired', trialColor: 'var(--danger)', planInfo: 'No active plan' });
                }
                return;
            }

            if (data.trialEligible === false) {
                setLicense({ status: 'noTrial', label: 'No Trial', pillClass: 'expired', planInfo: 'No active plan' });
            } else {
                setLicense({ status: 'pending', label: 'Pending', pillClass: 'trial', planInfo: 'Sign in from the app to activate' });
            }
        } catch (err) {
            console.error('Failed to load user data:', err);
            setLicense({ status: 'noTrial', label: 'Error loading', pillClass: 'expired', planInfo: '—' });
        }
    };

    // Trigger dashboard load when user changes
    if (user && !license && !loading) {
        loadDashboard();
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}><div className={styles.spinner} />Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.page}>
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
                            <button type="button" className={styles.forgotLink} onClick={handleForgot}>Forgot password?</button>
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
            </div>
        );
    }

    return (
        <div className={styles.page}>
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
                </div>

                <div className={styles.statusCard}>
                    <h3>Quick Actions</h3>
                    <div className={styles.actionsGrid}>
                        {license && (license.status === 'expired' || license.status === 'noTrial') && (
                            <button onClick={() => openCheckout(PRICE_IDS.yearly, user.email || undefined, user.uid)} className={`${styles.actionBtn} ${styles.actionPrimary}`}>Upgrade Now</button>
                        )}
                        <a href="/BridgePlay.dmg" download className={`${styles.actionBtn} ${license && (license.status === 'expired' || license.status === 'noTrial') ? styles.actionSecondary : styles.actionPrimary}`}>Download BridgePlay</a>
                        <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={handleSignOut}>Sign Out</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
