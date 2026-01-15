import React from 'react';
import styles from './AboutSection.module.css';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';

const AboutSection: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);

  const faqs = [
    {
      question: "Is Talishar free to play?",
      answer: "Yes! Talishar is completely free to play. You can enjoy all features without spending any money. We offer exclusive cosmetics for our supporters and those who want to help fund development."
    },
    {
      question: "Do I need to download anything?",
      answer: "No downloads required! Talishar runs directly in your web browser on desktop, tablet, or mobile."
    },
    {
      question: "Can I play offline?",
      answer: "Talishar is an online platform that requires an internet connection to play. This allows you to compete against real players worldwide in real-time."
    },
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button on the main page and enter your email and password. Your account is created instantly, and you can start playing right away."
    },
    {
      question: "Is this an official Flesh & Blood platform?",
      answer: "Talishar is an unofficial community-created platform. It's not affiliated with Legend Story Studios."
    },
    {
      question: "What if I find a bug or have suggestions?",
      answer: "We love feedback, this platform wouldn't be the same without it! You can report issues or suggest features through our <a href=\"https://discord.gg/JykuRkdd5S\" target=\"_blank\">Discord</a> server. Players input helps us improve Talishar."
    },
    {
        question: "Why is there no matchmaking or ranked play?",
        answer: "Talishar is designed as a no-stakes testing platform for players to experiment with decks and strategies. If you wish to have competitive play, head to <a href=\"https://fabtcg.com/organised-play/\" target=\"_blank\">organised play</a> and join official flesh and blood tournaments!"
    },
    {
        question: "Where can I play in person?",
        answer: " Check out LSS official <a href=\"https://fabtcg.com/locator/?tab=event&privateMode=false\" target=\"_blank\">event locator</a> to find local tournaments and events."
    },
    {
        question: "How can I become a contributor?",
        answer: "Talishar is an open-source project. Head to our discord #dev-general channel to get involved, and check our <a href=\"https://github.com/Talishar/Talishar/blob/main/README.md\" target=\"_blank\">GitHub</a> for contribution guidelines."
    }

  ];

  return (
    <section className={styles.aboutContainer}>
      <div className={styles.content}>
        <h2>Welcome to Talishar</h2>
        <p className={styles.tagline}>
          The Unofficial Online Platform for Flesh & Blood
        </p>

        <p className={styles.description}>
          Talishar is the free, browser-based community platform where over 9,000+ players daily
          compete in real-time games of Flesh & Blood. Bring your deck, face off against
          players worldwide, and master your heroes.
        </p>

        {/* About Talishar Section */}
        <div className={styles.aboutTalisharSection}>
          <h3>🎮 What is Talishar?</h3>
          <p>
            Talishar is a passion project built by the Flesh & Blood community for the community. We created this platform to provide players 
            with a free, accessible, and welcoming space to play and test deck ideas. Whether you're a casual player looking to learn the game 
            before joining a local armory or a competitive player wanting some reps. Talishar is there for the community.
          </p>
        </div>

        {/* Who Maintains Talishar */}
        <div className={styles.maintenanceSection}>
          <h3>👥 Who Maintains Talishar?</h3>
          <p>
            Talishar is maintained by a dedicated team of volunteer developers and community members who are passionate about Flesh & Blood. 
            Our team works entirely on a volunteer basis to keep the platform running, code new card sets, fix bugs, and implement new features. 
            We're supported by the community through optional contributions platform like Metafy. It help cover server costs and fund development.
          </p>
          <p className={styles.contributorInfo}>
            Want to contribute? Talishar is open-source! Join us on <a href="https://discord.gg/JykuRkdd5S" target="_blank" rel="noopener noreferrer">Discord</a> or 
            check our <a href="https://github.com/Talishar/Talishar" target="_blank" rel="noopener noreferrer">GitHub repository</a> to get involved.
          </p>
        </div>

        {/* LSS Relationship */}
        <div className={styles.lssRelationship}>
          <h3>⚖️ Our Relationship with Legend Story Studios</h3>
          <p>
            <strong>Talishar is an unofficial platform and independent.</strong> We are not affiliated with, endorsed by, or connected to Legend Story Studios (LSS), 
            the creators of Flesh & Blood. Talishar operates as a fan-made platform created to celebrate and support the FAB community.
          </p>
          <p>
            While we strive to maintain rules accuracy, Talishar may not be a completely accurate representation of the official rules. 
            For official rulings and clarifications, we recommend consulting the judge community on the
            <a href="https://discord.com/invite/flesh-and-blood-judge-hub-874145774135558164" target="_blank" rel="noopener noreferrer"> Judge Hub Discord</a> or 
            visiting the <a href="https://fabtcg.com/rules-and-policy-center/" target="_blank" rel="noopener noreferrer">official FAB rules and policy center</a>.
          </p>
        </div>

        {/* Features & Stats */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3>⚡ Instant Play</h3>
            <p>No downloads required. Play directly in your browser</p>
          </div>

          <div className={styles.featureCard}>
            <h3>🌍 Active Community</h3>
            <p>Join 9,000+ daily players worldwide</p>
          </div>

          <div className={styles.featureCard}>
            <h3>📱 Mobile Friendly</h3>
            <p>Play on your phone, tablet, or computer</p>
          </div>

          <div className={styles.featureCard}>
            <h3>📣 Open to feedback and suggestions</h3>
            <p>We value your input to improve the platform</p>
          </div>

          <div className={styles.featureCard}>
            <h3>⚖️ No Stakes Platform</h3>
            <p>Don't stress, play and have fun.</p>
          </div>

          <div className={styles.featureCard}>
            <h3>🌶️ Test Your Spicy Brew</h3>
            <p>Experiment with strategies and refine your builds</p>
          </div>

        </div>
        <div className={styles.statsContainer}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>9,000+</span>
            <span className={styles.statLabel}>Daily Players</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>Free to Play</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>500+</span>
            <span className={styles.statLabel}>Active Supporters</span>
          </div>
        </div>

        <div className={styles.communityResourcesContainer}>
          <h3>🤝 Built By The Community</h3>
          <p>Talishar thrives thanks to collaboration with other talented fan software developers from the FAB community:</p>
          
          <div className={styles.resourcesGrid}>
            <a href="https://fabrary.net/" target="_blank" rel="noopener noreferrer" className={styles.resourceCard}>
              <h4>Fabrary</h4>
              <p>The most advanced Flesh and Blood card search, deck building, and collection management tool.</p>
            </a>

            <a href="https://www.thefabcube.com/cubes" target="_blank" rel="noopener noreferrer" className={styles.resourceCard}>
              <h4>The FAB Cube</h4>
              <p>Easy to use cube builder with comprehensive card database for the Flesh and Blood TCG.</p>
            </a>

            <a href="https://github.com/the-fab-cube/flesh-and-blood-cards" target="_blank" rel="noopener noreferrer" className={styles.resourceCard}>
              <h4>FAB Card Database</h4>
              <p>Open source database with JSON/CSV representations of Flesh and Blood cards.</p>
            </a>

            <a href="https://legendarystories.net/intro.html" target="_blank" rel="noopener noreferrer" className={styles.resourceCard}>
              <h4>Legendary Stories</h4>
              <p>Fan-curated archive of all official Flesh and Blood lore and world-building.</p>
            </a>

            <a href="https://fablazingdata.com" target="_blank" rel="noopener noreferrer" className={styles.resourceCard}>
              <h4>FAB Blazing Data</h4>
              <p>Discover the current meta landscape and access detailed hero and deck statistics.</p>
            </a>

            <a href="https://www.fabinsights.net/" target="_blank" rel="noopener noreferrer" className={styles.resourceCard}>
              <h4>FAB Insights</h4>
              <p>Advanced statistical analysis of the meta, hero interactions, and Talishar gameplay data.</p>
            </a>
          </div>
        </div>

        <div className={styles.faqContainer}>
          <h3>❓ Frequently Asked Questions</h3>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className={styles.faqToggle}>
                    {expandedFAQ === index ? '−' : '+'}
                  </span>
                </button>
                {expandedFAQ === index && (
                  <div className={styles.faqAnswer}>
                    <p>
                      {parseHtmlToReactElements(faq.answer)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Community Values */}
        <div className={styles.communityValuesSection}>
          <h3>Talishar Values</h3>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h4>🤝 Inclusivity</h4>
              <p>We welcome players of all skill levels and backgrounds. Everyone deserves a safe place to play and learn.</p>
            </div>
            <div className={styles.valueCard}>
              <h4>📖 Transparency</h4>
              <p>We communicate openly with our community about updates, features, and decisions that affect the platform.</p>
            </div>
            <div className={styles.valueCard}>
              <h4>🎯 Accuracy</h4>
              <p>We continuously work to ensure card mechanics and rules are as accurate as possible to official FAB standards.</p>
            </div>
            <div className={styles.valueCard}>
              <h4>💡 Innovation</h4>
              <p>We listen to player feedback and regularly implement improvements to enhance the gaming experience.</p>
            </div>
            <div className={styles.valueCard}>
              <h4>🛡️ Safety</h4>
              <p>We maintain a respectful, harassment-free environment where all players can enjoy the game safely. Report any kind of abuse to our moderators on Discord.</p>
            </div>
            <div className={styles.valueCard}>
              <h4>🌱 Community-Driven</h4>
              <p>Talishar is built by the community, for the community. We value player input and collaboration to shape the platform's future.</p>
            </div>
          </div>
        </div>

        <div className={styles.disclaimer}>
            <p>
              <strong>Disclaimer:</strong> Talishar is an open-source, fan-made platform not associated with LSS. It may not be a completely accurate representation of the Rules as written. 
              If you have questions about interactions or rulings, please contact the judges community on the
              <a href="https://discord.com/invite/flesh-and-blood-judge-hub-874145774135558164" target="_blank" rel="noopener noreferrer"> JudgeHub Discord</a> for clarification.
            </p>
            <p>
              Talishar is in no way affiliated with Legend Story Studios. Legend Story Studios®, Flesh and Blood™, and set names are trademarks of Legend Story Studios. 
              Flesh and Blood characters, cards, logos, and art are property of <a href="https://legendstory.com/" target="_blank" rel="noopener noreferrer">Legend Story Studios</a>. 
              Card Images © Legend Story Studios
            </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
