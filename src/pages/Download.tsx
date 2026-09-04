import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import SectionHeader from '../components/ui/SectionHeader';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { usePlatform } from '../hooks/usePlatform';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useToast } from '../context/useToast';
import { useI18n } from '../i18n/useI18n';
import styles from './Download.module.css';
import { DOWNLOAD_URL } from '../config/download';

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
function formatSize(bytes: number, bcp47: string, format: (mb: string, bytes: string) => string): string {
    return format((bytes / 1e6).toFixed(1), bytes.toLocaleString(bcp47));
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
    const { t } = useI18n();
    return <span className={styles.absent}>{t.common.unavailable}</span>;
}

function CopyButton({ value, label }: { value: string; label: string }) {
    const { showToast } = useToast();
    const { t } = useI18n();

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            showToast(t.downloadPage.copiedToast, 'success');
        } catch {
            showToast(t.downloadPage.copyFailedToast, 'error');
        }
    };

    return (
        <button type="button" className={styles.copy} onClick={copy} aria-label={t.common.copyAria(label)}>
            {t.common.copy}
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
    const { t, bcp47 } = useI18n();

    useDocumentMeta({
        title: t.meta.download.title,
        description: t.meta.download.description,
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
                            eyebrow={t.downloadPage.eyebrow}
                            title={t.downloadPage.title}
                            reveal
                            lede={t.downloadPage.lede}
                        />

                        <div className={`${styles.ctaBlock} reveal`}>
                            {isUnsupported ? (
                                <>
                                    <p className={`${styles.unsupported} notice-card`}>
                                        {t.downloadPage.unsupportedNote}
                                    </p>
                                    <a href={DOWNLOAD_URL} download className={styles.plainLink}>
                                        {t.downloadPage.downloadAnyway}
                                    </a>
                                </>
                            ) : (
                                <>
                                    <a href={DOWNLOAD_URL} download className={styles.primary}>
                                        <Icon name="download" size={20} />
                                        {t.downloadPage.downloadForMac}
                                    </a>
                                    <ul className={styles.ctaFacts}>
                                        <li>{t.downloadPage.factSilicon}</li>
                                        <li>{t.downloadPage.factOs}</li>
                                        <li>{t.downloadPage.factTrial}</li>
                                    </ul>
                                </>
                            )}
                        </div>

                        <div className={`${styles.cardWrap} reveal`}>
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>{t.downloadPage.fileCardTitle}</h2>
                                <p className={styles.cardNote}>{t.downloadPage.fileCardNote}</p>
                                <dl className={styles.facts} aria-busy={loading}>
                                    <div className={styles.fact}>
                                        <dt>{t.downloadPage.size}</dt>
                                        <dd>
                                            {meta?.sizeBytes != null
                                                ? formatSize(meta.sizeBytes, bcp47, t.downloadPage.sizeFormat)
                                                : loading ? <Reserved chars={26} /> : <Absent />}
                                        </dd>
                                    </div>
                                    <div className={styles.fact}>
                                        <dt>{t.downloadPage.sha256}</dt>
                                        <dd className={styles.hashCell}>
                                            {meta?.sha256 ? (
                                                <span className={styles.hashRow}>
                                                    <code className={styles.hash}>{meta.sha256}</code>
                                                    <CopyButton value={meta.sha256} label={t.downloadPage.copyLabelChecksum} />
                                                </span>
                                            ) : loading ? <Reserved chars={64} /> : <Absent />}
                                        </dd>
                                    </div>
                                </dl>

                                {detailsMissing && (
                                    <p className={styles.notice}>
                                        {t.downloadPage.detailsMissing}
                                    </p>
                                )}

                                {/* The hash is listed for anyone who wants it, without a tutorial:
                                    it is served from the same page as the file, so it only catches a
                                    damaged download — the signature check below is what establishes
                                    who built the app. */}
                                <p className={styles.cardFine}>
                                    {t.downloadPage.verifyFineBefore}{' '}
                                    <code className={styles.inlineCode}>{VERIFY_COMMAND}</code>{' '}
                                    {t.downloadPage.verifyFineAfter}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.band} data-band-seam>
                    <div className={styles.inner}>
                        <SectionHeader
                            label={t.downloadPage.bandLabel}
                            title={t.downloadPage.bandTitle}
                            description={t.downloadPage.bandDescription}
                        />

                        <div className={styles.stack}>
                            <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 0 }}>
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>{t.downloadPage.requirementsTitle}</h3>
                                    <ul className={styles.reqs}>
                                        <li>
                                            <strong>{t.downloadPage.reqSiliconTerm}</strong>
                                            <span>
                                                {t.downloadPage.reqSiliconBefore}
                                                {' '}<Link to="/limitations">{t.downloadPage.reqSiliconLink}</Link>.
                                            </span>
                                        </li>
                                        <li>
                                            <strong>{t.downloadPage.reqOsTerm}</strong>
                                            <span>{t.downloadPage.reqOsDesc}</span>
                                        </li>
                                        <li>
                                            <strong>{t.downloadPage.reqRosettaTerm}</strong>
                                            <span>{t.downloadPage.reqRosettaDesc}</span>
                                        </li>
                                        <li>
                                            <strong>{t.downloadPage.reqDiskTerm}</strong>
                                            <span>
                                                {t.downloadPage.reqDiskBefore}
                                                {' '}<code className={`${styles.inlineCode} ${styles.inlinePath}`}>~/Library/Application Support/BridgePlay</code>{' '}
                                                {t.downloadPage.reqDiskAfter}
                                            </span>
                                        </li>
                                        <li>
                                            <strong>{t.downloadPage.reqGamesTerm}</strong>
                                            <span>{t.downloadPage.reqGamesDesc}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 1 }}>
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>{t.downloadPage.rosettaCardTitle}</h3>
                                    <p className={styles.cardNote}>{t.downloadPage.rosettaCardNote}</p>
                                    <CommandBlock command={ROSETTA_COMMAND} label={t.downloadPage.copyLabelRosetta} />
                                    <p className={styles.cardFine}>{t.downloadPage.rosettaCardFine}</p>
                                </div>
                            </div>

                            <div className={`${styles.cardWrap} reveal`} style={{ ['--i' as string]: 2 }}>
                                <div className={styles.card}>
                                    <h3 className={styles.cardTitle}>{t.downloadPage.gatekeeperTitle}</h3>
                                    <p className={styles.cardNote}>
                                        <strong>{t.downloadPage.gatekeeperWhatLabel}</strong>{' '}
                                        {t.downloadPage.gatekeeperWhatBody}
                                    </p>
                                    <ol className={styles.steps}>
                                        <li>{t.downloadPage.gatekeeperStep1}</li>
                                        <li>{t.downloadPage.gatekeeperStep2}</li>
                                        <li>{t.downloadPage.gatekeeperStep3}</li>
                                    </ol>
                                    <div className={styles.rule} />
                                    <p className={styles.cardNote}>{t.downloadPage.signatureNote}</p>
                                    <CommandBlock command={SIGNATURE_COMMAND} label={t.downloadPage.copyLabelSignature} />
                                    <p className={styles.cardFine}>
                                        {t.downloadPage.signatureFineBefore}
                                        {' '}<Link to="/#contact">{t.downloadPage.signatureFineLink}</Link> {t.downloadPage.signatureFineAfter}
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
                                {t.downloadPage.outroBefore}
                                {' '}<Link to="/limitations">{t.downloadPage.outroLimitations}</Link>{t.downloadPage.outroMiddle}
                                {' '}<Link to="/#faq">{t.downloadPage.outroFaq}</Link> {t.downloadPage.outroDoesNotAnswer}
                                {' '}<Link to="/#contact">{t.downloadPage.outroContact}</Link>.
                            </p>
                            <Link to="/" className={styles.plainLink}>{t.common.backToBridgePlay}</Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
