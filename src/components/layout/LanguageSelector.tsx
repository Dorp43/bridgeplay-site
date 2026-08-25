import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { LOCALES, localeMeta, type LocaleCode } from '../../i18n/config';
import { useI18n } from '../../i18n/useI18n';
import styles from './LanguageSelector.module.css';

/* Built by hand rather than on the shadcn <Select> in components/shadcn: none
   of those are used anywhere in this site, they are Radix-flavoured and
   Tailwind-styled, and the nav is CSS Modules and glass. Seven items do not
   justify pulling a headless menu library into the entry chunk.

   Keyboard contract matches the mobile drawer in Nav: Escape closes and returns
   focus to the trigger, Up/Down move between options, Home/End jump to the
   ends, and Enter/Space commit. Options are a listbox because this SETS A
   VALUE — a menu would be the wrong role for a control with a current state. */

interface Props {
    /** Compact places the panel flush right, under the nav trigger. */
    variant?: 'nav' | 'drawer';
    /** Called after a language is picked — the mobile drawer closes on it. */
    onPick?: () => void;
}

export default function LanguageSelector({ variant = 'nav', onPick }: Props) {
    const { locale, setLocale, t } = useI18n();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    /* Which option the keyboard is on. Seeded to the active language each time
       the panel opens, so Down from a closed control starts somewhere sensible
       instead of always at the top of the list. */
    const [activeIndex, setActiveIndex] = useState(0);

    const current = localeMeta(locale);
    const currentIndex = LOCALES.findIndex(l => l.code === locale);

    const choose = (code: LocaleCode) => {
        if (code !== locale) {
            setLocale(code);
            track('language_change', { from: locale, to: code });
        }
        setOpen(false);
        triggerRef.current?.focus();
        onPick?.();
    };

    const openPanel = (index = currentIndex === -1 ? 0 : currentIndex) => {
        setActiveIndex(index);
        setOpen(true);
    };

    /* Pointer-down rather than click: a click listener fires after the button's
       own handler has already toggled the panel back open. */
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    /* Move DOM focus with the active option so screen readers announce each
        one as you arrow through, instead of relying on aria-activedescendant
        (which VoiceOver handles unevenly inside a listbox this small). */
    useEffect(() => {
        if (!open) return;
        const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
        items?.[activeIndex]?.focus();
    }, [open, activeIndex]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'Escape':
                if (!open) return;
                e.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!open) openPanel();
                else setActiveIndex(i => (i + 1) % LOCALES.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!open) openPanel();
                else setActiveIndex(i => (i - 1 + LOCALES.length) % LOCALES.length);
                break;
            case 'Home':
                if (!open) return;
                e.preventDefault();
                setActiveIndex(0);
                break;
            case 'End':
                if (!open) return;
                e.preventDefault();
                setActiveIndex(LOCALES.length - 1);
                break;
            default:
        }
    };

    return (
        <div
            ref={rootRef}
            className={`${styles.root} ${variant === 'drawer' ? styles.drawer : ''}`}
            onKeyDown={onKeyDown}
        >
            <button
                ref={triggerRef}
                type="button"
                className={styles.trigger}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`${t.language.label}: ${current.endonym}`}
                onClick={() => (open ? setOpen(false) : openPanel())}
            >
                {/* Globe, not a flag: a language is not a country. */}
                <svg className={styles.globe} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
                </svg>
                <span className={styles.code}>{current.short}</span>
                <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open && (
                <ul
                    ref={listRef}
                    className={styles.panel}
                    role="listbox"
                    aria-label={t.language.choose}
                    tabIndex={-1}
                >
                    {LOCALES.map((l, i) => {
                        const selected = l.code === locale;
                        return (
                            <li
                                key={l.code}
                                role="option"
                                aria-selected={selected}
                                tabIndex={-1}
                                className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                                onClick={() => choose(l.code)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        choose(l.code);
                                    }
                                }}
                                onMouseEnter={() => setActiveIndex(i)}
                            >
                                <span className={styles.optionCode}>{l.short}</span>
                                <span className={styles.optionName}>{l.endonym}</span>
                                {selected && (
                                    <svg className={styles.check} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" aria-hidden="true">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
