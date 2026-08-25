import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ScrollToTop from './components/ui/ScrollToTop';
import { useI18n } from './i18n/useI18n';
import type { Dictionary } from './i18n/types';

// Only the home page ships in the entry chunk. Everything below is a separate
// chunk fetched on navigation — AccountPage above all, since it (and the auth
// provider deferred in main.tsx) is what drags Firebase in.
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AuthAction = lazy(() => import('./pages/AuthAction'));
const AppCheckout = lazy(() => import('./pages/AppCheckout'));
const Download = lazy(() => import('./pages/Download'));
const Limitations = lazy(() => import('./pages/Limitations'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const Notices = lazy(() => import('./pages/Notices'));
const Changelog = lazy(() => import('./pages/Changelog'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

/* Placeholder for a page whose chunk is still in flight. Styled in global.css
   to stay invisible for its first 300ms, so a fast fetch shows nothing at all
   instead of flashing a spinner. */
/* Branded loader for the window while a lazy page chunk downloads — the same
   breathing logo as the boot splash, so every load state looks like ONE
   system. Tall enough that the footer doesn't jump to mid-screen. */
function RouteFallback() {
    const { t } = useI18n();
    return (
        <div className="route-fallback" role="status" aria-label={t.common.loading}>
            <img src="/favicon-192.png" alt="" width="56" height="56" />
        </div>
    );
}

/* Synchronous title for the window between a navigation committing and its lazy
   page chunk landing. Every route below except '/' also calls useDocumentMeta,
   which then takes ownership of the title plus description/canonical/OG/Twitter;
   these strings must stay identical to that hook's `title` or the tab visibly
   flips once the chunk resolves. '/' is eager and owns its title here alone. */
const pageTitles = (t: Dictionary): Record<string, string> => ({
    '/': t.meta.home.title,
    '/account': t.meta.account.title,
    '/plans': t.meta.plans.title,
    '/auth/action': t.meta.authAction.title,
    '/app-checkout': t.meta.checkout.title,
    '/privacy-policy': t.meta.privacy.title,
    '/terms': t.meta.terms.title,
    '/refund-policy': t.meta.refund.title,
    '/notices': t.meta.notices.title,
    '/changelog': t.meta.changelog.title,
    '/download': t.meta.download.title,
    '/limitations': t.meta.limitations.title,
});

function PageTitle() {
    const { pathname } = useLocation();
    const { t } = useI18n();
    useEffect(() => {
        /* Unmatched paths render the wildcard NotFound route, so its title is
           the right fallback — a generic one would flip when the chunk lands. */
        document.title = pageTitles(t)[pathname] || t.meta.notFound.title;
    }, [pathname, t]);
    /* Scroll reset stays keyed on pathname alone: re-running it when the
       language changes would yank a reader back to the top mid-page. */
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

/* Nav + Footer chrome. The Suspense boundary is inside, around the <Outlet />,
   for the same reason as MinimalLayout below: /download and /limitations are
   lazy chunks, and a boundary above the chrome would unmount Nav and Footer
   while one is in flight. HomePage is eager, so it never reaches the fallback. */
function MainLayout() {
    return (
        <>
            <Nav variant="full" />
            <Suspense fallback={<RouteFallback />}>
                <Outlet />
            </Suspense>
            <Footer />
        </>
    );
}

/* Suspense sits around the <Outlet />, not around <Routes>: the boundary has to
   be below Nav so a pending chunk never unmounts the chrome. */
function MinimalLayout() {
    return (
        <>
            <Nav variant="minimal" />
            <Suspense fallback={<RouteFallback />}>
                <Outlet />
            </Suspense>
        </>
    );
}

function LegalRoute() {
    return (
        <Suspense fallback={<RouteFallback />}>
            <Outlet />
        </Suspense>
    );
}

export default function App() {
    return (
        <>
            <PageTitle />
            <ScrollToTop />
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/download" element={<Download />} />
                    <Route path="/limitations" element={<Limitations />} />
                </Route>
                <Route element={<MinimalLayout />}>
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/plans" element={<PlansPage />} />
                    <Route path="/auth/action" element={<AuthAction />} />
                </Route>
                <Route element={<LegalRoute />}>
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/notices" element={<Notices />} />
                    <Route path="/changelog" element={<Changelog />} />
                </Route>
                {/* Bare, chrome-less — it renders inside the Mac app's WKWebView. */}
                <Route path="/app-checkout" element={<Suspense fallback={<RouteFallback />}><AppCheckout /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<RouteFallback />}><NotFound /></Suspense>} />
            </Routes>
        </>
    );
}
