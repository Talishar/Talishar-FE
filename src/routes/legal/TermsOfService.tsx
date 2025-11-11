import React from 'react';
import styles from './LegalPages.module.css';

const TermsOfService: React.FC = () => {
  return (
    <main className={styles.legalContainer}>
      <div className={styles.content}>
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last Updated: November 4, 2025</p>

        <section className={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Talishar ("the Service"), you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. License</h2>
          <p>
            Talishar grants you a non-exclusive, non-transferable, revocable license to use the Service for personal, 
            non-commercial purposes. This license does not include:
          </p>
          <ul>
            <li>Copying or distributing the Service or its content</li>
            <li>Modifying or creating derivative works</li>
            <li>Reverse engineering or attempting to derive source code</li>
            <li>Using the Service for any commercial purpose</li>
            <li>Attempting to gain unauthorized access to the Service or its systems</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account information and password. 
            You agree to accept responsibility for all activity under your account. You must immediately notify 
            us of any unauthorized use of your account or any other breach of security.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Engage in harassment, abuse, or threatening behavior toward other users</li>
            <li>Post content that is illegal, infringing, or violates third-party rights</li>
            <li>Engage in hacking, phishing, or attempting to exploit the Service</li>
            <li>Use automated tools or bots to access the Service without permission</li>
            <li>Spam, flood, or engage in denial-of-service attacks</li>
            <li>Attempt to gain unauthorized access to restricted areas</li>
            <li>Use the Service in any way that violates applicable laws</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Intellectual Property Rights</h2>
          <p>
            Talishar is an unofficial community platform. Flesh and Blood, card images, and related intellectual 
            property are trademarks and property of Legend Story Studios. We operate under fair use and with respect 
            for intellectual property rights. We are not affiliated with, endorsed by, or connected to Legend Story Studios.
          </p>
          <p>
            Talishar's source code is open-source and available under applicable license terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Disclaimers</h2>
          <p>
            The Service is provided "as is" and "as available." Talishar makes no warranties about:
          </p>
          <ul>
            <li>The accuracy or reliability of content</li>
            <li>The absence of viruses or other harmful components</li>
            <li>Uninterrupted access or availability</li>
            <li>The accuracy of rules implementation</li>
          </ul>
          <p>
            Talishar is not responsible for inaccurate rules representation. For official Flesh and Blood rulings, 
            consult the official FAB rules or Judge Hub Discord.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Talishar shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages, including but not limited to loss of data, loss of profit, 
            or business interruption arising from your use or inability to use the Service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account and access to the Service at any time, 
            without notice, for conduct we believe violates these Terms or is otherwise inappropriate or harmful.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Modifications to Service</h2>
          <p>
            Talishar reserves the right to modify, suspend, or discontinue the Service or any portion thereof 
            at any time. We will attempt to notify users of significant changes.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Third-Party Links</h2>
          <p>
            The Service may contain links to third-party websites. We are not responsible for the content, 
            accuracy, or practices of these external sites. Your use of third-party websites is governed by their terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Advertisements</h2>
          <p>
            Talishar displays advertisements through Google AdSense. We are not responsible for the content of 
            advertisements or any issues arising from ads. Google's use of cookies and similar technologies is 
            governed by Google's policies.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Community Guidelines</h2>
          <p>
            We maintain a respectful, harassment-free community. Users are expected to:
          </p>
          <ul>
            <li>Treat other players with respect</li>
            <li>Follow the spirit of fair play</li>
            <li>Report bugs and issues constructively</li>
            <li>Help maintain a positive community</li>
          </ul>
          <p>
            Violations may result in warnings, temporary suspension, or permanent bans at our discretion.
          </p>
        </section>

        <section className={styles.section}>
          <h2>13. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by and construed in accordance with the laws applicable 
            to the jurisdiction where Talishar's servers are located, without regard to its conflict of law provisions.
          </p>
        </section>

        <section className={styles.section}>
          <h2>14. Changes to Terms</h2>
          <p>
            Talishar reserves the right to modify these Terms at any time. Significant changes will be posted 
            on our website. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>15. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
          </p>
        </section>

        <section className={styles.section}>
          <h2>16. Contact Us</h2>
          <p>
            If you have questions about these Terms, please reach out to us:
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

export default TermsOfService;
