import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import styles from './NotFound.module.css';

export default function NotFound() {
    const { pathname } = useLocation();

    /* canonicalPath is self-referential on purpose. Omitting it made
       absoluteCanonical() fall back to the bare origin, so every unknown URL
       declared itself to be the homepage — which, with the SPA's 200-status
       wildcard route, is a textbook soft-404 that consolidates junk paths into
       "/" in Search Console. */
    useDocumentMeta({
        title: 'Page Not Found — BridgePlay',
        description: "This page doesn't exist or has been moved. Head back to BridgePlay to play your Windows games on macOS.",
        canonicalPath: pathname,
    });

    // Which URL 404'd is the whole point of the event — it turns a dead link
    // (ours or someone else's) into something we can actually find and fix.
    useEffect(() => {
        track('not_found', { path: pathname });
    }, [pathname]);

    return (
        <>
            <div className="bg-glow" aria-hidden="true" />
            <main className={styles.page} id="main-content" tabIndex={-1}>
                <div className={styles.card}>
                    <div className={styles.codeWrap}>
                        <span className={styles.code}>404</span>
                    </div>
                    <h1>Page Not Found</h1>
                    <p>
                        Nothing lives at <code className={styles.path}>{pathname}</code>. The link
                        was probably mistyped, or the page moved &mdash; nothing is wrong with your
                        copy of BridgePlay.
                    </p>
                    <div className={styles.actions}>
                        <Link to="/" className={styles.btn}>Back to Home</Link>
                        <a
                            href="/BridgePlay.dmg"
                            download
                            className={styles.btnSecondary}
                            onClick={() => track('download_click', { source: '404' })}
                        >Download BridgePlay</a>
                    </div>
                    <p className={styles.links}>
                        Looking for something specific? Try the{' '}
                        <Link to="/download">download page</Link>,{' '}
                        <Link to="/limitations">known limitations</Link>,{' '}
                        <Link to="/changelog">changelog</Link>,{' '}
                        <Link to="/#faq">FAQ</Link>,{' '}
                        <Link to="/#pricing">pricing</Link>, or{' '}
                        <Link to="/account">your account</Link>.
                    </p>
                </div>
            </main>
        </>
    );
}
