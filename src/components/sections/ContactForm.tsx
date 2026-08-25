import { useState, type FormEvent } from 'react';
import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useToast } from '../../context/useToast';
import { useI18n } from '../../i18n/useI18n';
import styles from './ContactForm.module.css';

type SendState = 'idle' | 'sending' | 'sent';

export default function ContactForm() {
    const ref = useScrollReveal<HTMLElement>();
    const { showToast } = useToast();
    const { t } = useI18n();
    /* State, not a stored label: the button text is derived from it on every
       render, so switching language mid-send relabels the button instead of
       leaving an English string frozen in place. */
    const [state, setState] = useState<SendState>('idle');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setState('sending');

        try {
            const res = await fetch('https://formspree.io/f/xlgavaeo', {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error();
            showToast(t.contact.successToast, 'success');
            form.reset();
            setState('sent');
            setTimeout(() => setState('idle'), 3000);
        } catch {
            showToast(t.contact.errorToast, 'error');
            setState('idle');
        }
    };

    const label = state === 'sending' ? t.contact.sending
        : state === 'sent' ? t.contact.sent
        : t.contact.send;

    return (
        <section className={styles.section} id="contact" ref={ref} data-band-seam>
            <div className={styles.container}>
                <SectionHeader label={t.contact.label} title={t.contact.title} description={t.contact.description} />
                <form className={`${styles.form} reveal-stagger`} onSubmit={handleSubmit}>
                    <div className={`${styles.field} reveal`} style={{ ['--i' as string]: 0 }}>
                        <label htmlFor="contact-name">{t.contact.name}</label>
                        <input type="text" id="contact-name" name="name" placeholder={t.contact.namePlaceholder} required />
                    </div>
                    <div className={`${styles.field} reveal`} style={{ ['--i' as string]: 1 }}>
                        <label htmlFor="contact-email">{t.contact.email}</label>
                        <input type="email" id="contact-email" name="email" placeholder={t.contact.emailPlaceholder} required />
                    </div>
                    <div className={`${styles.field} reveal`} style={{ ['--i' as string]: 2 }}>
                        <label htmlFor="contact-message">{t.contact.message}</label>
                        <textarea id="contact-message" name="message" placeholder={t.contact.messagePlaceholder} required />
                    </div>
                    <div className="reveal" style={{ ['--i' as string]: 3 }}>
                        <button type="submit" className={styles.submit} disabled={state !== 'idle'}>{label}</button>
                    </div>
                </form>
            </div>
        </section>
    );
}
