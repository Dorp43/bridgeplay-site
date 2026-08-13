import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import HowItWorks from '../components/sections/HowItWorks';
import Compatibility from '../components/sections/Compatibility';
import Pricing from '../components/sections/Pricing';
import FAQ from '../components/sections/FAQ';
import WhatsNew from '../components/sections/WhatsNew';
import CTA from '../components/sections/CTA';
import ContactForm from '../components/sections/ContactForm';
import { useParallax } from '../hooks/useParallax';

export default function HomePage() {
    useParallax();

    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const el = document.querySelector(location.hash);
            if (el) {
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        }
    }, [location.hash]);

    // One event per session, on the first deliberate input. Separates
    // "landed and left" from "landed and engaged" without touching scroll,
    // which browsers fire on their own during scroll restoration.
    useEffect(() => {
        let fired = false;
        const onFirstInput = (e: Event) => {
            if (fired) return;
            fired = true;
            track('first_interaction', { kind: e.type === 'keydown' ? 'keyboard' : 'pointer' });
            remove();
        };
        const remove = () => {
            window.removeEventListener('pointerdown', onFirstInput);
            window.removeEventListener('keydown', onFirstInput);
        };
        window.addEventListener('pointerdown', onFirstInput, { passive: true });
        window.addEventListener('keydown', onFirstInput);
        return remove;
    }, []);

    return (
        <>
            <div className="bg-grid" aria-hidden="true" />
            <div className="bg-glow" aria-hidden="true" />
            <div className="bg-grain" aria-hidden="true" />
            {/* Landmark + target for the skip link rendered in main.tsx. */}
            <main id="main-content" tabIndex={-1}>
                <Hero />
                <Features />
                <WhatsNew />
                <HowItWorks />
                <Compatibility />
                <Pricing />
                <FAQ />
                <CTA />
                <ContactForm />
            </main>
        </>
    );
}
