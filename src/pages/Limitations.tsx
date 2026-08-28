import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useI18n } from '../i18n/useI18n';
import styles from './Limitations.module.css';

const ANTI_CHEAT = ['Easy Anti-Cheat', 'BattlEye', 'VAC', 'nProtect GameGuard'];

export default function Limitations() {
    const ref = useScrollReveal<HTMLElement>();
    const { t } = useI18n();

    useDocumentMeta({
        title: t.meta.limitations.title,
        description: t.meta.limitations.description,
        canonicalPath: '/limitations',
    });

    return (
        <>
            <div className="bg-glow" aria-hidden="true" />
            {/* Landmark + target for the skip link rendered in main.tsx. */}
            <main id="main-content" tabIndex={-1} className={styles.page} ref={ref}>
                <div className={styles.inner}>
                    <PageHeader
                        eyebrow={t.limitations.eyebrow}
                        title={t.limitations.title}
                        reveal
                        lede={t.limitations.lede}
                    />

                    <div className={styles.stack}>
                        <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 0 }}>
                            <article className={styles.card}>
                                <div className={styles.indexRow}>
                                    <span className={styles.index}>01</span>
                                    <span className={styles.indexRule} aria-hidden="true" />
                                </div>
                                <h2 className={styles.cardTitle}>{t.limitations.anticheatTitle}</h2>
                                <p>
                                    {t.limitations.anticheatP1Before}
                                    <em> {t.limitations.anticheatKernel}</em> {t.limitations.anticheatP1After}
                                </p>
                                <p>{t.limitations.anticheatP2}</p>
                                <div className={styles.chipsBlock}>
                                    <span className={styles.chipsLabel}>{t.limitations.anticheatChipsLabel}</span>
                                    <ul className={styles.chips}>
                                        {ANTI_CHEAT.map(name => (
                                            <li key={name}>{name}</li>
                                        ))}
                                    </ul>
                                </div>
                                <p>{t.limitations.anticheatP3}</p>
                                <p className={styles.counter}>{t.limitations.anticheatCounter}</p>
                            </article>
                        </div>

                        <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 1 }}>
                            <article className={styles.card}>
                                <div className={styles.indexRow}>
                                    <span className={styles.index}>02</span>
                                    <span className={styles.indexRule} aria-hidden="true" />
                                </div>
                                <h2 className={styles.cardTitle}>{t.limitations.dx12Title}</h2>
                                <p className={styles.blunt}>{t.limitations.dx12Blunt}</p>
                                <p>{t.limitations.dx12P1}</p>
                                <p>{t.limitations.dx12P2}</p>
                            </article>
                        </div>

                        <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 2 }}>
                            <article className={styles.card}>
                                <div className={styles.indexRow}>
                                    <span className={styles.index}>03</span>
                                    <span className={styles.indexRule} aria-hidden="true" />
                                </div>
                                <h2 className={styles.cardTitle}>{t.limitations.intelTitle}</h2>
                                <p>{t.limitations.intelP1}</p>
                                <p>{t.limitations.intelP2}</p>
                            </article>
                        </div>

                        <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 3 }}>
                            <article className={styles.card}>
                                <div className={styles.indexRow}>
                                    <span className={styles.index}>04</span>
                                    <span className={styles.indexRule} aria-hidden="true" />
                                </div>
                                <h2 className={styles.cardTitle}>{t.limitations.rosettaTitle}</h2>
                                <p>{t.limitations.rosettaP1}</p>
                                <p>
                                    {t.limitations.rosettaP2Before}{' '}
                                    <Link to="/changelog">{t.limitations.rosettaP2Link}</Link>.
                                </p>
                            </article>
                        </div>
                    </div>

                    <div className={`${styles.outro} reveal`}>
                        <p className={styles.outroNote}>{t.limitations.outroNote}</p>
                        <div className={styles.outroLinks}>
                            <Link to="/download" className={styles.textLink}>{t.limitations.outroDownload}</Link>
                            <span className={styles.dot} aria-hidden="true">&middot;</span>
                            <Link to="/#faq" className={styles.textLink}>{t.limitations.outroFaq}</Link>
                            <span className={styles.dot} aria-hidden="true">&middot;</span>
                            <Link to="/#contact" className={styles.textLink}>{t.limitations.outroContact}</Link>
                        </div>
                        <Link to="/" className="back-link">{t.common.backToBridgePlay}</Link>
                    </div>
                </div>
            </main>
        </>
    );
}
