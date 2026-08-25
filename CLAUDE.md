# BridgePlay site — working notes

Marketing site for the BridgePlay Mac app (`/Users/dor/git-repos/BridgePlay`).
Vite + React 19, CSS Modules, deployed on Vercel.

## 🌍 THE RULE: every user-facing string is translated

**This site ships in 7 languages. No English string may be hard-coded in a
component. Ever.**

If your change adds, edits, or removes any text a visitor can read, you are not
done until all seven locale files agree. Read **[I18N.md](I18N.md)** before
touching copy — it has the full workflow, the key-naming conventions, and the
list of things that deliberately stay in English.

The short version:

1. Add or edit the key in `src/i18n/locales/en.ts` (the master dictionary).
2. `npx tsc -b` will now **fail in six files** — that is the safety net working.
3. Translate the key in `es.ts`, `de.ts`, `fr.ts`, `pt-BR.ts`, `ja.ts`, `zh-CN.ts`.
4. Read the string from `useI18n()` in the component: `const { t } = useI18n()`
   → `t.nav.pricing`.
5. `npm run build` must pass before you call the change done.

**Never** silence the type error by widening `Dictionary`, marking keys
optional, adding an index signature, or falling back to English at runtime. The
build failure is the only thing standing between us and a half-translated site.

## Other things that bite

- **CSS import order in `src/main.tsx` is load-bearing.** `global.css` must be
  imported *before* `App` so `*.module.css` wins specificity ties.
- **One canonical explanation per concept.** Wine is explained once, in the
  compatibility section. Rosetta 2 once, on `/download`. Kernel anti-cheat and
  DirectX 12 once, on `/limitations`. Everywhere else names the thing and links.
  Do not re-gloss a term that already has a home — that duplication is what the
  Aug 2026 copy pass removed, and it costs 7× to maintain.
- **Some strings are legal disclosures, not marketing copy.** `pricing.footer*`
  and `faq.items.cancel` must keep every term (price, renewal cadence, how to
  cancel, what happens to access). They are commented as such in `en.ts`.
- **Legal documents are English-only on purpose.** `/terms`, `/privacy-policy`,
  `/refund-policy` and `/notices` render English bodies with a translated
  banner (`legal.englishOnlyNotice`). Do not translate the document text.
- **Plan copy lives in one place.** `t.plans.<key>` for words, `src/lib/plans.ts`
  for price ids and amounts. Three surfaces read them (marketing pricing
  section, `/plans`, `/app-checkout`) — never re-type a plan's features.
- **`public/third-party-notices.md` is a copy** of `THIRD_PARTY_NOTICES.md` in
  the app repo. When the bundled runtime changes, re-copy it, and check that
  `src/pages/Notices.tsx` still matches. It must never claim a licence the full
  document does not.
- **`vercel.json` is schema-validated** — unknown keys (including `comment`)
  fail the deploy.

## Commands

```
npm run dev      # vite dev server
npx tsc -b       # type check — this is what enforces the translation contract
npm run lint
npm run build    # tsc -b && vite build; also stamps the .dmg size/SHA
```
