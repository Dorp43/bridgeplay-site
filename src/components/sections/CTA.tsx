import { Link } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useI18n } from '../../i18n/useI18n';
import styles from './CTA.module.css';

export default function CTA() {
    const ref = useScrollReveal<HTMLElement>();
    const { t } = useI18n();

    return (
        <section className={styles.section} id="download" ref={ref}>
            <div className={styles.container}>
                <div className={`${styles.box} reveal-scale`}>
                    <h2>{t.cta.titleStart} <span className={styles.accent}>{t.cta.titleAccent}</span></h2>
                    <p>{t.cta.body}</p>
                    <div className={styles.actions}>
                        {/* Routes to /download, not straight at the disk image: this is the
                            considered end of the page, and that page carries the
                            requirements and the first-launch steps. */}
                        <Link
                            to="/download"
                            className={styles.btn}
                            onClick={() => track('download_page_click', { source: 'cta_section' })}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            {t.cta.getForMac}
                        </Link>
                        <a href="#pricing" className={styles.btnSecondary}>{t.cta.seePricing}</a>
                    </div>
                    <p className={styles.note}>{t.cta.note}</p>
                </div>
            </div>
        </section>
    );
}
