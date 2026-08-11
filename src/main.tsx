import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { inject } from '@vercel/analytics';
// global.css must be imported BEFORE App so global styles are emitted first
// and *.module.css rules win specificity ties (button sizing, card transforms).
import './styles/global.css';
import App from './App';

inject();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
