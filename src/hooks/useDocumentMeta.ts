import { useEffect } from 'react';
import { DEFAULT_LOCALE, LOCALES, SITE_ORIGIN, localePrefix } from '../i18n/config';
import { useI18n } from '../i18n/useI18n';

/* Marks head tags this hook created, so restore can remove them again. */
const CREATED_FLAG = 'data-managed-meta';

interface DocumentMeta {
    title: string;
    description: string;
    canonicalPath?: string;
}

interface HeadTag {
    selector: string;
    attribute: 'content' | 'href';
    create: () => Element;
}

function createMeta(key: 'name' | 'property', value: string): Element {
    const el = document.createElement('meta');
    el.setAttribute(key, value);
    return el;
}

function createCanonical(): Element {
    const el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    return el;
}

const HEAD_TAGS = {
    description: {
        selector: 'meta[name="description"]',
        attribute: 'content',
        create: () => createMeta('name', 'description'),
    },
    canonical: {
        selector: 'link[rel="canonical"]',
        attribute: 'href',
        create: createCanonical,
    },
    ogTitle: {
        selector: 'meta[property="og:title"]',
        attribute: 'content',
        create: () => createMeta('property', 'og:title'),
    },
    ogDescription: {
        selector: 'meta[property="og:description"]',
        attribute: 'content',
        create: () => createMeta('property', 'og:description'),
    },
    twitterTitle: {
        selector: 'meta[name="twitter:title"]',
        attribute: 'content',
        create: () => createMeta('name', 'twitter:title'),
    },
    twitterDescription: {
        selector: 'meta[name="twitter:description"]',
        attribute: 'content',
        create: () => createMeta('name', 'twitter:description'),
    },
} satisfies Record<string, HeadTag>;

type HeadTagKey = keyof typeof HEAD_TAGS;

const HEAD_TAG_KEYS = Object.keys(HEAD_TAGS) as HeadTagKey[];

function readTag(tag: HeadTag): string | null {
    const el = document.head.querySelector(tag.selector);
    return el ? el.getAttribute(tag.attribute) : null;
}

/* Snapshot of what index.html shipped, captured once when this module loads. */
const hasDocument = typeof document !== 'undefined';
const ORIGINAL_TITLE = hasDocument ? document.title : '';
const ORIGINAL_TAGS: Record<HeadTagKey, string | null> = HEAD_TAG_KEYS.reduce((acc, key) => {
    acc[key] = hasDocument ? readTag(HEAD_TAGS[key]) : null;
    return acc;
}, {} as Record<HeadTagKey, string | null>);

function writeTag(tag: HeadTag, value: string) {
    let el = document.head.querySelector(tag.selector);
    if (!el) {
        el = tag.create();
        el.setAttribute(CREATED_FLAG, '');
        document.head.appendChild(el);
    }
    el.setAttribute(tag.attribute, value);
}

function restoreTag(tag: HeadTag, original: string | null) {
    const el = document.head.querySelector(tag.selector);
    if (!el) return;
    if (original === null) {
        /* Nothing to restore: drop it only if we were the ones who added it. */
        if (el.hasAttribute(CREATED_FLAG)) el.remove();
        return;
    }
    el.setAttribute(tag.attribute, original);
}

function normalisePath(canonicalPath?: string): string {
    if (!canonicalPath || canonicalPath === '/') return '';
    const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

/* Callers pass a bare, language-free path ('/download') because that is what
   useLocation reports under the router basename. The language belongs to the
   canonical URL, so it is added here — once — rather than at 11 call sites. */
function absoluteCanonical(canonicalPath: string | undefined, prefix: string): string {
    return SITE_ORIGIN + localeHref(prefix, normalisePath(canonicalPath));
}

/* One place decides trailing slashes, because canonical, hreflang, the static
   block in index.html and sitemap.xml must agree CHARACTER FOR CHARACTER — a
   canonical that disagrees with its own hreflang entry is worse than shipping
   neither. The convention: a language home ends in '/', every deeper page does
   not. */
function localeHref(prefix: string, path: string): string {
    return path ? `${prefix}${path}` : `${prefix}/`;
}

/* ── hreflang ────────────────────────────────────────────────────────────
   Every page declares all seven of its language variants plus x-default, so a
   search engine that finds /download knows /ja/download is the same page in
   Japanese and serves the right one — instead of treating them as duplicates
   or never discovering them at all.

   Rebuilt on every route change and torn down with the page, using a marker
   attribute so we only ever remove our own tags. */
const ALT_FLAG = 'data-managed-alt';

function writeAlternates(canonicalPath?: string) {
    /* Clears EVERY hreflang link, not just ours: index.html ships a static set
       for the home page so a crawler that does not run JS still sees them, and
       leaving those in place would duplicate each tag once React took over. */
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    const path = normalisePath(canonicalPath);
    const add = (hreflang: string, href: string) => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', hreflang);
        el.setAttribute('href', href);
        el.setAttribute(ALT_FLAG, '');
        document.head.appendChild(el);
    };
    LOCALES.forEach(l => add(l.code, SITE_ORIGIN + localeHref(localePrefix(l.code), path)));
    /* x-default is what a searcher gets when none of the seven matches them. */
    add('x-default', SITE_ORIGIN + localeHref(localePrefix(DEFAULT_LOCALE), path));
}

/**
 * Sets the document title, description, canonical URL and Open Graph / Twitter
 * title+description for a routed page, then restores whatever index.html had
 * when the page unmounts.
 */
export function useDocumentMeta({ title, description, canonicalPath }: DocumentMeta): void {
    const { locale } = useI18n();

    useEffect(() => {
        document.title = title;
        const prefix = localePrefix(locale);

        const values: Record<HeadTagKey, string> = {
            description,
            canonical: absoluteCanonical(canonicalPath, prefix),
            ogTitle: title,
            ogDescription: description,
            twitterTitle: title,
            twitterDescription: description,
        };

        HEAD_TAG_KEYS.forEach(key => writeTag(HEAD_TAGS[key], values[key]));
        writeAlternates(canonicalPath);

        return () => {
            document.title = ORIGINAL_TITLE;
            HEAD_TAG_KEYS.forEach(key => restoreTag(HEAD_TAGS[key], ORIGINAL_TAGS[key]));
            document.head.querySelectorAll(`link[${ALT_FLAG}]`).forEach(el => el.remove());
        };
    }, [title, description, canonicalPath, locale]);
}
