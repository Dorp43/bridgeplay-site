import { useState } from 'react';

/* ============================================================
   usePlatform — the one place the site decides whether the
   visitor's device can run BridgePlay.

   The user agent can only tell us "this is not a Mac", and nothing more:
   Safari and Chrome both report MacIntel on Apple Silicon, so an Intel Mac is
   indistinguishable from an M-series one here. Anything unrecognised is
   'unknown' and MUST be treated as capable — never withhold the installer on
   a guess. Callers gate on `isUnsupported`, which is true only when we
   positively know the app cannot run.
   ============================================================ */

export type Platform =
    /** A Mac. Cannot tell Apple Silicon from Intel — the app itself does that. */
    | 'mac'
    /** A phone or tablet: iOS, iPadOS, Android. No build exists. */
    | 'mobile'
    /** A desktop that is not a Mac: Windows, Linux, ChromeOS. No build exists. */
    | 'other'
    /** Unrecognised. Gets the download, always. */
    | 'unknown';

export interface PlatformInfo {
    platform: Platform;
    isMac: boolean;
    isMobile: boolean;
    isUnknown: boolean;
    /** Positively known to be unable to run BridgePlay — the only gate to use. */
    isUnsupported: boolean;
}

/* Order matters twice over: iPadOS reports platform "MacIntel" with a
   touchscreen, so it has to be caught before the Mac test, and every Android
   user agent contains "Linux", so it has to be caught before the desktop
   test. */
function classify(): Platform {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';

    if (/iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1)) return 'mobile';
    if (/Android/i.test(ua)) return 'mobile';
    if (/Mac/i.test(platform) || /Macintosh|Mac OS X/i.test(ua)) return 'mac';
    if (/Win|Linux|CrOS/i.test(`${platform} ${ua}`)) return 'other';
    return 'unknown';
}

function describe(platform: Platform): PlatformInfo {
    return {
        platform,
        isMac: platform === 'mac',
        isMobile: platform === 'mobile',
        isUnknown: platform === 'unknown',
        isUnsupported: platform === 'mobile' || platform === 'other',
    };
}

/* Resolved at most once per page load and shared, so every consumer agrees and
   the returned object is referentially stable. Nothing is cached when there is
   no navigator (SSR, prerender, tests): the answer there is 'unknown', and the
   real client render must still get to ask. */
let cached: PlatformInfo | null = null;

export function detectPlatform(): PlatformInfo {
    if (typeof navigator === 'undefined') return describe('unknown');
    if (!cached) cached = describe(classify());
    return cached;
}

/* useState with a lazy initialiser, not an effect: the answer is settled
   before first paint, so no button ever swaps under the visitor and no
   element's className is rewritten by a later render. */
export function usePlatform(): PlatformInfo {
    const [info] = useState(detectPlatform);
    return info;
}
