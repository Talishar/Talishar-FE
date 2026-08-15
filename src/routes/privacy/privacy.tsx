import { useTranslation, Trans } from 'react-i18next';
import { TALISHAR_DISCORD_URL } from 'constants/socialLinks';
import { reopenCookieConsent } from 'utils/cookieConsent';
import { usePageTitle } from 'hooks/usePageTitle';
import styles from './Privacy.module.css';

export const Privacy = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.PRIVACY'));
  return (
    <main>
      <article className={styles.privacyContainer}>
        <h1>{t('PRIVACY_PAGE.PRIVACY_POLICY_TITLE')}</h1>
        <h2>{t('PRIVACY_PAGE.DISCLAIMER_TITLE')}</h2>
        <p>
          <Trans i18nKey="PRIVACY_PAGE.AFFILIATION_DISCLAIMER">
            Talishar is in no way affiliated with Legend Story Studios. Legend
            Story Studios®, Flesh and Blood™, and set names are trademarks of
            Legend Story Studios. Flesh and Blood characters, cards, logos, and
            art are property of Legend Story Studios. Talishar is a "Rules
            enforcement application" for the Flesh and Blood™ TCG created by
            Legend Story Studios®. The related IP is used in accordance with the{' '}
            <a href="https://fabtcg.com/resources/terms-use-licensed-assets/">
              Terms of Use for Game and Studio Assets and IP
            </a>
            .
          </Trans>
        </p>
        <h2>{t('PRIVACY_PAGE.REMEMBER_ME_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.REMEMBER_ME_DESCRIPTION')}</p>
        <h2>{t('PRIVACY_PAGE.AUTHORIZATION_KEY_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.AUTHORIZATION_KEY_DESCRIPTION')}</p>
        <h2>{t('PRIVACY_PAGE.COOKIE_PREFERENCES_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.COOKIE_PREFERENCES_DESCRIPTION')}</p>
        <p>
          <button type="button" onClick={() => reopenCookieConsent()}>
            {t('PRIVACY_PAGE.OPEN_COOKIE_SETTINGS')}
          </button>
        </p>

        <h2>{t('PRIVACY_PAGE.DATA_COLLECTION_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.DATA_COLLECTION_DESCRIPTION')}</p>

        <h2>{t('PRIVACY_PAGE.REVIQ_ADS_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.REVIQ_ADS_DESCRIPTION')}</p>
        <ul>
          <li>{t('PRIVACY_PAGE.REVIQ_BENEFITS.PERSONALIZED_ADS')}</li>
          <li>{t('PRIVACY_PAGE.REVIQ_BENEFITS.MEASURE_PERFORMANCE')}</li>
          <li>{t('PRIVACY_PAGE.REVIQ_BENEFITS.ANALYZE_TRAFFIC')}</li>
          <li>{t('PRIVACY_PAGE.REVIQ_BENEFITS.AGGREGATE_REPORTING')}</li>
        </ul>
        <p>{t('PRIVACY_PAGE.REVIQ_VENDORS_DESCRIPTION')}</p>
        <p>
          <Trans i18nKey="PRIVACY_PAGE.REVIQ_LEARN_MORE">
            <strong>Learn more:</strong> For more information about how rev.iq
            uses data when you use our site, please visit{' '}
            <a
              href="https://www.rev.iq/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              rev.iq Privacy Policy
            </a>
            .
          </Trans>
        </p>

        <h2>{t('PRIVACY_PAGE.PRIVACY_CHOICES_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.PRIVACY_CHOICES_DESCRIPTION')}</p>
        <ul>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.CHOICE_OPT_OUT_ADS">
              <strong>Opt out of personalized advertising:</strong> Visit{' '}
              <a
                href="https://www.rev.iq/optout"
                target="_blank"
                rel="noopener noreferrer"
              >
                rev.iq Ad Settings
              </a>{' '}
              to manage your ad preferences and opt out of personalized
              advertising.
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.CHOICE_OPT_OUT_COOKIES">
              <strong>Opt out of third-party cookies:</strong> Visit{' '}
              <a
                href="http://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
              >
                aboutads.info
              </a>{' '}
              or{' '}
              <a
                href="http://www.youronlinechoices.eu/"
                target="_blank"
                rel="noopener noreferrer"
              >
                youronlinechoices.eu
              </a>{' '}
              (for EU users) to opt out of interest-based advertising from
              participating companies.
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.CHOICE_BROWSER_SETTINGS">
              <strong>Browser settings:</strong> You can configure your browser
              to refuse all cookies or to alert you when a cookie is being set.
              Note that some features of Talishar may not function properly
              without cookies.
            </Trans>
          </li>
        </ul>

        <h2>{t('PRIVACY_PAGE.CHILDREN_COPPA_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.CHILDREN_COPPA_DESCRIPTION')}</p>
        <p>{t('PRIVACY_PAGE.CHILDREN_PARENTS_NOTICE')}</p>

        <h2>{t('PRIVACY_PAGE.GDPR_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.GDPR_DESCRIPTION')}</p>
        <ul>
          <li>{t('PRIVACY_PAGE.GDPR_RIGHTS.ACCESS')}</li>
          <li>{t('PRIVACY_PAGE.GDPR_RIGHTS.RECTIFY')}</li>
          <li>{t('PRIVACY_PAGE.GDPR_RIGHTS.ERASURE')}</li>
          <li>{t('PRIVACY_PAGE.GDPR_RIGHTS.RESTRICT')}</li>
          <li>{t('PRIVACY_PAGE.GDPR_RIGHTS.PORTABILITY')}</li>
        </ul>
        <p>{t('PRIVACY_PAGE.GDPR_CONTACT')}</p>

        <h2>{t('PRIVACY_PAGE.CHANGES_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.CHANGES_DESCRIPTION')}</p>

        <h2>{t('PRIVACY_PAGE.US_LAWS_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.US_LAWS_DESCRIPTION')}</p>
        <ul>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_LAWS.CCPA">
              <strong>California Consumer Privacy Act (CCPA):</strong> Provides
              rights to know, delete, and opt-out of the sale of personal
              information
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_LAWS.CPRA">
              <strong>California Privacy Rights Act (CPRA):</strong> Enhanced
              CCPA protections including the right to correct and limit use of
              information
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_LAWS.VCDPA">
              <strong>Virginia Consumer Data Protection Act (VCDPA):</strong>{' '}
              Provides rights to access, delete, and correct personal data
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_LAWS.CPA">
              <strong>Colorado Privacy Act (CPA):</strong> Similar protections
              for Colorado residents
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_LAWS.CTDPA">
              <strong>Connecticut Data Privacy Act (CTDPA):</strong> Protections
              for Connecticut residents
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_LAWS.UCPA">
              <strong>Utah Consumer Privacy Act (UCPA):</strong> Privacy
              protections for Utah residents
            </Trans>
          </li>
        </ul>
        <p>
          <strong>{t('PRIVACY_PAGE.US_RIGHTS_TITLE')}</strong>
        </p>
        <ul>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_RIGHTS.KNOW">
              <strong>Right to Know:</strong> You can request what personal
              information we collect about you
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_RIGHTS.DELETE">
              <strong>Right to Delete:</strong> You can request deletion of your
              personal information (subject to certain exceptions)
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_RIGHTS.ACCESS">
              <strong>Right to Access:</strong> You can access and download your
              personal information
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_RIGHTS.CORRECT">
              <strong>Right to Correct:</strong> You can request correction of
              inaccurate personal information
            </Trans>
          </li>
          <li>
            <Trans i18nKey="PRIVACY_PAGE.US_RIGHTS.OPT_OUT">
              <strong>Right to Opt-Out:</strong> You can opt out of the sale or
              sharing of your personal information
            </Trans>
          </li>
        </ul>
        <p>
          <strong>{t('PRIVACY_PAGE.EXERCISE_RIGHTS_TITLE')}</strong>
        </p>
        <p>
          <Trans i18nKey="PRIVACY_PAGE.EXERCISE_RIGHTS_DESCRIPTION">
            To exercise any of these rights, please contact us through our{' '}
            <a
              href={TALISHAR_DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord community
            </a>
            . We will respond to verified requests within 45 days (or as
            otherwise required by applicable law). We will not discriminate
            against you for exercising your rights under these laws.
          </Trans>
        </p>
        <p>
          <Trans i18nKey="PRIVACY_PAGE.NON_DISCRIMINATION">
            <strong>Non-Discrimination:</strong> We will not deny, charge
            different prices for, or provide different quality of service based
            on your exercise of these privacy rights, except as permitted by
            law.
          </Trans>
        </p>

        <p>
          <strong>
            {t('PRIVACY_PAGE.LAST_UPDATED', { date: 'January 23, 2026' })}
          </strong>
        </p>
        <h2>{t('PRIVACY_PAGE.CREDITS_TITLE')}</h2>
        <p>{t('PRIVACY_PAGE.CREDITS_DESCRIPTION')}</p>
      </article>
    </main>
  );
};

export default Privacy;
