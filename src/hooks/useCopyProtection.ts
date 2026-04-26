import { useEffect } from 'react';

export function useCopyProtection() {
    useEffect(() => {
        const prevent = (e: Event) => e.preventDefault();
        const preventKeys = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 'u'].includes(e.key)) {
                e.preventDefault();
            }
        };

        document.addEventListener('copy', prevent);
        document.addEventListener('cut', prevent);
        document.addEventListener('keydown', preventKeys);
        document.addEventListener('contextmenu', prevent);

        return () => {
            document.removeEventListener('copy', prevent);
            document.removeEventListener('cut', prevent);
            document.removeEventListener('keydown', preventKeys);
            document.removeEventListener('contextmenu', prevent);
        };
    }, []);
}
