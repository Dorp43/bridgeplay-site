import { Link } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { usePlatform } from '../../hooks/usePlatform';
import styles from './Hero.module.css';
import shot1x from '../../assets/app-screenshot.webp';
import shot2x from '../../assets/app-screenshot-2x.webp';

export default function Hero() {
    /* Settled before first paint — see usePlatform. Only a visitor we
       positively know cannot run the app loses the download; 'unknown' keeps
       it. */
    const { isUnsupported } = usePlatform();

    return (
        <section className={styles.hero} data-parallax="hero">
            <div className={styles.particles} data-parallax="particles">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={styles.particle} />
                ))}
            </div>
            <div className={styles.container}>
                <div className={styles.badge}>
                    <span className={styles.dot} />
                    Now available for macOS
                </div>
                <h1>
                    Windows Games.<br />
                    <span className={styles.gradient}>Your Mac.</span>
                </h1>
                <p>
                    BridgePlay runs your Windows PC games on macOS through a source-built Wine 11.0 runtime
                    it manages for you. No dual boot. No virtual machines. Just launch and play.
                </p>
                {isUnsupported && (
                    <p className={`${styles.platformNote} notice-card`}>
                        <strong>BridgePlay is a macOS app for Apple Silicon Macs.</strong> There is no
                        Windows, Linux, iOS or Android build, so there is nothing to install on this
                        device. Open this page on an M-series Mac and the download is here.
                    </p>
                )}
                <div className={styles.actions}>
                    {isUnsupported ? (
                        <Link to="/download" className={styles.btnSecondary}>What it needs to run</Link>
                    ) : (
                        <a
                            href="/BridgePlay.dmg"
                            download
                            className={styles.btnPrimary}
                            onClick={() => track('download_click', { source: 'hero' })}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download Now
                        </a>
                    )}
                    <a href="#features" className={styles.btnSecondary}>Learn More</a>
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
                    {!isUnsupported && (
                        <span className={styles.fineLink}>
                            <Link to="/download">Requirements, and what to do if macOS blocks it</Link>
                        </span>
                    )}
                </div>
                <div className={styles.statsWrap}>
                    <div className={styles.stats}>
                        <div className={styles.stat}><div className={styles.number}>7 Days</div><div className={styles.label}>Free Trial</div></div>
                        <div className={styles.stat}><div className={styles.number}>Apple Silicon</div><div className={styles.label}>M1 and Later</div></div>
                        <div className={styles.stat}><div className={styles.number}>Auto</div><div className={styles.label}>Updates</div></div>
                    </div>
                </div>

                <div className={styles.appPreview} data-parallax="preview">
                    <div className={styles.stage}>
                        <img className={styles.ambient} src={shot1x} alt="" aria-hidden="true" />
                        <div className={styles.frame}>
                            <img
                                className={styles.shot}
                                src={shot1x}
                                srcSet={`${shot1x} 1x, ${shot2x} 2x`}
                                width={1400}
                                height={967}
                                alt="The BridgePlay library on macOS: five installed games in a grid, with the detail panel for Aetherium Online open and ready to launch"
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                            />
                            <span className={styles.sweep} aria-hidden="true" />
                        </div>
                        <div className={styles.spill} aria-hidden="true" />
                        <p className={styles.caption}>Wine 11.0, built from source&ensp;&middot;&ensp;WoW64&ensp;&middot;&ensp;Apple Silicon</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
