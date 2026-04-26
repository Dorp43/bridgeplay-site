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

export function useStaggerReveal<T extends HTMLElement>(
    selector: string,
    delay: number = 60,
    options?: { threshold?: number }
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const items = entry.target.querySelectorAll(selector);
                        items.forEach((item, i) => {
                            const htmlItem = item as HTMLElement;
                            htmlItem.style.opacity = '0';
                            htmlItem.style.transform = 'translateY(15px) scale(0.9)';
                            setTimeout(() => {
                                htmlItem.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                                htmlItem.style.opacity = '1';
                                htmlItem.style.transform = 'translateY(0) scale(1)';
                            }, i * delay);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: options?.threshold ?? 0.3 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [selector, delay, options?.threshold]);

    return ref;
}
