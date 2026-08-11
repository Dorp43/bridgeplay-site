import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import styles from './Nav.module.css';

interface Props {
    variant?: 'full' | 'minimal';
}

export default function Nav({ variant = 'full' }: Props) {
    const { user, loading } = useAuth();
    const location = useLocation();
    // Track which history entry the menu was opened on; navigating away
    // changes location.key, so the menu closes automatically without an effect.
    const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
    const menuOpen = menuOpenAt === location.key;
    const setMenuOpen = (open: boolean) => setMenuOpenAt(open ? location.key : null);
    const navRef = useRef<HTMLElement>(null);

    // Nav owns its own scrolled state so every page gets it, not just home.
    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                nav.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            });
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            document.querySelector(hash)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        }
        setMenuOpen(false);
    };

    if (variant === 'minimal') {
        return (
            <nav ref={navRef} className={styles.nav}>
                <Link to="/" className={styles.logo}>BridgePlay</Link>
                <Link to="/" className={styles.backLink}>&larr; Back to home</Link>
                <span aria-hidden="true" data-nav-progress className={styles.progress} />
            </nav>
        );
    }

    return (
        <>
            <nav ref={navRef} className={styles.nav}>
                <Link to="/" className={styles.logo}>BridgePlay</Link>
                <div className={styles.links}>
                    <a href="/#features" onClick={e => handleAnchor(e, '#features')}>Features</a>
                    <a href="/#how-it-works" onClick={e => handleAnchor(e, '#how-it-works')}>How It Works</a>
                    <a href="/#pricing" onClick={e => handleAnchor(e, '#pricing')}>Pricing</a>
                    <a href="/#faq" onClick={e => handleAnchor(e, '#faq')}>FAQ</a>
                    <Link to="/changelog">Changelog</Link>
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
                    <button type="button" disabled aria-disabled="true" title="Releasing soon" className={`${styles.ctaWaiting} btn-waiting`}>Coming Soon</button>
                </div>
                <button className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                    <span /><span /><span />
                </button>
                <span aria-hidden="true" data-nav-progress className={styles.progress} />
            </nav>

            {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}
            <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
                <a href="/#features" onClick={e => handleAnchor(e, '#features')}>Features</a>
                <a href="/#how-it-works" onClick={e => handleAnchor(e, '#how-it-works')}>How It Works</a>
                <a href="/#pricing" onClick={e => handleAnchor(e, '#pricing')}>Pricing</a>
                <a href="/#faq" onClick={e => handleAnchor(e, '#faq')}>FAQ</a>
                <Link to="/changelog" onClick={() => setMenuOpen(false)}>Changelog</Link>
                <span className={`${styles.authSlot} ${!loading ? styles.ready : ''}`}>
                    {!loading && (
                        user ? (
                            <Link to="/account" className={styles.profile} onClick={() => setMenuOpen(false)}>
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
                            <Link to="/account" onClick={() => setMenuOpen(false)}>Login</Link>
                        )
                    )}
                </span>
                <button type="button" disabled aria-disabled="true" className={`${styles.mobileCta} btn-waiting`}>Coming Soon</button>
            </div>
        </>
    );
}
