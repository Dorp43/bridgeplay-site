import { useState } from 'react';
import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useI18n } from '../../i18n/useI18n';
import en from '../../i18n/locales/en';
import styles from './FAQ.module.css';

/* Order lives here, wording in the dictionary under faq.items.<key>. The keys
   are typed off the English dictionary, so renaming a question there is a build
   error rather than a silently missing entry.

   Each concept on this site has one canonical home, and the FAQ is not it for
   most of them — an answer here states the fact and points at the page that
   explains it. Compatibility coverage lives in the compatibility section,
   kernel anti-cheat and DirectX 12 on /limitations, Rosetta 2 on /download. The
   exceptions are the trial and billing answers, which are canonical here, and
   the billing one is a legal disclosure — do not trim it. */
const FAQ_KEYS = [
    'whatIs', 'whichMacs', 'multiplayer', 'directx12', 'performance', 'gameBroken',
    'ownGames', 'legal', 'trial', 'howManyMacs', 'cancel', 'offline', 'stopPaying',
    'rosetta', 'refund', 'safe',
] as const satisfies readonly (keyof typeof en.faq.items)[];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const ref = useScrollReveal<HTMLElement>();
    const { t } = useI18n();

    return (
        <section className={styles.section} id="faq" ref={ref} data-band-seam>
            <div className={styles.container}>
                {/* Every other section carries a description; this one read as an
                    unlabelled list. It also sets expectations honestly up front. */}
                <SectionHeader
                    label={t.faq.label}
                    title={t.faq.title}
                    description={t.faq.description}
                />
                <div className={`${styles.list} reveal-stagger`}>
                    {FAQ_KEYS.map((key, i) => {
                        const faq = t.faq.items[key];
                        return (
                        // Static wrapper owns the reveal class: the observer adds .visible
                        // imperatively, and a state-driven className rewrite on the item
                        // below would wipe it (the observer unobserves after revealing).
                        <div key={key} className="reveal" style={{ ['--i' as string]: i }}>
                            <div className={`${styles.item} ${openIndex === i ? styles.open : ''}`}>
                                <button
                                    className={styles.question}
                                    aria-expanded={openIndex === i}
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                >
                                    <span className={styles.qText}>{faq.q}</span>
                                    <span className={styles.arrow}>+</span>
                                </button>
                                <div className={styles.answer}>
                                    <div>
                                        <p>{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
