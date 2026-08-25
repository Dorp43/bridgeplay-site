import { useNavigate } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useAuth } from '../../context/useAuth';
import { SALES_LIVE, openCheckout } from '../../lib/paddle';
import { PLANS, PLAN_ORDER } from '../../lib/plans';
import { useI18n } from '../../i18n/useI18n';
import styles from './Pricing.module.css';

/* Button labels name what the click does. There is no trial configured on these
   Paddle prices — checkout charges the full amount immediately — so no label
   here may say "trial". The genuine free 7 days are claimed in the app; the
   section header says where, and the footer line says what these buttons do.
   The price is deliberately NOT repeated in the label: .amount has its own
   rack-focus beat in the module (blur + scale resolving 200ms after the card
   lands) precisely so the number is the card's payload, and the billing cadence
   already appears in a bullet, which is where a reader looks for terms. Stating
   it a third time in the button only made the card busier.

   Copy lives in the dictionary under `plans.<key>`; ids and amounts in
   lib/plans.ts. This section, /plans and /app-checkout all read the same two. */
export default function Pricing() {
    const ref = useScrollReveal<HTMLElement>();
    const { user } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();

    return (
        <section className={styles.section} id="pricing" ref={ref}>
            <div className={styles.container}>
                {/* The trial belongs above the cards, because it is not what these
                    buttons do: the free 7 days are claimed in the app, and checkout
                    takes the full amount immediately. */}
                <SectionHeader
                    label={t.pricing.label}
                    title={t.pricing.title}
                    description={t.pricing.description}
                />
                <div className={styles.grid}>
                    {PLAN_ORDER.map((key, i) => {
                        const plan = PLANS[key];
                        const copy = t.plans[key];
                        return (
                            <div
                                key={key}
                                className={`${styles.card} ${plan.popular ? styles.popular : ''} reveal`}
                                style={{ ['--i' as string]: [0, 2, 1][i] }}
                            >
                                {plan.popular && <div className={styles.badge}>{t.pricing.mostPopular}</div>}
                                <h3>{copy.name}</h3>
                                <div className={styles.amount}>{plan.price} <span>{plan.period}</span></div>
                                <div className={styles.save}>{copy.save}</div>
                                <ul className={styles.features}>
                                    {copy.features.map((f, j) => <li key={j}>{f}</li>)}
                                </ul>
                                {SALES_LIVE ? (
                                    <button
                                        type="button"
                                        className={plan.popular ? styles.btnPrimary : styles.btnSecondary}
                                        onClick={() => {
                                            if (user) {
                                                openCheckout(plan.priceId, user.email ?? undefined, user.uid);
                                            } else {
                                                navigate('/account');
                                            }
                                        }}
                                    >
                                        {copy.cta}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        aria-disabled="true"
                                        title={t.pricing.availableAtLaunchTitle}
                                        className={`${styles.btnWait} btn-waiting`}
                                    >
                                        {t.pricing.availableAtLaunch}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                {/* Sits directly under the buttons: what the click does, then the
                    terms. No reveal class here or above — nothing in this block has
                    a className that changes with state.

                    Branches on `user` because the onClick above does: signed out —
                    the default state for this page — the button opens no checkout
                    and charges nothing, it navigates to /account first. The
                    guarantee and renewal terms are inside the SALES_LIVE branch,
                    so the paused-sales copy does not describe billing that cannot
                    happen. */}
                <p className={styles.footer}>
                    {SALES_LIVE
                        ? (user ? t.pricing.footerSignedIn : t.pricing.footerSignedOut)
                        : t.pricing.footerPaused}
                </p>
            </div>
        </section>
    );
}
