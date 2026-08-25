import { useEffect, useState } from 'react';
import { initPaddle, readPriceOverride } from '../lib/paddle';
import { APP_PLAN_ORDER, PLANS } from '../lib/plans';
import { useI18n } from '../i18n/useI18n';
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

/* Display amount for the unlisted test plan. Must match the Paddle price the
   ?price= override points at — Paddle shows the authoritative amount in the
   checkout overlay before any payment. Goes away with the override. */
const TEST_PLAN_PRICE = '$0.71';

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
    const { t } = useI18n();

    /* Its own effect, keyed on the dictionary: the init effect below must run
       once and only once, so the title cannot share its empty dep array. */
    useEffect(() => {
        document.title = t.appCheckout.documentTitle;
    }, [t]);

    useEffect(() => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot Paddle + identity bootstrap; alreadyDone is fixed for the life of the page
    }, []);

    const buy = (priceId: string) => {
        if (!appUser || !ready) return;
        window.Paddle.Checkout.open({
            // An unlisted ?price= override (internal testing) beats the plan
            // the button was rendered for.
            items: [{ priceId: readPriceOverride() ?? priceId, quantity: 1 }],
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
                    <h1>{t.appCheckout.doneTitle}</h1>
                    <p className={styles.subtitle}>{t.appCheckout.doneBody}</p>
                </div>
            </main>
        );
    }

    if (!appUser) {
        return (
            <main className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.spinner} />
                    <p className={styles.subtitle}>{t.appCheckout.preparing}</p>
                </div>
            </main>
        );
    }

    // An unlisted ?price= override (internal testing) adds an EXTRA card beside
    // the real plans — it never replaces them, and the plan cards always charge
    // the price they display.
    const override = readPriceOverride();

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <h1>{t.appCheckout.title}</h1>
                <p className={styles.subtitle}>{t.appCheckout.subtitle(appUser.email || t.appCheckout.yourAccount)}</p>
                <div className={styles.plans}>
                    {APP_PLAN_ORDER.map((key) => {
                        const p = PLANS[key];
                        const copy = t.plans[key];
                        return (
                            <button
                                key={key}
                                className={`${styles.plan} ${p.popular ? styles.planPopular : ''}`}
                                onClick={() => buy(p.priceId)}
                                disabled={!ready}
                            >
                                {p.popular && <span className={styles.badge}>{t.pricing.mostPopular}</span>}
                                <span className={styles.planName}>{copy.name}</span>
                                <span className={styles.planPrice}>{p.price}<span className={styles.planPeriod}>{p.period}</span></span>
                                <span className={styles.planSave}>{copy.save}</span>
                                <span className={styles.planCta}>{ready ? copy.cta : t.appCheckout.loading}</span>
                            </button>
                        );
                    })}
                    {override && (
                        <button
                            className={styles.plan}
                            onClick={() => buy(override)}
                            disabled={!ready}
                        >
                            <span className={styles.planName}>{t.appCheckout.testPlanName}</span>
                            <span className={styles.planPrice}>{TEST_PLAN_PRICE}<span className={styles.planPeriod}>/day</span></span>
                            <span className={styles.planSave}>{t.appCheckout.testPlanNote}</span>
                            <span className={styles.planCta}>{ready ? t.plans.monthly.cta : t.appCheckout.loading}</span>
                        </button>
                    )}
                </div>
                <p className={styles.footnote}>{t.appCheckout.footnote}</p>
            </div>
        </main>
    );
}
