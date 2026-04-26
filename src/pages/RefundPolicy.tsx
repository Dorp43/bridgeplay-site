import LegalLayout from '../components/layout/LegalLayout';

export default function RefundPolicy() {
    return (
        <LegalLayout title="Refund Policy" lastUpdated="April 26, 2026">
            <h2>Free Trial</h2>
            <p>BridgePlay offers a 7-day free trial so you can test the software before purchasing. We encourage you to use the trial period to ensure the app works well with your games and hardware.</p>

            <h2>Refund Window</h2>
            <p>If you are not satisfied with your purchase, you may request a full refund within <strong>7 days</strong> of purchase.</p>

            <h2>How to Request a Refund</h2>
            <p>To request a refund, contact us at the <a href="/#contact">contact form</a> on our website with your purchase email address. Refunds are typically processed within 5-10 business days.</p>

            <h2>After 7 Days</h2>
            <p>Refund requests made after the 7-day window will be reviewed on a case-by-case basis. We want you to be happy with your purchase and will do our best to resolve any issues.</p>

            <h2>License Revocation</h2>
            <p>Upon a successful refund, your BridgePlay license will be deactivated.</p>
        </LegalLayout>
    );
}
