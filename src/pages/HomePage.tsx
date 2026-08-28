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
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useI18n } from '../i18n/useI18n';

export default function HomePage() {
    useParallax();
    const { t } = useI18n();

    /* '/' owns its head here rather than leaning on index.html: the static tags
       cannot carry a per-language canonical or the hreflang set, and the home
       page is the one Google is most likely to find first. The title matches
       App.tsx's PAGE_TITLES entry exactly, so the tab never flips. */
    useDocumentMeta({
        title: t.meta.home.title,
        description: t.meta.home.description,
        canonicalPath: '/',
    });

    const location = useLocation();

    /* Deep links to a section (/#faq from the footer, or a shared URL). The
       old single 100ms shot fired while the boot splash was still up and the
       reveal animations had not laid the page out, so it routinely landed
       short or not at all. Retrying across a few frames costs nothing and
       makes the link land where it says it will. Jumps rather than smooth-
       scrolls on a cold load — there is nothing to animate away from. */
    useEffect(() => {
        if (!location.hash) return;
        let cancelled = false;
        let tries = 0;
        const settle = () => {
            if (cancelled) return;
            const el = document.querySelector(location.hash);
            if (el) {
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                el.scrollIntoView({ behavior: tries === 0 || reduce ? 'auto' : 'smooth' });
            }
            if (++tries < 4) setTimeout(settle, 250);
        };
        const first = setTimeout(settle, 60);
        return () => { cancelled = true; clearTimeout(first); };
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
