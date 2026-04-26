import styles from './Hero.module.css';

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
                    <a href="#download" className={styles.btnPrimary}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download Free
                    </a>
                    <a href="#features" className={styles.btnSecondary}>Learn More</a>
                </div>
                <div className={styles.stats}>
                    <div className={styles.stat}><div className={styles.number}>7 Days</div><div className={styles.label}>Free Trial</div></div>
                    <div className={styles.stat}><div className={styles.number}>Apple Silicon</div><div className={styles.label}>Native Support</div></div>
                    <div className={styles.stat}><div className={styles.number}>Auto</div><div className={styles.label}>Updates</div></div>
                </div>

                <div className={styles.appPreview} data-parallax="preview">
                    <div className={styles.macWindow}>
                        <div className={styles.titlebar}>
                            <div className={`${styles.dot2} ${styles.red}`} />
                            <div className={`${styles.dot2} ${styles.yellow}`} />
                            <div className={`${styles.dot2} ${styles.green}`} />
                            <div className={styles.titlebarText}>BridgePlay</div>
                            <div style={{ width: 52 }} />
                        </div>
                        <div className={styles.macBody}>
                            <div className={styles.sidebar}>
                                <div className={styles.sbTitle}>BridgePlay</div>
                                <div className={styles.sbLabel}>System</div>
                                <div className={`${styles.sbItem} ${styles.active}`}><span className={styles.sbIcon}>&#9638;</span> Library</div>
                                <div className={styles.sbItem}><span className={styles.sbIcon}>&#9733;</span> Favorites</div>
                                <div className={styles.sbLabel}>Collections</div>
                                <div className={styles.sbItem}><span className={styles.sbIcon}>&#128193;</span> RPGs</div>
                                <div className={styles.sbItem}><span className={styles.sbIcon}>&#128193;</span> Multiplayer</div>
                                <div className={styles.sbSpacer} />
                                <div className={styles.sbActions}>
                                    <div className={`${styles.sbBtn} ${styles.sbBtnPrimary}`}>&#43; Install Game</div>
                                    <div className={`${styles.sbBtn} ${styles.sbBtnSecondary}`}>&#43; New Collection</div>
                                </div>
                                <div className={styles.sbProfileSection}>
                                    <div className={styles.sbLicensePill}>&#10003; Licensed</div>
                                    <div className={styles.sbProfile}>
                                        <div className={styles.sbAvatar}>D</div>
                                        <div className={styles.sbEmail}>player@email.com</div>
                                        <div className={styles.sbSignout}>&#10132;</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.main}>
                                <div className={styles.toolbar}>
                                    <div className={styles.toolbarTitle}>Library</div>
                                    <div className={styles.toolbarSearch}><span className={styles.searchIcon}>&#128269;</span>Search games...</div>
                                    <div className={styles.toolbarGear}>&#9881;</div>
                                </div>
                                <div className={styles.dock}>
                                    <div className={styles.pill}><span className={styles.pillIcon} style={{ color: 'var(--green)' }}>&#9679;</span><span className={styles.pillInfo}><span className={styles.pillLabel}>Runtime</span><span className={styles.pillValue}>Ready</span></span></div>
                                    <div className={styles.pill}><span className={styles.pillIcon} style={{ color: 'var(--accent)' }}>&#9679;</span><span className={styles.pillInfo}><span className={styles.pillLabel}>Installer</span><span className={styles.pillValue}>Selected</span></span></div>
                                    <div className={styles.pill}><span className={styles.pillIcon} style={{ color: '#f9c826' }}>&#9679;</span><span className={styles.pillInfo}><span className={styles.pillLabel}>Display</span><span className={styles.pillValue}>Retina</span></span></div>
                                    <div className={styles.dockSpacer} />
                                    <div className={styles.dockStatus}>All systems ready</div>
                                    <div className={styles.dockLogs}>Open Logs</div>
                                </div>
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}><span>&#128230;</span></div>
                                    <div className={styles.emptyTitle}>No games installed</div>
                                    <div className={styles.emptySubtitle}>Install your first game to get started</div>
                                    <div className={styles.emptyDetail}>Choose a Windows installer .exe, confirm the target environment, and BridgePlay will import it into your library.</div>
                                    <div className={styles.emptyBtn}>&#43; Install Game</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
