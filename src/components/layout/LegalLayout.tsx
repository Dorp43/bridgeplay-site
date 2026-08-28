import { Children, cloneElement, isValidElement, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../ui/PageHeader';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useI18n } from '../../i18n/useI18n';
import styles from './LegalLayout.module.css';

interface Props {
    title: string;
    lastUpdated: string;
    /* All three documents sit under one label today; overridable so a fourth
       one does not have to. Defaults to the translated "Legal" eyebrow. */
    eyebrow?: string;
    children: ReactNode;
}

/* The other two legal documents, for the footer rail. The current page is
   filtered out of it by pathname. */
const LEGAL_DOCS = [
    { to: '/terms', key: 'terms' },
    { to: '/privacy-policy', key: 'privacy' },
    { to: '/refund-policy', key: 'refund' },
    { to: '/notices', key: 'notices' },
] as const;

interface Section {
    id: string;
    ordinal: string;
    label: string;
    body: ReactNode[];
}

/* Flattens a node tree to its text so a heading's label — and the document's
   word count — can be read straight off the JSX the page already ships. */
function plainText(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(plainText).join('');
    if (isValidElement(node)) {
        const { children } = node.props as { children?: ReactNode };
        return plainText(children);
    }
    return '';
}

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/* Tags the run-in-term paragraphs — "**Automatic renewal.** The Monthly and
   Yearly plans…" — so CSS can give them the indent a definition list would get.
   Done here rather than with `p:has(> strong:first-child)` because :first-child
   ignores text nodes: that selector also matches "…a full refund within
   **7 days** of the payment", where the bold is mid-sentence and the paragraph
   is ordinary prose. This tests the first *node*, which is the actual rule. */
function tagRunInTerms(nodes: ReactNode[], className: string): ReactNode[] {
    return nodes.map(node => {
        if (!isValidElement(node) || node.type !== 'p') return node;
        const { children } = node.props as { children?: ReactNode };
        const first = Array.isArray(children) ? children[0] : children;
        if (!isValidElement(first) || first.type !== 'strong') return node;
        return cloneElement(node as ReactElement<{ className?: string }>, { className });
    });
}

export default function LegalLayout({ title, lastUpdated, eyebrow, children }: Props) {
    const { pathname } = useLocation();
    const ref = useScrollReveal<HTMLElement>();
    const { t } = useI18n();
    const [activeId, setActiveId] = useState<string | null>(null);

    /* Each document is a flat run of <h2> headings followed by their prose.
       Rather than make every page repeat a wrapper element per section, the
       layout reads that structure back off its children: it splits on <h2>,
       numbers the sections by position, and builds the contents list and the
       reading estimate in the same pass.

       No wording is rewritten here. The one transform is stripping a leading
       "4. " off a heading whose number this layout is about to render itself —
       safe because the printed numbers in Terms (1-13) and Privacy (1-11) are
       already sequential and so match their positional index exactly, and the
       cross-reference in the privacy policy ("see section 4") still lands on
       the section it always did. The refund policy ships unnumbered and simply
       gains the same markers. */
    const { preamble, sections, minutes } = useMemo(() => {
        const collectedPreamble: ReactNode[] = [];
        const collected: Section[] = [];
        const usedIds = new Set<string>();

        for (const node of Children.toArray(children)) {
            if (isValidElement(node) && node.type === 'h2') {
                const position = collected.length + 1;
                const label = plainText(node).replace(/^\s*\d+\.\s*/, '').trim() || t.legal.sectionFallback(position);
                const base = slugify(label) || `section-${position}`;
                const id = usedIds.has(base) ? `${base}-${position}` : base;
                usedIds.add(id);
                collected.push({ id, ordinal: String(position).padStart(2, '0'), label, body: [] });
                continue;
            }
            if (collected.length === 0) collectedPreamble.push(node);
            else collected[collected.length - 1].body.push(node);
        }

        const words = plainText(children).trim().split(/\s+/).filter(Boolean).length;
        return {
            preamble: tagRunInTerms(collectedPreamble, styles.runIn),
            sections: collected.map(section => ({ ...section, body: tagRunInTerms(section.body, styles.runIn) })),
            minutes: Math.max(1, Math.round(words / 220)),
        };
    }, [children, t]);

    const ids = useMemo(() => sections.map(s => s.id), [sections]);

    /* Marks the section you are reading in the contents rail. The band is the
       top third of the viewport, and the first section inside it in document
       order wins, so the marker never jumps backwards past a heading you have
       already scrolled through. When no section is in the band (a long one
       filling the screen) the previous mark is kept rather than cleared. */
    useEffect(() => {
        const targets = ids
            .map(id => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);
        if (targets.length === 0) return;

        const inBand = new Set<string>();
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) inBand.add(entry.target.id);
                    else inBand.delete(entry.target.id);
                });
                setActiveId(prev => ids.find(id => inBand.has(id)) ?? prev);
            },
            { rootMargin: '-64px 0px -66% 0px' }
        );
        targets.forEach(target => observer.observe(target));
        return () => observer.disconnect();
    }, [ids]);

    const others = LEGAL_DOCS.filter(doc => doc.to !== pathname);

    return (
        <>
            <div className="bg-glow" aria-hidden="true" />
            {/* Landmark + target for the skip link rendered in main.tsx. These
                routes render no nav, so the skip link is a short hop, but the
                landmark is what screen-reader users navigate by. */}
            <main id="main-content" tabIndex={-1} className={styles.page} ref={ref}>
                <div className={styles.shell}>
                    <PageHeader
                        eyebrow={eyebrow ?? t.legal.eyebrow}
                        title={title}
                        align="left"
                        backTo="/"
                        backLabel={t.common.backToBridgePlay}
                        reveal
                        /* Spans both tracks once .shell becomes a grid at 1080px. */
                        className={styles.head}
                        meta={[
                            t.legal.lastUpdated(lastUpdated),
                            sections.length > 0 ? t.legal.sectionCount(sections.length) : null,
                            t.legal.readingTime(minutes),
                        ]}
                    />

                    {/* These documents are binding and are published in English
                        only — a translated contract that disagrees with the
                        original is worse than no translation. Shown to everyone
                        so the choice is visible rather than silent. */}
                    <p className={`${styles.englishOnly} reveal`}>{t.legal.englishOnlyNotice}</p>

                    {sections.length > 1 && (
                        <nav className={`${styles.toc} reveal`} aria-labelledby="toc-label">
                            <p className={styles.tocLabel} id="toc-label">{t.legal.onThisPage}</p>
                            <ol className={styles.tocList}>
                                {sections.map(section => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className={activeId === section.id ? `${styles.tocLink} ${styles.tocLinkActive}` : styles.tocLink}
                                            aria-current={activeId === section.id ? 'true' : undefined}
                                        >
                                            <span className={styles.tocNum} aria-hidden="true">{section.ordinal}</span>
                                            <span>{section.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    )}

                    <div className={styles.doc}>
                        {preamble.length > 0 && <div className={styles.body}>{preamble}</div>}
                        {sections.map(section => (
                            <section key={section.id} id={section.id} className={styles.section}>
                                <h2 className={styles.heading}>
                                    <span className={styles.headingNum} aria-hidden="true">{section.ordinal}</span>
                                    <span>{section.label}</span>
                                </h2>
                                <div className={styles.body}>{section.body}</div>
                            </section>
                        ))}
                    </div>

                    <footer className={`${styles.foot} reveal`}>
                        <div className={styles.footRow}>
                            <span className={styles.footLabel}>{t.common.also}</span>
                            {others.map(doc => (
                                <Link key={doc.to} to={doc.to} className={styles.footLink}>{t.footer[doc.key]}</Link>
                            ))}
                            <Link to="/#contact" className={styles.footLink}>{t.footer.contact}</Link>
                        </div>
                        <Link to="/" className="back-link">{t.common.backToBridgePlay}</Link>
                    </footer>
                </div>
            </main>
        </>
    );
}
