import React from 'react';
import styles from './LegalPages.module.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <main className={styles.legalContainer}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: November 4, 2025</p>

        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            Talishar ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and otherwise handle your information when you visit 
            our website and use our services.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Information You Provide Directly</h3>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your email address, username, and password.</li>
            <li><strong>Game Data:</strong> We store information about your games, deck builds, and game history on our platform.</li>
            <li><strong>Communications:</strong> We may collect messages, feedback, and communications you send us.</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Log Data:</strong> IP address, browser type, operating system, pages visited, and timestamps.</li>
            <li><strong>Cookies and Similar Technologies:</strong> We use cookies to enhance user experience and track site usage.</li>
            <li><strong>Analytics:</strong> We use Google Analytics and similar services to understand how users interact with our platform.</li>
          </ul>

          <h3>2.3 Third-Party Information</h3>
          <p>We may receive information from third-party services, analytics providers, and advertising partners.</p>
        </section>

        <section className={styles.section}>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain, and improve our services</li>
            <li>To process transactions and send related information</li>
            <li>To authenticate users and prevent fraud</li>
            <li>To personalize user experience and provide targeted content</li>
            <li>To send promotional emails and updates (with your consent)</li>
            <li>To comply with legal obligations</li>
            <li>To analyze platform usage and trends</li>
            <li>To display personalized advertisements through Google AdSense</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share information:
          </p>
          <ul>
            <li>With service providers who assist us in operating our website</li>
            <li>With analytics and advertising partners (in anonymized form)</li>
            <li>When required by law or to protect our rights and safety</li>
            <li>With your consent for specific purposes</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to:
          </p>
          <ul>
            <li>Remember your preferences and login information</li>
            <li>Analyze platform usage through Google Analytics</li>
            <li>Display personalized ads through Google AdSense</li>
            <li>Enable essential platform functionality</li>
          </ul>
          <p>
            You can control cookie settings through your browser. Disabling cookies may affect platform functionality.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Google AdSense</h2>
          <p>
            Talishar uses Google AdSense to display advertisements. Google may collect information about your 
            browsing behavior to deliver personalized ads. For more information, see 
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"> Google's Privacy Policy</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information against 
            unauthorized access, alteration, disclosure, or destruction. However, no online platform is completely secure.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Data Retention</h2>
          <p>
            We retain your information for as long as necessary to provide our services and comply with legal obligations. 
            You can request deletion of your account and associated data at any time through your account settings.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information:</p>
          <ul>
            <li>Right to access your information</li>
            <li>Right to correct inaccurate information</li>
            <li>Right to request deletion</li>
            <li>Right to opt-out of certain processing</li>
            <li>Right to data portability</li>
          </ul>
          <p>
            To exercise these rights, please contact us at the email address provided below.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Children's Privacy</h2>
          <p>
            Talishar is not directed to children under 13. We do not knowingly collect personal information from 
            children under 13. If we learn we have collected such information, we will delete it promptly.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by 
            posting the updated policy on our website. Your continued use of Talishar constitutes acceptance of our Privacy Policy.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <ul>
            <li><strong>Discord:</strong> <a href="https://discord.gg/JykuRkdd5S" target="_blank" rel="noopener noreferrer">Join our Discord community</a></li>
            <li><strong>GitHub:</strong> <a href="https://github.com/Talishar/Talishar" target="_blank" rel="noopener noreferrer">Visit our GitHub repository</a></li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
