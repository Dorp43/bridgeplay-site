import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/useAuth';
import { PRICE_IDS, SALES_LIVE, openCheckout } from '../lib/paddle';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import pricing from '../components/sections/Pricing.module.css';
import styles from './PlansPage.module.css';

/* Same catalogue as the marketing Pricing section — one source of truth for
   copy would be nicer, but the two surfaces phrase CTAs differently, so the
   price ids are the shared constant and the words live where they're shown. */
const plans = [
    { key: 'monthly', name: 'Monthly', price: '$6.99', period: '/mo', save: 'Auto-renews monthly', popular: false, priceId: PRICE_IDS.monthly, cta: 'Subscribe', features: ['Every feature — no gated settings', 'Automatic app updates', 'Billed $6.99 every month', 'Cancel anytime; access runs to the end of the month you paid for'] },
    { key: 'yearly', name: 'Yearly', price: '$39.99', period: '/yr', save: 'Save 52% vs monthly', popular: true, priceId: PRICE_IDS.yearly, cta: 'Subscribe', features: ['Every feature — no gated settings', 'Automatic app updates', 'Billed $39.99 every 12 months', 'Cancel anytime; access runs to the end of the year you paid for'] },
    { key: 'lifetime', name: 'Lifetime', price: '$59.99', period: '', save: 'Pay once — no renewals', popular: false, priceId: PRICE_IDS.lifetime, cta: 'Buy', features: ['Every feature — no gated settings', 'All future updates included', 'One payment of $59.99', 'No recurring charges, nothing to cancel'] },
];

/* Dedicated plans page, reached by "Choose a Plan" / "Change Plan" on the
   account page. Slides in from the right. The plan the visitor already holds
   is disabled — a lifetime holder has every card disabled, since both
   subscriptions would be a strict downgrade on top of a double charge. */
export default function PlansPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    /* null = no active plan; 'monthly' | 'yearly' | 'lifetime' otherwise.
       undefined = still resolving. */
    const [currentPlan, setCurrentPlan] = useState<string | null | undefined>(undefined);

    useDocumentMeta({
        title: 'Plans — BridgePlay',
        description: 'Choose the BridgePlay plan that fits: monthly, yearly, or a one-time lifetime purchase.',
        canonicalPath: '/plans',
    });

    useEffect(() => {
        if (loading) return;
        if (!user) { setCurrentPlan(null); return; }
        let cancelled = false;
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                const data = snap.exists() ? snap.data() : null;
                if (cancelled) return;
                if (data?.purchaseStatus !== 'active') { setCurrentPlan(null); return; }
                const plan = data.plan as string | undefined;
                if (plan === 'monthly' || plan === 'yearly') setCurrentPlan(plan);
                else if (plan === 'lifetime' || !data.paddleSubscriptionId) setCurrentPlan('lifetime');
                else setCurrentPlan(null);
            } catch {
                if (!cancelled) setCurrentPlan(null);
            }
        })();
        return () => { cancelled = true; };
    }, [user, loading]);

    const resolving = loading || currentPlan === undefined;

    return (
        <main id="main-content" tabIndex={-1} className={styles.page}>
            <div className={styles.head}>
                <Link to="/account" className={styles.backLink}>&larr; Back to account</Link>
                <h1>Choose Your Plan</h1>
                <p className={styles.sub}>
                    Every plan unlocks the same app — they differ only in how you pay.
                    {currentPlan && ' Your current plan is marked below.'}
                </p>
            </div>

            <div className={`${pricing.grid} ${styles.grid}`}>
                {plans.map((p) => {
                    const isCurrent = currentPlan === p.key;
                    /* Lifetime already includes everything below it. */
                    const isCovered = currentPlan === 'lifetime' && !isCurrent;
                    const disabled = resolving || isCurrent || isCovered;
                    return (
                        <div
                            key={p.key}
                            className={`${pricing.card} ${p.popular ? pricing.popular : ''} ${isCurrent || isCovered ? styles.held : ''}`}
                        >
                            {isCurrent
                                ? <div className={styles.currentBadge}>Current plan</div>
                                : p.popular && <div className={pricing.badge}>Most Popular</div>}
                            <h3>{p.name}</h3>
                            <div className={pricing.amount}>{p.price} <span>{p.period}</span></div>
                            <div className={pricing.save}>{p.save}</div>
                            <ul className={pricing.features}>
                                {p.features.map((f, j) => <li key={j}>{f}</li>)}
                            </ul>
                            {SALES_LIVE && (
                                <button
                                    type="button"
                                    className={p.popular ? pricing.btnPrimary : pricing.btnSecondary}
                                    disabled={disabled}
                                    aria-disabled={disabled}
                                    title={isCovered ? 'Included in your lifetime license' : undefined}
                                    onClick={() => {
                                        if (disabled) return;
                                        if (user) openCheckout(p.priceId, user.email ?? undefined, user.uid);
                                        else navigate('/account');
                                    }}
                                >
                                    {resolving ? '…' : isCurrent ? 'Current Plan' : isCovered ? 'Included in Lifetime' : user ? p.cta : 'Sign in to buy'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className={styles.footnote}>
                Secure checkout by Paddle · 7-day money-back guarantee ·
                Subscriptions can be cancelled any time from your <Link to="/account">account</Link>.
            </p>
        </main>
    );
}
