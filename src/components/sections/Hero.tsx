import { Link } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { usePlatform } from '../../hooks/usePlatform';
import { useI18n } from '../../i18n/useI18n';
import styles from './Hero.module.css';
import shot1x from '../../assets/app-screenshot.webp';
import shot2x from '../../assets/app-screenshot-2x.webp';
import { DOWNLOAD_URL } from '../../config/download';

export default function Hero() {
    /* Settled before first paint — see usePlatform. Only a visitor we
       positively know cannot run the app loses the download; 'unknown' keeps
       it. */
    const { isUnsupported } = usePlatform();
    const { t } = useI18n();

    return (
        <section className={styles.hero} data-parallax="hero">
            <div className={styles.particles} data-parallax="particles">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={styles.particle} />
                ))}
            </div>
            <div className={styles.container}>
                <h1>
                    {t.hero.titleLine1}<br />
                    <span className={styles.gradient}>{t.hero.titleLine2}</span>
                </h1>
                <p>{t.hero.lede}</p>
                {isUnsupported && (
                    <p className={`${styles.platformNote} notice-card`}>
                        <strong>{t.hero.platformNoteStrong}</strong> {t.hero.platformNoteRest}
                    </p>
                )}
                <div className={styles.actions}>
                    {isUnsupported ? (
                        <Link to="/download" className={styles.btnSecondary}>{t.hero.whatItNeeds}</Link>
                    ) : (
                        <a
                            href={DOWNLOAD_URL}
                            download
                            className={styles.btnPrimary}
                            onClick={() => track('download_click', { source: 'hero' })}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            {t.hero.downloadNow}
                        </a>
                    )}
                    <a href="#features" className={styles.btnSecondary}>{t.hero.learnMore}</a>
                    {/* The considered path, always one click from the fast one. Lives
                        inside .actions (width:100% puts it on its own row) so it rides
                        the row's single fadeInUp instead of needing another delay.

                        The label names the refusal, not just the paperwork. The
                        button above is a direct hit on the disk image — kept, because
                        it is the fastest path for a visitor who already knows what
                        they want — but this release is not notarized, so Gatekeeper
                        blocks the first launch for most people. /download is the only
                        page with the Control-click instructions, and "System
                        requirements and checksum" did not read as the fix for a Mac
                        that has just refused to open the app. */}
                    {/* Cost and commitment, attached to the button rather than
                        left to the stats row below — this is the moment the
                        hesitation happens. Says what the stats row does not:
                        that the download itself costs nothing and that trying
                        it needs no card. */}
                    {!isUnsupported && (
                        <span className={styles.ctaNote}>{t.hero.ctaNote}</span>
                    )}
                    {!isUnsupported && (
                        <span className={styles.fineLink}>
                            <Link to="/download">{t.hero.fineLink}</Link>
                        </span>
                    )}
                </div>
                <div className={styles.statsWrap}>
                    <div className={styles.stats}>
                        <div className={styles.stat}><div className={styles.number}>{t.hero.statTrialValue}</div><div className={styles.label}>{t.hero.statTrialLabel}</div></div>
                        <div className={styles.stat}><div className={styles.number}>{t.hero.statSiliconValue}</div><div className={styles.label}>{t.hero.statSiliconLabel}</div></div>
                        <div className={styles.stat}><div className={styles.number}>{t.hero.statUpdatesValue}</div><div className={styles.label}>{t.hero.statUpdatesLabel}</div></div>
                    </div>
                </div>

                <div className={styles.appPreview} data-parallax="preview">
                    {/* Retro stage lights rising from the screenshot, washing
                        over the stats row above. Pure CSS, behind the text. */}
                    <span className={styles.beams} aria-hidden="true" />
                    <div className={styles.stage}>
                        <img className={styles.ambient} src={shot1x} alt="" aria-hidden="true" />
                        <div className={styles.frame}>
                            <img
                                className={styles.shot}
                                src={shot1x}
                                srcSet={`${shot1x} 1x, ${shot2x} 2x`}
                                width={1400}
                                height={967}
                                alt={t.hero.screenshotAlt}
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                            />
                            <span className={styles.sweep} aria-hidden="true" />
                        </div>
                        <div className={styles.spill} aria-hidden="true" />
                        <p className={styles.caption}>{t.hero.caption}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
