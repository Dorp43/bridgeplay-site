import { Link } from 'react-router-dom';
import LegalLayout from '../components/layout/LegalLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function TermsAndConditions() {
    useDocumentMeta({
        title: 'Terms of Service — BridgePlay',
        description: 'The terms that govern your use of the BridgePlay software and licence, including subscription pricing, automatic renewal, cancellation, intellectual property and disclaimers.',
        canonicalPath: '/terms',
    });

    return (
        <LegalLayout title="Terms of Service" lastUpdated="August 12, 2026">
            <h2>1. Acceptance of Terms</h2>
            <p>By downloading, installing, or using BridgePlay ("the Software"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Software.</p>

            <h2>2. Licence</h2>
            <p>BridgePlay grants you a personal, non-exclusive, non-transferable licence to use the Software. The licence is tied to your BridgePlay account rather than to a single machine: you may sign in and use the Software on any Mac you personally own. The licence is for personal use only — you may not share your account credentials with other people or use one licence to serve other users.</p>
            <p>The Software is a launcher. It does not include, distribute, or provide access to any game. You are responsible for lawfully obtaining the game files you point it at.</p>

            <h2>3. Free Trial</h2>
            <p>BridgePlay offers a 7-day free trial with full functionality and no payment details required. The trial is claimed when you create your account inside the app on first launch.</p>
            <p>The trial is limited to one per Mac. To enforce this, the Software stores a one-way hash of your Mac's hardware identifier and records the date the trial started against it. Reinstalling the Software or creating a new account on the same Mac resumes the original 7-day period; it does not start a new one.</p>

            <h2>4. Plans, Prices and Automatic Renewal</h2>
            <p>After the trial, continued use requires a paid plan. Three plans are offered, and all three unlock the same functionality:</p>
            <ul>
                <li><strong>Monthly — $6.99 per month.</strong> A subscription that renews automatically every month.</li>
                <li><strong>Yearly — $39.99 per year.</strong> A subscription that renews automatically every 12 months.</li>
                <li><strong>Lifetime — $59.99 once.</strong> A one-time payment. It is not a subscription, never renews, and includes future updates to the Software.</li>
            </ul>
            <p><strong>Automatic renewal.</strong> The Monthly and Yearly plans are recurring subscriptions. Unless you cancel first, your payment method is charged again automatically at the end of each billing period — $6.99 every month for the Monthly plan, or $39.99 every 12 months for the Yearly plan — and your access continues without interruption. Renewal continues indefinitely until you cancel. Prices are in US dollars; taxes may be added at checkout depending on your location.</p>
            <p><strong>Price changes.</strong> We may change subscription prices. If we do, we will tell you before a changed price applies to a renewal, and you may cancel before that renewal if you do not want to continue at the new price.</p>

            <h2>5. Cancellation and What Happens to Your Access</h2>
            <p>You may cancel a subscription at any time, and you do not need a reason. To cancel, use the <a href="/#contact">contact form</a> on this website, or use the subscription-management link in the payment receipt that Paddle emails you for each charge.</p>
            <p>When you cancel, the cancellation takes effect at the end of the billing period you have already paid for. You keep full access until that date, you are not charged again, and we do not pro-rate or refund the remainder of a period you chose to cancel mid-way (separately from this, the <Link to="/refund-policy">refund policy</Link> may apply to a recent charge).</p>
            <p>After a subscription lapses, the Software stops launching games and returns to its unlicensed state. Nothing on your Mac is deleted: your game files, save data, and per-game settings remain in place and are yours. Starting a new subscription restores access to them. A Lifetime licence does not lapse.</p>

            <h2>6. Payment and Merchant of Record</h2>
            <p>Payments are processed by Paddle, which acts as the merchant of record for all purchases. Paddle handles the transaction, taxes, and the payment method on file, and appears on your bank statement. By purchasing, you also agree to Paddle's terms of service. We do not receive or store your card details.</p>

            <h2>7. Refunds</h2>
            <p>Every plan carries a 7-day money-back guarantee, and statutory consumer rights apply on top of it. See the <Link to="/refund-policy">refund policy</Link> for the window, how it applies to renewal charges, and what to include in a request.</p>

            <h2>8. Intellectual Property</h2>
            <p>BridgePlay and all associated intellectual property remain the property of the developer. You may not reverse engineer, decompile, or modify the Software, except where such a restriction is prohibited by applicable law or where the licence of a bundled open-source component grants you that right.</p>

            <h2>9. Third-Party Software</h2>
            <p>BridgePlay bundles Wine 11.0, built from upstream source, together with other open-source components to run Windows software. These components are licensed under their own terms (Wine under the LGPL v2.1-or-later), and the third-party notices shipped inside the app list them with their licences and source provenance. BridgePlay does not include or distribute any game, nor any Microsoft code.</p>

            <h2>10. Requirements and Disclaimer of Warranties</h2>
            <p>BridgePlay requires an Apple Silicon Mac (M1 or later), macOS 14 or newer, and Rosetta 2. Intel Macs are not supported. The Software is provided "as is" without warranties of any kind. Game compatibility varies and is not guaranteed for any specific title: DirectX 12 is not supported, and games protected by kernel-level anti-cheat will not run. Use the free trial to confirm your own games work before paying.</p>

            <h2>11. Limitation of Liability</h2>
            <p>To the extent permitted by law, BridgePlay shall not be liable for any indirect, incidental, or consequential damages arising from the use of the Software. Nothing in these terms limits liability that cannot be limited under applicable law, including your statutory consumer rights.</p>

            <h2>12. Changes to Terms</h2>
            <p>We may update these terms from time to time. The date at the top of this page reflects the most recent change. Continued use of the Software after changes constitutes acceptance of the new terms.</p>

            <h2>13. Contact</h2>
            <p>For questions about these terms, contact us at the <a href="/#contact">contact form</a> on our website.</p>
        </LegalLayout>
    );
}
