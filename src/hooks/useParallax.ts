import { useEffect } from 'react';

/**
 * Home-page scroll motion. One rAF, one passive listener:
 * (a) hero recede — writes scroll progress 0..1 to --hero-p on
 *     [data-parallax="preview"]; Hero.module.css derives the
 *     translate/scale/glow-dim from it (defaults to 0 without JS).
 * (b) particles — slow counter-drift on [data-parallax="particles"].
 * (c) background depth — mirrors scrollY to --scroll-y on <html>;
 *     global.css drifts .bg-grid / .bg-glow planes from it (defaults to 0).
 * (d) aurora handoff — --hero-p mirrored onto [data-parallax="hero"] so
 *     the aurora dims as the light source hands off to Features.
 * Nav's `scrolled` class is owned by Nav.tsx, not this hook.
 */
export function useParallax() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const preview = document.querySelector<HTMLElement>('[data-parallax="preview"]');
        const particles = document.querySelector<HTMLElement>('[data-parallax="particles"]');
        const hero = document.querySelector<HTMLElement>('[data-parallax="hero"]');
        const root = document.documentElement;
        if (!preview && !particles && !hero) return;

        let ticking = false;
        let lastP = -1;
        let lastY = -1;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                if (preview || hero) {
                    const p = Math.min(Math.max(scrollY / 520, 0), 1);
                    if (Math.abs(p - lastP) >= 0.005) {
                        preview?.style.setProperty('--hero-p', String(p));
                        hero?.style.setProperty('--hero-p', String(p));
                        lastP = p;
                    }
                }
                if (particles) {
                    particles.style.transform = `translateY(${scrollY * -0.04}px)`;
                }
                if (Math.abs(scrollY - lastY) >= 4) {
                    root.style.setProperty('--scroll-y', String(scrollY));
                    lastY = scrollY;
                }
                ticking = false;
            });
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            root.style.removeProperty('--scroll-y');
        };
    }, []);
}
