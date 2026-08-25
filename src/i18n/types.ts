import type en from './locales/en';

/**
 * The shape every locale file must satisfy, derived from English.
 *
 * This is the enforcement mechanism the whole i18n setup rests on: each
 * `locales/<code>.ts` declares `const x: Dictionary = { … }`, so adding a key to
 * en.ts breaks the build in six files until every language has it. `tsc -b`
 * runs in `npm run build`, which means a half-translated site cannot ship.
 *
 * Do not "fix" that failure by marking keys optional, by widening this to
 * Partial<>, or by adding an index signature. The failure IS the contract —
 * see I18N.md.
 */
export type Dictionary = typeof en;
