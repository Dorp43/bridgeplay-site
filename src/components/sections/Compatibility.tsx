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
    { key: 'bundled', icon: 'layers', color: 'var(--green)', bg: 'var(--green-glow)' },
    { key: 'protected', icon: 'bolt', color: 'var(--purple)', bg: 'var(--purple-glow)' },
    { key: 'display', icon: 'expand', color: 'var(--orange)', bg: 'var(--orange-glow)' },
    { key: 'settings', icon: 'sliders', color: 'var(--accent)', bg: 'var(--accent-glow)' },
];

const GROUPS = ['graphics', 'display', 'runtime'] as const satisfies readonly GroupKey[];

/* Splits on every arrow so a multi-stage entry keeps all of its stages; each
   arrow gets its own travelling span. Entries are free of arrows today — the
   spec sheet names what is supported, never the chain that implements it — but
   a translation may still reach for one. */
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
                {/* THE canonical statement of coverage on this site: what
                    BridgePlay runs, then the limit. It says what is supported,
                    never which compatibility stack does the supporting — that
                    is deliberate and applies to every surface. Other pages
                    (hero, features, FAQ, /limitations) link here rather than
                    restating it. */}
                <SectionHeader
                    label={t.compatibility.label}
                    title={t.compatibility.title}
                    description={t.compatibility.description}
                />
                {/* The spec sheet below answers "what does it support" in the
                    vocabulary of someone who already knows what DirectX is.
                    This answers "will it run MY game" for everyone else, which
                    is the question they actually arrived with. Deliberately
                    example-shaped rather than a list of titles: a compatibility
                    list we cannot keep honest is worse than none, but a
                    description of the SHAPE of what works needs no upkeep. */}
                <div className={`${styles.fit} reveal`}>
                    <div className={`${styles.fitCard} ${styles.fitGood}`}>
                        <p className={styles.fitLabel}>{t.compatibility.fit.goodLabel}</p>
                        <ul>
                            {t.compatibility.fit.goodItems.map(item => <li key={item}>{item}</li>)}
                        </ul>
                    </div>
                    <div className={`${styles.fitCard} ${styles.fitBad}`}>
                        <p className={styles.fitLabel}>{t.compatibility.fit.badLabel}</p>
                        <ul>
                            {t.compatibility.fit.badItems.map(item => <li key={item}>{item}</li>)}
                        </ul>
                    </div>
                </div>
                <p className={`${styles.fitNote} reveal`}>{t.compatibility.fit.note}</p>

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
