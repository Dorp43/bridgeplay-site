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

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            {/* First focusable node on the page, ahead of Nav. It is rendered
                unconditionally, so every route has to provide the target or the
                first thing a keyboard user tabs to is a dead control: HomePage,
                Download, Limitations, AccountPage, Changelog, NotFound and
                LegalLayout each render a <main id="main-content" tabIndex={-1}>.
                On the routes with little or no nav (MinimalLayout has two links;
                the legal/changelog routes render none) the hop is short, but the
                landmark is what screen-reader users navigate by. */}
            <a href="#main-content" className="skip-link">Skip to content</a>
            <DeferredAuthProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </DeferredAuthProvider>
        </BrowserRouter>
    </StrictMode>
);
