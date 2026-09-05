import { useRef } from 'react';
import SectionHeader from '../ui/SectionHeader';
import Icon, { type IconName } from '../ui/Icon';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { usePointerGlow } from '../../hooks/usePointerGlow';
import { useI18n } from '../../i18n/useI18n';
import en from '../../i18n/locales/en';
import styles from './Features.module.css';

/* Presentation only — the words live in the dictionary under
   features.items.<key>. `key` ties the two together, and because it is typed
   off the English dictionary, renaming a feature there is a build error here
   rather than a card that silently renders undefined. */
type FeatureKey = keyof typeof en.features.items;

const features: { key: FeatureKey; icon: IconName; color: string; bg: string }[] = [
    { key: 'oneClick', icon: 'play', color: 'var(--accent)', bg: 'var(--accent-glow)' },
    { key: 'setup', icon: 'gear', color: 'var(--green)', bg: 'var(--green-glow)' },
    { key: 'updates', icon: 'download', color: 'var(--purple)', bg: 'var(--purple-glow)' },
    { key: 'library', icon: 'grid', color: 'var(--pink)', bg: 'var(--pink-glow)' },
    { key: 'silicon', icon: 'bolt', color: 'var(--orange)', bg: 'var(--orange-glow)' },
    { key: 'multi', icon: 'layers', color: 'var(--accent)', bg: 'var(--accent-glow)' },
];

export default function Features() {
    const ref = useScrollReveal<HTMLElement>();
    const gridRef = useRef<HTMLDivElement>(null);
    usePointerGlow(gridRef);
    const { t } = useI18n();

    return (
        <section className={styles.features} id="features" ref={ref}>
            <div className={styles.container}>
                {/* Talks about what the app does for you, never about the
                    compatibility stack underneath — the section below is where
                    coverage is stated, once, and it names no components. */}
                <SectionHeader
                    label={t.features.label}
                    title={t.features.title}
                    description={t.features.description}
                />
                <div className={`${styles.grid} reveal-stagger`} ref={gridRef}>
                    {features.map((f, i) => {
                        const copy = t.features.items[f.key];
                        return (
                            <div
                                key={f.key}
                                className={`${styles.card} reveal`}
                                data-glow-card
                                style={{ ['--card-accent' as string]: f.color, ['--card-glow' as string]: f.bg, ['--i' as string]: i }}
                            >
                                <div className={styles.icon} data-icon={f.icon}><Icon name={f.icon} /></div>
                                <h3>{copy.title}</h3>
                                <p>{copy.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
