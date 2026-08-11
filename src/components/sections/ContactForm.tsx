import { useState, type FormEvent } from 'react';
import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useToast } from '../../context/useToast';
import styles from './ContactForm.module.css';

export default function ContactForm() {
    const ref = useScrollReveal<HTMLElement>();
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);
    const [btnText, setBtnText] = useState('Send Message');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setSending(true);
        setBtnText('Sending...');

        try {
            const res = await fetch('https://formspree.io/f/xlgavaeo', {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                showToast('Message sent! We\'ll get back to you soon.', 'success');
                form.reset();
                setBtnText('Sent!');
                setTimeout(() => { setBtnText('Send Message'); setSending(false); }, 3000);
            } else {
                throw new Error();
            }
        } catch {
            showToast('Something went wrong. Please try again.', 'error');
            setBtnText('Send Message');
            setSending(false);
        }
    };

    return (
        <section className={styles.section} id="contact" ref={ref} data-band-seam>
            <div className={styles.container}>
                <SectionHeader label="Contact" title="Get in Touch" description="Have a question, feedback, or need help? Send us a message and we'll get back to you." />
                <form className={`${styles.form} reveal-stagger`} onSubmit={handleSubmit}>
                    <div className={`${styles.field} reveal`} style={{ ['--i' as string]: 0 }}>
                        <label htmlFor="contact-name">Name</label>
                        <input type="text" id="contact-name" name="name" placeholder="Your name" required />
                    </div>
                    <div className={`${styles.field} reveal`} style={{ ['--i' as string]: 1 }}>
                        <label htmlFor="contact-email">Email</label>
                        <input type="email" id="contact-email" name="email" placeholder="you@example.com" required />
                    </div>
                    <div className={`${styles.field} reveal`} style={{ ['--i' as string]: 2 }}>
                        <label htmlFor="contact-message">Message</label>
                        <textarea id="contact-message" name="message" placeholder="How can we help?" required />
                    </div>
                    <div className="reveal" style={{ ['--i' as string]: 3 }}>
                        <button type="submit" className={styles.submit} disabled={sending}>{btnText}</button>
                    </div>
                </form>
            </div>
        </section>
    );
}
