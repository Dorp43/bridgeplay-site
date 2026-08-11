import { useEffect, useRef } from 'react';

export function useScrollReveal<T extends HTMLElement>(options?: { threshold?: number; rootMargin?: string }) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: options?.threshold ?? 0.08, rootMargin: options?.rootMargin ?? '0px 0px -60px 0px' }
        );

        const targets = el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        if (targets.length > 0) {
            targets.forEach(t => observer.observe(t));
        } else {
            observer.observe(el);
        }

        return () => observer.disconnect();
    }, [options?.threshold, options?.rootMargin]);

    return ref;
}
