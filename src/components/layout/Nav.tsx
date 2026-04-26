import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Nav.module.css';

interface Props {
    variant?: 'full' | 'minimal';
}

export default function Nav({ variant = 'full' }: Props) {
    const { user, loading } = useAuth();
    const location = useLocation();

    const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        if (location.pathname === '/') {
            e.preventDefault();
            document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (variant === 'minimal') {
        return (
            <nav className={styles.nav}>
                <Link to="/" className={styles.logo}>BridgePlay</Link>
                <Link to="/" className={styles.backLink}>&larr; Back to home</Link>
            </nav>
        );
    }

    return (
        <nav className={styles.nav}>
            <Link to="/" className={styles.logo}>BridgePlay</Link>
            <div className={styles.links}>
                <a href="/#features" onClick={e => handleAnchor(e, '#features')}>Features</a>
                <a href="/#how-it-works" onClick={e => handleAnchor(e, '#how-it-works')}>How It Works</a>
                <a href="/#pricing" onClick={e => handleAnchor(e, '#pricing')}>Pricing</a>
                <a href="/#faq" onClick={e => handleAnchor(e, '#faq')}>FAQ</a>
                <span className={`${styles.authSlot} ${!loading ? styles.ready : ''}`}>
                    {!loading && (
                        user ? (
                            <Link to="/account" className={styles.profile}>
                                <span className={styles.avatar}>
                                    {(user.email || '?')[0].toUpperCase()}
                                </span>
                                <span className={styles.profileEmail}>
                                    {(user.email || '').length > 20
                                        ? user.email!.substring(0, 18) + '...'
                                        : user.email}
                                </span>
                            </Link>
                        ) : (
                            <Link to="/account">Login</Link>
                        )
                    )}
                </span>
                <a href="/#download" onClick={e => handleAnchor(e, '#download')} className={styles.cta}>Download</a>
            </div>
        </nav>
    );
}
