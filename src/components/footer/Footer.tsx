import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { BsGithub, BsPersonFill, BsGearFill } from 'react-icons/bs';
import { FaDiscord, FaTwitter, FaYoutube } from 'react-icons/fa';
import TalisharLogo from '../../img/TalisharLogo.webp';
import styles from './Footer.module.scss';
import useSupporterStatus from 'hooks/useSupporterStatus';

const Footer = () => {
  const { isSupporter } = useSupporterStatus();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.leftCol}>
            <img src={TalisharLogo} alt="Talishar" className={styles.logo} />
            {!isSupporter && (
              <a
                href="https://metafy.gg/@talishar/members"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.supportBtn}
              >
                Support us on Metafy
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
              <nav className={styles.navLinks} aria-label="Footer navigation">
                <Link to="/">Play</Link>
                <Link to="/game/load">Replays</Link>
                <Link to="/learn">Learn</Link>
                <Link to="/about">About</Link>
              </nav>
              <nav className={styles.userLinks} aria-label="User links">
                <Link to="/user"><BsPersonFill aria-hidden="true" /> Profile</Link>
                <Link to="/user/settings"><BsGearFill aria-hidden="true" /> Settings</Link>
              </nav>
            </div>

            <nav className={styles.socialLinks} aria-label="Social links">
              <a href="https://github.com/Talishar/Talishar" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <BsGithub aria-hidden="true" />
              </a>
              <a href="https://discord.gg/JykuRkdd5S" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <FaDiscord aria-hidden="true" />
              </a>
              <a href="https://bsky.app/profile/talishar.bsky.social" target="_blank" rel="noopener noreferrer" aria-label="Bluesky">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
                </svg>
              </a>
              <a href="https://twitter.com/talishar_online" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
                <FaTwitter aria-hidden="true" />
              </a>
              <a href="https://www.youtube.com/@pvtvoid" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube aria-hidden="true" />
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
                      href="https://discord.com/invite/flesh-and-blood-judge-hub-874145774135558164"
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
