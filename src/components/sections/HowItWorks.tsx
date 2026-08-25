import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useI18n } from '../../i18n/useI18n';
import en from '../../i18n/locales/en';
import styles from './HowItWorks.module.css';

/* Order lives here, wording in the dictionary. Numerals are rendered from the
   index rather than stored, so no translator can renumber the steps. */
const STEPS = ['download', 'signUp', 'addGames', 'play'] as const satisfies readonly (keyof typeof en.howItWorks.steps)[];

export default function HowItWorks() {
    const ref = useScrollReveal<HTMLElement>();
    const { t } = useI18n();

    return (
        <section className={styles.section} id="how-it-works" ref={ref} data-band-seam>
            <div className={styles.container}>
                <SectionHeader label={t.howItWorks.label} title={t.howItWorks.title} description={t.howItWorks.description} />
                <div className={styles.steps}>
                    {STEPS.map((key, i) => {
                        const step = t.howItWorks.steps[key];
                        return (
                            <div key={key} className={`${styles.step} reveal`} style={{ ['--i' as string]: i }}>
                                {i < STEPS.length - 1 && <div className={styles.connector} />}
                                <div className={styles.number}>{i + 1}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
