import { useState } from 'react';
import SectionHeader from '../ui/SectionHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './FAQ.module.css';

const faqs = [
    { q: 'What is BridgePlay?', a: 'BridgePlay is a macOS app that runs Windows games on your Mac. It bundles Wine — the long-running open-source project that reimplements Windows so Windows programs can run without it — at version 11.0, stock and unmodified, built from source, and it sets Wine up for each of your games so you do not have to. There is no Proton fork and no DXVK (the translation pieces Valve ships on Steam Deck), and nothing closed-source.' },
    { q: 'Which Macs are supported?', a: 'BridgePlay requires an Apple Silicon Mac (M1 or later) running macOS 14 (Sonoma) or newer, with Rosetta 2 installed. Intel Macs are not supported.' },
    { q: 'Does multiplayer work? What about anti-cheat?', a: 'Online play works, but kernel-level anti-cheat does not. Easy Anti-Cheat, BattlEye, VAC and nProtect GameGuard install drivers deep inside Windows itself, and Wine only reimplements the outer layer that ordinary programs talk to — there is no Windows core underneath for those drivers to load into. The clients BridgePlay is built and tested against are the ones used with community-run game servers (private servers); those protect themselves at the ordinary-program level instead, by wrapping the game in a copy-protection layer such as Themida, which is exactly why they do run.' },
    { q: 'Is DirectX 12 supported?', a: 'No. DirectX is the graphics system Windows games draw with, and BridgePlay covers DirectDraw and DirectX 8, 9, 10 and 11: Wine\'s own wined3d translator converts those into OpenGL, which macOS runs on Metal. DirectX 12 would need a different graphics path (through Vulkan, or straight to Metal) that this build does not include, so DirectX 12 games will not launch at all.' },
    { q: 'Will my games run well?', a: 'Performance varies by game. Many games run very well, especially older titles and indie games. More demanding titles may require lower graphics settings. Use the 7-day free trial to test your specific games before you pay for anything.' },
    { q: 'What if my game doesn\'t work?', a: 'Test it during the 7-day free trial first — that is what the trial is for, and it needs no card. If you have already bought a plan, we offer a 7-day money-back guarantee on every plan, including Lifetime. Contact us and we will either fix it or refund you.' },
    { q: 'Do I need to own the games?', a: 'Yes. BridgePlay is a launcher, not a game store. You need your own game files. Point BridgePlay to your existing game installations, and it handles the rest.' },
    { q: 'Is this legal?', a: 'Yes. Wine is an open-source (LGPL) reimplementation of the Windows API and contains no Microsoft code, and BridgePlay ships no games. You supply your own legally obtained game files and play them on hardware you own.' },
    { q: 'How does the free trial work?', a: 'Download BridgePlay and create your account inside the app on first launch — that is where the trial is claimed. You get 7 days of full access with no credit card. The trial is one per Mac: BridgePlay stores a one-way hash of your Mac\'s hardware ID — a scrambled stand-in, not the ID itself — so the same machine cannot restart the trial, and reinstalling or making a new account resumes the original countdown rather than granting a fresh week.' },
    { q: 'How many Macs can I use my licence on?', a: 'Your licence belongs to your BridgePlay account, not to one machine. Sign in on any Mac you personally own and it unlocks there; there is no activation limit and nothing to deactivate when you replace a Mac. Only the free trial is per-machine — one trial per Mac.' },
    { q: 'How do I cancel?', a: 'Monthly ($6.99) and yearly ($39.99) plans renew automatically until you cancel. To cancel, use the contact form below or the subscription link in the payment receipt Paddle emails you. You keep full access until the end of the period you have already paid for, and you are not charged again. Lifetime is a single payment with nothing to cancel.' },
    { q: 'Does BridgePlay work offline?', a: 'Mostly. BridgePlay verifies your licence with our servers, then keeps a signed local copy of that result so it keeps working for up to 24 hours offline. Beyond that it needs one online check. Games themselves run entirely on your Mac; online games still need their own connection.' },
    { q: 'What happens to my games if I stop paying?', a: 'Nothing happens to your games. The game files are yours, they live in your own folders, and BridgePlay never deletes or locks them. What stops is BridgePlay itself: launching through it needs an active subscription, an in-progress trial or a Lifetime licence. Resubscribe and your library and per-game settings are exactly as you left them.' },
    { q: 'Do I need Rosetta 2, and how long will it last?', a: 'Yes. Windows games are built for Intel processors, and Rosetta 2 is Apple\'s built-in translator that lets Intel software run on an M-series Mac, so BridgePlay runs its Wine runtime through it and will not launch without it. Being straight with you about the platform: macOS 27 is the last release with full Rosetta 2, and macOS 28 keeps it only for certain older, unmaintained games that rely on Intel-based frameworks. We are not going to promise you a specific migration path we have not shipped yet.' },
    { q: 'Can I get a refund?', a: 'Yes. We offer a 7-day money-back guarantee on all plans. Use the contact form below and include your Paddle order ID or the email you paid with. See the refund policy for the full details.' },
    { q: 'Is BridgePlay safe?', a: 'The app collects no telemetry and does not track what you play: it stores your email for sign-in and a one-way hash of your hardware ID for trial eligibility, and that is it. Your games, saves and settings stay on your Mac. This website is separate — it uses cookieless Vercel Analytics for aggregate visit counts, plus a short list of named events (a download link clicked, a page not found and which URL was asked for, a first interaction) with no identifier attached to them. The privacy policy lists every processor we use, and section 3 names each event.' },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const ref = useScrollReveal<HTMLElement>();

    return (
        <section className={styles.section} id="faq" ref={ref} data-band-seam>
            <div className={styles.container}>
                {/* Every other section carries a description; this one read as an
                    unlabelled list. It also sets expectations honestly up front. */}
                <SectionHeader
                    label="FAQ"
                    title="Frequently Asked Questions"
                    description="What BridgePlay is, which Macs it needs, what it cannot run, and how the trial and billing work."
                />
                <div className={`${styles.list} reveal-stagger`}>
                    {faqs.map((faq, i) => (
                        // Static wrapper owns the reveal class: the observer adds .visible
                        // imperatively, and a state-driven className rewrite on the item
                        // below would wipe it (the observer unobserves after revealing).
                        <div key={i} className="reveal" style={{ ['--i' as string]: i }}>
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
                    ))}
                </div>
            </div>
        </section>
    );
}
