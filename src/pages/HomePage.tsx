import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import HowItWorks from '../components/sections/HowItWorks';
import Compatibility from '../components/sections/Compatibility';
import Pricing from '../components/sections/Pricing';
import FAQ from '../components/sections/FAQ';
import CTA from '../components/sections/CTA';
import ContactForm from '../components/sections/ContactForm';
import { useParallax } from '../hooks/useParallax';
import { useCopyProtection } from '../hooks/useCopyProtection';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function HomePage() {
    useParallax();
    useCopyProtection();

    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const el = document.querySelector(location.hash);
            if (el) {
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        }
    }, [location.hash]);

    return (
        <>
            <div className="bg-glow" />
            <Hero />
            <Features />
            <HowItWorks />
            <Compatibility />
            <Pricing />
            <FAQ />
            <CTA />
            <ContactForm />
        </>
    );
}
