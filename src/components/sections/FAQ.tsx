import { useState } from 'react';
import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './FAQ.module.css';

const faqs = [
    { q: 'What is BridgePlay?', a: 'BridgePlay is a macOS application that lets you run Windows games on your Mac. It uses advanced compatibility technology (Wine) to translate Windows game calls into macOS-native instructions, so your games run without needing a separate Windows installation.' },
    { q: 'Which Macs are supported?', a: 'BridgePlay supports macOS 14 (Sonoma) and later, on both Apple Silicon (M1, M2, M3, M4) and Intel Macs. For the best gaming experience, we recommend an Apple Silicon Mac with at least 8GB of RAM.' },
    { q: 'Will my games run well?', a: 'Performance varies by game. Many games run very well, especially older titles and indie games. More demanding AAA titles may require lower graphics settings. We offer a 7-day free trial so you can test your specific games before purchasing.' },
    { q: 'Do I need to own the games?', a: 'Yes. BridgePlay is a launcher, not a game store. You need your own game files. Point BridgePlay to your existing game installations, and it handles the rest.' },
    { q: 'How does the free trial work?', a: 'Download BridgePlay, create an account, and you get 7 days of full access — no credit card needed. After the trial, choose a plan to continue using BridgePlay.' },
    { q: 'Can I get a refund?', a: 'Yes. We offer a 7-day money-back guarantee on all plans. Use the contact form below to request a refund.' },
    { q: 'Is BridgePlay safe?', a: 'Absolutely. BridgePlay doesn\'t collect telemetry or track your activity. We only store your email for authentication and a device hash for trial management. Your gaming data stays entirely on your Mac.' },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.section} id="faq" ref={ref}>
            <div className={styles.container}>
                <SectionHeader label="FAQ" title="Frequently Asked Questions" />
                <div className={styles.list}>
                    {faqs.map((faq, i) => (
                        <div key={i} className={`${styles.item} ${openIndex === i ? styles.open : ''} reveal`}>
                            <button className={styles.question} onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                                {faq.q}
                                <span className={styles.arrow}>+</span>
                            </button>
                            <div className={styles.answer}>
                                <p>{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
