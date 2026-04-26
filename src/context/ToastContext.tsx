import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import Toast from '../components/ui/Toast';

type ToastType = 'success' | 'error';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
    visible: boolean;
}

interface ToastContextValue {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const idRef = useRef(0);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = ++idRef.current;
        setToasts(prev => [...prev, { id, message, type, visible: false }]);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: true } : t));
            });
        });

        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 500);
        }, 4500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast toasts={toasts} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
