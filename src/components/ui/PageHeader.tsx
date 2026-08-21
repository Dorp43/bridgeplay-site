import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './PageHeader.module.css';

interface Props {
    /* Uppercase accent label above the title. */
    eyebrow: string;
    title: ReactNode;
    /* Centred for the two marketing pages (/download, /limitations); left for
       the documents (/changelog and the legal pages), which read as prose. */
    align?: 'center' | 'left';
    /* Rendered above the eyebrow. The document routes render no nav, so this is
       the only way back out of them. */
    backTo?: string;
    backLabel?: ReactNode;
    lede?: ReactNode;
    /* Meta row under the lede. Given as items so the middot separators are this
       component's business rather than four callers' — pass [] or omit for none. */
    meta?: ReactNode[];
    /* True when the header sits inside a useScrollReveal root: the divider then
       draws off the header's own `.visible` flip. False (the default) draws it on
       load, which is what a page with no reveal root needs — `reveal` alone would
       leave the header at opacity 0 forever. */
    reveal?: boolean;
    /* Escape hatch for the caller's own layout placement, nothing else. The legal
       pages turn their shell into a two-column grid at 1080px and need the header
       to span both tracks — where the header sits in the page is the page's
       business, not this component's. */
    className?: string;
}

/**
 * The one page head for every routed page: /download, /limitations, /changelog
 * and the three legal documents.
 *
 * The eyebrow + divider + h1 trio was hand-copied into four modules on top of
 * SectionHeader's — `grep ':global(.visible) .divider'` returned four hits — and
 * the copies had already drifted into two orders for the parts and a line-height
 * in only one of them. One order here: the divider sits under the h1, where it
 * underlines the title instead of floating above the eyebrow, and that reads on
 * both alignments.
 *
 * SectionHeader stays separate: it is the header of a band *inside* a page, with
 * its own centred-only layout and no back link or meta row.
 */
export default function PageHeader({
    eyebrow,
    title,
    align = 'center',
    backTo,
    backLabel = <>&larr; Back to BridgePlay</>,
    lede,
    meta,
    reveal = false,
    className,
}: Props) {
    const classes = [
        styles.head,
        align === 'center' ? styles.center : styles.left,
        reveal ? `${styles.onReveal} reveal` : styles.onLoad,
        className,
    ].filter(Boolean).join(' ');

    const metaItems = meta?.filter(Boolean) ?? [];

    return (
        <header className={classes}>
            {backTo && (
                <Link to={backTo} className={`${styles.back} back-link`}>{backLabel}</Link>
            )}
            <div className={styles.eyebrow}>{eyebrow}</div>
            <h1>{title}</h1>
            <div className={styles.divider} />
            {lede && <p className={styles.lede}>{lede}</p>}
            {metaItems.length > 0 && (
                <p className={styles.meta}>
                    {metaItems.map((item, i) => (
                        <Fragment key={i}>
                            {i > 0 && <span className={styles.metaDot} aria-hidden="true">&middot;</span>}
                            {item}
                        </Fragment>
                    ))}
                </p>
            )}
        </header>
    );
}
