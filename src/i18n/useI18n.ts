import { createContext, useContext } from 'react';
import type { LocaleCode } from './config';
import { DEFAULT_LOCALE } from './config';
import type { Dictionary } from './types';
import { en } from './dictionaries';

export interface I18nState {
    locale: LocaleCode;
    /** The active dictionary. Named `t` so call sites read `t.nav.pricing`. */
    t: Dictionary;
    /** BCP-47 tag for toLocaleDateString / toLocaleString. */
    bcp47: string;
    /** False while the chosen language's chunk is still in flight on first load. */
    ready: boolean;
    setLocale: (code: LocaleCode) => void;
}

/* Context lives in its own module so the provider file exports a component and
   nothing else — Fast Refresh drops a module's state when it also exports
   non-components, which would remount the tree on every edit. */
export const I18nContext = createContext<I18nState>({
    locale: DEFAULT_LOCALE,
    t: en,
    bcp47: 'en-US',
    ready: true,
    setLocale: () => {},
});

export function useI18n(): I18nState {
    return useContext(I18nContext);
}
