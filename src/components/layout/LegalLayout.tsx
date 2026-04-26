import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './LegalLayout.module.css';

interface Props {
    title: string;
    lastUpdated: string;
    children: ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: Props) {
    return (
        <div className={styles.page}>
            <Link to="/" className={styles.back}>&larr; Back to BridgePlay</Link>
            <h1>{title}</h1>
            <p className={styles.date}>Last updated: {lastUpdated}</p>
            <div className={styles.content}>{children}</div>
        </div>
    );
}
