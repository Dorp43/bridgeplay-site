import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useI18n } from '../../i18n/useI18n';
import styles from './Footer.module.css';

export default function Footer() {
    const ref = useScrollReveal<HTMLElement>();
    const { t } = useI18n();

    return (
        <footer className={styles.footer} ref={ref}>
            <div className={styles.container}>
                <div className={`${styles.topline} reveal`} aria-hidden="true" />
                <div className={styles.grid}>
                    <div className={`${styles.brand} reveal`} style={{ ['--i' as string]: 0 }}>
                        <div className={styles.logo}>BridgePlay</div>
                        <p>{t.footer.tagline}</p>
                    </div>
                    {/* h3, not h4: the last heading before the footer is a
                        section h2, so h4 skipped a level. Styling is unchanged. */}
                    <div className={`${styles.col} reveal`} style={{ ['--i' as string]: 1 }}>
                        <h3>{t.footer.product}</h3>
                        <Link to="/#features">{t.nav.features}</Link>
                        <Link to="/#pricing">{t.nav.pricing}</Link>
                        {/* The real page, not the home CTA anchor: it carries the
                            requirements, the checksum and the first-launch steps. */}
                        <Link to="/download">{t.nav.download}</Link>
                        <Link to="/#faq">{t.nav.faq}</Link>
                        <Link to="/changelog">{t.nav.changelog}</Link>
                    </div>
                    <div className={`${styles.col} reveal`} style={{ ['--i' as string]: 2 }}>
                        <h3>{t.footer.legal}</h3>
                        <Link to="/terms">{t.footer.terms}</Link>
                        <Link to="/privacy-policy">{t.footer.privacy}</Link>
                        <Link to="/refund-policy">{t.footer.refund}</Link>
                        {/* The LGPL notices shipped inside the disk image, and
                            nowhere a visitor could read them before downloading
                            it. This is that page. */}
                        <Link to="/notices">{t.footer.notices}</Link>
                    </div>
                    <div className={`${styles.col} reveal`} style={{ ['--i' as string]: 3 }}>
                        <h3>{t.footer.support}</h3>
                        {/* "Account", not "Login": the same link is where an
                            already-signed-in visitor manages their licence. */}
                        <Link to="/account">{t.footer.account}</Link>
                        <Link to="/limitations">{t.footer.limitations}</Link>
                        <Link to="/#contact">{t.footer.contact}</Link>
                    </div>
                </div>
                {/* Names are used descriptively, to say what BridgePlay is
                    compatible with. Saying so is the cheapest way to keep that
                    unambiguous; the full attribution list is on /notices. */}
                <p className={styles.disclaimer}>
                    {t.footer.disclaimerBody}{' '}
                    <Link to="/notices">{t.footer.disclaimerLink}</Link>.
                </p>
                <div className={styles.bottom}>
                    <span>{t.footer.copyright}</span>
                    <span className={styles.tagline}>{t.footer.madeFor}</span>
                </div>
            </div>
        </footer>
    );
}
