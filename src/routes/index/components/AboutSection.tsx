import React from 'react';
import styles from './AboutSection.module.css';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import { useTranslation, Trans } from 'react-i18next';
import ContributorLeaderboard from './ContributorLeaderboard';
import { AdUnit } from 'components/ads';
import useAuth from 'hooks/useAuth';
import { useGetUserProfileQuery } from 'features/api/apiSlice';
import { useMediaQuery } from 'hooks/useMediaQuery';

const AboutSection: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);
  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();
  const { isLoggedIn, isLoading } = useAuth();
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery(
    undefined,
    { skip: !isLoggedIn }
  );
  const isSupporter = isLoggedIn
    ? (isProfileLoading ? true : (profileData?.isMetafySupporter ?? false))
    : false;
  const showAds = !isLoading && !isSupporter;
  const isMobile = useMediaQuery('(max-width: 728px)');

  const faqs = [
    { question: t("ABOUT.FAQ.IS_FREE_Q"),         answer: t("ABOUT.FAQ.IS_FREE_A") },
    { question: t("ABOUT.FAQ.DOWNLOAD_NEEDED_Q"), answer: t("ABOUT.FAQ.DOWNLOAD_NEEDED_A") },
    { question: t("ABOUT.FAQ.PLAY_OFFLINE_Q"),    answer: t("ABOUT.FAQ.PLAY_OFFLINE_A") },
    { question: t("ABOUT.FAQ.HOW_SIGNUP_Q"),      answer: t("ABOUT.FAQ.HOW_SIGNUP_A") },
    { question: t("ABOUT.FAQ.IS_OFFICIAL_Q"),     answer: t("ABOUT.FAQ.IS_OFFICIAL_A") },
    { question: t("ABOUT.FAQ.BUG_FEATURE_Q"),     answer: t("ABOUT.FAQ.BUG_FEATURE_A") },
    { question: t("ABOUT.FAQ.WHY_NO_RANKED_Q"),   answer: t("ABOUT.FAQ.WHY_NO_RANKED_A") },
    { question: t("ABOUT.FAQ.WHERE_PLAY_Q"),      answer: t("ABOUT.FAQ.WHERE_PLAY_A") },
    { question: t("ABOUT.FAQ.HOW_CONTRIBUTER_Q"), answer: t("ABOUT.FAQ.HOW_CONTRIBUTER_A") },
  ];

  const features = [
    { icon: "⚡", title: t("ABOUT.FEATURES.INSTANT_TITLE"),   desc: t("ABOUT.FEATURES.INSTANT_DESCRIPTION") },
    { icon: "🌍", title: t("ABOUT.FEATURES.ACTIVE_TITLE"),    desc: t("ABOUT.FEATURES.ACTIVE_DESCRIPTION") },
    { icon: "📱", title: t("ABOUT.FEATURES.MOBILE_TITLE"),    desc: t("ABOUT.FEATURES.MOBILE_DESCRIPTION") },
    { icon: "📣", title: t("ABOUT.FEATURES.FEEDBACK_TITLE"),  desc: t("ABOUT.FEATURES.FEEDBACK_DESCRIPTION") },
    { icon: "⚖️", title: t("ABOUT.FEATURES.NO_STAKES_TITLE"), desc: t("ABOUT.FEATURES.NO_STAKES_DESCRIPTION") },
    { icon: "🌶️", title: t("ABOUT.FEATURES.SPICY_TITLE"),     desc: t("ABOUT.FEATURES.SPICY_DESCRIPTION") },
  ];

  const resources = [
    { href: "https://fabrary.net/",                                            name: "Fabrary",           desc: t("ABOUT.COMMUNITY.FABRARY_DESCRIPTION") },
    { href: "https://www.thefabcube.com/cubes",                                name: "The FAB Cube",      desc: t("ABOUT.COMMUNITY.THE_FAB_CUBE_DESCRIPTION") },
    { href: "https://github.com/the-fab-cube/flesh-and-blood-cards",           name: "FAB Card Database", desc: t("ABOUT.COMMUNITY.FAB_CARD_DATABASE_DESCRIPTION") },
    { href: "https://legendarystories.net/intro.html",                         name: "Legendary Stories", desc: t("ABOUT.COMMUNITY.LEGENDARY_STORIES_DESCRIPTION") },
    { href: "https://fablazingdata.com",                                       name: "FAB Blazing Data",  desc: t("ABOUT.COMMUNITY.FABLAZING_DATA_DESCRIPTION") },
    { href: "https://www.fabinsights.net/",                                    name: "FAB Insights",      desc: t("ABOUT.COMMUNITY.FAB_INSIGHTS_DESCRIPTION") },
  ];

  return (
    <section className={styles.aboutContainer}>
      <div className={styles.content}>

        <div className={styles.pageHeader}>
          <h2>{t("ABOUT.TITLE")}</h2>
          <p className={styles.tagline}>{t("ABOUT.SUB_HEADER")}</p>
        </div>

        <div className={styles.section}>
          <div className={styles.introGrid}>
            <div className={styles.introLeft}>
              <h3 className={styles.sectionTitle}>{t("ABOUT.WHAT_IS_TITLE")}</h3>
              <p className={styles.bodyText}>{t("ABOUT.WHAT_IS_DESCRIPTION")}</p>
              <p className={styles.bodyText}>{t("ABOUT.DESCRIPTION")}</p>
            </div>
            <ul className={styles.featureList}>
              {features.map((f, i) => (
                <li key={i} className={styles.featureItem}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <div className={styles.featureText}>
                    <strong>{f.title}</strong>
                    <p>{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <Trans i18nKey="ABOUT.STATS.PLAYERS" values={{ players: "9,000+" }}>
                <span className={styles.statNumber}>9,000+</span>
                <span className={styles.statLabel}>Daily Players</span>
              </Trans>
            </div>
            <div className={styles.stat}>
              <Trans i18nKey="ABOUT.STATS.FREE" values={{ percent: "100%" }}>
                <span className={styles.statNumber}>100%</span>
                <span className={styles.statLabel}>Free to Play</span>
              </Trans>
            </div>
            <div className={styles.stat}>
              <Trans i18nKey="ABOUT.STATS.ACTIVE" values={{ supporters: "500+" }}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Active Supporters</span>
              </Trans>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>{t("ABOUT.WHO_MAINTAINS_TITLE")}</h3>
            <div className={styles.contributeButtons}>
              <a
                href="https://github.com/Talishar/Talishar"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubButton}
              >
                Github
              </a>
              <a
                href="https://discord.gg/JykuRkdd5S"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.discordButton}
              >
                Discord
              </a>
            </div>
          </div>
          <p className={styles.bodyText}>{t("ABOUT.WHO_MAINTAINS_DESCRIPTION")}</p>
          <ContributorLeaderboard />
          {showAds && (
            <div className={styles.adRow}>
              {isMobile
                ? <AdUnit placement="mobile-unit-2" />
                : <AdUnit placement="leaderboard-2" />}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.lssGrid}>
            <div>
              <h3 className={styles.sectionTitle}>Talishar is an Unofficial Independent platform</h3>
              <p className={styles.bodyText}><Trans
                i18nKey="ABOUT.LSS_RELATIONSHIP_DESCRIPTION"
                components={[
                  <p key="lss-p0" className={styles.bodyText} />,
                  <p key="lss-p1" className={styles.bodyText} />,
                  <a key="lss-discord" href="https://discord.gg/JykuRkdd5S" target="_blank" rel="noopener noreferrer" />,
                  <a key="lss-rules"   href="https://fabtcg.com/rules/"       target="_blank" rel="noopener noreferrer" />,
                ]}
              /></p>
            </div>
            <div>
              <h3 className={styles.sectionTitle}>{t("ABOUT.LSS_RELATIONSHIP_TITLE")}</h3>
              <p className={styles.bodyText}>{t("ABOUT.WHO_MAINTAINS_DESCRIPTION")}</p>
              {!isSupporter && (
              <a
                href="https://metafy.gg/@talishar"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.metafyButton}
              >
                Support us on Metafy
              </a>
            )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("ABOUT.COMMUNITY.TITLE")}</h3>
          <p className={styles.bodyText}>{t("ABOUT.COMMUNITY.DESCRIPTION")}</p>
          <div className={styles.resourcesGrid}>
            {resources.map((r, i) => (
              <a key={i} href={r.href} target="_blank" rel="noopener noreferrer" className={styles.resourceCard}>
                <div className={styles.resourceCardBody}>
                  <h4>{r.name}</h4>
                  <p>{r.desc}</p>
                </div>
                <span className={styles.linkIcon}>↗</span>
              </a>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("ABOUT.FAQ.TITLE")}</h3>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className={styles.faqToggle}>{expandedFAQ === index ? '−' : '+'}</span>
                </button>
                {expandedFAQ === index && (
                  <div className={styles.faqAnswer}>
                    <p>{parseHtmlToReactElements(faq.answer)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {showAds && (
            <div className={styles.adRow}>
              {isMobile
                ? <AdUnit placement="mobile-unit-3" />
                : <AdUnit placement="leaderboard-3" />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
