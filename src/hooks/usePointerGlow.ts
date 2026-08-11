import { useEffect, type RefObject } from 'react';

/**
 * Pointer spotlight for card grids. Pass the grid container's ref;
 * on pointermove (rAF-throttled) the hovered card — found via
 * closest('[data-glow-card]') — gets --mx / --my written as
 * percentages. Pair with a card ::before radial-gradient at
 * `var(--mx, 50%) var(--my, 0%)` that fades in on hover.
 * Pointer-fine only; inert under prefers-reduced-motion.
 */
export function usePointerGlow<T extends HTMLElement>(ref: RefObject<T | null>) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let raf = 0;
        const onMove = (e: PointerEvent) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const card = (e.target as Element | null)?.closest<HTMLElement>('[data-glow-card]');
                if (!card) return;
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
                card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
            });
        };

        el.addEventListener('pointermove', onMove, { passive: true });
        return () => {
            el.removeEventListener('pointermove', onMove);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [ref]);
}
