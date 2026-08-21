import { useEffect } from 'react';

const SITE_ORIGIN = 'https://bridgeplay.app';

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

function absoluteCanonical(canonicalPath?: string): string {
    if (!canonicalPath || canonicalPath === '/') return SITE_ORIGIN;
    const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    return SITE_ORIGIN + (path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path);
}

/**
 * Sets the document title, description, canonical URL and Open Graph / Twitter
 * title+description for a routed page, then restores whatever index.html had
 * when the page unmounts.
 */
export function useDocumentMeta({ title, description, canonicalPath }: DocumentMeta): void {
    useEffect(() => {
        document.title = title;

        const values: Record<HeadTagKey, string> = {
            description,
            canonical: absoluteCanonical(canonicalPath),
            ogTitle: title,
            ogDescription: description,
            twitterTitle: title,
            twitterDescription: description,
        };

        HEAD_TAG_KEYS.forEach(key => writeTag(HEAD_TAGS[key], values[key]));

        return () => {
            document.title = ORIGINAL_TITLE;
            HEAD_TAG_KEYS.forEach(key => restoreTag(HEAD_TAGS[key], ORIGINAL_TAGS[key]));
        };
    }, [title, description, canonicalPath]);
}
