import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useScrollReveal } from '../hooks/useScrollReveal';
import styles from './Limitations.module.css';

const ANTI_CHEAT = ['Easy Anti-Cheat', 'BattlEye', 'VAC', 'nProtect GameGuard'];

export default function Limitations() {
    const ref = useScrollReveal<HTMLElement>();

    useDocumentMeta({
        title: 'Known Limitations — BridgePlay',
        description: 'What BridgePlay cannot do today: kernel-level anti-cheat, DirectX 12 and bleeding-edge AAA, Intel Macs, and the Rosetta 2 timeline — stated plainly, before you buy.',
        canonicalPath: '/limitations',
    });

    return (
        <>
            <div className="bg-glow" aria-hidden="true" />
            {/* Landmark + target for the skip link rendered in main.tsx. */}
            <main id="main-content" tabIndex={-1} className={styles.page} ref={ref}>
                <div className={styles.inner}>
                    <PageHeader
                        eyebrow="Known limitations"
                        title={<>What BridgePlay can&rsquo;t do (yet)</>}
                        reveal
                        lede={<>
                            No compatibility layer on macOS runs everything. These four gaps are structural — the
                            current state of the shipping runtime, not bugs waiting on a patch. Where there is a
                            counter-position it is stated; where there is no fix, we say so.
                        </>}
                    />

                    <div className={styles.stack}>
                        <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 0 }}>
                            <article className={styles.card}>
                                <div className={styles.indexRow}>
                                    <span className={styles.index}>01</span>
                                    <span className={styles.indexRule} aria-hidden="true" />
                                </div>
                                <h2 className={styles.cardTitle}>Kernel-level anti-cheat does not work</h2>
                                <p>
                                    Anti-cheat of this kind works by installing a driver into the Windows
                                    <em> kernel</em> — the most privileged layer of an operating system, sitting
                                    underneath every ordinary app — so that it can watch the whole machine for cheating
                                    tools.
                                </p>
                                <p>
                                    BridgePlay runs your game through Wine 11.0, entirely in user space. Wine is a
                                    compatibility layer: rather than emulating a PC, it re-implements the Windows
                                    functions a game calls and passes the work to macOS, and all of that runs as a
                                    normal unprivileged app, like every other app on your Mac. BridgePlay installs no
                                    kernel extension, no system extension and no driver of any kind — there is no part
                                    of BridgePlay that lives in the kernel. Anti-cheat that expects to load a Windows
                                    kernel driver therefore has nothing to load into.
                                </p>
                                <div className={styles.chipsBlock}>
                                    <span className={styles.chipsLabel}>Assume these do not run</span>
                                    <ul className={styles.chips}>
                                        {ANTI_CHEAT.map(name => (
                                            <li key={name}>{name}</li>
                                        ))}
                                    </ul>
                                </div>
                                <p>
                                    What that looks like on your screen: a game guarded by one of those will refuse to
                                    start, or quit by itself within seconds, or let you as far as the menus and then
                                    fail the moment it tries to put you in a match. Assume titles guarded by any of
                                    them do not run under BridgePlay, and test yours during the trial before you pay us
                                    anything. There is no setting that changes it, and nothing we could ship that
                                    would — a launcher cannot hand a Windows driver a macOS kernel.
                                </p>
                                <p className={styles.counter}>
                                    The counter-position: the multiplayer BridgePlay is actually built around is
                                    private-server clients, and those do run. They are the titles the launcher tunes
                                    per game — its own network handling for clients whose resolver fails under Wine,
                                    and the x87 emulator injected into packed clients that fault under Rosetta 2. If
                                    your multiplayer is a private server, this limitation costs you nothing.
                                </p>
                            </article>
                        </div>

                        <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 1 }}>
                            <article className={styles.card}>
                                <div className={styles.indexRow}>
                                    <span className={styles.index}>02</span>
                                    <span className={styles.indexRule} aria-hidden="true" />
                                </div>
                                <h2 className={styles.cardTitle}>DirectX 12 and bleeding-edge AAA are out of reach</h2>
                                <p className={styles.blunt}>
                                    The honest gap is exactly one tier — bleeding-edge DirectX 12 AAA — and this
                                    runtime does not reach it.
                                </p>
                                <p>
                                    DirectX is the set of interfaces Windows games draw their graphics through, and
                                    macOS has no DirectX at all. BridgePlay ships stock Wine 11.0 built from upstream
                                    source, with Wine&rsquo;s own Direct3D translation and nothing else layered on top:
                                    no DXVK, no VKD3D, no proprietary shim. Wine converts a game&rsquo;s DirectX calls
                                    into OpenGL, and macOS runs that on top of Metal.
                                </p>
                                <p>
                                    That stack covers DirectX 8 through 11, and covers DirectX 12 not at all. Older
                                    titles, indie games and the 2D/3D clients our players actually run are the sweet
                                    spot; a current AAA release with a D3D12-only renderer will not start, and no
                                    amount of per-game settings will change that.
                                </p>
                                <p>
                                    Demanding DirectX 11 titles are a different question — they may run, at lower
                                    settings, or run badly. That is what the trial is for.
                                </p>
                            </article>
                        </div>

                        <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 2 }}>
                            <article className={styles.card}>
                                <div className={styles.indexRow}>
                                    <span className={styles.index}>03</span>
                                    <span className={styles.indexRule} aria-hidden="true" />
                                </div>
                                <h2 className={styles.cardTitle}>Intel Macs are not supported, at all</h2>
                                <p>
                                    Not &ldquo;slower&rdquo; — not supported. The app ships as a single arm64 binary,
                                    so there is no Intel build to install in the first place.
                                </p>
                                <p>
                                    The reason is the whole design: the Windows runtime BridgePlay drives is x86_64 —
                                    Intel code — and Rosetta 2 is what executes it. Rosetta 2 is Apple&rsquo;s own
                                    translation layer for running Intel software on Apple Silicon, and it exists only
                                    on Apple Silicon, so an Intel Mac has neither the app nor the translation layer
                                    underneath it — there is nothing to fall back to. The floor is an M1 or later on
                                    macOS 14 or newer, and that floor is not moving.
                                </p>
                            </article>
                        </div>

                        <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 3 }}>
                            <article className={styles.card}>
                                <div className={styles.indexRow}>
                                    <span className={styles.index}>04</span>
                                    <span className={styles.indexRule} aria-hidden="true" />
                                </div>
                                <h2 className={styles.cardTitle}>Rosetta 2 is on a clock</h2>
                                <p>
                                    Apple has stated that macOS 27 (fall 2026) is the last release with full Rosetta 2,
                                    and that macOS 28 (fall 2027) keeps it only for &ldquo;certain older, unmaintained
                                    games that rely on Intel-based frameworks.&rdquo; BridgePlay&rsquo;s Windows
                                    runtime is x86_64 and runs on Rosetta 2, so Apple&rsquo;s timeline is our timeline:
                                    the shelf life of the runtime as it stands today is set by macOS releases, not by
                                    anything we control.
                                </p>
                                <p>
                                    We are tracking it closely, and we are deliberately not promising you a migration
                                    path we have not shipped. What we will do is say what changed, when it changes:
                                    every release is written up in the{' '}
                                    <Link to="/changelog">changelog</Link>.
                                </p>
                            </article>
                        </div>
                    </div>

                    <div className={`${styles.outro} reveal`}>
                        <p className={styles.outroNote}>
                            This page is not a compatibility list — we do not publish one yet, because a list we
                            cannot keep honest is worse than none. Test your own games during the trial.
                        </p>
                        <div className={styles.outroLinks}>
                            <Link to="/download" className={styles.textLink}>Download BridgePlay</Link>
                            <span className={styles.dot} aria-hidden="true">&middot;</span>
                            <a href="/#faq" className={styles.textLink}>Read the FAQ</a>
                            <span className={styles.dot} aria-hidden="true">&middot;</span>
                            <a href="/#contact" className={styles.textLink}>Ask us directly</a>
                        </div>
                        <Link to="/" className="back-link">&larr; Back to BridgePlay</Link>
                    </div>
                </div>
            </main>
        </>
    );
}
