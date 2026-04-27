declare global {
    interface Window {
        Paddle: {
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

const CLIENT_TOKEN = 'live_af6735b12c46a24a37ab21ec5b9';

export const PRICE_IDS = {
    monthly: 'pri_01kq6xc966dg5krhv67j0p3dpr',
    yearly: 'pri_01kq6xh6gvfwr8csqbensbtkex',
    lifetime: 'pri_01kq6xk25va96vnhdm03mkaa33',
} as const;

let initialized = false;

export function initPaddle() {
    if (initialized || !window.Paddle) return;
    window.Paddle.Initialize({ token: CLIENT_TOKEN });
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
