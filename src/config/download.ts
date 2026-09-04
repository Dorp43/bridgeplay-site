/* Where the app is actually downloaded from.
 *
 * Not `/BridgePlay.dmg`. The real disk image is ~340 MB and GitHub refuses any
 * file over 100 MB, so it can never live in this repo — and because it could
 * not, `scripts/release.sh` in the app repo skipped copying it and left
 * whatever was already in `public/`. The site therefore served BridgePlay
 * 0.5.1 from 25 July 2026 for six weeks: a 9.6 MB image with no notarization
 * ticket, which macOS refuses to open with "Apple could not verify BridgePlay
 * is free of malware". Every release since only updated the changelog around
 * it.
 *
 * GitHub Releases hosts the asset the release pipeline actually notarized and
 * stapled, has no size limit, and `/releases/latest/` always resolves to the
 * newest one — so this cannot go stale the way a committed file did. */
export const DOWNLOAD_URL =
    'https://github.com/Dorp43/BridgePlay/releases/latest/download/BridgePlay.dmg';
