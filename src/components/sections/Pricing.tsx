import { useNavigate } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useAuth } from '../../context/useAuth';
import { PRICE_IDS, SALES_LIVE, openCheckout } from '../../lib/paddle';
import styles from './Pricing.module.css';

/* Button labels name what the click does. There is no trial configured on these
   Paddle prices — checkout charges the full amount immediately — so no label
   here may say "trial". The genuine free 7 days are claimed in the app; the
   section header says where, and the footer line says what these buttons do.
   The price is deliberately NOT repeated in the label: .amount has its own
   rack-focus beat in the module (blur + scale resolving 200ms after the card
   lands) precisely so the number is the card's payload, and the billing cadence
   already appears in a bullet, which is where a reader looks for terms. Stating
   it a third time in the button only made the card busier. */
const plans = [
    { name: 'Monthly', price: '$6.99', period: '/mo', save: 'Auto-renews monthly', popular: false, priceId: PRICE_IDS.monthly, cta: 'Subscribe', features: ['Every feature — no gated settings', 'Automatic app updates', 'Billed $6.99 every month', 'Cancel anytime; access runs to the end of the month you paid for'] },
    /* The 52% lives in `save`, which the module gives its own beat. It used to
       be restated in the bullet list as well. */
    { name: 'Yearly', price: '$39.99', period: '/yr', save: 'Save 52% vs monthly', popular: true, priceId: PRICE_IDS.yearly, cta: 'Subscribe', features: ['Every feature — no gated settings', 'Automatic app updates', 'Billed $39.99 every 12 months', 'Cancel anytime; access runs to the end of the year you paid for'] },
    { name: 'Lifetime', price: '$59.99', period: '', save: 'Pay once — no renewals', popular: false, priceId: PRICE_IDS.lifetime, cta: 'Buy', features: ['Every feature — no gated settings', 'All future updates included', 'One payment of $59.99', 'No recurring charges, nothing to cancel'] },
];

export default function Pricing() {
    const ref = useScrollReveal<HTMLElement>();
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <section className={styles.section} id="pricing" ref={ref}>
            <div className={styles.container}>
                {/* The trial belongs above the cards, because it is not what these
                    buttons do: the free 7 days are claimed in the app, and checkout
                    takes the full amount immediately. */}
                <SectionHeader
                    label="Pricing"
                    title="Simple, Honest Pricing"
                    description="Every plan unlocks the same app — they differ only in how you pay. The free 7-day trial is separate: it starts inside the app on first launch, with no card and nothing to cancel."
                />
                <div className={styles.grid}>
                    {plans.map((p, i) => (
                        <div
                            key={i}
                            className={`${styles.card} ${p.popular ? styles.popular : ''} reveal`}
                            style={{ ['--i' as string]: [0, 2, 1][i] }}
                        >
                            {p.popular && <div className={styles.badge}>Most Popular</div>}
                            <h3>{p.name}</h3>
                            <div className={styles.amount}>{p.price} <span>{p.period}</span></div>
                            <div className={styles.save}>{p.save}</div>
                            <ul className={styles.features}>
                                {p.features.map((f, j) => <li key={j}>{f}</li>)}
                            </ul>
                            {SALES_LIVE ? (
                                <button
                                    type="button"
                                    className={p.popular ? styles.btnPrimary : styles.btnSecondary}
                                    onClick={() => {
                                        if (user) {
                                            openCheckout(p.priceId, user.email ?? undefined, user.uid);
                                        } else {
                                            navigate('/account');
                                        }
                                    }}
                                >
                                    {p.cta}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    aria-disabled="true"
                                    title="Available at launch"
                                    className={`${styles.btnWait} btn-waiting`}
                                >
                                    Available at Launch
                                </button>
                            )}
                        </div>
                    ))}
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
                        ? `${user
                            ? 'These open Paddle checkout and charge the full amount today'
                            : 'These take you to sign-in first, then to Paddle checkout for the full amount'
                        } · 7-day money-back guarantee · monthly and yearly plans renew automatically until you cancel`
                        : 'Plans open for purchase at launch'}
                </p>
            </div>
        </section>
    );
}
