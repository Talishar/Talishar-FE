import React from 'react';
import styles from './AboutSection.module.css';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import { useTranslation, Trans } from 'react-i18next';

const AboutSection: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);
  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();
  const faqs = [
    {
      question: t("ABOUT.FAQ.IS_FREE_Q"),
      answer: t("ABOUT.FAQ.IS_FREE_A")       
    },
    {
      question: t("ABOUT.FAQ.DOWNLOAD_NEEDED_Q"),
      answer: t("ABOUT.FAQ.DOWNLOAD_NEEDED_A")
    },
    {
      question: t("ABOUT.FAQ.PLAY_OFFLINE_A"),
      answer: t("ABOUT.FAQ.PLAY_OFFLINE_Q")
    },
    {
      question: t("ABOUT.FAQ.HOW_SIGNUP_Q"),
      answer: t("ABOUT.FAQ.HOW_SIGNUP_A")
    },
    {
      question: t("ABOUT.FAQ.IS_OFFICIAL_Q"),
      answer: t("ABOUT.FAQ.IS_OFFICIAL_Q")
    },
    {
      question: t("ABOUT.FAQ.BUG_FEATURE_Q"),
      answer: t("ABOUT.FAQ.BUG_FEATURE_A")
    },
    {
      question: t("ABOUT.FAQ.WHY_NO_RANKED_Q"),
      answer: t("ABOUT.FAQ.WHY_NO_RANKED_A")
    },
    {
      question: t("ABOUT.FAQ.WHERE_PLAY_Q"),
      answer: t("ABOUT.FAQ.WHERE_PLAY_A")
    },
    {
      question: t("ABOUT.FAQ.HOW_CONTRIBUTER_Q"),
      answer: t("ABOUT.FAQ.HOW_CONTRIBUTER_A")
    }
  ];

  return (
    <section className={styles.aboutContainer}>
      <div className={styles.content}>
        <h2>{t("ABOUT.TITLE")}</h2>
        <p className={styles.tagline}>
          {t("ABOUT.SUB_HEADER")}
        </p>

        <p className={styles.description}>
	  {t("ABOUT.DESCRIPTION")}
        </p>

        {/* About Talishar Section */}
        <div className={styles.aboutTalisharSection}>
          <h3>🎮 {t("ABOUT.WHAT_IS_TITLE")}</h3>
          <p>
	    {t("ABOUT.WHAT_IS_DESCRIPTION")}
          </p>
        </div>

        {/* Who Maintains Talishar */}
        <div className={styles.maintenanceSection}>
          <h3>👥 {t("ABOUT.WHO_MAINTAINS_TITLE")}</h3>
          <p>
	    {t("ABOUT.WHO_MAINTAINS_DESCRIPTION")}            
          </p>
          <p className={styles.contributorInfo}>
	    <Trans i18nKey="ABOUT.WANT_TO_CONTRIBUTE">
	    Want to contribute? Talishar is open-source! Join us on
            <a
              href="https://discord.gg/JykuRkdd5S"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            or check our
            <a
              href="https://github.com/Talishar/Talishar"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub repository
            </a>
              to get involved.
	    </Trans>
          </p>
        </div>

        {/* LSS Relationship */}
        <div className={styles.lssRelationship}>
          <h3>⚖️{t("ABOUT.LSS_RELATIONSHIP_TITLE")}</h3>
	  <Trans
	    i18nKey="ABOUT.LSS_RELATIONSHIP_DESCRIPTION"
	    components={{
	      0: <p />,
	      1: <p />,
	      2: (
		<a
		  href="https://discord.gg/JykuRkdd5S"
		  target="_blank"
		  rel="noopener noreferrer"
		/>
	      ),
	      3: (
		<a
		  href="https://fabtcg.com/rules/"
		  target="_blank"
		  rel="noopener noreferrer"
		/>
	      ),
	    }}
	  />
        </div>

        {/* Features & Stats */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3>⚡{t("ABOUT.FEATURES.INSTANT_TITLE")}</h3>
            <p>{t("ABOUT.FEATURES.INSTANT_DESCRIPTION")}</p>
          </div>

          <div className={styles.featureCard}>
            <h3>🌍{t("ABOUT.FEATURES.ACTIVE_TITLE")}</h3>
            <p>{t("ABOUT.FEATURES.ACTIVE_DESCRIPTION")}</p>
          </div>

          <div className={styles.featureCard}>
            <h3>📱{t("ABOUT.FEATURES.MOBILE_TITLE")}</h3>
            <p>{t("ABOUT.FEATURES.MOBILE_DESCRIPTION")}</p>
          </div>

          <div className={styles.featureCard}>
            <h3>📣{t("ABOUT.FEATURES.FEEDBACK_TITLE")}</h3>
            <p>{t("ABOUT.FEATURES.FEEDBACK_DESCRIPTION")}</p>
          </div>

          <div className={styles.featureCard}>
            <h3>⚖️{t("ABOUT.FEATURES.NO_STAKES_TITLE")}</h3>
            <p>{t("ABOUT.FEATURES.NO_STAKES_DESCRIPTION")}</p>
          </div>

          <div className={styles.featureCard}>
            <h3>🌶️{t("ABOUT.FEATURES.SPICY_TITLE")}</h3>
            <p>{t("ABOUT.FEATURES.SPICY_DESCRIPTION")}</p>
          </div>
        </div>
        <div className={styles.statsContainer}>
          <div className={styles.stat}>
	    <Trans
	      i18nKey="ABOUT.STATS.PLAYERS"
	      values={{players:"9,000+"}}>
	      <span className={styles.statNumber}>9,000+</span>
	      <span className={styles.statLabel}>Daily Players</span>
	    </Trans>
          </div>
          <div className={styles.stat}>
	    <Trans
	      i18nKey="ABOUT.STATS.FREE"
	      values={{percent:"100%"}}>
              <span className={styles.statNumber}>100%</span>
	      <span className={styles.statLabel}>Free to Play</span>
	    </Trans>
          </div>
          <div className={styles.stat}>
	    <Trans
	      i18nKey="ABOUT.STATS.ACTIVE"
	      values={{supporters:"500+"}}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Active Supporters</span>
	    </Trans>
          </div>
        </div>
        <div className={styles.communityResourcesContainer}>
          <h3>🤝{t("ABOUT.COMMUNITY.TITLE")}</h3>
          <p>
            {t("ABOUT.COMMUNITY.DESCRIPTION")}
          </p>

          <div className={styles.resourcesGrid}>
            <a
              href="https://fabrary.net/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resourceCard}
            >
              <h4>Fabrary</h4>
              <p>
                {t("ABOUT.COMMUNITY.FABRARY_DESCRIPTION")}
              </p>
            </a>

            <a
              href="https://www.thefabcube.com/cubes"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resourceCard}
            >
              <h4>The FAB Cube</h4>
              <p>
                {t("ABOUT.COMMUNITY.THE_FAB_CUBE_DESCRIPTION")}
              </p>
            </a>

            <a
              href="https://github.com/the-fab-cube/flesh-and-blood-cards"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resourceCard}
            >
              <h4>FAB Card Database</h4>
              <p>
                {t("ABOUT.COMMUNITY.FAB_CARD_DATABASE_DESCRIPTION")}    
              </p>
            </a>

            <a
              href="https://legendarystories.net/intro.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resourceCard}
            >
              <h4>Legendary Stories</h4>
              <p>
		{t("ABOUT.COMMUNITY.LEGENDARY_STORIES_DESCRIPTION")}
	      </p>
            </a>

            <a
              href="https://fablazingdata.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resourceCard}
            >
              <h4>FAB Blazing Data</h4>
              <p>
		{t("ABOUT.COMMUNITY.FABLAZING_DATA_DESCRIPTION")}
              </p>
            </a>

            <a
              href="https://www.fabinsights.net/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resourceCard}
            >
              <h4>FAB Insights</h4>
              <p>
		{t("ABOUT.COMMUNITY.FAB_INSIGHTS_DESCRIPTION")}   
              </p>
            </a>
          </div>
        </div>

        <div className={styles.faqContainer}>
          <h3>❓{t("ABOUT.FAQ.TITLE")}</h3>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === index ? null : index)
                  }
                >
                  <span>{faq.question}</span>
                  <span className={styles.faqToggle}>
                    {expandedFAQ === index ? '−' : '+'}
                  </span>
                </button>
                {expandedFAQ === index && (
                  <div className={styles.faqAnswer}>
                    <p>{parseHtmlToReactElements(faq.answer)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Community Values */}
        <div className={styles.communityValuesSection}>
          <h3>{t("ABOUT.VALUES.TITLE")}</h3>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h4>🤝{t("ABOUT.VALUES.INCLUSIVITY_TITLE")}</h4>
              <p>
		{t("ABOUT.VALUES.INCLUSIVITY_DESCRIPTION")}                
              </p>
            </div>
            <div className={styles.valueCard}>
              <h4>📖 {t("ABOUT.VALUES.TRANSPARENCY_TITLE")}</h4>
              <p>
		{t("ABOUT.VALUES.TRANSPARENCY_DESCRIPTION")}
                
              </p>
            </div>
            <div className={styles.valueCard}>
              <h4>🎯{t("ABOUT.VALUES.ACCURACY_TITLE")}</h4>
              <p>
		{t("ABOUT.VALUES.ACCURACY_DESCRIPTION")}
              </p>
            </div>
            <div className={styles.valueCard}>
              <h4>💡{t("ABOUT.VALUES.INNOVATION_TITLE")}</h4>
              <p>
		{t("ABOUT.VALUES.INNOVATION_DESCRIPTION")}                
              </p>
            </div>
            <div className={styles.valueCard}>
              <h4>🛡️{t("ABOUT.VALUES.SAFETY_TITLE")}</h4>
              <p>
		{t("ABOUT.VALUES.SAFETY_DESCRIPTION")}
              </p>
            </div>
            <div className={styles.valueCard}>
              <h4>🌱{t("ABOUT.VALUES.COMMUNITY_DRIVEN_TITLE")}</h4>
              <p>
		{t("ABOUT.VALUES.COMMUNITY_DRIVEN_DESCRIPTION")}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.disclaimer}>
	  <Trans i18nKey="ABOUT.DISCLAIMER"
		 components={{
		 0: <p />,
		 1: <strong></strong>,
		 2: <p />,		 
		 3: (<a
		       href="https://discord.com/invite/flesh-and-blood-judge-hub-874145774135558164"
		       target="_blank"
		       rel="noopener noreferrer"
		       />),
		 4: (<a
		       href="https://legendstory.com/"
		       target="_blank"
		       rel="noopener noreferrer"
		       />)
		 
		 }}

	  />

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
