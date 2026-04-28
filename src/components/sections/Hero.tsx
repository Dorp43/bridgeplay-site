import styles from './Hero.module.css';

function GameCard({ mono, name, gradient, selected, favorite }: { mono: string; name: string; gradient: string; selected?: boolean; favorite?: boolean }) {
    return (
        <div className={`${styles.gameCard} ${selected ? styles.gameCardSelected : ''}`}>
            <div className={styles.gameCardTop}>
                <span className={styles.gameReady}><span className={styles.statusDot} style={{ background: 'var(--accent)' }} />Ready</span>
                <span className={styles.gameTopRight}>
                    {favorite && <span className={styles.gameStar}>&#9733;</span>}
                    <span className={styles.gameGear}>&#8896;</span>
                </span>
            </div>
            <div className={styles.gameIcon} style={{ background: gradient }}>{mono}</div>
            <div className={styles.gameName}>{name}</div>
            <div className={styles.gameMeta}>Auto Bottle</div>
            <div className={styles.gameInstalled}>Installed locally</div>
        </div>
    );
}

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.particles} data-parallax="particles">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={styles.particle} />
                ))}
            </div>
            <div className={styles.container}>
                <div className={styles.badge}>
                    <span className={styles.dot} />
                    Releasing soon for macOS
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
                    <button type="button" className={`${styles.btnPrimary} ${styles.disabled}`} disabled aria-disabled="true" title="Releasing soon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Releasing Soon
                    </button>
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
                    <div className={styles.macWindow}>
                        <div className={styles.titlebar}>
                            <div className={`${styles.dot2} ${styles.red}`} />
                            <div className={`${styles.dot2} ${styles.yellow}`} />
                            <div className={`${styles.dot2} ${styles.green}`} />
                        </div>
                        <div className={styles.macBody}>
                            <div className={styles.sidebar}>
                                <div className={styles.sbLabel}>System</div>
                                <div className={`${styles.sbItem} ${styles.active}`}><span className={styles.sbIcon}>&#9638;</span> Library</div>
                                <div className={styles.sbItem}><span className={styles.sbIcon}>&#9734;</span> Favorites</div>
                                <div className={styles.sbSpacer} />
                                <div className={styles.sbActions}>
                                    <div className={`${styles.sbBtn} ${styles.sbBtnPrimary}`}>&#43; Install Game</div>
                                    <div className={`${styles.sbBtn} ${styles.sbBtnSecondary}`}>&#43; New Collection</div>
                                </div>
                                <div className={styles.sbProfileSection}>
                                    <div className={styles.sbLicensePill}>&#10003; Licensed</div>
                                    <div className={styles.sbProfile}>
                                        <div className={styles.sbAvatar}>P</div>
                                        <div className={styles.sbEmail}>player@bridgeplay.app</div>
                                        <div className={styles.sbSignout}>&#10132;</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.main}>
                                <div className={styles.toolbar}>
                                    <span className={styles.tbIcon}>&#9776;</span>
                                    <span className={styles.tbIcon}>&#9638;</span>
                                    <div className={styles.toolbarTitle}>Library <span className={styles.countPill}>6</span></div>
                                    <div className={styles.toolbarStatus}>
                                        <span className={styles.statusItem}><span className={styles.statusDot} style={{ background: 'var(--accent)' }} />Runtime <strong>Ready</strong></span>
                                        <span className={styles.statusItem}><span className={styles.statusDot} style={{ background: '#f9c826' }} />Display <strong>Windowed</strong></span>
                                    </div>
                                    <span className={styles.tbIcon}>&#128462;</span>
                                    <span className={styles.tbIcon}>&#9881;</span>
                                </div>
                                <div className={styles.searchRow}>
                                    <div className={styles.searchBox}><span className={styles.searchIcon}>&#128269;</span>Search games...</div>
                                    <div className={styles.sortBtn}>&#8645; Default</div>
                                </div>
                                <div className={styles.gameGrid}>
                                    <GameCard mono="PQ" name="Pixel Quest" gradient="linear-gradient(135deg,#f59e0b,#ef4444)" favorite />
                                    <GameCard mono="AD" name="Astro Drift" gradient="linear-gradient(135deg,#4a9eff,#6366f1)" />
                                    <GameCard mono="NS" name="Neon Strike" gradient="linear-gradient(135deg,#a78bfa,#f472b6)" />
                                    <GameCard mono="CT" name="Crown Tactics" gradient="linear-gradient(135deg,#6dd5a0,#10b981)" favorite />
                                    <GameCard mono="FH" name="Frost Hollow" gradient="linear-gradient(135deg,#06b6d4,#3b82f6)" selected />
                                    <GameCard mono="VC" name="Velocity Cup" gradient="linear-gradient(135deg,#ef4444,#f59e0b)" />
                                </div>
                            </div>
                            <div className={styles.detail}>
                                <div className={styles.detailHeader}>
                                    <div className={styles.detailIcon} style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)' }}>FH</div>
                                    <div className={styles.detailTitle}>
                                        <div className={styles.detailName}>Frost Hollow</div>
                                        <div className={styles.detailReady}><span className={styles.statusDot} style={{ background: 'var(--orange)' }} /> Ready</div>
                                    </div>
                                    <div className={styles.detailStar}>&#9733;</div>
                                    <div className={styles.detailClose}>&#10005;</div>
                                </div>
                                <div className={styles.launchBtn}>&#9654; Launch Game</div>
                                <div className={styles.detailLabel}>Display</div>
                                <div className={styles.toggleRow}>
                                    <div className={`${styles.toggleBtn} ${styles.toggleActive}`}><span className={styles.toggleIcon}>&#9633;</span>Windowed</div>
                                    <div className={styles.toggleBtn}><span className={styles.toggleIcon}>&#9744;</span>Fullscreen</div>
                                </div>
                                <div className={styles.detailRow}>
                                    <div className={styles.detailRowMain}>
                                        <div className={styles.detailRowTitle}>Custom Resolution</div>
                                        <div className={styles.detailRowSub}>Override the default window size</div>
                                    </div>
                                    <div className={styles.toggle} />
                                </div>
                                <div className={styles.detailRow}>
                                    <div className={styles.detailRowMain}>
                                        <div className={styles.detailRowTitle}>Window Control</div>
                                    </div>
                                    <div className={styles.detailRowMeta}>Inactive</div>
                                </div>
                                <div className={styles.detailCollapse}>
                                    <span className={styles.detailCollapseChevron}>&#8250;</span>
                                    <span className={styles.detailCollapseTitle}>Compatibility</span>
                                    <span className={styles.detailCollapseAction}>Show</span>
                                </div>
                                <div className={styles.detailLabel}>Installation</div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailRowIcon} style={{ color: 'var(--green)' }}>&#128193;</span>
                                    <div className={styles.detailRowMain}>
                                        <div className={styles.detailRowTitle}>Game Folder</div>
                                    </div>
                                    <div className={styles.detailRowMeta}>3A9A4EE…F4E2/client</div>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailRowIcon} style={{ color: 'var(--accent)' }}>&#9654;</span>
                                    <div className={styles.detailRowMain}>
                                        <div className={styles.detailRowTitle}>Executable</div>
                                        <div className={styles.detailRowSub}>FrostHollow.exe</div>
                                    </div>
                                    <span className={styles.detailRowAction}>&#128193;</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailRowIcon} style={{ color: 'var(--orange)' }}>&#9728;</span>
                                    <div className={styles.detailRowMain}>
                                        <div className={styles.detailRowTitle}>Runtime</div>
                                    </div>
                                    <div className={styles.detailRowMeta} style={{ color: 'var(--accent)' }}>Ready</div>
                                </div>
                                <div className={styles.detailFade} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
