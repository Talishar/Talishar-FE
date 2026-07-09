import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { BsGithub, BsPersonFill, BsGearFill } from 'react-icons/bs';
import { FaDiscord, FaTwitter, FaYoutube } from 'react-icons/fa';
import {
  JUDGE_HUB_DISCORD_URL,
  TALISHAR_BLUESKY_URL,
  TALISHAR_DISCORD_URL,
  TALISHAR_GITHUB_URL,
  TALISHAR_METAFY_URL,
  TALISHAR_X_URL,
  TALISHAR_YOUTUBE_URL
} from 'constants/socialLinks';
import TalisharLogo from '../../img/TalisharLogo.webp';
import styles from './Footer.module.scss';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { reopenCookieConsent } from 'utils/cookieConsent';

const Footer = () => {
  const { isSupporter } = useSupporterStatus();
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.leftCol}>
            <img src={TalisharLogo} alt={t('FOOTER.LOGO_ALT')} className={styles.logo} />
            {!isSupporter && (
              <a
                href={TALISHAR_METAFY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.supportBtn}
              >
                {t('HOME.HERO.SUPPORT_CTA')}
              </a>
            )}
          </div>

          {!isSupporter && (
            <div className={styles.adSlot}>
              <div data-ad="video" />
            </div>
          )}
          <div className={styles.rightCol}>
            <div className={styles.navRow}>
              <nav className={styles.navLinks} aria-label={t('FOOTER.NAV_LABEL')}>
                <Link to="/">{t('HEADER.PLAY')}</Link>
                <Link to="/game/load">{t('HEADER.REPLAYS')}</Link>
                <Link to="/learn">{t('HEADER.LEARN')}</Link>
                <Link to="/about">{t('HEADER.ABOUT')}</Link>
              </nav>
              <nav className={styles.userLinks} aria-label={t('FOOTER.USER_LINKS_LABEL')}>
                <Link to="/user"><BsPersonFill aria-hidden="true" /> {t('HEADER.PROFILE')}</Link>
                <Link to="/user/settings"><BsGearFill aria-hidden="true" /> {t('HEADER.SETTINGS')}</Link>
              </nav>
            </div>

            <nav className={styles.socialLinks} aria-label={t('FOOTER.SOCIAL_LINKS_LABEL')}>
              <a href={TALISHAR_GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <BsGithub aria-hidden="true" />
              </a>
              <a href={TALISHAR_DISCORD_URL} target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <FaDiscord aria-hidden="true" />
              </a>
              <a href={TALISHAR_BLUESKY_URL} target="_blank" rel="noopener noreferrer" aria-label="Bluesky">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
                </svg>
              </a>
              <a href={TALISHAR_X_URL} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
                <FaTwitter aria-hidden="true" />
              </a>
              <a href={TALISHAR_YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube aria-hidden="true" />
              </a>
            </nav>

            <nav className={styles.legalLinks} aria-label={t('FOOTER.LEGAL_LINKS_LABEL')}>
              <Link to="/privacy">{t('FOOTER.PRIVACY_POLICY')}</Link>
              <Link to="/terms-of-service">{t('FOOTER.TERMS_OF_SERVICE')}</Link>
              <a
                href="#"
                className={styles.cookiePreferencesButton}
                onClick={(e) => {
                  e.preventDefault();
                  reopenCookieConsent();
                }}
              >
                {t('FOOTER.COOKIE_PREFERENCES')}
              </a>
            </nav>

            <div className={styles.disclaimer}>
              <Trans
                i18nKey="ABOUT.DISCLAIMER"
                components={{
                  0: <p />,
                  1: <strong />,
                  2: <p />,
                  3: (
                    <a
                      href={JUDGE_HUB_DISCORD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  4: (
                    <a
                      href="https://legendstory.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
