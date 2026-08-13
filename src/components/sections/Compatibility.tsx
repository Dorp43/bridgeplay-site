import { Link } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import Icon, { type IconName } from '../ui/Icon';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Compatibility.module.css';

const items: { icon: IconName; color: string; bg: string; title: string; desc: string }[] = [
    { icon: 'display', color: 'var(--accent)', bg: 'var(--accent-glow)', title: 'DirectX 8, 9, 10 & 11', desc: 'DirectX is how Windows games draw. Wine\'s own wined3d converts it to OpenGL, which macOS draws with Metal.' },
    { icon: 'layers', color: 'var(--green)', bg: 'var(--green-glow)', title: 'Stock Wine 11.0, From Source', desc: 'Unmodified upstream Wine, compiled from the public source — no Proton or DXVK (the parts Valve ships on Steam Deck), nothing closed-source.' },
    { icon: 'bolt', color: 'var(--purple)', bg: 'var(--purple-glow)', title: 'Copy-Protected Clients Handled', desc: 'Some game clients ship inside Themida, a copy-protection wrapper that crashes under Rosetta 2. BridgePlay turns on an x87 (legacy floating-point) emulator for those.' },
    { icon: 'expand', color: 'var(--orange)', bg: 'var(--orange-glow)', title: 'Per-Game Display Control', desc: 'Windowed, fullscreen, or a virtual display — the game gets its own screen inside a window. Resolution can be overridden.' },
    { icon: 'sliders', color: 'var(--accent)', bg: 'var(--accent-glow)', title: 'Per-Game Settings', desc: 'Whatever you change is remembered for that one game, not applied across your library.' },
];

const specGroups = [
    { label: 'Graphics', entries: ['DirectDraw & DirectX 8', 'DirectX 9', 'DirectX 10', 'DirectX 11', 'wined3d → OpenGL → Metal'] },
    { label: 'Display', entries: ['Windowed & Fullscreen', 'Virtual Display', 'Resolution Overrides'] },
    { label: 'Runtime', entries: ['Wine 11.0 (source-built)', 'WoW64 (32-bit games, 64-bit Wine)', 'Intel games via Rosetta 2', 'Automatic per-game setup'] },
];

/* Running row index per group so the stagger flows across the whole sheet */
const specOffsets = specGroups.map((_, gi) =>
    specGroups.slice(0, gi).reduce((n, g) => n + g.entries.length, 0)
);

/* Splits on every arrow so a multi-stage chain (wined3d → OpenGL → Metal) keeps
   all of its stages; each arrow gets its own travelling span. */
function SpecEntry({ text }: { text: string }) {
    const parts = text.split('→');
    if (parts.length === 1) return <>{text}</>;
    return (
        <>
            {parts.map((part, i) => (
                <span key={i}>
                    {i > 0 && <span className={styles.arrow}>{'→'}</span>}
                    {part}
                </span>
            ))}
        </>
    );
}

export default function Compatibility() {
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.section} id="compatibility" ref={ref}>
            <div className={styles.container}>
                {/* Same facts as before, in reading order: what it is, then what
                    that covers, then the limit — instead of leading with three
                    unglossed terms (WoW64, wined3d, DXVK) and ending on the caveat. */}
                <SectionHeader
                    label="Compatibility"
                    title="What Runs, and What Doesn't"
                    description="BridgePlay carries its own copy of Wine 11.0, built from the upstream source and left unmodified. Games that use DirectX 8 through 11 work. DirectX 12 does not run, and neither do games guarded by kernel-level anti-cheat such as Easy Anti-Cheat or BattlEye."
                />
                <div className={styles.grid}>
                    <ul className={`${styles.list} reveal-stagger`}>
                        {items.map((item, i) => (
                            <li key={i} className={`${styles.item} reveal`} style={{ ['--i' as string]: i }}>
                                <div className={styles.icon} style={{ background: item.bg, color: item.color }}>
                                    <Icon name={item.icon} size={20} />
                                </div>
                                {/* h3, not h4: the only heading above these is the
                                    section's own h2, so h4 skipped a level. */}
                                <div>
                                    <h3>{item.title}</h3>
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
                        {/* The panel lists what works; a reader deciding whether to
                            download deserves the other half one tap away. */}
                        <Link to="/limitations" className={styles.limitLink}>
                            What doesn&rsquo;t work <span className={styles.arrow}>&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
