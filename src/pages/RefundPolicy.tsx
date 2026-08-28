import { Link } from 'react-router-dom';
import LegalLayout from '../components/layout/LegalLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useI18n } from '../i18n/useI18n';

export default function RefundPolicy() {
    const { t } = useI18n();

    useDocumentMeta({
        title: t.meta.refund.title,
        description: "BridgePlay's refund policy: a 7-day money-back guarantee on every plan, how the window applies to renewal charges, and what to include in a request.",
        canonicalPath: '/refund-policy',
    });

    return (
        <LegalLayout title="Refund Policy" lastUpdated="August 12, 2026">
            <h2>Try It Free First</h2>
            <p>BridgePlay offers a 7-day free trial with no payment details required, claimed when you create your account inside the app. Please use it: game compatibility varies, and the trial is the reliable way to confirm that your specific games and your Mac work before any money changes hands.</p>

            <h2>7-Day Money-Back Guarantee</h2>
            <p>If you are not satisfied with a purchase, you may request a full refund within <strong>7 days</strong> of the payment. This applies to all three plans — Monthly, Yearly, and Lifetime — and you do not need to justify the request.</p>

            <h2>Renewal Charges</h2>
            <p>Each payment has its own 7-day window, including automatic renewal charges. If a Monthly or Yearly renewal charges you and you no longer want the subscription, tell us within 7 days of that charge and we will refund it and cancel the subscription. A renewal does not consume, or reset, the window belonging to any earlier payment.</p>
            <p>Cancelling part-way through a period you have already paid for is not itself a refund: you keep access until that period ends. See the <Link to="/terms">terms of service</Link> for how cancellation works.</p>

            <h2>How to Request a Refund</h2>
            <p>Contact us through the <Link to="/#contact">contact form</Link> on this website and include:</p>
            <ul>
                <li>Your <strong>Paddle order ID</strong> (it is in the receipt email Paddle sent you for the charge)</li>
                <li>The email address you used at checkout, if it differs from the one you are writing from</li>
                <li>Which charge you want refunded, and — optionally, it genuinely helps us fix things — what went wrong</li>
            </ul>
            <p>Refunds are issued to the original payment method. Paddle typically completes them within 5–10 business days, though how quickly the money appears depends on your bank or card issuer.</p>

            <h2>Merchant of Record</h2>
            <p>Paddle is the merchant of record for every BridgePlay purchase. That means Paddle, not us, processed your payment, holds your payment method, and appears on your bank statement — and Paddle issues the refund once we approve it. You can also contact Paddle directly about a charge.</p>

            <h2>Statutory Rights (EU, UK and Elsewhere)</h2>
            <p>This guarantee is offered in addition to your rights under law, and nothing here reduces them. If you are a consumer in the EU or UK, you generally have a statutory 14-day right to withdraw from a distance purchase of digital content, and separate rights if the software is faulty or not as described. Where your statutory rights are more generous than this policy, your statutory rights apply.</p>

            <h2>After 7 Days</h2>
            <p>Requests made after the 7-day window are reviewed case by case. If BridgePlay stopped working because of something we changed or broke, tell us — we would rather fix it or refund you than leave you stuck.</p>

            <h2>Licence Revocation</h2>
            <p>When a refund is issued, the licence it paid for is deactivated and BridgePlay returns to its unlicensed state. Nothing on your Mac is deleted: your game files, save data, and per-game settings remain yours and stay where they are.</p>
        </LegalLayout>
    );
}
