import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Footer.module.css';

export default function Footer() {
    const ref = useScrollReveal<HTMLElement>();

    return (
        <footer className={styles.footer} ref={ref}>
            <div className={styles.container}>
                <div className={`${styles.topline} reveal`} aria-hidden="true" />
                <div className={styles.grid}>
                    <div className={`${styles.brand} reveal`} style={{ ['--i' as string]: 0 }}>
                        <div className={styles.logo}>BridgePlay</div>
                        <p>Play Windows games on your Mac. Built on stock, open-source Wine, for Apple Silicon.</p>
                    </div>
                    {/* h3, not h4: the last heading before the footer is a
                        section h2, so h4 skipped a level. Styling is unchanged. */}
                    <div className={`${styles.col} reveal`} style={{ ['--i' as string]: 1 }}>
                        <h3>Product</h3>
                        <a href="/#features">Features</a>
                        <a href="/#pricing">Pricing</a>
                        {/* The real page, not the home CTA anchor: it carries the
                            requirements, the checksum and the first-launch steps. */}
                        <Link to="/download">Download</Link>
                        <a href="/#faq">FAQ</a>
                        <Link to="/changelog">Changelog</Link>
                    </div>
                    <div className={`${styles.col} reveal`} style={{ ['--i' as string]: 2 }}>
                        <h3>Legal</h3>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/refund-policy">Refund Policy</Link>
                    </div>
                    <div className={`${styles.col} reveal`} style={{ ['--i' as string]: 3 }}>
                        <h3>Support</h3>
                        {/* "Account", not "Login": the same link is where an
                            already-signed-in visitor manages their licence. */}
                        <Link to="/account">Account</Link>
                        <Link to="/limitations">Known limitations</Link>
                        <a href="/#contact">Contact</a>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <span>&copy; 2026 BridgePlay. All rights reserved.</span>
                    <span className={styles.tagline}>Made for Mac gamers everywhere</span>
                </div>
            </div>
        </footer>
    );
}
