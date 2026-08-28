import { useState } from 'react';
import { detectLocale, localeMeta, localizedHref, readStoredLocale, writeStoredLocale } from '../../i18n/config';
import { useI18n } from '../../i18n/useI18n';
import styles from './LanguageSuggestion.module.css';

/**
 * "Also available in Deutsch →" — shown when the visitor's browser asks for a
 * language this page is not written in.
 *
 * Moving the language into the URL made the site indexable, but it also meant a
 * German visitor landing on the English root stays in English: the URL decides,
 * and it says English. Auto-redirecting on Accept-Language is the obvious fix
 * and the wrong one — Google treats it as cloaking risk, and it strands anyone
 * who deliberately wants the English page. Offering costs nothing and strands
 * nobody.
 *
 * The label is the language's own endonym rather than a translated sentence, so
 * this needs no dictionary from the language being offered — a German speaker
 * reads "Deutsch" without help, and we avoid pulling down a 13 kB chunk purely
 * to render one line of chrome.
 *
 * Shown at most once: acting on it or dismissing it both write a stored
 * preference, which is also what stops main.tsx redirecting later.
 */
export default function LanguageSuggestion() {
    const { locale, t } = useI18n();
    /* Resolved once on mount. A visitor who has ever expressed a preference —
       by using the selector, or by dismissing this — is never asked again. */
    const [suggested] = useState(() => {
        if (readStoredLocale()) return null;
        const detected = detectLocale();
        return detected === locale ? null : detected;
    });
    const [dismissed, setDismissed] = useState(false);

    if (!suggested || dismissed) return null;

    const meta = localeMeta(suggested);
    const href = localizedHref(suggested, window.location.pathname, window.location.search, window.location.hash);

    return (
        <div className={styles.bar} role="region" aria-label={t.language.label}>
            <a
                className={styles.offer}
                href={href}
                lang={suggested}
                aria-label={`${t.language.alsoAvailable} ${meta.endonym}`}
                onClick={() => writeStoredLocale(suggested)}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
                </svg>
                <span className={styles.endonym}>{meta.endonym}</span>
                <span className={styles.arrow} aria-hidden="true">&rarr;</span>
            </a>
            <button
                type="button"
                className={styles.dismiss}
                aria-label={t.language.dismissSuggestion}
                onClick={() => {
                    /* Storing the language they are already reading is the
                       record that they were asked and declined. */
                    writeStoredLocale(locale);
                    setDismissed(true);
                }}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="13" height="13" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
