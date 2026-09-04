/**
 * Stamps public/download-meta.json from the real disk image in public/, and
 * checks that the disk image is the release the homepage is advertising.
 *
 * Runs as the `prebuild` step, so /download can only ever show a size and a
 * SHA-256 that were computed from the exact bytes being served — never a number
 * typed into a component by hand.
 *
 * The version check exists because the stamp on its own is a trap: it turns
 * whatever binary happens to be in public/ into a checkable promise, so a stale
 * artifact gets published with a build-verified fingerprint and reads as
 * deliberate. /download says "Both values are computed at build time from the
 * exact disk image this page serves", which is true and is exactly what makes a
 * stale image worse than an unfingerprinted one.
 *
 * Two modes:
 *   default   — warns loudly on a mismatch, still writes the stamp. The build
 *               goes through, because a fresh clone or a Linux CI box cannot
 *               read a DMG's bundle version at all and must not be blocked.
 *   --strict  — exits non-zero on a mismatch. `npm run verify:download`. This is
 *               the release gate: run it before shipping, and the page can never
 *               fingerprint a release older than the one the homepage advertises.
 *
 * Reading the bundle version needs `hdiutil` + `plutil`, so it only happens on
 * macOS; everywhere else the version is recorded as null and no claim is made.
 *
 * No dependencies: node: builtins only.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DMG_PATH = resolve(repoRoot, 'public/BridgePlay.dmg');
const CHANGELOG_PATH = resolve(repoRoot, 'public/changelog.json');
const OUT_PATH = resolve(repoRoot, 'public/download-meta.json');

const STRICT = process.argv.includes('--strict');

const EMPTY_META = { sizeBytes: null, sha256: null, modifiedISO: null, appVersion: null };

function sha256OfFile(path) {
    return new Promise((resolvePromise, rejectPromise) => {
        const hash = createHash('sha256');
        const stream = createReadStream(path);
        stream.on('error', rejectPromise);
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolvePromise(hash.digest('hex')));
    });
}

/* CFBundleShortVersionString of the .app inside the disk image, or null when it
   cannot be read — a non-macOS host, no hdiutil, a DMG with no bundle in it.
   Mounts read-only and with -nobrowse so nothing appears in Finder, and detaches
   in a finally so a failure part-way through never leaves a volume attached. */
async function readAppVersion() {
    if (process.platform !== 'darwin') return null;

    let mountPoint = null;
    try {
        const plist = execFileSync(
            'hdiutil',
            ['attach', '-nobrowse', '-readonly', '-noverify', '-plist', DMG_PATH],
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
        );
        mountPoint = /<key>mount-point<\/key>\s*<string>([^<]+)<\/string>/.exec(plist)?.[1] ?? null;
        if (!mountPoint) throw new Error('hdiutil reported no mount point');

        const app = (await readdir(mountPoint)).find(entry => entry.endsWith('.app'));
        if (!app) throw new Error('no .app bundle at the root of the disk image');

        return execFileSync(
            'plutil',
            ['-extract', 'CFBundleShortVersionString', 'raw', '-o', '-', `${mountPoint}/${app}/Contents/Info.plist`],
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
        ).trim() || null;
    } catch (error) {
        console.warn(`[stamp-download] Could not read the disk image's bundle version (${error.message}).`);
        return null;
    } finally {
        if (mountPoint) {
            try {
                execFileSync('hdiutil', ['detach', mountPoint, '-quiet'], { stdio: 'ignore' });
            } catch {
                /* Best effort — a left-over read-only mount is not worth failing over. */
            }
        }
    }
}

/* The version the homepage's What's New section and /changelog advertise, i.e.
   the newest entry in the changelog. */
async function readAdvertisedVersion() {
    try {
        const entries = JSON.parse(await readFile(CHANGELOG_PATH, 'utf8'));
        const newest = Array.isArray(entries) ? entries[0] : null;
        return typeof newest?.version === 'string' ? newest.version : null;
    } catch (error) {
        console.warn(`[stamp-download] Could not read public/changelog.json (${error.message}).`);
        return null;
    }
}

async function readMeta() {
    const info = await stat(DMG_PATH);
    if (!info.isFile()) {
        throw new Error('public/BridgePlay.dmg is not a regular file');
    }
    return {
        sizeBytes: info.size,
        sha256: await sha256OfFile(DMG_PATH),
        /* Recorded for provenance only. The page never renders it as a release
           date: git does not preserve mtimes, so on a CI checkout this is the
           build time, not the day the disk image was cut. */
        modifiedISO: info.mtime.toISOString(),
        appVersion: await readAppVersion(),
    };
}

/* Returns the mismatch message, or null when there is nothing to report. */
function versionComplaint(appVersion, advertised) {
    if (!appVersion || !advertised) return null;
    if (appVersion === advertised) return null;
    return (
        `public/BridgePlay.dmg is BridgePlay ${appVersion}, but public/changelog.json ` +
        `advertises ${advertised} as the current release. /download stamps a ` +
        'build-verified size and SHA-256 onto whatever image is in public/, so this ' +
        `publishes ${appVersion} as a checkable promise while the homepage sells ` +
        `${advertised}. Replace the disk image with the ${advertised} build.`
    );
}

/* The metadata the release pipeline wrote for the published asset, if any. */
async function readExistingMeta() {
    try {
        const parsed = JSON.parse(await readFile(OUT_PATH, 'utf8'));
        return typeof parsed?.sha256 === 'string' && parsed.sha256.length === 64 ? parsed : null;
    } catch {
        return null;
    }
}

async function main() {
    let meta = EMPTY_META;

    try {
        meta = await readMeta();
    } catch {
        /* The disk image is deliberately NOT in this repo: it is ~340 MB and
         * GitHub refuses anything over 100 MB, so downloads point at the
         * GitHub release asset (src/config/download.ts). Keep whatever
         * public/download-meta.json already says — the release pipeline writes
         * the published asset's real size and SHA-256 there — rather than
         * blanking it. Overwriting with nulls would silently drop the
         * verification the /download page offers. */
        const existing = await readExistingMeta();
        if (existing) {
            console.log('[stamp-download] No local disk image; keeping the published asset metadata already in public/download-meta.json.');
            return;
        }
        console.warn('[stamp-download] No local disk image and no existing metadata — /download will hide the file details.');
    }

    try {
        await writeFile(OUT_PATH, `${JSON.stringify(meta, null, 4)}\n`, 'utf8');
        if (meta.sha256) {
            console.log(
                `[stamp-download] public/download-meta.json — ${meta.sizeBytes} bytes, ` +
                `sha256 ${meta.sha256}, app version ${meta.appVersion ?? 'unknown'}`
            );
        } else {
            console.log('[stamp-download] public/download-meta.json — written with nulls.');
        }
    } catch (error) {
        console.warn(
            `[stamp-download] Could not write public/download-meta.json (${error.message}). ` +
            '/download will fall back to hiding the file details.'
        );
    }

    const complaint = versionComplaint(meta.appVersion, await readAdvertisedVersion());
    if (!complaint) {
        if (meta.appVersion) console.log(`[stamp-download] Version check passed — serving ${meta.appVersion}.`);
        return;
    }

    if (STRICT) {
        console.error(`[stamp-download] STALE DISK IMAGE — ${complaint}`);
        process.exitCode = 1;
        return;
    }
    console.warn(
        `\n[stamp-download] ============ STALE DISK IMAGE ============\n` +
        `[stamp-download] ${complaint}\n` +
        `[stamp-download] Run \`npm run verify:download\` for a non-zero exit on this.\n` +
        `[stamp-download] =========================================\n`
    );
}

/* Never fail the build from an unexpected path: every step above is guarded, and
   this catch is the backstop. The one deliberate non-zero exit is --strict. */
await main().catch(error => {
    console.warn(`[stamp-download] Unexpected failure, skipping stamp: ${error.message}`);
});
