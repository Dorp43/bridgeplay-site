import LegalLayout from '../components/layout/LegalLayout';

export default function PrivacyPolicy() {
    return (
        <LegalLayout title="Privacy Policy" lastUpdated="April 26, 2026">
            <h2>1. Information We Collect</h2>
            <p>BridgePlay collects minimal information necessary to operate the service:</p>
            <p><strong>Account information:</strong> When you create an account, we collect your email address for authentication purposes.</p>
            <p><strong>Device identifier:</strong> A one-way hash of your device's hardware ID is stored to manage trial eligibility. This hash cannot be reversed to identify your device.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information solely to:</p>
            <ul>
                <li>Authenticate your account and manage your license</li>
                <li>Determine free trial eligibility</li>
                <li>Deliver app updates</li>
            </ul>

            <h2>3. Data Storage</h2>
            <p>Your data is stored securely using Google Firebase (Firestore). We do not store passwords — authentication is handled by Firebase Auth.</p>

            <h2>4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <p><strong>Firebase:</strong> For authentication and data storage (subject to Google's privacy policy).</p>
            <p><strong>Paddle:</strong> For payment processing (subject to Paddle's privacy policy). We do not store your payment details.</p>

            <h2>5. What We Don't Collect</h2>
            <p>We do not collect or track:</p>
            <ul>
                <li>Your gaming activity or usage patterns</li>
                <li>Your files or personal data on your Mac</li>
                <li>Analytics or telemetry data</li>
                <li>Your location</li>
            </ul>

            <h2>6. Data Deletion</h2>
            <p>You may request deletion of your account and all associated data at any time by contacting us. Upon deletion, all your data will be permanently removed from our systems.</p>

            <h2>7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Changes will be reflected on this page with an updated date.</p>

            <h2>8. Contact</h2>
            <p>For privacy concerns, contact us at the <a href="/#contact">contact form</a> on our website.</p>
        </LegalLayout>
    );
}
