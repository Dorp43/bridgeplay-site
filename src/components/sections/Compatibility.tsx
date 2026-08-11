import SectionHeader from '../ui/SectionHeader';
import Icon, { type IconName } from '../ui/Icon';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Compatibility.module.css';

const items: { icon: IconName; color: string; bg: string; title: string; desc: string }[] = [
    { icon: 'display', color: 'var(--accent)', bg: 'var(--accent-glow)', title: 'DirectX 9, 10 & 11', desc: 'DirectX translated to Metal (via Vulkan)' },
    { icon: 'bolt', color: 'var(--green)', bg: 'var(--green-glow)', title: 'Apple Silicon Optimized', desc: 'Runs natively on M1, M2, M3, and M4 Macs' },
    { icon: 'expand', color: 'var(--purple)', bg: 'var(--purple-glow)', title: 'Fullscreen Mode', desc: 'Play in windowed or fullscreen with auto-expand support' },
    { icon: 'sliders', color: 'var(--orange)', bg: 'var(--orange-glow)', title: 'Per-Game Settings', desc: 'Custom configurations for each game in your library' },
];

const specGroups = [
    { label: 'Graphics', entries: ['DirectX 9', 'DirectX 10', 'DirectX 11', 'Vulkan → Metal'] },
    { label: 'Display', entries: ['Retina Display', 'Fullscreen Mode'] },
    { label: 'Runtime', entries: ['Apple Silicon', 'x86 games via Rosetta 2', 'Auto-Configuration'] },
];

/* Running row index per group so the stagger flows across the whole sheet */
const specOffsets = specGroups.map((_, gi) =>
    specGroups.slice(0, gi).reduce((n, g) => n + g.entries.length, 0)
);

function SpecEntry({ text }: { text: string }) {
    const parts = text.split('→');
    if (parts.length === 1) return <>{text}</>;
    return (
        <>
            {parts[0]}
            <span className={styles.arrow}>{'→'}</span>
            {parts[1]}
        </>
    );
}

export default function Compatibility() {
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.section} id="compatibility" ref={ref}>
            <div className={styles.container}>
                <SectionHeader label="Compatibility" title="Broad Compatibility, Native Performance" description="BridgePlay translates Windows graphics APIs to Metal, delivering broad game support on your Mac." />
                <div className={styles.grid}>
                    <ul className={`${styles.list} reveal-stagger`}>
                        {items.map((item, i) => (
                            <li key={i} className={`${styles.item} reveal`} style={{ ['--i' as string]: i }}>
                                <div className={styles.icon} style={{ background: item.bg, color: item.color }}>
                                    <Icon name={item.icon} size={20} />
                                </div>
                                <div>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className={`${styles.visual} reveal-right`}>
                        <p className={styles.visualLabel}>Supported Technologies</p>
                        <div>
                            {specGroups.map((group, gi) => (
                                <div key={group.label} className={`${styles.group} reveal-stagger`}>
                                    <div className={styles.groupLabel}>{group.label}</div>
                                    {group.entries.map((entry, ei) => (
                                        <div key={entry} className={`${styles.specRow} reveal`} style={{ ['--i' as string]: specOffsets[gi] + ei }}>
                                            <SpecEntry text={entry} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
