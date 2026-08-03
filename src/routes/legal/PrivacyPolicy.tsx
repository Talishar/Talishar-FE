import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  TALISHAR_DISCORD_URL,
  TALISHAR_GITHUB_URL
} from 'constants/socialLinks';
import { usePageTitle } from 'hooks/usePageTitle';
import styles from './LegalPages.module.css';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.PRIVACY_POLICY_PAGE'));
  return (
    <main className={styles.legalContainer}>
      <div className={styles.content}>
        <h1>{t('LEGAL.PRIVACY_POLICY')}</h1>
        <p className={styles.lastUpdated}>
          {t('LEGAL.LAST_UPDATED', { date: 'November 4, 2025' })}
        </p>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_1_TITLE')}</h2>
          <p>{t('LEGAL.PRIVACY.SECTION_1_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_2_TITLE')}</h2>
          <h3>{t('LEGAL.PRIVACY.SECTION_2_SUB_1_TITLE')}</h3>
          <ul>
            <li>
              <Trans i18nKey="LEGAL.PRIVACY.SECTION_2_SUB_1_ITEM_1">
                <strong>Account Information:</strong> When you create an
                account, we collect your email address, username, and password.
              </Trans>
            </li>
            <li>
              <Trans i18nKey="LEGAL.PRIVACY.SECTION_2_SUB_1_ITEM_2">
                <strong>Game Data:</strong> We store information about your
                games, deck builds, and game history on our platform.
              </Trans>
            </li>
            <li>
              <Trans i18nKey="LEGAL.PRIVACY.SECTION_2_SUB_1_ITEM_3">
                <strong>Communications:</strong> We may collect messages,
                feedback, and communications you send us.
              </Trans>
            </li>
          </ul>

          <h3>{t('LEGAL.PRIVACY.SECTION_2_SUB_2_TITLE')}</h3>
          <ul>
            <li>
              <Trans i18nKey="LEGAL.PRIVACY.SECTION_2_SUB_2_ITEM_1">
                <strong>Log Data:</strong> IP address, browser type, operating
                system, pages visited, and timestamps.
              </Trans>
            </li>
            <li>
              <Trans i18nKey="LEGAL.PRIVACY.SECTION_2_SUB_2_ITEM_2">
                <strong>Cookies and Similar Technologies:</strong> We use
                cookies to enhance user experience and track site usage.
              </Trans>
            </li>
            <li>
              <Trans i18nKey="LEGAL.PRIVACY.SECTION_2_SUB_2_ITEM_3">
                <strong>Analytics:</strong> We use Google Analytics and similar
                services to understand how users interact with our platform.
                Analytics cookies are only set after you accept them in the
                cookie consent banner.
              </Trans>
            </li>
          </ul>

          <h3>{t('LEGAL.PRIVACY.SECTION_2_SUB_3_TITLE')}</h3>
          <p>{t('LEGAL.PRIVACY.SECTION_2_SUB_3_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_3_TITLE')}</h2>
          <ul>
            <li>{t('LEGAL.PRIVACY.SECTION_3_ITEM_1')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_3_ITEM_2')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_3_ITEM_3')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_3_ITEM_4')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_3_ITEM_5')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_3_ITEM_6')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_3_ITEM_7')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_3_ITEM_8')}</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_4_TITLE')}</h2>
          <p>{t('LEGAL.PRIVACY.SECTION_4_INTRO')}</p>
          <ul>
            <li>{t('LEGAL.PRIVACY.SECTION_4_ITEM_1')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_4_ITEM_2')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_4_ITEM_3')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_4_ITEM_4')}</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_5_TITLE')}</h2>
          <p>{t('LEGAL.PRIVACY.SECTION_5_INTRO')}</p>
          <ul>
            <li>{t('LEGAL.PRIVACY.SECTION_5_ITEM_1')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_5_ITEM_2')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_5_ITEM_3')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_5_ITEM_4')}</li>
          </ul>
          <p>{t('LEGAL.PRIVACY.SECTION_5_PARA_2')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_6_TITLE')}</h2>
          <p>
            <Trans i18nKey="LEGAL.PRIVACY.SECTION_6_PARA_1">
              Talishar uses rev.iq to display advertisements. rev.iq may collect
              information about your browsing behavior to deliver relevant ads.
              For more information, see{' '}
              <a
                href="https://www.rev.iq/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                rev.iq's Privacy Policy
              </a>
              .
            </Trans>
          </p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_7_TITLE')}</h2>
          <p>{t('LEGAL.PRIVACY.SECTION_7_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_8_TITLE')}</h2>
          <p>{t('LEGAL.PRIVACY.SECTION_8_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_9_TITLE')}</h2>
          <p>{t('LEGAL.PRIVACY.SECTION_9_INTRO')}</p>
          <ul>
            <li>{t('LEGAL.PRIVACY.SECTION_9_ITEM_1')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_9_ITEM_2')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_9_ITEM_3')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_9_ITEM_4')}</li>
            <li>{t('LEGAL.PRIVACY.SECTION_9_ITEM_5')}</li>
          </ul>
          <p>{t('LEGAL.PRIVACY.SECTION_9_PARA_2')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_10_TITLE')}</h2>
          <p>{t('LEGAL.PRIVACY.SECTION_10_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_11_TITLE')}</h2>
          <p>{t('LEGAL.PRIVACY.SECTION_11_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.PRIVACY.SECTION_12_TITLE')}</h2>
          <p>{t('LEGAL.PRIVACY.SECTION_12_INTRO')}</p>
          <ul>
            <li>
              <strong>{t('LEGAL.CONTACT_DISCORD')}</strong>{' '}
              <a
                href={TALISHAR_DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('LEGAL.JOIN_DISCORD_COMMUNITY')}
              </a>
            </li>
            <li>
              <strong>{t('LEGAL.CONTACT_GITHUB')}</strong>{' '}
              <a
                href={TALISHAR_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('LEGAL.VISIT_GITHUB_REPOSITORY')}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
