import { useRef } from 'react';
import SectionHeader from '../ui/SectionHeader';
import Icon, { type IconName } from '../ui/Icon';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { usePointerGlow } from '../../hooks/usePointerGlow';
import styles from './Features.module.css';

const features: { icon: IconName; color: string; bg: string; title: string; desc: string }[] = [
    { icon: 'play', color: 'var(--accent)', bg: 'var(--accent-glow)', title: 'One-Click Launch', desc: 'Add your games to the library and launch them instantly. No command line, no configuration files. Just click and play.' },
    { icon: 'gear', color: 'var(--green)', bg: 'var(--green-glow)', title: 'Auto-Configuration', desc: 'BridgePlay automatically detects game executables and configures optimal settings for each title.' },
    { icon: 'download', color: 'var(--purple)', bg: 'var(--purple-glow)', title: 'Automatic Updates', desc: 'Always stay on the latest version. BridgePlay checks for updates on launch and installs them seamlessly.' },
    { icon: 'grid', color: 'var(--pink)', bg: 'var(--pink-glow)', title: 'Game Library', desc: 'Organize your collection with custom categories and per-game settings. Your library, your way.' },
    { icon: 'bolt', color: 'var(--orange)', bg: 'var(--orange-glow)', title: 'Apple Silicon Native', desc: 'Built specifically for M-series chips. BridgePlay leverages the power of Apple Silicon for the best experience.' },
    { icon: 'layers', color: 'var(--accent)', bg: 'var(--accent-glow)', title: 'Multi-Game Multitasking', desc: 'Run several games at once. Switch between them with hotkeys, mute or solo each game\'s audio, and stay in control of every window.' },
];

export default function Features() {
    const ref = useScrollReveal<HTMLElement>();
    const gridRef = useRef<HTMLDivElement>(null);
    usePointerGlow(gridRef);

    return (
        <section className={styles.features} id="features" ref={ref}>
            <div className={styles.container}>
                <SectionHeader label="Features" title="Everything You Need to Game on Mac" description="BridgePlay handles the complexity so you can focus on what matters — playing your games." />
                <div className={`${styles.grid} reveal-stagger`} ref={gridRef}>
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className={`${styles.card} reveal`}
                            data-glow-card
                            style={{ ['--card-accent' as string]: f.color, ['--card-glow' as string]: f.bg, ['--i' as string]: i }}
                        >
                            <div className={styles.icon} data-icon={f.icon}><Icon name={f.icon} /></div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
