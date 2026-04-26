import { Routes, Route, Outlet } from 'react-router-dom';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import RefundPolicy from './pages/RefundPolicy';

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
            </Route>
        </Routes>
    );
}
