import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Dictionary } from '../i18n/types';

const firebaseConfig = {
    apiKey: "AIzaSyBTqWbkTUzQRG6xNDYAWgjzNDcaSNtvutU",
    // Our own domain, not <project>.firebaseapp.com, so Google's consent
    // screen says "continue to bridgeplay.app". Requires the /__/auth/*
    // rewrite in vercel.json and the bridgeplay.app redirect URI on the
    // OAuth web client (added 2026-08-25).
    authDomain: "bridgeplay.app",
    projectId: "bridgeplay-8f4f6",
    storageBucket: "bridgeplay-8f4f6.firebasestorage.app",
    messagingSenderId: "438760266610",
    appId: "1:438760266610:ios:6c8c9319aefa219c4e5beb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* Takes the dictionary explicitly: this is a plain module, not a component, so
   it cannot read the i18n context itself. Callers pass the `t` they already
   hold. */
export function friendlyAuthError(code: string, t: Dictionary): string {
    const map: Record<string, string> = {
        'auth/invalid-email': t.authErrors.invalidEmail,
        'auth/user-disabled': t.authErrors.userDisabled,
        'auth/user-not-found': t.authErrors.userNotFound,
        'auth/wrong-password': t.authErrors.wrongPassword,
        'auth/invalid-credential': t.authErrors.invalidCredential,
        'auth/email-already-in-use': t.authErrors.emailInUse,
        'auth/weak-password': t.authErrors.weakPassword,
        'auth/too-many-requests': t.authErrors.tooManyRequests,
        'auth/network-request-failed': t.authErrors.networkFailed,
    };
    return map[code] || t.authErrors.generic;
}
