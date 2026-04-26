import { useEffect } from 'react';

export function useParallax() {
    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;

                    const nav = document.querySelector('nav');
                    if (nav) {
                        nav.classList.toggle('scrolled', scrollY > 50);
                    }

                    const preview = document.querySelector('[data-parallax="preview"]') as HTMLElement;
                    if (preview) {
                        const rate = scrollY * 0.03;
                        preview.style.transform = `translateY(${Math.min(rate, 30)}px)`;
                    }

                    const particles = document.querySelector('[data-parallax="particles"]') as HTMLElement;
                    if (particles) {
                        particles.style.transform = `translateY(${scrollY * -0.05}px)`;
                    }

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
}
