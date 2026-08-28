import { absoluteLocalizedUrl } from '../i18n/config';

declare global {
    interface Window {
        Paddle: {
            Environment: {
                set: (environment: 'sandbox' | 'production') => void;
            };
            Initialize: (options: { token: string; eventCallback?: (event: { name?: string }) => void }) => void;
            Checkout: {
                open: (options: {
                    items: { priceId: string; quantity: number }[];
                    customer?: { email?: string };
                    customData?: Record<string, string>;
                    successUrl?: string;
                    settings?: { displayMode?: 'overlay' | 'inline' };
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

/// A `?price=pri_…` URL override, for exercising an unlisted price (internal
/// testing) without shipping its id. Shape-validated only — the concrete id is
/// deliberately NOT a constant here, because everything in this module ships
/// in the public JS bundle. Accepting any well-formed id grants nothing: the
/// real PRICE_IDS are already public, so the only price an override can reach
/// that a Buy button cannot is one whose opaque id the caller already knows.
export function readPriceOverride(): string | null {
    const raw = new URLSearchParams(window.location.search).get('price');
    return raw && /^pri_[a-z0-9]{20,40}$/.test(raw) ? raw : null;
}

let initialized = false;

/// `eventCallback` is applied only on the FIRST init (Paddle keeps the initial
/// callback for the page's lifetime). The in-app checkout page passes one to
/// catch `checkout.completed` and signal the native app; the marketing site
/// initializes without one.
export function initPaddle(eventCallback?: (event: { name?: string }) => void) {
    if (initialized || !window.Paddle) return;
    if (SANDBOX) {
        // Must run before Initialize: https://developer.paddle.com/paddlejs/methods/paddle-environment-set
        window.Paddle.Environment.set('sandbox');
    }
    window.Paddle.Initialize({
        token: SANDBOX ? import.meta.env.VITE_PADDLE_SANDBOX_TOKEN : CLIENT_TOKEN,
        ...(eventCallback && { eventCallback }),
    });
    initialized = true;
}

/// successUrl is resolved per call, in the language the buyer is reading. A
/// bare '/account' default would land a Japanese buyer on the English account
/// page the instant their payment succeeded — and the stored-preference
/// redirect in main.tsx cannot rescue that, because a visitor who arrived from
/// a search result has never opened the language selector.
export function openCheckout(
    priceId: string,
    email?: string,
    uid?: string,
    successUrl: string = absoluteLocalizedUrl('/account'),
) {
    initPaddle();
    window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        ...(email && { customer: { email } }),
        ...(uid && { customData: { uid } }),
        successUrl,
    });
}
