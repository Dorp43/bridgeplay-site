import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useI18n } from '../i18n/useI18n';
import styles from './NotFound.module.css';

export default function NotFound() {
    const { pathname } = useLocation();
    const { t } = useI18n();

    /* canonicalPath is self-referential on purpose. Omitting it made
       absoluteCanonical() fall back to the bare origin, so every unknown URL
       declared itself to be the homepage — which, with the SPA's 200-status
       wildcard route, is a textbook soft-404 that consolidates junk paths into
       "/" in Search Console. */
    useDocumentMeta({
        title: t.meta.notFound.title,
        description: t.meta.notFound.description,
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
                    <h1>{t.notFound.title}</h1>
                    <p>
                        {t.notFound.bodyBefore} <code className={styles.path}>{pathname}</code>{t.notFound.bodyAfter}
                    </p>
                    <div className={styles.actions}>
                        <Link to="/" className={styles.btn}>{t.notFound.backHome}</Link>
                        <a
                            href="/BridgePlay.dmg"
                            download
                            className={styles.btnSecondary}
                            onClick={() => track('download_click', { source: '404' })}
                        >{t.notFound.downloadApp}</a>
                    </div>
                    <p className={styles.links}>
                        {t.notFound.linksIntro}{' '}
                        <Link to="/download">{t.notFound.linkDownload}</Link>,{' '}
                        <Link to="/limitations">{t.notFound.linkLimitations}</Link>,{' '}
                        <Link to="/changelog">{t.notFound.linkChangelog}</Link>,{' '}
                        <Link to="/#faq">{t.notFound.linkFaq}</Link>,{' '}
                        <Link to="/#pricing">{t.notFound.linkPricing}</Link>, {t.notFound.linkAccountBefore}{' '}
                        <Link to="/account">{t.notFound.linkAccount}</Link>.
                    </p>
                </div>
            </main>
        </>
    );
}
