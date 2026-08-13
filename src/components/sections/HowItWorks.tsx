import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './HowItWorks.module.css';

const steps = [
    { num: '1', title: 'Download', desc: 'Download BridgePlay for free and drag it to your Applications folder.' },
    { num: '2', title: 'Sign Up in the App', desc: 'Open BridgePlay and create your account on first launch — that is where your 7-day trial is claimed. No credit card required.' },
    { num: '3', title: 'Add Your Games', desc: 'Point BridgePlay at a folder you already have a Windows game in. It finds the program file to launch.' },
    { num: '4', title: 'Play', desc: 'Press Launch. BridgePlay starts Wine with that game\'s settings, then stays out of your way.' },
];

export default function HowItWorks() {
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.section} id="how-it-works" ref={ref} data-band-seam>
            <div className={styles.container}>
                <SectionHeader label="Getting Started" title="Up and Running in Minutes" description="Four steps from downloading BridgePlay to launching a game you already own." />
                <div className={styles.steps}>
                    {steps.map((s, i) => (
                        <div key={i} className={`${styles.step} reveal`} style={{ ['--i' as string]: i }}>
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
