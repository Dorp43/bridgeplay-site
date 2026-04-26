import LegalLayout from '../components/layout/LegalLayout';

export default function TermsAndConditions() {
    return (
        <LegalLayout title="Terms of Service" lastUpdated="April 26, 2026">
            <h2>1. Acceptance of Terms</h2>
            <p>By downloading, installing, or using BridgePlay ("the Software"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Software.</p>

            <h2>2. License</h2>
            <p>BridgePlay grants you a personal, non-exclusive, non-transferable license to use the Software on your Mac computer. This license is for personal use only.</p>

            <h2>3. Free Trial</h2>
            <p>BridgePlay offers a 7-day free trial. After the trial period, a one-time purchase is required to continue using the Software. Each device is eligible for one free trial.</p>

            <h2>4. Payment</h2>
            <p>Payments are processed securely through Paddle, our merchant of record. By purchasing a license, you agree to Paddle's terms of service in addition to these terms.</p>

            <h2>5. Intellectual Property</h2>
            <p>BridgePlay and all associated intellectual property remain the property of the developer. You may not reverse engineer, decompile, or modify the Software.</p>

            <h2>6. Third-Party Software</h2>
            <p>BridgePlay uses Wine and other open-source components to enable Windows game compatibility. These components are subject to their own licenses (LGPL). BridgePlay does not include or distribute any games.</p>

            <h2>7. Disclaimer of Warranties</h2>
            <p>The Software is provided "as is" without warranties of any kind. Game compatibility may vary and is not guaranteed for all titles.</p>

            <h2>8. Limitation of Liability</h2>
            <p>In no event shall BridgePlay be liable for any indirect, incidental, or consequential damages arising from the use of the Software.</p>

            <h2>9. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the Software after changes constitutes acceptance of the new terms.</p>

            <h2>10. Contact</h2>
            <p>For questions about these terms, contact us at the <a href="/#contact">contact form</a> on our website.</p>
        </LegalLayout>
    );
}
