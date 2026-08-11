import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  TALISHAR_DISCORD_URL,
  TALISHAR_GITHUB_URL
} from 'constants/socialLinks';
import { usePageTitle } from 'hooks/usePageTitle';
import styles from './LegalPages.module.css';

const TermsOfService: React.FC = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.TERMS_OF_SERVICE_PAGE'));
  return (
    <main className={styles.legalContainer}>
      <div className={styles.content}>
        <h1>{t('LEGAL.TERMS_OF_SERVICE')}</h1>
        <p className={styles.lastUpdated}>
          {t('LEGAL.LAST_UPDATED', { date: 'November 4, 2025' })}
        </p>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_1_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_1_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_2_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_2_INTRO')}</p>
          <ul>
            <li>{t('LEGAL.TERMS.SECTION_2_ITEM_1')}</li>
            <li>{t('LEGAL.TERMS.SECTION_2_ITEM_2')}</li>
            <li>{t('LEGAL.TERMS.SECTION_2_ITEM_3')}</li>
            <li>{t('LEGAL.TERMS.SECTION_2_ITEM_4')}</li>
            <li>{t('LEGAL.TERMS.SECTION_2_ITEM_5')}</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_3_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_3_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_4_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_4_INTRO')}</p>
          <ul>
            <li>{t('LEGAL.TERMS.SECTION_4_ITEM_1')}</li>
            <li>{t('LEGAL.TERMS.SECTION_4_ITEM_2')}</li>
            <li>{t('LEGAL.TERMS.SECTION_4_ITEM_3')}</li>
            <li>{t('LEGAL.TERMS.SECTION_4_ITEM_4')}</li>
            <li>{t('LEGAL.TERMS.SECTION_4_ITEM_5')}</li>
            <li>{t('LEGAL.TERMS.SECTION_4_ITEM_6')}</li>
            <li>{t('LEGAL.TERMS.SECTION_4_ITEM_7')}</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_5_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_5_PARA_1')}</p>
          <p>{t('LEGAL.TERMS.SECTION_5_PARA_2')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_6_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_6_INTRO')}</p>
          <ul>
            <li>{t('LEGAL.TERMS.SECTION_6_ITEM_1')}</li>
            <li>{t('LEGAL.TERMS.SECTION_6_ITEM_2')}</li>
            <li>{t('LEGAL.TERMS.SECTION_6_ITEM_3')}</li>
            <li>{t('LEGAL.TERMS.SECTION_6_ITEM_4')}</li>
          </ul>
          <p>{t('LEGAL.TERMS.SECTION_6_PARA_2')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_7_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_7_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_8_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_8_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_9_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_9_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_10_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_10_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_11_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_11_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_12_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_12_INTRO')}</p>
          <ul>
            <li>{t('LEGAL.TERMS.SECTION_12_ITEM_1')}</li>
            <li>{t('LEGAL.TERMS.SECTION_12_ITEM_2')}</li>
            <li>{t('LEGAL.TERMS.SECTION_12_ITEM_3')}</li>
            <li>{t('LEGAL.TERMS.SECTION_12_ITEM_4')}</li>
          </ul>
          <p>{t('LEGAL.TERMS.SECTION_12_PARA_2')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_13_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_13_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_14_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_14_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_15_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_15_PARA_1')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('LEGAL.TERMS.SECTION_16_TITLE')}</h2>
          <p>{t('LEGAL.TERMS.SECTION_16_INTRO')}</p>
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

export default TermsOfService;
