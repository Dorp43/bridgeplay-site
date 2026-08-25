/* ============================================================
   i18n configuration — the one place a language is declared.

   Adding a language means: add a row here, add src/i18n/locales/<code>.ts
   (typed `Dictionary`, so `tsc -b` fails until every key is translated), and
   register its loader in dictionaries.ts. Nothing else in the site changes.
   ============================================================ */

export interface LocaleMeta {
    /** Storage value, <html lang>, and the locales/<code>.ts filename. */
    code: string;
    /** Passed to toLocaleDateString / toLocaleString for dates and numbers. */
    bcp47: string;
    /** The language's name IN that language — what the selector shows. */
    endonym: string;
    /** Two/three-letter chip in the nav trigger. Flags are deliberately not
        used: a language is not a country (es ≠ Spain, pt-BR ≠ Portugal). */
    short: string;
    /** English name, for the trigger's accessible label. */
    english: string;
}

export const LOCALES = [
    { code: 'en', bcp47: 'en-US', endonym: 'English', short: 'EN', english: 'English' },
    { code: 'es', bcp47: 'es-ES', endonym: 'Español', short: 'ES', english: 'Spanish' },
    { code: 'de', bcp47: 'de-DE', endonym: 'Deutsch', short: 'DE', english: 'German' },
    { code: 'fr', bcp47: 'fr-FR', endonym: 'Français', short: 'FR', english: 'French' },
    { code: 'pt-BR', bcp47: 'pt-BR', endonym: 'Português (BR)', short: 'PT', english: 'Portuguese (Brazil)' },
    { code: 'ja', bcp47: 'ja-JP', endonym: '日本語', short: 'JA', english: 'Japanese' },
    { code: 'zh-CN', bcp47: 'zh-CN', endonym: '简体中文', short: 'ZH', english: 'Chinese (Simplified)' },
] as const satisfies readonly LocaleMeta[];

export type LocaleCode = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: LocaleCode = 'en';

export const STORAGE_KEY = 'bridgeplay.locale';

const CODES = LOCALES.map(l => l.code) as readonly LocaleCode[];

export function isLocaleCode(value: unknown): value is LocaleCode {
    return typeof value === 'string' && (CODES as readonly string[]).includes(value);
}

export function localeMeta(code: LocaleCode): LocaleMeta {
    return LOCALES.find(l => l.code === code) ?? LOCALES[0];
}

/* navigator.languages is ordered by preference, so the first entry that maps to
   a language we ship wins. An exact tag match beats a primary-subtag match, but
   only within the same entry: a visitor whose first preference is "pt-PT" gets
   pt-BR (closer than falling through to their second preference), while
   "de-AT" gets de. Unknown languages fall through to English. */
function matchLocale(tag: string): LocaleCode | null {
    const lower = tag.toLowerCase();
    const exact = CODES.find(code => code.toLowerCase() === lower);
    if (exact) return exact;
    const primary = lower.split('-')[0];
    return CODES.find(code => code.toLowerCase().split('-')[0] === primary) ?? null;
}

export function detectLocale(): LocaleCode {
    if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
    const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const tag of tags) {
        if (!tag) continue;
        const match = matchLocale(tag);
        if (match) return match;
    }
    return DEFAULT_LOCALE;
}

/* A stored choice always wins over the browser's preference — it is the
   visitor overruling the guess, and it must survive a reload. */
export function readStoredLocale(): LocaleCode | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return isLocaleCode(stored) ? stored : null;
    } catch {
        /* Safari private mode / storage disabled — fall back to detection. */
        return null;
    }
}

export function writeStoredLocale(code: LocaleCode): void {
    try {
        localStorage.setItem(STORAGE_KEY, code);
    } catch {
        /* Non-fatal: the choice just will not survive this reload. */
    }
}

export function initialLocale(): LocaleCode {
    return readStoredLocale() ?? detectLocale();
}
