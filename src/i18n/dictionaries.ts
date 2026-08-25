import type { LocaleCode } from './config';
import type { Dictionary } from './types';
import en from './locales/en';

/* English is imported statically — it is the fallback, and the site must be
   able to render text on the very first frame without waiting on a chunk.
   Every other language is a dynamic import, so a visitor reading the site in
   English never downloads the other six dictionaries. Vite gives each its own
   chunk automatically. */
const LOADERS: Record<Exclude<LocaleCode, 'en'>, () => Promise<{ default: Dictionary }>> = {
    es: () => import('./locales/es'),
    de: () => import('./locales/de'),
    fr: () => import('./locales/fr'),
    'pt-BR': () => import('./locales/pt-BR'),
    ja: () => import('./locales/ja'),
    'zh-CN': () => import('./locales/zh-CN'),
};

/* Resolved dictionaries, kept for the life of the page: switching back to a
   language you have already viewed is then synchronous, with no flash. */
const cache = new Map<LocaleCode, Dictionary>([['en', en]]);

export function cachedDictionary(code: LocaleCode): Dictionary | undefined {
    return cache.get(code);
}

export async function loadDictionary(code: LocaleCode): Promise<Dictionary> {
    const hit = cache.get(code);
    if (hit) return hit;
    try {
        const mod = await LOADERS[code as Exclude<LocaleCode, 'en'>]();
        cache.set(code, mod.default);
        return mod.default;
    } catch {
        /* A failed chunk fetch (offline, a bad deploy) must not blank the site.
           English is already in memory, so fall back to it rather than throw
           into a provider that has no error boundary above it. */
        return en;
    }
}

export { en };
