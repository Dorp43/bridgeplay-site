import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { localeFromPath, localeMeta, localizedHref, writeStoredLocale, type LocaleCode } from './config';
import { cachedDictionary, en, loadDictionary } from './dictionaries';
import { I18nContext, type I18nState } from './useI18n';

/**
 * Owns the active language, which the URL determines: English at the root,
 * every other language under /<code>/.
 *
 * The locale is therefore known synchronously on the first render. Its
 * dictionary may not have arrived — every locale but English is a lazy chunk —
 * so `ready` stays false until it does, and main.tsx's BootGate holds the
 * splash on that flag. Nobody sees English flash into Japanese.
 *
 * Switching language navigates rather than swapping state; see setLocale.
 */
export default function I18nProvider({ children }: { children: ReactNode }) {
    /* The URL decides the language — not localStorage, not the browser. That
       makes /ja/download a real, shareable, indexable address rather than a
       page whose language depends on who is looking at it. main.tsx has
       already applied any stored preference by redirecting before React
       mounted, so by here the URL is authoritative. */
    const [locale] = useState<LocaleCode>(() => localeFromPath(window.location.pathname));
    /* Seeded from the cache so an already-loaded language never re-flashes. */
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
        if (!ready) return;
        document.documentElement.lang = locale;
        /* og:locale too, or a share of a page being read in Japanese still
           announces itself as en_US to every social crawler. Underscore form,
           which is what the Open Graph spec wants. */
        let tag = document.head.querySelector('meta[property="og:locale"]');
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('property', 'og:locale');
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', localeMeta(locale).bcp47.replace('-', '_'));
    }, [locale, ready]);

    /* Changing language changes the URL, so it is a real navigation rather
       than a state swap. The router's basename is fixed for the life of the
       document, which makes a full load the honest way to move between
       language roots — and it guarantees canonical, hreflang and og:locale all
       agree with the address bar afterwards. The dictionary chunk is already
       in the HTTP cache by then, and BootGate covers the handoff. */
    const setLocale = useCallback((code: LocaleCode) => {
        if (code === locale) return;
        writeStoredLocale(code);
        window.location.assign(
            localizedHref(code, window.location.pathname, window.location.search, window.location.hash)
        );
    }, [locale]);

    const value = useMemo<I18nState>(() => ({
        locale,
        t: dict,
        bcp47: localeMeta(locale).bcp47,
        ready,
        setLocale,
    }), [locale, dict, ready, setLocale]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
