import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { PRICE_IDS } from '../../lib/paddle';
import styles from './Pricing.module.css';

const plans = [
    { name: 'Monthly', price: '$6.99', period: '/mo', save: '\u00A0', popular: false, priceId: PRICE_IDS.monthly, features: ['Full access to BridgePlay', 'All game compatibility', 'Automatic updates', 'Cancel anytime'] },
    { name: 'Yearly', price: '$39.99', period: '/yr', save: 'Save 52% vs monthly', popular: true, priceId: PRICE_IDS.yearly, features: ['Full access to BridgePlay', 'All game compatibility', 'Automatic updates', 'Cancel anytime'] },
    { name: 'Lifetime', price: '$59.99', period: '', save: 'Pay once, own forever', popular: false, priceId: PRICE_IDS.lifetime, features: ['Full access to BridgePlay', 'All game compatibility', 'Lifetime updates', 'No recurring charges'] },
];

export default function Pricing() {
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.section} id="pricing" ref={ref}>
            <div className={styles.container}>
                <SectionHeader label="Pricing" title="Simple, Honest Pricing" description="Plans go live at launch. Start with a free 7-day trial — no credit card required when we ship." />
                <div className={styles.grid}>
                    {plans.map((p, i) => (
                        <div key={i} className={`${styles.card} ${p.popular ? styles.popular : ''} reveal`}>
                            {p.popular && <div className={styles.badge}>Most Popular</div>}
                            <h3>{p.name}</h3>
                            <div className={styles.amount}>{p.price} <span>{p.period}</span></div>
                            <div className={styles.save}>{p.save}</div>
                            <ul className={styles.features}>
                                {p.features.map((f, j) => <li key={j}>{f}</li>)}
                            </ul>
                            <button
                                type="button"
                                disabled
                                aria-disabled="true"
                                title="Available at launch"
                                className={`${p.popular ? styles.btnPrimary : styles.btnSecondary} ${styles.disabled}`}
                            >
                                Available at Launch
                            </button>
                        </div>
                    ))}
                </div>
                <p className={styles.footer}>7-day free trial &middot; 7-day money-back guarantee &middot; Available at launch.</p>
            </div>
        </section>
    );
}
