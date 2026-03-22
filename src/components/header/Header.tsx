import useAuth from 'hooks/useAuth';
import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import styles from './Header.module.scss';
import TalisharLogo from '../../img/CoinLogo.png';
import {
  BsPersonFill,
  BsShieldFillCheck,
  BsGear,
  BsFillBookFill,
  BsList,
  BsX
} from 'react-icons/bs';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { MdVideoLibrary } from 'react-icons/md';
import SocialDropdown from 'components/header/SocialDropdown';
import LanguageSelector from 'components/header/LanguageSelector';
import { useGetPendingRequestsQuery } from 'features/api/apiSlice';
import CookieConsent from 'components/CookieConsent';
import AdBlockingRecovery from 'components/AdBlockingRecovery';
import SessionRecovery from 'components/SessionRecovery';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { isLoggedIn, isMod, isPatron, currentUserName, logOut } = useAuth();
  const { data: pendingData } = useGetPendingRequestsQuery(undefined, {
    skip: !isLoggedIn
  });
  const pendingRequestCount = pendingData?.requests?.length || 0;
  const canAccessReplays = isMod || currentUserName === 'Tegunn' || isPatron;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();

  useEffect(() => {
    const handleOrientationChange = () => setMobileMenuOpen(false);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogOut = (e: React.MouseEvent) => {
    e.preventDefault();
    logOut();
    setMobileMenuOpen(false);
  };

  return (
    <div>
      <nav className={styles.navBar}>
        <Toaster
          position="top-left"
          toastOptions={{
            style: {
              background: 'var(--theme-tertiary)',
              color: 'var(--white)',
              border: '1px solid var(--theme-border)',
              padding: '0.5rem',
              wordBreak: 'break-word',
              maxWidth: '100vh',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              userSelect: 'none',
              msUserSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              zIndex: 10001
            }
          }}
        />
        <ul>
          <li>
            <Link to="/" className={styles.logo}>
              <img src={TalisharLogo} alt={t('HEADER.TALISHAR_LOGO_ALT')} />
            </Link>
          </li>
          <li>
            <a
              href="https://metafy.gg/@talishar"
              target={'_blank'}
              className={styles.support}
            >
              {t('HEADER.SUPPORT_US')}
            </a>
          </li>
        </ul>
        <ul className={styles.rightNav}>
          <li>
            <Link to="/learn">
              <BsFillBookFill></BsFillBookFill> <span>{t('HEADER.LEARN')}</span>
            </Link>
          </li>
          {isLoggedIn && isMod && (
            <li>
              <Link to="/mod">
                <BsShieldFillCheck size="0.9em"></BsShieldFillCheck>{' '}
                <span>Mod Page</span>
              </Link>
            </li>
          )}
          {isLoggedIn && canAccessReplays && (
            <li>
              <Link to="/game/load">
                <MdVideoLibrary></MdVideoLibrary>{' '}
                <span>{t('HEADER.REPLAYS')}</span>
              </Link>
            </li>
          )}
          <LanguageSelector />
          <SocialDropdown />
          <li>
            {isLoggedIn ? (
              <Link to="/user" className={styles.profileLink} onClick={closeMobileMenu}>
                <BsPersonFill></BsPersonFill> <span>{t('HEADER.PROFILE')}</span>
                {pendingRequestCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {pendingRequestCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link to="/user/login" className={styles.login}>
                <button>{t('HEADER.LOGIN')}</button>
              </Link>
            )}
          </li>
          {isLoggedIn && (
            <li>
              <Link to="/user/settings">
                <BsGear></BsGear> <span>{t('HEADER.SETTINGS')}</span>
              </Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <a href="" onClick={handleLogOut}>
                <RiLogoutBoxRLine></RiLogoutBoxRLine>{' '}
                <span>{t('HEADER.LOGOUT')}</span>
              </a>
            </li>
          )}
        </ul>
        <button
          className={styles.burgerButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <BsX /> : <BsList />}
        </button>
      </nav>
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <ul>
            <li>
              <Link to="/learn" onClick={closeMobileMenu}>
                <BsFillBookFill /> <span>{t('HEADER.LEARN')}</span>
              </Link>
            </li>
            {isLoggedIn && isMod && (
              <li>
                <Link to="/mod" onClick={closeMobileMenu}>
                  <BsShieldFillCheck /> <span>Mod Page</span>
                </Link>
              </li>
            )}
            {isLoggedIn && canAccessReplays && (
              <li>
                <Link to="/game/load" onClick={closeMobileMenu}>
                  <MdVideoLibrary /> <span>{t('HEADER.REPLAYS')}</span>
                </Link>
              </li>
            )}
            <LanguageSelector />
            <SocialDropdown />
            <li>
              {isLoggedIn ? (
                <Link to="/user" className={styles.profileLink} onClick={closeMobileMenu}>
                  <BsPersonFill /> <span>{t('HEADER.PROFILE')}</span>
                  {pendingRequestCount > 0 && (
                    <span className={styles.notificationBadge}>
                      {pendingRequestCount}
                    </span>
                  )}
                </Link>
              ) : (
                <Link to="/user/login" className={styles.login} onClick={closeMobileMenu}>
                  <button>{t('HEADER.LOGIN')}</button>
                </Link>
              )}
            </li>
            {isLoggedIn && (
              <li>
                <Link to="/user/settings" onClick={closeMobileMenu}>
                  <BsGear /> <span>{t('HEADER.SETTINGS')}</span>
                </Link>
              </li>
            )}
            {isLoggedIn && (
              <li>
                <a href="" onClick={handleLogOut}>
                  <RiLogoutBoxRLine /> <span>{t('HEADER.LOGOUT')}</span>
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
      <div className={styles.contentWrapper}>
        <Outlet />
      </div>
      <CookieConsent />
      <AdBlockingRecovery />
      <SessionRecovery />
    </div>
  );
};

export default Header;
