import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useScrollReveal';
import styles from './Compatibility.module.css';

const items = [
    { icon: '\uD83D\uDCBB', color: 'var(--accent)', bg: 'var(--accent-glow)', title: 'DirectX 9, 10, 11 & 12', desc: 'Full DirectX support translated to Metal' },
    { icon: '\u26A1', color: 'var(--green)', bg: 'var(--green-glow)', title: 'Apple Silicon Optimized', desc: 'Runs natively on M1, M2, M3, and M4 Macs' },
    { icon: '\uD83D\uDDB9', color: 'var(--purple)', bg: 'rgba(167,139,250,0.12)', title: 'Fullscreen Mode', desc: 'Play in windowed or fullscreen with auto-expand support' },
    { icon: '\uD83D\uDCBE', color: 'var(--orange)', bg: 'rgba(245,158,11,0.12)', title: 'Per-Game Settings', desc: 'Custom configurations for each game in your library' },
];

const badges = [
    'DirectX 9', 'DirectX 10', 'DirectX 11', 'DirectX 12',
    'Vulkan \u2192 Metal', 'Apple Silicon', 'Intel x86',
    'Retina Display', 'Fullscreen Mode', 'Auto-Configuration',
];

export default function Compatibility() {
    const ref = useScrollReveal<HTMLElement>();
    const badgeRef = useStaggerReveal<HTMLDivElement>('.badge-item', 60, { threshold: 0.3 });

    return (
        <section className={styles.section} id="compatibility" ref={ref}>
            <div className={styles.container}>
                <SectionHeader label="Compatibility" title="Broad Compatibility, Native Performance" description="BridgePlay translates Windows graphics APIs to Metal, delivering broad game support on your Mac." />
                <div className={styles.grid}>
                    <ul className={`${styles.list} reveal-left`}>
                        {items.map((item, i) => (
                            <li key={i} className={styles.item}>
                                <div className={styles.icon} style={{ background: item.bg, color: item.color }}>{item.icon}</div>
                                <div>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className={`${styles.visual} reveal-right`}>
                        <p className={styles.visualLabel}>Supported Technologies</p>
                        <div className={styles.badgeGrid} ref={badgeRef}>
                            {badges.map((b, i) => (
                                <div key={i} className={`${styles.badge} badge-item`}>{b}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
