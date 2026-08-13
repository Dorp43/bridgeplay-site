import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { useAuth } from '../../context/useAuth';
import { usePlatform } from '../../hooks/usePlatform';
import styles from './Nav.module.css';

interface Props {
    variant?: 'full' | 'minimal';
}

const MENU_ID = 'nav-mobile-menu';

export default function Nav({ variant = 'full' }: Props) {
    const { user, loading } = useAuth();
    const location = useLocation();
    /* Both nav CTAs lead to /download either way — the platform only decides
       what the button is allowed to promise. Settled before first paint, so the
       label never swaps under the visitor. */
    const { isUnsupported } = usePlatform();
    const ctaLabel = isUnsupported ? 'Requirements' : 'Download';
    const ctaTitle = isUnsupported ? 'BridgePlay is a macOS app — see what it needs to run' : undefined;
    // Track which history entry the menu was opened on; navigating away
    // changes location.key, so the menu closes automatically without an effect.
    const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
    const menuOpen = menuOpenAt === location.key;
    const setMenuOpen = (open: boolean) => setMenuOpenAt(open ? location.key : null);
    const navRef = useRef<HTMLElement>(null);
    const burgerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

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

    // Drawer keyboard contract: opening moves focus to the first item so the
    // next Tab lands inside the drawer, Escape closes it, and any close hands
    // focus back to the toggle — without wasOpen the browser dumps focus on
    // <body> the moment the drawer turns inert. setMenuOpenAt is called
    // directly because the setMenuOpen wrapper is new on every render.
    const wasOpen = useRef(false);
    useEffect(() => {
        if (!menuOpen) {
            if (wasOpen.current) {
                wasOpen.current = false;
                burgerRef.current?.focus();
            }
            return;
        }
        wasOpen.current = true;
        menuRef.current?.querySelector<HTMLElement>('a, button')?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpenAt(null);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
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
                    {/* /download, not the disk image: it is the only page that states
                        the requirements and what to do when macOS blocks the
                        un-notarized image on first launch. */}
                    <Link
                        to="/download"
                        className={styles.cta}
                        title={ctaTitle}
                        onClick={() => track('download_page_click', { source: 'nav' })}
                    >{ctaLabel}</Link>
                </div>
                <button
                    ref={burgerRef}
                    className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    aria-controls={MENU_ID}
                >
                    <span /><span /><span />
                </button>
                <span aria-hidden="true" data-nav-progress className={styles.progress} />
            </nav>

            {/* Scrim is a pointer-only shortcut for closing; Escape is the
                keyboard equivalent, so it stays out of the a11y tree. */}
            {menuOpen && <div className={styles.overlay} aria-hidden="true" onClick={() => setMenuOpen(false)} />}
            {/* The drawer is always in the DOM (it slides), so it must be inert
                while closed — otherwise Tab walks through five off-screen
                links and focus disappears behind the page. */}
            <div
                ref={menuRef}
                id={MENU_ID}
                inert={!menuOpen}
                className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
            >
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
                {/* Stays a single element in every state: the drawer's cascade-in
                    delays are nth-child based, so the child count must not move. */}
                <Link
                    to="/download"
                    className={styles.mobileCta}
                    title={ctaTitle}
                    onClick={() => {
                        track('download_page_click', { source: 'nav_mobile' });
                        setMenuOpen(false);
                    }}
                >{ctaLabel}</Link>
            </div>
        </>
    );
}
