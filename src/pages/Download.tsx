import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import SectionHeader from '../components/ui/SectionHeader';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { usePlatform } from '../hooks/usePlatform';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useToast } from '../context/useToast';
import styles from './Download.module.css';

const ROSETTA_COMMAND = 'softwareupdate --install-rosetta --agree-to-license';
const VERIFY_COMMAND = 'shasum -a 256 ~/Downloads/BridgePlay.dmg';
const SIGNATURE_COMMAND = 'codesign -dv --verbose=2 /Applications/BridgePlay.app';

/* Written by scripts/stamp-download.mjs from the real public/BridgePlay.dmg.
   modifiedISO is in that file but deliberately never rendered: git does not
   preserve mtimes, so on a CI checkout it is the build time rather than the day
   the disk image was cut, and showing it would read as a release date. */
interface DownloadMeta {
    sizeBytes: number | null;
    sha256: string | null;
}

function normalizeMeta(data: unknown): DownloadMeta | null {
    if (!data || typeof data !== 'object') return null;
    const raw = data as Record<string, unknown>;
    const size = raw.sizeBytes;
    const hash = raw.sha256;
    return {
        sizeBytes: typeof size === 'number' && Number.isFinite(size) && size > 0 ? size : null,
        sha256: typeof hash === 'string' && /^[a-f0-9]{64}$/i.test(hash) ? hash.toLowerCase() : null,
    };
}

/* Decimal MB, the unit Finder shows, plus the exact byte count so the number is
   checkable against the file on disk. */
function formatSize(bytes: number): string {
    return `${(bytes / 1e6).toFixed(1)} MB (${bytes.toLocaleString('en-US')} bytes)`;
}

/* Reserves the exact box the real value will occupy, so nothing moves when the
   fetch lands: same font, same character count, painted as a skeleton bar with
   a single sweep across it. */
function Reserved({ chars }: { chars: number }) {
    return <span className={styles.pending} aria-hidden="true">{'0'.repeat(chars)}</span>;
}

/* The fetch resolved but the value is not there. Designed as a state rather
   than left as bare text, and paired with .notice below the list so the reader
   is told what it means for them. */
function Absent() {
    return <span className={styles.absent}>Unavailable</span>;
}

function CopyButton({ value, label }: { value: string; label: string }) {
    const { showToast } = useToast();

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            showToast('Copied to clipboard', 'success');
        } catch {
            showToast('Copy failed — select the text and copy it manually', 'error');
        }
    };

    return (
        <button type="button" className={styles.copy} onClick={copy} aria-label={`Copy ${label}`}>
            Copy
        </button>
    );
}

function CommandBlock({ command, label }: { command: string; label: string }) {
    return (
        <div className={styles.command}>
            <code>{command}</code>
            <CopyButton value={command} label={label} />
        </div>
    );
}

export default function Download() {
    const [meta, setMeta] = useState<DownloadMeta | null>(null);
    const [loading, setLoading] = useState(true);
    /* Resolved once, before first paint, so the button never swaps under the
       visitor and no reveal class is ever rewritten by a re-render. */
    const { isUnsupported } = usePlatform();
    const ref = useScrollReveal<HTMLElement>();

    useDocumentMeta({
        title: 'Download BridgePlay for macOS — Apple Silicon',
        description: 'Download the BridgePlay disk image for Apple Silicon Macs, with the size and SHA-256 of the exact file being served, the system requirements, and the Rosetta 2 and first-launch steps.',
        canonicalPath: '/download',
    });

    useEffect(() => {
        let cancelled = false;

        fetch('/download-meta.json')
            .then(res => (res.ok ? res.json() : Promise.reject(new Error('missing'))))
            .then((data: unknown) => {
                if (cancelled) return;
                setMeta(normalizeMeta(data));
                setLoading(false);
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    const detailsMissing = !loading && meta?.sha256 == null && meta?.sizeBytes == null;

    return (
        <>
            <div className="bg-glow" aria-hidden="true" />
            {/* Landmark + target for the skip link rendered in main.tsx. */}
            <main id="main-content" tabIndex={-1} className={styles.page} ref={ref}>
                <section className={styles.top}>
                    <div className={styles.inner}>
                        <PageHeader
                            eyebrow="Download"
                            title="BridgePlay for macOS"
                            reveal
                            lede="One disk image. Drag BridgePlay into Applications, launch it, and point it at Windows game files you already have."
                        />

                        <div className={`${styles.ctaBlock} reveal`}>
                            {isUnsupported ? (
                                <>
                                    <p className={`${styles.unsupported} notice-card`}>
                                        BridgePlay is a macOS app for Apple Silicon Macs. There is no Windows, Linux,
                                        iOS or Android build, so there is nothing here to install on this device — open
                                        this page again on an M-series Mac running macOS 14 or newer.
                                    </p>
                                    <a href="/BridgePlay.dmg" download className={styles.plainLink}>
                                        Download the disk image anyway
                                    </a>
                                </>
                            ) : (
                                <>
                                    <a href="/BridgePlay.dmg" download className={styles.primary}>
                                        <Icon name="download" size={20} />
                                        Download for macOS
                                    </a>
                                    <ul className={styles.ctaFacts}>
                                        <li>Apple Silicon</li>
                                        <li>macOS 14 or newer</li>
                                        <li>7-day free trial</li>
                                    </ul>
                                </>
                            )}
                        </div>

                        <div className={`${styles.cardWrap} reveal`}>
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>The file you are getting</h2>
                                <p className={styles.cardNote}>
                                    Both values are computed at build time from the exact disk image this page serves.
                                </p>
                                <dl className={styles.facts} aria-busy={loading}>
                                    <div className={styles.fact}>
                                        <dt>Size</dt>
                                        <dd>
                                            {meta?.sizeBytes != null
                                                ? formatSize(meta.sizeBytes)
                                                : loading ? <Reserved chars={26} /> : <Absent />}
                                        </dd>
                                    </div>
                                    <div className={styles.fact}>
                                        <dt>SHA-256</dt>
                                        <dd className={styles.hashCell}>
                                            {meta?.sha256 ? (
                                                <span className={styles.hashRow}>
                                                    <code className={styles.hash}>{meta.sha256}</code>
                                                    <CopyButton value={meta.sha256} label="the SHA-256 checksum" />
                                                </span>
                                            ) : loading ? <Reserved chars={64} /> : <Absent />}
                                        </dd>
                                    </div>
                                </dl>

                                {detailsMissing && (
                                    <p className={styles.notice}>
                                        The size and checksum could not be loaded just now, so there is nothing to
                                        compare your copy against on this visit. The download link above still serves
                                        the current disk image, and reloading this page usually brings the values back.
                                    </p>
                                )}

                                {/* The hash is listed for anyone who wants it, without a tutorial:
                                    it is served from the same page as the file, so it only catches a
                                    damaged download — the signature check below is what establishes
                                    who built the app. */}
                                <p className={styles.cardFine}>
                                    To check a download landed intact, run{' '}
                                    <code className={styles.inlineCode}>{VERIFY_COMMAND}</code>{' '}
                                    and compare it with the SHA-256 above.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.band} data-band-seam>
                    <div className={styles.inner}>
                        <SectionHeader
                            label="Before you install"
                            title="What your Mac needs"
                            description="Hard requirements, the one command Rosetta 2 needs, and what to do about the first-launch warning. If your Mac misses a requirement, BridgePlay will not run — better to find out here than after the download."
                        />

                        <div className={styles.stack}>
                            <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 0 }}>
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>Requirements</h3>
                                    <ul className={styles.reqs}>
                                        <li>
                                            <strong>An Apple Silicon Mac</strong>
                                            <span>
                                                M1 or later — every Mac Apple has shipped since late 2020 has one. The
                                                Apple menu &rarr; About This Mac names your chip and your macOS version
                                                in one place. The app ships as a single arm64 binary, and Intel Macs
                                                are not supported —
                                                {' '}<Link to="/limitations">the detail is on the limitations page</Link>.
                                            </span>
                                        </li>
                                        <li>
                                            <strong>macOS 14 (Sonoma) or newer</strong>
                                            <span>The app declares macOS 14.0 as its minimum system version; older macOS releases will refuse to open it.</span>
                                        </li>
                                        <li>
                                            <strong>Rosetta 2</strong>
                                            <span>
                                                Rosetta 2 is Apple&rsquo;s own translation layer: it lets software built
                                                for Intel processors run on an Apple Silicon Mac. The Windows runtime
                                                BridgePlay drives is Intel (x86_64) code, so Rosetta 2 is the piece that
                                                actually executes it. Without it the launcher reports
                                                &ldquo;Rosetta required&rdquo; and will not start a game. It is free,
                                                and one command installs it.
                                            </span>
                                        </li>
                                        <li>
                                            <strong>Free disk space</strong>
                                            <span>
                                                BridgePlay keeps its Wine runtime under
                                                {' '}<code className={`${styles.inlineCode} ${styles.inlinePath}`}>~/Library/Application Support/BridgePlay</code>{' '}
                                                and gives every game its own Windows prefix in there — a self-contained
                                                folder that looks like an entire Windows C: drive to that one game — on
                                                top of the game files themselves. Leave headroom on the volume.
                                            </span>
                                        </li>
                                        <li>
                                            <strong>Your own game files</strong>
                                            <span>BridgePlay is a launcher, not a game store. Bring the Windows installer or client folder you already have.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 1 }}>
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>Install Rosetta 2</h3>
                                    <p className={styles.cardNote}>
                                        Run this once in Terminal (Command-Space, type Terminal, Return), then launch
                                        BridgePlay. It is Apple&rsquo;s own installer command: it asks macOS to fetch
                                        Rosetta 2 from Apple, and macOS may ask you to confirm. Rosetta 2 is free and
                                        installs once per Mac.
                                    </p>
                                    <CommandBlock command={ROSETTA_COMMAND} label="the Rosetta 2 install command" />
                                    <p className={styles.cardFine}>
                                        If Rosetta 2 is already on this Mac, running the command again does no harm.
                                    </p>
                                </div>
                            </div>

                            <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 2 }}>
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>If macOS says the app cannot be opened</h3>
                                    <p className={styles.cardNote}>
                                        <strong>What is happening.</strong> Gatekeeper is the part of macOS that vets an
                                        app the first time you open it. One of the things it looks for is a notarization
                                        ticket — notarization being Apple&rsquo;s automated malware scan, which a
                                        developer submits a build to before shipping it.
                                    </p>
                                    <p className={styles.cardNote}>
                                        Current state, stated plainly: the app inside the disk image is signed with an
                                        Apple Developer ID certificate, which is what proves it came from us and has not
                                        been modified since we signed it — but this release is
                                        {' '}<strong>not notarized</strong>. There is no ticket for Gatekeeper to find,
                                        so it treats the build as unverified and the first launch needs your explicit
                                        approval. Nothing about the app changes when you give it.
                                    </p>
                                    <ol className={styles.steps}>
                                        <li>Open the disk image and drag <strong>BridgePlay</strong> into your Applications folder.</li>
                                        <li>In Applications, <strong>Control-click (right-click) BridgePlay and choose Open</strong>, then confirm <strong>Open</strong> in the dialog that appears. Double-clicking is what triggers the refusal; this path asks instead.</li>
                                        <li>If there is no Open option, try to launch it once so macOS records the block, then open <strong>System Settings &rarr; Privacy &amp; Security</strong>, scroll to the Security section, and choose <strong>Open Anyway</strong>.</li>
                                    </ol>
                                    <div className={styles.rule} />
                                    <p className={styles.cardNote}>
                                        You do not have to take the signature on trust. This prints it, and the authority
                                        line should name a <em>Developer ID Application</em> certificate.
                                    </p>
                                    <CommandBlock command={SIGNATURE_COMMAND} label="the signature check command" />
                                    <p className={styles.cardFine}>
                                        If that line is missing, or names something other than us, do not open the app —
                                        {' '}<a href="/#contact">tell us</a> instead.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.tail}>
                    <div className={styles.inner}>
                        <div className={`${styles.outro} reveal`}>
                            <p>
                                Before you spend the trial on it, read what BridgePlay
                                {' '}<Link to="/limitations">still cannot do</Link>. Anything the
                                {' '}<a href="/#faq">FAQ</a> does not answer goes to the
                                {' '}<a href="/#contact">contact form</a>.
                            </p>
                            <Link to="/" className={styles.plainLink}>&larr; Back to BridgePlay</Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
