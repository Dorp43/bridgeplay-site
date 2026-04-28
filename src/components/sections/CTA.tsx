import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './CTA.module.css';

export default function CTA() {
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.section} id="download" ref={ref}>
            <div className={styles.container}>
                <div className={`${styles.box} reveal-scale`}>
                    <h2>Releasing Soon</h2>
                    <p>BridgePlay is putting the final touches on the macOS build. The download will land here the moment it's ready.</p>
                    <div className={styles.actions}>
                        <button type="button" className={`${styles.btn} ${styles.disabled}`} disabled aria-disabled="true" title="Releasing soon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Releasing Soon
                        </button>
                    </div>
                    <p className={styles.note}>Built for macOS 14+ &middot; Apple Silicon &amp; Intel</p>
                </div>
            </div>
        </section>
    );
}
