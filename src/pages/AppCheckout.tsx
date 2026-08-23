import { useEffect, useState } from 'react';
import { PRICE_IDS, initPaddle } from '../lib/paddle';
import styles from './AppCheckout.module.css';

/* Checkout surface for the Mac app's in-app WKWebView. It is NOT the website
   account page: a fresh WKWebView has its own cookie store and is not signed
   into the site, so this page never uses Firebase/useAuth. Instead the native
   app injects the signed-in identity — window.bridgePlayUser = {uid, email} —
   via a WKUserScript at documentStart (before this code runs), and also exposes
   window.__bridgeplaySetUser for a late/again injection. That uid rides into
   Paddle custom_data, which the webhook keys on to activate the account. On
   checkout.completed we notify the app (webkit message handler) AND land on
   ?status=success as a navigation fallback the app can also detect. */

interface AppUser { uid: string; email?: string | null }

declare global {
    interface Window {
        bridgePlayUser?: AppUser;
        __bridgeplaySetUser?: (uid: string, email?: string) => void;
        webkit?: { messageHandlers?: { bridgePlay?: { postMessage: (msg: unknown) => void } } };
    }
}

const plans = [
    { key: 'yearly', name: 'Yearly', price: '$39.99', period: '/yr', save: 'Save 52% vs monthly', popular: true, priceId: PRICE_IDS.yearly, cta: 'Subscribe' },
    { key: 'monthly', name: 'Monthly', price: '$6.99', period: '/mo', save: 'Auto-renews monthly', popular: false, priceId: PRICE_IDS.monthly, cta: 'Subscribe' },
    { key: 'lifetime', name: 'Lifetime', price: '$59.99', period: '', save: 'Pay once — no renewals', popular: false, priceId: PRICE_IDS.lifetime, cta: 'Buy' },
];

function notifyNativeSuccess() {
    try {
        window.webkit?.messageHandlers?.bridgePlay?.postMessage({ event: 'purchaseComplete' });
    } catch {
        /* not running inside the app webview — no-op */
    }
}

export default function AppCheckout() {
    const alreadyDone = new URLSearchParams(window.location.search).get('status') === 'success';
    const [appUser, setAppUser] = useState<AppUser | null>(window.bridgePlayUser ?? null);
    const [ready, setReady] = useState(false);
    const [done, setDone] = useState(alreadyDone);

    useEffect(() => {
        document.title = 'Upgrade BridgePlay';

        // If we landed on the Paddle successUrl, the purchase is complete even
        // if the JS event callback never fired — tell the app and stop here.
        if (alreadyDone) {
            notifyNativeSuccess();
            return;
        }

        // Identity arrives one of two ways, and we accept both:
        //  - documentStart injection sets window.bridgePlayUser BEFORE React
        //    mounts (the app's primary path; useState above already read it),
        //  - a late __bridgeplaySetUser call after mount (fallback).
        // A short poll on window.bridgePlayUser makes the pickup robust against
        // any mount/injection ordering or re-render timing.
        window.__bridgeplaySetUser = (uid, email) => {
            window.bridgePlayUser = { uid, email };
            setAppUser({ uid, email });
        };
        if (window.bridgePlayUser) setAppUser(window.bridgePlayUser);
        const userPoll = setInterval(() => {
            if (window.bridgePlayUser) {
                setAppUser(window.bridgePlayUser);
                clearInterval(userPoll);
            }
        }, 150);

        const tryInit = () => {
            if (!window.Paddle) return false;
            initPaddle((event) => {
                if (event?.name === 'checkout.completed') {
                    setDone(true);
                    notifyNativeSuccess();
                }
            });
            setReady(true);
            return true;
        };
        let poll: ReturnType<typeof setInterval> | undefined;
        if (!tryInit()) {
            poll = setInterval(() => { if (tryInit()) clearInterval(poll); }, 200);
        }
        return () => {
            if (poll) clearInterval(poll);
            clearInterval(userPoll);
            delete window.__bridgeplaySetUser;
        };
    }, []);

    const buy = (priceId: string) => {
        if (!appUser || !ready) return;
        window.Paddle.Checkout.open({
            items: [{ priceId, quantity: 1 }],
            ...(appUser.email && { customer: { email: appUser.email } }),
            customData: { uid: appUser.uid },
            successUrl: 'https://bridgeplay.app/app-checkout?status=success',
            settings: { displayMode: 'overlay' },
        });
    };

    if (done) {
        return (
            <main className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.successIcon}>✓</div>
                    <h1>Purchase complete</h1>
                    <p className={styles.subtitle}>Your BridgePlay license is active. You can close this window and start playing.</p>
                </div>
            </main>
        );
    }

    if (!appUser) {
        return (
            <main className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.spinner} />
                    <p className={styles.subtitle}>Preparing your checkout…</p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <h1>Choose your plan</h1>
                <p className={styles.subtitle}>Every plan unlocks the full app. Signed in as {appUser.email || 'your account'}.</p>
                <div className={styles.plans}>
                    {plans.map((p) => (
                        <button
                            key={p.key}
                            className={`${styles.plan} ${p.popular ? styles.planPopular : ''}`}
                            onClick={() => buy(p.priceId)}
                            disabled={!ready}
                        >
                            {p.popular && <span className={styles.badge}>Most Popular</span>}
                            <span className={styles.planName}>{p.name}</span>
                            <span className={styles.planPrice}>{p.price}<span className={styles.planPeriod}>{p.period}</span></span>
                            <span className={styles.planSave}>{p.save}</span>
                            <span className={styles.planCta}>{ready ? p.cta : 'Loading…'}</span>
                        </button>
                    ))}
                </div>
                <p className={styles.footnote}>Secure checkout by Paddle · 7-day money-back guarantee</p>
            </div>
        </main>
    );
}
