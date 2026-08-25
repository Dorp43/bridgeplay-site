import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { initialLocale, localeMeta, writeStoredLocale, type LocaleCode } from './config';
import { cachedDictionary, en, loadDictionary } from './dictionaries';
import { I18nContext, type I18nState } from './useI18n';

/**
 * Owns the active language.
 *
 * The locale is resolved synchronously (stored choice, else navigator) so the
 * first render already knows which language it is in. Its dictionary may not
 * have arrived yet — every locale but English is a lazy chunk — so `ready` is
 * false until it does, and main.tsx's BootGate holds the splash on that flag.
 * Nobody sees English flash into Japanese.
 *
 * Switching language later keeps the OUTGOING dictionary on screen while the
 * new chunk loads, rather than falling back to English for a frame. A language
 * already visited this session is in the cache and swaps synchronously.
 */
export default function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);
    /* Seeded from the cache so an already-loaded language never re-flashes.
       `locale` is already initialised by the line above, so these read the
       resolved value rather than calling initialLocale() a second time. */
    const [dict, setDict] = useState(() => cachedDictionary(locale) ?? en);
    const [ready, setReady] = useState(() => cachedDictionary(locale) !== undefined);

    /* Guards against a fast double-switch (en → ja → de) resolving out of
       order and leaving the page in the language you passed through. Only the
       most recent request is allowed to publish. */
    const requestRef = useRef(0);

    /* Mount only. A stored or detected non-English locale needs its chunk
       before anything can render in it; later switches are handled inside
       setLocale, which is an event handler and can update state directly
       instead of bouncing through an effect. */
    useEffect(() => {
        if (cachedDictionary(locale)) return;
        const token = ++requestRef.current;
        loadDictionary(locale).then(loaded => {
            if (requestRef.current !== token) return;
            setDict(loaded);
            setReady(true);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- first paint only
    }, []);

    /* <html lang> drives screen-reader pronunciation, browser translation
        prompts and CSS :lang() — it has to follow the choice, not sit at "en"
        forever. Written only once the matching dictionary is on screen, so the
        attribute never disagrees with the words under it. */
    useEffect(() => {
        if (ready) document.documentElement.lang = locale;
    }, [locale, ready]);

    const setLocale = useCallback((code: LocaleCode) => {
        writeStoredLocale(code);
        setLocaleState(code);

        const token = ++requestRef.current;
        const cached = cachedDictionary(code);
        if (cached) {
            /* Already loaded this session — swap in the same tick so the page
               never flickers back through English. */
            setDict(cached);
            setReady(true);
            return;
        }
        setReady(false);
        loadDictionary(code).then(loaded => {
            if (requestRef.current !== token) return;
            setDict(loaded);
            setReady(true);
        });
    }, []);

    const value = useMemo<I18nState>(() => ({
        locale,
        t: dict,
        bcp47: localeMeta(locale).bcp47,
        ready,
        setLocale,
    }), [locale, dict, ready, setLocale]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
