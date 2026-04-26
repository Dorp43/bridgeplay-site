import styles from './Toast.module.css';

interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'error';
    visible: boolean;
}

export default function Toast({ toasts }: { toasts: ToastItem[] }) {
    return (
        <div className={styles.container}>
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`${styles.toast} ${styles[t.type]} ${t.visible ? styles.show : ''}`}
                >
                    {t.message}
                </div>
            ))}
        </div>
    );
}
