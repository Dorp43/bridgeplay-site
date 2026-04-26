import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './CTA.module.css';

export default function CTA() {
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.section} id="download" ref={ref}>
            <div className={styles.container}>
                <div className={`${styles.box} reveal-scale`}>
                    <h2>Ready to Play?</h2>
                    <p>Download BridgePlay and start gaming on your Mac today. Free 7-day trial, no credit card required.</p>
                    <div className={styles.actions}>
                        <a href="/BridgePlay.dmg" className={styles.btn} download>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download for macOS
                        </a>
                    </div>
                    <p className={styles.note}>Requires macOS 14+ &middot; Apple Silicon or Intel &middot; 25MB download</p>
                </div>
            </div>
        </section>
    );
}
