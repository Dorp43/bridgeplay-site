/* eslint-disable react-refresh/only-export-components --
   This is the entry module: it exports nothing by design, and editing it always
   triggers a full reload rather than a Fast Refresh, so the rule's premise
   ("move your components to a separate file so HMR can swap them") does not
   apply to the two helpers below. */
import { StrictMode, Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext, useAuth, type AuthState } from './context/useAuth';
import { ToastProvider } from './context/ToastContext';
import I18nProvider from './i18n/I18nProvider';
import { useI18n } from './i18n/useI18n';
import { localeFromPath, localePrefix, localizedHref, readStoredLocale } from './i18n/config';
import { inject } from '@vercel/analytics';
// global.css must be imported BEFORE App so global styles are emitted first
// and *.module.css rules win specificity ties (button sizing, card transforms).
import './styles/global.css';
import App from './App';

inject();

/* AuthProvider pulls in firebase/app + firebase/auth + firestore — ~250 kB of
   the entry chunk that only /account actually needs. Loading it eagerly made
   every marketing visitor parse it before first paint, so it is deferred here.
   The real provider mounts in a render-null side channel and AuthMirror lifts
   the state it publishes into the outer provider that <App /> consumes, which
   keeps <App /> at a fixed position in the tree — a Suspense fallback swap
   around <App /> itself would unmount and remount the whole page when the
   chunk landed. Until it arrives the context holds { loading: true }, exactly
   the state Nav already fades its auth slot in from. */
const LazyAuthProvider = lazy(() =>
    import('./context/AuthContext').then(m => ({ default: m.AuthProvider }))
);

function AuthMirror({ publish }: { publish: (state: AuthState) => void }) {
    const state = useAuth(); // resolves to LazyAuthProvider's inner value
    useEffect(() => { publish(state); }, [publish, state]);
    return null;
}

function DeferredAuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({ user: null, loading: true });
    return (
        <AuthContext.Provider value={state}>
            {children}
            <Suspense fallback={null}>
                <LazyAuthProvider>
                    <AuthMirror publish={setState} />
                </LazyAuthProvider>
            </Suspense>
        </AuthContext.Provider>
    );
}

/* Takes over from the static splash in index.html (same look, so the handoff
   is invisible) and holds until the deferred auth chunk has RESOLVED the
   session — before this, the page rendered signed-out and the nav's account
   chip popped in ~half a second later. Minimum 900ms on screen so the reveal
   never strobes on a warm cache; hard cap 4s so a hung network can't brick
   the site behind a loader; 400ms fade out. */
function BootGate() {
    const { loading } = useAuth();
    /* Also gated on the dictionary: for a visitor whose language is not English
       the words arrive in a lazy chunk, and without this the page painted in
       English and then swapped under them a moment later. */
    const { ready: localeReady, t } = useI18n();
    const [minElapsed, setMinElapsed] = useState(false);
    const [maxElapsed, setMaxElapsed] = useState(false);
    const [gone, setGone] = useState(false);
    useEffect(() => {
        const min = setTimeout(() => setMinElapsed(true), 900);
        const max = setTimeout(() => setMaxElapsed(true), 4000);
        return () => { clearTimeout(min); clearTimeout(max); };
    }, []);
    const ready = (minElapsed && !loading && localeReady) || maxElapsed;
    useEffect(() => {
        if (!ready || gone) return;
        const t = setTimeout(() => setGone(true), 400);
        return () => clearTimeout(t);
    }, [ready, gone]);
    if (gone) return null;
    return (
        <div className={`boot-gate${ready ? ' boot-gate-done' : ''}`} role="status" aria-label={t.common.loading}>
            <div className="boot-orb">
                <span className="boot-ripple" />
                <span className="boot-ripple boot-ripple2" />
                <span className="boot-ring" />
                <img src="/favicon-192.png" alt="" width="64" height="64" />
            </div>
        </div>
    );
}

/* Split out of the tree below only so it can read the dictionary — it has to
   sit inside I18nProvider, and it is still the first focusable node on the
   page, ahead of Nav. */
function SkipLink() {
    const { t } = useI18n();
    return <a href="#main-content" className="skip-link">{t.common.skipToContent}</a>;
}

/* Resolved once, from the URL, before React mounts. The router then treats
   /ja as its root, so every <Link to="/download"> in the app becomes
   /ja/download without a single call-site change, and useLocation().pathname
   still reports "/download" to any logic that reads it.

   A visitor who previously chose a language and then lands on a bare English
   URL is sent to their language, but ONLY on the strength of a stored choice —
   never on browser-language detection. Search crawlers carry no localStorage,
   so they are never redirected and always index what they asked for. */
const bootLocale = localeFromPath(window.location.pathname);
if (bootLocale === 'en') {
    const stored = readStoredLocale();
    if (stored && stored !== 'en') {
        window.location.replace(
            localizedHref(stored, window.location.pathname, window.location.search, window.location.hash)
        );
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter basename={localePrefix(bootLocale)}>
            {/* First focusable node on the page, ahead of Nav. It is rendered
                unconditionally, so every route has to provide the target or the
                first thing a keyboard user tabs to is a dead control: HomePage,
                Download, Limitations, AccountPage, Changelog, NotFound and
                LegalLayout each render a <main id="main-content" tabIndex={-1}>.
                On the routes with little or no nav (MinimalLayout has two links;
                the legal/changelog routes render none) the hop is short, but the
                landmark is what screen-reader users navigate by. */}
            {/* Outermost provider: the skip link, the boot splash and every
                route below it read their words from here. */}
            <I18nProvider>
                <SkipLink />
                <DeferredAuthProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                    <BootGate />
                </DeferredAuthProvider>
            </I18nProvider>
        </BrowserRouter>
    </StrictMode>
);
