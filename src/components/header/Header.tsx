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
  BsCollection,
  BsCollectionPlayFill,
  BsChevronDown,
  BsPlayFill,
  BsInfoCircleFill,
  BsFullscreen,
  BsFullscreenExit
} from 'react-icons/bs';
import { IoLogOut } from "react-icons/io5";
import SocialDropdown from 'components/header/SocialDropdown';
import LanguageSelector from 'components/header/LanguageSelector';
import Footer from 'components/footer/Footer';
import { useGetPendingRequestsQuery } from 'features/api/apiSlice';
import useSupporterStatus from 'hooks/useSupporterStatus';
import CookieConsent from 'components/CookieConsent';
import AdBlockingRecovery from 'components/AdBlockingRecovery';
import SessionRecovery from 'components/SessionRecovery';
import { AmbientParticles } from 'routes/game/components/elements/ambientParticles/AmbientParticles';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { isLoggedIn, isMod, currentUserName, currentDisplayName, logOut } =
    useAuth();
  const { data: pendingData } = useGetPendingRequestsQuery(undefined, {
    skip: !isLoggedIn
  });
  const { isSupporter } = useSupporterStatus();
  const pendingRequestCount = pendingData?.requests?.length || 0;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const handleOrientationChange = () => setMobileMenuOpen(false);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

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
            <li>
              <NavLink to="/premium" className={styles.support}>
                {t('HEADER.SUPPORT_US')}
              </NavLink>
            </li>
        </ul>

        <ul className={styles.centerNav}>
          <li>
            <NavLink to="/" end className={navLinkClass}>
              {t('HEADER.PLAY')}
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
              {t('HEADER.ABOUT')}
            </NavLink>
          </li>
	</ul>
        <ul className={styles.rightGroup}>
          {!isLoggedIn && <LanguageSelector hideIcon />}
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
                  <span className={styles.userName}>
                    {currentDisplayName ?? currentUserName}
                  </span>
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
                      <Link to="/user/decks" onClick={closeUserDropdown}>
                        <BsCollection /> <span>{t('HEADER.MY_DECKS')}</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/user/settings" onClick={closeUserDropdown}>
                        <BsGearFill /> <span>{t('HEADER.SETTINGS')}</span>
                      </Link>
                    </li>
                    <LanguageSelector inDropdown />
                    {document.fullscreenEnabled && (
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleFullscreenToggle(); }}>
                          {isFullscreen ? <BsFullscreenExit /> : <BsFullscreen />}
                          <span>{isFullscreen ? t('HEADER.EXIT_FULLSCREEN') : t('HEADER.FULLSCREEN')}</span>
                        </a>
                      </li>
                    )}
                    {isMod && (
                      <li>
                        <Link to="/mod" onClick={closeUserDropdown}>
                          <BsShieldFillCheck /> <span>{t('HEADER.MOD_PAGE')}</span>
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
          aria-label={mobileMenuOpen ? t('HEADER.CLOSE_MENU') : t('HEADER.OPEN_MENU')}
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
                <BsPlayFill /> <span>{t('HEADER.PLAY')}</span>
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
                <BsInfoCircleFill /> <span>{t('HEADER.ABOUT')}</span>
              </Link>
            </li>
            <li>
              {isLoggedIn ? (
                <Link to="/user" onClick={closeMobileMenu}>
                  <BsPersonFill /> <span>{t('HEADER.PROFILE')}</span>
                  {pendingRequestCount > 0 && (
                    <span className={styles.notificationBadge}>
                      {pendingRequestCount}
                    </span>
                  )}
                </Link>
              ) : (
                <Link to="/user/login" onClick={closeMobileMenu}>
                  <BsPersonFill /> <span>{t('HEADER.LOGIN')}</span>
                </Link>
              )}
            </li>
            {isLoggedIn && (
              <li>
                <Link to="/user/decks" onClick={closeMobileMenu}>
                  <BsCollection /> <span>{t('HEADER.MY_DECKS')}</span>
                </Link>
              </li>
            )}
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
                  <BsShieldFillCheck /> <span>{t('HEADER.MOD_PAGE')}</span>
                </Link>
              </li>
            )}
            {document.fullscreenEnabled && (
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); handleFullscreenToggle(); }}>
                  {isFullscreen ? <BsFullscreenExit /> : <BsFullscreen />}
                  <span>{isFullscreen ? t('HEADER.EXIT_FULLSCREEN') : t('HEADER.FULLSCREEN')}</span>
                </a>
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
      <AmbientParticles variant="global" />
      <CookieConsent />
      <AdBlockingRecovery />
      <SessionRecovery />
    </div>
  );
};

export default Header;
