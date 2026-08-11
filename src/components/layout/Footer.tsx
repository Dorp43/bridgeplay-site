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
                        <p>Play Windows games on your Mac. Built with care for the macOS gaming community.</p>
                    </div>
                    <div className={`${styles.col} reveal`} style={{ ['--i' as string]: 1 }}>
                        <h4>Product</h4>
                        <a href="/#features">Features</a>
                        <a href="/#pricing">Pricing</a>
                        <a href="/#download">Download</a>
                        <a href="/#faq">FAQ</a>
                        <Link to="/changelog">Changelog</Link>
                    </div>
                    <div className={`${styles.col} reveal`} style={{ ['--i' as string]: 2 }}>
                        <h4>Legal</h4>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/refund-policy">Refund Policy</Link>
                    </div>
                    <div className={`${styles.col} reveal`} style={{ ['--i' as string]: 3 }}>
                        <h4>Support</h4>
                        <Link to="/account">Login</Link>
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
