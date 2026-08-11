import styles from './Hero.module.css';
import shot1x from '../../assets/app-screenshot.webp';
import shot2x from '../../assets/app-screenshot-2x.webp';

export default function Hero() {
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
                    BridgePlay lets you play your favorite Windows PC games natively on macOS.
                    No dual boot. No virtual machines. Just launch and play.
                </p>
                <div className={styles.actions}>
                    <a href="/BridgePlay.dmg" download className={styles.btnPrimary}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download Now
                    </a>
                    <a href="#features" className={styles.btnSecondary}>Learn More</a>
                </div>
                <div className={styles.statsWrap}>
                    <div className={styles.stats}>
                        <div className={styles.stat}><div className={styles.number}>7 Days</div><div className={styles.label}>Free Trial</div></div>
                        <div className={styles.stat}><div className={styles.number}>Apple Silicon</div><div className={styles.label}>Native Support</div></div>
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
                                alt="BridgePlay game library on macOS showing Aetherium Online ready to launch via the Proton 8.0-2 runtime"
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                            />
                            <span className={styles.sweep} aria-hidden="true" />
                        </div>
                        <div className={styles.spill} aria-hidden="true" />
                        <p className={styles.caption}>Proton 8.0-2 runtime&ensp;&middot;&ensp;Native Metal&ensp;&middot;&ensp;Apple Silicon</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
