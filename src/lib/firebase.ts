import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBTqWbkTUzQRG6xNDYAWgjzNDcaSNtvutU",
    authDomain: "bridgeplay-8f4f6.firebaseapp.com",
    projectId: "bridgeplay-8f4f6",
    storageBucket: "bridgeplay-8f4f6.firebasestorage.app",
    messagingSenderId: "438760266610",
    appId: "1:438760266610:ios:6c8c9319aefa219c4e5beb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function friendlyAuthError(code: string): string {
    const map: Record<string, string> = {
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return map[code] || 'Something went wrong. Please try again.';
}
