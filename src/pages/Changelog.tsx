import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Changelog.module.css';

interface ChangelogEntry {
    version: string;
    date: string;
    notes: string[];
}

export default function Changelog() {
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/changelog.json')
            .then(res => res.json())
            .then(data => { setEntries(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className={styles.page}>
            <Link to="/" className={styles.back}>&larr; Back to BridgePlay</Link>
            <h1>Changelog</h1>
            <p className={styles.subtitle}>What's new in BridgePlay — every update, documented.</p>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <div className={styles.timeline}>
                    {entries.map((entry, i) => (
                        <div key={entry.version} className={styles.entry}>
                            <div className={styles.dot} />
                            <div className={styles.card}>
                                <div className={styles.header}>
                                    <span className={styles.version}>v{entry.version}</span>
                                    <span className={styles.date}>
                                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    {i === 0 && <span className={styles.latest}>Latest</span>}
                                </div>
                                <ul className={styles.notes}>
                                    {entry.notes.map((note, j) => (
                                        <li key={j}>{note}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
