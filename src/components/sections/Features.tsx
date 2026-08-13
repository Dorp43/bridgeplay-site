import { useRef } from 'react';
import SectionHeader from '../ui/SectionHeader';
import Icon, { type IconName } from '../ui/Icon';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { usePointerGlow } from '../../hooks/usePointerGlow';
import styles from './Features.module.css';

const features: { icon: IconName; color: string; bg: string; title: string; desc: string }[] = [
    { icon: 'play', color: 'var(--accent)', bg: 'var(--accent-glow)', title: 'One-Click Launch', desc: 'Add a game once, then start it from your library with a single click. No Terminal, no config files to edit by hand.' },
    { icon: 'gear', color: 'var(--green)', bg: 'var(--green-glow)', title: 'Set Up For You', desc: 'Point BridgePlay at a game folder and it finds the .exe — the Windows program file — and picks settings that suit that game.' },
    { icon: 'download', color: 'var(--purple)', bg: 'var(--purple-glow)', title: 'Automatic Updates', desc: 'BridgePlay checks for a newer version of itself each time it starts and installs it for you. Your games are never touched.' },
    { icon: 'grid', color: 'var(--pink)', bg: 'var(--pink-glow)', title: 'Game Library', desc: 'Keep your collection in one place with your own categories, and settings saved separately for each game.' },
    { icon: 'bolt', color: 'var(--orange)', bg: 'var(--orange-glow)', title: 'Built for Apple Silicon', desc: 'The launcher itself is a native app for M-series Macs. The games stay Windows Intel builds, so they run through Apple\'s Rosetta 2 translator.' },
    { icon: 'layers', color: 'var(--accent)', bg: 'var(--accent-glow)', title: 'Several Games at Once', desc: 'Run more than one game at a time. Switch between them with hotkeys, mute or solo each game\'s audio, and stay in control of every window.' },
];

export default function Features() {
    const ref = useScrollReveal<HTMLElement>();
    const gridRef = useRef<HTMLDivElement>(null);
    usePointerGlow(gridRef);

    return (
        <section className={styles.features} id="features" ref={ref}>
            <div className={styles.container}>
                {/* First plain-language gloss of "Wine" on the page: the hero
                    names it, this is the earliest place we can say what it is. */}
                <SectionHeader
                    label="Features"
                    title="Everything You Need to Game on Mac"
                    description="Wine — the open-source project that lets Windows programs run without Windows — has to be set up differently for almost every game. BridgePlay is the part that does that for you. You get a library and a Launch button."
                />
                <div className={`${styles.grid} reveal-stagger`} ref={gridRef}>
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className={`${styles.card} reveal`}
                            data-glow-card
                            style={{ ['--card-accent' as string]: f.color, ['--card-glow' as string]: f.bg, ['--i' as string]: i }}
                        >
                            <div className={styles.icon} data-icon={f.icon}><Icon name={f.icon} /></div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
