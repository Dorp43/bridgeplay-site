import { Link } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import Icon, { type IconName } from '../ui/Icon';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useI18n } from '../../i18n/useI18n';
import en from '../../i18n/locales/en';
import styles from './Compatibility.module.css';

type ItemKey = keyof typeof en.compatibility.items;
type GroupKey = keyof typeof en.compatibility.specs;

const items: { key: ItemKey; icon: IconName; color: string; bg: string }[] = [
    { key: 'directx', icon: 'display', color: 'var(--accent)', bg: 'var(--accent-glow)' },
    { key: 'stockWine', icon: 'layers', color: 'var(--green)', bg: 'var(--green-glow)' },
    { key: 'protected', icon: 'bolt', color: 'var(--purple)', bg: 'var(--purple-glow)' },
    { key: 'display', icon: 'expand', color: 'var(--orange)', bg: 'var(--orange-glow)' },
    { key: 'settings', icon: 'sliders', color: 'var(--accent)', bg: 'var(--accent-glow)' },
];

const GROUPS = ['graphics', 'display', 'runtime'] as const satisfies readonly GroupKey[];

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
    const { t } = useI18n();

    /* Running row index per group so the stagger flows across the whole sheet.
       Computed from the ACTIVE dictionary, not English: a translation is free
       to give a group a different number of entries. */
    const specOffsets = GROUPS.map((_, gi) =>
        GROUPS.slice(0, gi).reduce((n, key) => n + t.compatibility.specs[key].entries.length, 0)
    );

    return (
        <section className={styles.section} id="compatibility" ref={ref}>
            <div className={styles.container}>
                {/* THE canonical explanation of Wine on this site: what it is,
                    then what it covers, then the limit. Every other surface
                    (hero, features, FAQ, /limitations) names Wine without
                    re-glossing it and links here or to /limitations instead — so
                    if the gloss moves, it moves out of this description, not
                    into a second copy somewhere else. */}
                <SectionHeader
                    label={t.compatibility.label}
                    title={t.compatibility.title}
                    description={t.compatibility.description}
                />
                <div className={styles.grid}>
                    <ul className={`${styles.list} reveal-stagger`}>
                        {items.map((item, i) => {
                            const copy = t.compatibility.items[item.key];
                            return (
                                <li key={item.key} className={`${styles.item} reveal`} style={{ ['--i' as string]: i }}>
                                    <div className={styles.icon} style={{ background: item.bg, color: item.color }}>
                                        <Icon name={item.icon} size={20} />
                                    </div>
                                    {/* h3, not h4: the only heading above these is the
                                        section's own h2, so h4 skipped a level. */}
                                    <div>
                                        <h3>{copy.title}</h3>
                                        <p>{copy.desc}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <div className={`${styles.visual} reveal-right`}>
                        <p className={styles.visualLabel}>{t.compatibility.visualLabel}</p>
                        <div>
                            {GROUPS.map((key, gi) => {
                                const group = t.compatibility.specs[key];
                                return (
                                    <div key={key} className={`${styles.group} reveal-stagger`}>
                                        <div className={styles.groupLabel}>{group.label}</div>
                                        {group.entries.map((entry, ei) => (
                                            <div key={entry} className={`${styles.specRow} reveal`} style={{ ['--i' as string]: specOffsets[gi] + ei }}>
                                                <SpecEntry text={entry} />
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                        {/* The panel lists what works; a reader deciding whether to
                            download deserves the other half one tap away. */}
                        <Link to="/limitations" className={styles.limitLink}>
                            {t.compatibility.limitLink} <span className={styles.arrow}>&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
