import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <span className={styles.code}>404</span>
                <h1>Page Not Found</h1>
                <p>The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/" className={styles.btn}>Back to Home</Link>
            </div>
        </div>
    );
}
