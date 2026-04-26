import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import RefundPolicy from './pages/RefundPolicy';
import NotFound from './pages/NotFound';
import Changelog from './pages/Changelog';
import ScrollToTop from './components/ui/ScrollToTop';

const PAGE_TITLES: Record<string, string> = {
    '/': 'BridgePlay — Play Windows Games on Your Mac',
    '/account': 'Login — BridgePlay',
    '/privacy-policy': 'Privacy Policy — BridgePlay',
    '/terms': 'Terms of Service — BridgePlay',
    '/refund-policy': 'Refund Policy — BridgePlay',
    '/changelog': 'Changelog — BridgePlay',
};

function PageTitle() {
    const { pathname } = useLocation();
    useEffect(() => {
        document.title = PAGE_TITLES[pathname] || 'BridgePlay';
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

function MainLayout() {
    return (
        <>
            <Nav variant="full" />
            <Outlet />
            <Footer />
        </>
    );
}

function MinimalLayout() {
    return (
        <>
            <Nav variant="minimal" />
            <Outlet />
        </>
    );
}

function LegalRoute() {
    return <Outlet />;
}

export default function App() {
    return (
        <>
            <PageTitle />
            <ScrollToTop />
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
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
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}
