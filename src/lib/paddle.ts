declare global {
    interface Window {
        Paddle: {
            Environment: {
                set: (environment: 'sandbox' | 'production') => void;
            };
            Initialize: (options: { token: string }) => void;
            Checkout: {
                open: (options: {
                    items: { priceId: string; quantity: number }[];
                    customer?: { email?: string };
                    customData?: Record<string, string>;
                    successUrl?: string;
                }) => void;
            };
        };
    }
}

export const SALES_LIVE = true;  // sales are live — flip to false to pause checkout

const SANDBOX = import.meta.env.VITE_PADDLE_SANDBOX === '1';

const CLIENT_TOKEN = 'live_af6735b12c46a24a37ab21ec5b9';

export const PRICE_IDS = {
    monthly: 'pri_01kq6xc966dg5krhv67j0p3dpr',
    yearly: 'pri_01kq6xh6gvfwr8csqbensbtkex',
    lifetime: 'pri_01kq6xk25va96vnhdm03mkaa33',
} as const;

let initialized = false;

export function initPaddle() {
    if (initialized || !window.Paddle) return;
    if (SANDBOX) {
        // Must run before Initialize: https://developer.paddle.com/paddlejs/methods/paddle-environment-set
        window.Paddle.Environment.set('sandbox');
    }
    window.Paddle.Initialize({ token: SANDBOX ? import.meta.env.VITE_PADDLE_SANDBOX_TOKEN : CLIENT_TOKEN });
    initialized = true;
}

export function openCheckout(priceId: string, email?: string, uid?: string) {
    initPaddle();
    window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        ...(email && { customer: { email } }),
        ...(uid && { customData: { uid } }),
        successUrl: 'https://bridgeplay.app/account',
    });
}
