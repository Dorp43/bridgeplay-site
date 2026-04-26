import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './HowItWorks.module.css';

const steps = [
    { num: '1', title: 'Download', desc: 'Download BridgePlay for free and drag it to your Applications folder.' },
    { num: '2', title: 'Sign Up', desc: 'Create a free account and start your 7-day trial. No credit card required.' },
    { num: '3', title: 'Add Games', desc: 'Point BridgePlay to your Windows game folders. It auto-detects executables.' },
    { num: '4', title: 'Play', desc: 'Click launch and start playing. BridgePlay handles everything behind the scenes.' },
];

export default function HowItWorks() {
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.section} id="how-it-works" ref={ref}>
            <div className={styles.container}>
                <SectionHeader label="Getting Started" title="Up and Running in Minutes" description="From download to playing your first game — it only takes a few minutes." />
                <div className={styles.steps}>
                    {steps.map((s, i) => (
                        <div key={i} className={`${styles.step} reveal`}>
                            {i < steps.length - 1 && <div className={styles.connector} />}
                            <div className={styles.number}>{s.num}</div>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
