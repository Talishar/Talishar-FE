import useAuth from 'hooks/useAuth';
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import styles from './Header.module.scss';
import TalisharLogo from '../../img/CoinLogo.png';
import {
  BsPersonFill,
  BsShieldFillCheck,
  BsGearFill,
  BsFillBookFill,
  BsList,
  BsX,
  BsCollectionPlayFill,
  BsChevronDown,
  BsPlayFill,
  BsInfoCircleFill
} from 'react-icons/bs';
import { IoLogOut } from "react-icons/io5";
import SocialDropdown from 'components/header/SocialDropdown';
import LanguageSelector from 'components/header/LanguageSelector';
import Footer from 'components/footer/Footer';
import { useGetPendingRequestsQuery, useGetUserProfileQuery } from 'features/api/apiSlice';
import CookieConsent from 'components/CookieConsent';
import AdBlockingRecovery from 'components/AdBlockingRecovery';
import SessionRecovery from 'components/SessionRecovery';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { isLoggedIn, isMod, currentUserName, logOut } = useAuth();
  const { data: pendingData } = useGetPendingRequestsQuery(undefined, {
    skip: !isLoggedIn
  });
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery(
    undefined,
    { skip: !isLoggedIn }
  );
  const isSupporter = isLoggedIn
    ? (isProfileLoading ? true : (profileData?.isMetafySupporter ?? false))
    : false;
  const pendingRequestCount = pendingData?.requests?.length || 0;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const handleOrientationChange = () => setMobileMenuOpen(false);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeUserDropdown = () => setUserDropdownOpen(false);

  const handleLogOut = (e: React.MouseEvent) => {
    e.preventDefault();
    logOut();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? styles.activeNavLink : undefined;

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

        <ul className={styles.leftGroup}>
          <li>
            <Link to="/" className={styles.logo}>
              <img src={TalisharLogo} alt={t('HEADER.TALISHAR_LOGO_ALT')} />
            </Link>
          </li>
          {!isSupporter && (
            <li>
              <a
                href="https://metafy.gg/@talishar"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.support}
              >
                {t('HEADER.SUPPORT_US')}
              </a>
            </li>
          )}
        </ul>

        <ul className={styles.centerNav}>
          <li>
            <NavLink to="/" end className={navLinkClass}>
              Play
            </NavLink>
          </li>
          <li>
            <NavLink to="/game/load" className={navLinkClass}>
              {t('HEADER.REPLAYS')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/learn" className={navLinkClass}>
              {t('HEADER.LEARN')}
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </li>
        </ul>

        <ul className={styles.rightGroup}>
          <li>
            {isLoggedIn ? (
              <div className={styles.userDropdown} ref={userDropdownRef}>
                <button
                  className={styles.userDropdownTrigger}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <BsPersonFill />
                  <span className={styles.userName}>{currentUserName}</span>
                  <BsChevronDown
                    className={`${styles.chevron} ${userDropdownOpen ? styles.chevronOpen : ''}`}
                  />
                  {pendingRequestCount > 0 && (
                    <span className={styles.notificationBadge}>
                      {pendingRequestCount}
                    </span>
                  )}
                </button>
                {userDropdownOpen && (
                  <ul className={styles.userDropdownMenu}>
                    <li>
                      <Link to="/user" onClick={closeUserDropdown}>
                        <BsPersonFill /> <span>{t('HEADER.PROFILE')}</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/user/settings" onClick={closeUserDropdown}>
                        <BsGearFill /> <span>{t('HEADER.SETTINGS')}</span>
                      </Link>
                    </li>
                    <LanguageSelector inDropdown />
                    {isMod && (
                      <li>
                        <Link to="/mod" onClick={closeUserDropdown}>
                          <BsShieldFillCheck /> <span>Mod Page</span>
                        </Link>
                      </li>
                    )}
                    <li>
                      <a href="" onClick={handleLogOut}>
                        <IoLogOut /> <span>{t('HEADER.LOGOUT')}</span>
                      </a>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link to="/user/login" className={styles.login}>
                <button>{t('HEADER.LOGIN')}</button>
              </Link>
            )}
          </li>
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
              <Link to="/" onClick={closeMobileMenu}>
                <BsPlayFill /> <span>Play</span>
              </Link>
            </li>
            <li>
              <Link to="/game/load" onClick={closeMobileMenu}>
                <BsCollectionPlayFill /> <span>{t('HEADER.REPLAYS')}</span>
              </Link>
            </li>
            <li>
              <Link to="/learn" onClick={closeMobileMenu}>
                <BsFillBookFill /> <span>{t('HEADER.LEARN')}</span>
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMobileMenu}>
                <BsInfoCircleFill /> <span>About</span>
              </Link>
            </li>
            <li className={styles.mobileDivider} />
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
                  <BsGearFill /> <span>{t('HEADER.SETTINGS')}</span>
                </Link>
              </li>
            )}
            <LanguageSelector />
            {isLoggedIn && isMod && (
              <li>
                <Link to="/mod" onClick={closeMobileMenu}>
                  <BsShieldFillCheck /> <span>Mod Page</span>
                </Link>
              </li>
            )}
            {isLoggedIn && (
              <li>
                <a href="" onClick={handleLogOut}>
                  <IoLogOut /> <span>{t('HEADER.LOGOUT')}</span>
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
      <div className={styles.contentWrapper}>
        <Outlet />
        <Footer />
      </div>
      <CookieConsent />
      <AdBlockingRecovery />
      <SessionRecovery />
    </div>
  );
};

export default Header;
