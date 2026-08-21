import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ScrollToTop from './components/ui/ScrollToTop';

// Only the home page ships in the entry chunk. Everything below is a separate
// chunk fetched on navigation — AccountPage above all, since it (and the auth
// provider deferred in main.tsx) is what drags Firebase in.
const AccountPage = lazy(() => import('./pages/AccountPage'));
const Download = lazy(() => import('./pages/Download'));
const Limitations = lazy(() => import('./pages/Limitations'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const Changelog = lazy(() => import('./pages/Changelog'));
const NotFound = lazy(() => import('./pages/NotFound'));

/* Placeholder for a page whose chunk is still in flight. Styled in global.css
   to stay invisible for its first 300ms, so a fast fetch shows nothing at all
   instead of flashing a spinner. */
function RouteFallback() {
    return <div className="route-fallback" />;
}

/* Synchronous title for the window between a navigation committing and its lazy
   page chunk landing. Every route below except '/' also calls useDocumentMeta,
   which then takes ownership of the title plus description/canonical/OG/Twitter;
   these strings must stay identical to that hook's `title` or the tab visibly
   flips once the chunk resolves. '/' is eager and owns its title here alone. */
const PAGE_TITLES: Record<string, string> = {
    '/': 'BridgePlay — Play Windows Games on Your Mac',
    '/account': 'Account — BridgePlay',
    '/privacy-policy': 'Privacy Policy — BridgePlay',
    '/terms': 'Terms of Service — BridgePlay',
    '/refund-policy': 'Refund Policy — BridgePlay',
    '/changelog': 'Changelog — BridgePlay',
    '/download': 'Download BridgePlay for macOS — Apple Silicon',
    '/limitations': 'Known Limitations — BridgePlay',
};

function PageTitle() {
    const { pathname } = useLocation();
    useEffect(() => {
        /* Unmatched paths render the wildcard NotFound route, so its title is
           the right fallback — a generic one would flip when the chunk lands. */
        document.title = PAGE_TITLES[pathname] || 'Page Not Found — BridgePlay';
        window.scrollTo(0, 0);
    }, [pathname]);
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
                </Route>
                <Route element={<LegalRoute />}>
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/changelog" element={<Changelog />} />
                </Route>
                <Route path="*" element={<Suspense fallback={<RouteFallback />}><NotFound /></Suspense>} />
            </Routes>
        </>
    );
}
