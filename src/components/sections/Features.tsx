import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Features.module.css';

const features = [
    { icon: '\u25B6', color: 'var(--accent)', bg: 'var(--accent-glow)', title: 'One-Click Launch', desc: 'Add your games to the library and launch them instantly. No command line, no configuration files. Just click and play.' },
    { icon: '\u2699', color: 'var(--green)', bg: 'var(--green-glow)', title: 'Auto-Configuration', desc: 'BridgePlay automatically detects game executables and configures optimal settings for each title.' },
    { icon: '\u2193', color: 'var(--purple)', bg: 'rgba(167,139,250,0.12)', title: 'Automatic Updates', desc: 'Always stay on the latest version. BridgePlay checks for updates on launch and installs them seamlessly.' },
    { icon: '\u2630', color: 'var(--pink)', bg: 'rgba(244,114,182,0.12)', title: 'Game Library', desc: 'Organize your collection with custom categories and per-game settings. Your library, your way.' },
    { icon: '\u26A1', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', title: 'Apple Silicon Native', desc: 'Built specifically for M-series chips. BridgePlay leverages the power of Apple Silicon for the best experience.' },
    { icon: '\uD83D\uDD12', color: 'var(--accent)', bg: 'rgba(74,158,255,0.12)', title: 'Secure & Private', desc: 'No telemetry, no tracking. Your gaming data stays on your Mac. We only store what\'s needed for your account.' },
];

export default function Features() {
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.features} id="features" ref={ref}>
            <div className={styles.container}>
                <SectionHeader label="Features" title="Everything You Need to Game on Mac" description="BridgePlay handles the complexity so you can focus on what matters — playing your games." />
                <div className={`${styles.grid} reveal-stagger`}>
                    {features.map((f, i) => (
                        <div key={i} className={`${styles.card} reveal`}>
                            <div className={styles.icon} style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
