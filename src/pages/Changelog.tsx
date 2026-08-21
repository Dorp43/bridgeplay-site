import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import styles from './Changelog.module.css';

interface ChangelogEntry {
    version: string;
    date: string;
    notes: string[];
}

/* The file is generated, but it is still fetched at runtime: a half-written or
   missing changelog.json should render a state, not a blank page or a crash. */
function normalizeEntries(data: unknown): ChangelogEntry[] {
    if (!Array.isArray(data)) return [];
    return data.filter((entry): entry is ChangelogEntry => {
        if (!entry || typeof entry !== 'object') return false;
        const candidate = entry as Partial<ChangelogEntry>;
        return typeof candidate.version === 'string'
            && typeof candidate.date === 'string'
            && Array.isArray(candidate.notes);
    });
}

function formatDate(date: string): string | null {
    const parsed = new Date(`${date}T00:00:00`);
    return Number.isNaN(parsed.getTime())
        ? null
        : parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/* Three placeholder entries on the real timeline, so the page has its shape
   before the fetch lands instead of collapsing to a line of text. */
function Skeleton() {
    return (
        <div className={styles.timeline} aria-hidden="true">
            {[0, 1, 2].map(i => (
                <div key={i} className={styles.entry} style={{ ['--i' as string]: i }}>
                    <div className={styles.dot} />
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <span className={`${styles.ghost} ${styles.ghostVersion}`} />
                            <span className={`${styles.ghost} ${styles.ghostDate}`} />
                        </div>
                        <div className={styles.ghostNotes}>
                            <span className={`${styles.ghost} ${styles.ghostLine}`} />
                            <span className={`${styles.ghost} ${styles.ghostLineShort}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Changelog() {
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    useDocumentMeta({
        title: 'Changelog — BridgePlay',
        description: 'Every BridgePlay release, documented — version-by-version notes for the macOS launcher that runs Windows games on Apple Silicon.',
        canonicalPath: '/changelog',
    });

    useEffect(() => {
        let cancelled = false;

        fetch('/changelog.json')
            .then(res => (res.ok ? res.json() : Promise.reject(new Error('unavailable'))))
            .then((data: unknown) => {
                if (cancelled) return;
                setEntries(normalizeEntries(data));
                setStatus('ready');
            })
            .catch(() => {
                if (!cancelled) setStatus('error');
            });

        return () => { cancelled = true; };
    }, []);

    const latest = entries.length > 0 ? entries[0].version : null;

    return (
        <>
            <div className="bg-glow" aria-hidden="true" />
            {/* Landmark + target for the skip link rendered in main.tsx. */}
            <main id="main-content" tabIndex={-1} className={styles.page}>
                <div className={styles.shell}>
                    {/* No `reveal` here: this route renders no chrome and has no
                        useScrollReveal root, so PageHeader draws its divider on
                        load instead. */}
                    <PageHeader
                        eyebrow="Releases"
                        title="Changelog"
                        align="left"
                        backTo="/"
                        lede={<>What&rsquo;s new in BridgePlay — every update, documented, newest first.</>}
                        meta={latest ? [
                            <>{entries.length} {entries.length === 1 ? 'release' : 'releases'}</>,
                            <>current version v{latest}</>,
                        ] : []}
                    />

                    {status === 'loading' && <Skeleton />}

                    {status === 'error' && (
                        <div className={styles.state}>
                            <p className={styles.stateTitle}>Release notes could not be loaded</p>
                            <p className={styles.stateBody}>
                                The list lives in a file this page fetches, and that request failed — which is a
                                problem with this page, not with your copy of BridgePlay. Reloading usually fixes it.
                                The app itself always shows the version it is running in its own window.
                            </p>
                        </div>
                    )}

                    {status === 'ready' && entries.length === 0 && (
                        <div className={styles.state}>
                            <p className={styles.stateTitle}>No releases listed yet</p>
                            <p className={styles.stateBody}>
                                Nothing has been published to this page so far. It fills in from the release notes as
                                versions ship.
                            </p>
                        </div>
                    )}

                    {status === 'ready' && entries.length > 0 && (
                        <div className={styles.timeline}>
                            {entries.map((entry, i) => {
                                const date = formatDate(entry.date);
                                return (
                                    <article key={entry.version} className={styles.entry} style={{ ['--i' as string]: i }}>
                                        <div className={styles.dot} />
                                        <div className={styles.card}>
                                            <div className={styles.header}>
                                                <h2 className={styles.version}>v{entry.version}</h2>
                                                {date && <span className={styles.date}>{date}</span>}
                                                {i === 0 && <span className={styles.latest}>Latest</span>}
                                            </div>
                                            <ul className={styles.notes}>
                                                {entry.notes.map((note, j) => (
                                                    <li key={j}>{note}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    <footer className={styles.foot}>
                        <div className={styles.footRow}>
                            <span className={styles.footLabel}>Also</span>
                            <Link to="/download" className={styles.footLink}>Download BridgePlay</Link>
                            <Link to="/limitations" className={styles.footLink}>Known limitations</Link>
                            <a href="/#faq" className={styles.footLink}>FAQ</a>
                        </div>
                        <Link to="/" className="back-link">&larr; Back to BridgePlay</Link>
                    </footer>
                </div>
            </main>
        </>
    );
}
