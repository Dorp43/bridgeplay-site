import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/useAuth';
import { SALES_LIVE, openCheckout } from '../lib/paddle';
import { PLANS, PLAN_ORDER } from '../lib/plans';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useI18n } from '../i18n/useI18n';
import pricing from '../components/sections/Pricing.module.css';
import styles from './PlansPage.module.css';

/* Dedicated plans page, reached by "Choose a Plan" / "Change Plan" on the
   account page. Slides in from the right. The plan the visitor already holds
   is disabled — a lifetime holder has every card disabled, since both
   subscriptions would be a strict downgrade on top of a double charge.

   Catalogue copy comes from the dictionary and the ids from lib/plans.ts, the
   same two sources the marketing Pricing section reads. */
export default function PlansPage() {
    const { user, loading } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    /* The held plan, keyed by uid so a stale fetch never labels the wrong
       account. Every setState below happens AFTER the awaited fetch. */
    const [fetched, setFetched] = useState<{ uid: string; plan: string | null } | null>(null);

    useDocumentMeta({
        title: t.meta.plans.title,
        description: t.meta.plans.description,
        canonicalPath: '/plans',
    });

    useEffect(() => {
        if (!user || fetched?.uid === user.uid) return;
        let cancelled = false;
        (async () => {
            let plan: string | null = null;
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                const data = snap.exists() ? snap.data() : null;
                if (data?.purchaseStatus === 'active') {
                    const p = data.plan as string | undefined;
                    if (p === 'monthly' || p === 'yearly') plan = p;
                    else if (p === 'lifetime' || !data.paddleSubscriptionId) plan = 'lifetime';
                }
            } catch { /* treated as no active plan */ }
            if (!cancelled) setFetched({ uid: user.uid, plan });
        })();
        return () => { cancelled = true; };
    }, [user, fetched]);

    /* null = no active plan; undefined = still resolving. */
    const currentPlan: string | null | undefined =
        user ? (fetched?.uid === user.uid ? fetched.plan : undefined) : null;
    const resolving = loading || currentPlan === undefined;

    return (
        <main id="main-content" tabIndex={-1} className={styles.page}>
            <div className={styles.head}>
                <Link to="/account" className={styles.backLink}>{t.plansPage.backToAccount}</Link>
                <h1>{t.plansPage.title}</h1>
                <p className={styles.sub}>
                    {t.plansPage.sub}
                    {currentPlan && t.plansPage.currentMarked}
                </p>
            </div>

            <div className={`${pricing.grid} ${styles.grid}`}>
                {PLAN_ORDER.map((key) => {
                    const plan = PLANS[key];
                    const copy = t.plans[key];
                    const isCurrent = currentPlan === key;
                    /* Lifetime already includes everything below it. */
                    const isCovered = currentPlan === 'lifetime' && !isCurrent;
                    const disabled = resolving || isCurrent || isCovered;
                    return (
                        <div
                            key={key}
                            className={`${pricing.card} ${plan.popular ? pricing.popular : ''} ${isCurrent || isCovered ? styles.held : ''}`}
                        >
                            {isCurrent
                                ? <div className={styles.currentBadge}>{t.plansPage.currentBadge}</div>
                                : plan.popular && <div className={pricing.badge}>{t.pricing.mostPopular}</div>}
                            <h3>{copy.name}</h3>
                            <div className={pricing.amount}>{plan.price} <span>{plan.period}</span></div>
                            <div className={pricing.save}>{copy.save}</div>
                            <ul className={pricing.features}>
                                {copy.features.map((f, j) => <li key={j}>{f}</li>)}
                            </ul>
                            {SALES_LIVE && (
                                <button
                                    type="button"
                                    className={plan.popular ? pricing.btnPrimary : pricing.btnSecondary}
                                    disabled={disabled}
                                    aria-disabled={disabled}
                                    title={isCovered ? t.plansPage.includedTitle : undefined}
                                    onClick={() => {
                                        if (disabled) return;
                                        if (user) openCheckout(plan.priceId, user.email ?? undefined, user.uid);
                                        else navigate('/account');
                                    }}
                                >
                                    {resolving ? '…'
                                        : isCurrent ? t.plansPage.currentPlanCta
                                        : isCovered ? t.plansPage.includedInLifetime
                                        : user ? copy.cta
                                        : t.plansPage.signInToBuy}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className={styles.footnote}>
                {t.plansPage.footnoteBefore}{' '}
                <Link to="/account">{t.plansPage.footnoteLink}</Link>{t.plansPage.footnoteAfter}
            </p>
        </main>
    );
}
