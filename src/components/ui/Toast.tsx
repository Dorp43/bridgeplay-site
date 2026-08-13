import styles from './Toast.module.css';

interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'error';
    visible: boolean;
}

export default function Toast({ toasts }: { toasts: ToastItem[] }) {
    return (
        /* Live region so toasts are announced instead of only being seen. The
           container is always mounted — an aria-live region has to exist before
           its content changes for assistive tech to notice the insertion. */
        <div className={styles.container} aria-live="polite" aria-atomic="false">
            {toasts.map(t => (
                <div
                    key={t.id}
                    role={t.type === 'error' ? 'alert' : 'status'}
                    className={`${styles.toast} ${styles[t.type]} ${t.visible ? styles.show : ''}`}
                >
                    {t.message}
                </div>
            ))}
        </div>
    );
}
