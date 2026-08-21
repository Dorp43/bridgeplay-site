import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './WhatsNew.module.css';

interface ChangelogEntry {
    version: string;
    date: string;
    notes: string[];
}

const MAX_RELEASES = 3;
const MAX_FEATURED_NOTES = 4;
const MAX_CONDENSED_NOTES = 2;

function formatDate(date: string, month: 'long' | 'short') {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric' });
}

export default function WhatsNew() {
    const ref = useScrollReveal<HTMLElement>();
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);

    useEffect(() => {
        let cancelled = false;
        fetch('/changelog.json')
            .then(res => {
                // Explicit failure on non-2xx: the SPA fallback rewrites a 404 to
                // index.html, which would otherwise fail silently inside json().
                if (!res.ok) throw new Error(`changelog fetch failed: ${res.status}`);
                return res.json();
            })
            .then((data: ChangelogEntry[]) => {
                if (!cancelled) setEntries(Array.isArray(data) ? data.slice(0, MAX_RELEASES) : []);
            })
            .catch(() => { /* keep the reserved space — the full-changelog link below still works */ });
        return () => { cancelled = true; };
    }, []);

    const [latest, ...previous] = entries;
    const latestHidden = latest ? latest.notes.length - MAX_FEATURED_NOTES : 0;

    return (
        <section className={styles.section} id="whats-new" ref={ref}>
            <div className={styles.container}>
                {/* "ships fast and documents everything" was a claim about us;
                    this says what the reader is actually looking at. */}
                <SectionHeader label="What's New" title="Better With Every Release" description="Every release gets written up. These are the most recent ones, straight from the changelog." />
                {/* Static wrapper owns the reveal class: the releases arrive from a
                    runtime fetch AFTER useScrollReveal has wired the observer, so a
                    global `reveal` class on the fetched children would never be seen.
                    Children animate from module CSS keyed off this wrapper's .visible
                    (HowItWorks' numeral pattern), and min-height reserves the fetched
                    content's footprint so the fetch causes zero CLS. */}
                <div className={`${styles.timeline} reveal`}>
                    {latest && (
                        <article className={styles.featured}>
                            <span className={`${styles.dot} ${styles.dotLatest}`} />
                            <div className={styles.releaseHeader}>
                                <h3 className={`${styles.pill} ${styles.pillLatest}`}>v{latest.version}</h3>
                                <span className={styles.latestBadge}>Latest</span>
                                <span className={styles.date}>{formatDate(latest.date, 'long')}</span>
                            </div>
                            <ul className={styles.notes}>
                                {latest.notes.slice(0, MAX_FEATURED_NOTES).map((note, i) => (
                                    <li key={i}>{note}</li>
                                ))}
                            </ul>
                            {latestHidden > 0 && <Link to="/changelog" className={styles.more}>+{latestHidden} more</Link>}
                        </article>
                    )}
                    {previous.map((entry, i) => {
                        const hidden = entry.notes.length - MAX_CONDENSED_NOTES;
                        return (
                            <article key={entry.version} className={styles.row} style={{ ['--i' as string]: i }}>
                                <span className={styles.dot} />
                                <div className={styles.releaseHeader}>
                                    <h3 className={styles.pill}>v{entry.version}</h3>
                                    <span className={styles.date}>{formatDate(entry.date, 'short')}</span>
                                </div>
                                <ul className={`${styles.notes} ${styles.notesCondensed}`}>
                                    {entry.notes.slice(0, MAX_CONDENSED_NOTES).map((note, j) => (
                                        <li key={j}>{note}</li>
                                    ))}
                                </ul>
                                {hidden > 0 && <Link to="/changelog" className={styles.more}>+{hidden} more</Link>}
                            </article>
                        );
                    })}
                </div>
                <div className={`${styles.linkRow} reveal`}>
                    <Link to="/changelog" className={styles.allLink}>
                        View full changelog <span className={styles.arrow}>&rarr;</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
