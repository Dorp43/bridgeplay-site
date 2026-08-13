import LegalLayout from '../components/layout/LegalLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function PrivacyPolicy() {
    useDocumentMeta({
        title: 'Privacy Policy — BridgePlay',
        description: 'How BridgePlay handles your data: the app collects no telemetry, this website uses cookieless aggregate analytics, and every processor we use is listed here.',
        canonicalPath: '/privacy-policy',
    });

    return (
        <LegalLayout title="Privacy Policy" lastUpdated="August 12, 2026">
            <h2>1. The App and This Website Are Different</h2>
            <p>BridgePlay is two things: the Mac app you install, and this website. They collect different data, so this policy keeps them apart.</p>
            <p><strong>The app collects no telemetry.</strong> It does not report which games you own, which games you launch, how long you play, your hardware specs, crash reports, or any usage analytics. There is no analytics SDK inside the app.</p>
            <p><strong>This website does count visits.</strong> It uses Vercel Analytics, which is cookieless and aggregate — see section 4.</p>

            <h2>2. What the App Collects</h2>
            <p><strong>Account information:</strong> your email address, used to authenticate you and to attach your licence to your account.</p>
            <p><strong>Device hash:</strong> a one-way SHA-256 hash of your Mac's hardware identifier. It is used for one purpose — deciding whether this Mac has already used its one free trial — and stored alongside the date that trial started. It cannot be reversed to identify your Mac.</p>
            <p><strong>Licence state:</strong> whether your account is on a trial, licensed, or neither, plus the date the trial started.</p>
            <p>Your game files, save data, library layout, and per-game settings stay on your Mac. They are never uploaded. The app also stores a signed local copy of your last verified licence check so it keeps working for up to 24 hours offline; that copy never leaves your Mac.</p>

            <h2>3. What This Website Collects</h2>
            <p><strong>Account and purchase pages:</strong> if you sign in, the same account information as above. If you buy a plan, the checkout is operated by Paddle.</p>
            <p><strong>Contact form:</strong> the name, email address, and message you type are sent to Formspree, which forwards them to us by email so we can reply.</p>
            <p><strong>Aggregate visit analytics:</strong> Vercel Analytics records page views and referrers without cookies and without building a profile of you. It also records a short, fixed list of named events, so we can tell which parts of the site actually work: that a download link or a link to the download page was clicked and which part of the page it was clicked from, that a page was not found and which URL was requested, and that a first interaction happened on the home page and whether it came from a pointer or the keyboard. We attach no account, email, or device identifier to any of them.</p>

            <h2>4. Processors We Use</h2>
            <p>This is the complete list of third parties that process data for us:</p>
            <ul>
                <li><strong>Google Firebase</strong> — account authentication (Firebase Auth) and data storage (Firestore) for your email, device hash, and licence state. Subject to Google's privacy policy.</li>
                <li><strong>Paddle</strong> — payment processing and merchant of record for all purchases, including your billing details and payment method. Subject to Paddle's privacy policy. We never receive or store your card details.</li>
                <li><strong>Vercel</strong> — hosting for this website, plus Vercel Analytics for cookieless, aggregate visit counts and the named events listed in section 3. Server logs necessarily include request metadata such as IP address.</li>
                <li><strong>Formspree</strong> — delivery of messages submitted through the contact form on this website.</li>
            </ul>

            <h2>5. How We Use Your Information</h2>
            <ul>
                <li>Authenticate your account and manage your licence</li>
                <li>Determine free trial eligibility</li>
                <li>Process payments and handle refunds</li>
                <li>Reply to messages you send us</li>
                <li>Deliver app updates</li>
                <li>Understand, in aggregate, how much traffic this website gets</li>
            </ul>
            <p>We do not sell your data, and we do not run advertising or ad tracking anywhere.</p>

            <h2>6. What We Don't Collect</h2>
            <p>Specifically, we do not collect or track:</p>
            <ul>
                <li>Your gaming activity — which games you launch, or for how long</li>
                <li>Any telemetry, usage analytics, or crash reporting from inside the app</li>
                <li>Your files, save data, or anything else on your Mac</li>
                <li>Your location</li>
                <li>Your payment card details</li>
            </ul>

            <h2>7. Data Storage and Retention</h2>
            <p>Account data is stored in Google Firebase (Firestore). We do not store passwords — authentication is handled by Firebase Auth. We keep your account data while your account exists, and payment records for as long as Paddle and tax law require.</p>

            <h2>8. Data Deletion</h2>
            <p>You may request deletion of your account and all associated data at any time using the <a href="/#contact">contact form</a>. Upon deletion, your account record is permanently removed. One exception, so this is not a surprise: the device-trial record that says "this Mac has used its free trial" is retained, because deleting it would turn the 7-day trial into an unlimited one. That record contains only the hardware hash and dates.</p>

            <h2>9. Your Rights</h2>
            <p>If you are in the EU, UK, or another jurisdiction with equivalent law, you have the right to access, correct, export, or delete your personal data, and to object to processing. Contact us and we will action it.</p>

            <h2>10. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Changes will be reflected on this page with an updated date.</p>

            <h2>11. Contact</h2>
            <p>For privacy concerns, contact us at the <a href="/#contact">contact form</a> on our website.</p>
        </LegalLayout>
    );
}
