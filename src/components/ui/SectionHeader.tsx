import styles from './SectionHeader.module.css';

interface Props {
    label: string;
    title: string;
    description?: string;
}

export default function SectionHeader({ label, title, description }: Props) {
    return (
        <div className={`${styles.header} reveal`}>
            <div className={styles.label}>{label}</div>
            <div className={styles.divider} />
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.desc}>{description}</p>}
        </div>
    );
}
