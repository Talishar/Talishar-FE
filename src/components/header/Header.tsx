import useAuth from 'hooks/useAuth';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import styles from './Header.module.scss';
import TalisharLogo from '../../img/CoinLogo.png';
import { BsPersonFill, BsShieldFillCheck, BsGear } from 'react-icons/bs';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { MdVideoLibrary } from 'react-icons/md';
import SocialDropdown from 'components/header/SocialDropdown';
import { useGetPendingRequestsQuery } from 'features/api/apiSlice';
import CookieConsent from 'components/CookieConsent';
import AdBlockingRecovery from 'components/AdBlockingRecovery';
import SessionRecovery from 'components/SessionRecovery';
import ChatBar from 'components/chatBar/ChatBar';
import { Toaster } from 'react-hot-toast';

const Header = () => {
  const { isLoggedIn, isMod, logOut } = useAuth();
  const { data: pendingData } = useGetPendingRequestsQuery(undefined, {
    skip: !isLoggedIn
  });
  const pendingRequestCount = pendingData?.requests?.length || 0;

  const handleLogOut = (e: React.MouseEvent) => {
    e.preventDefault();
    logOut();
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
              border: '1px solid var(--theme-tertiary-focus)',
              padding: '0.5rem',
              wordBreak: 'break-word',
              maxWidth: '100vh', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              userSelect: 'none',
              msUserSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              zIndex: 10001,
            }
          }}
        />
        <ul>
          <li>
            <Link to="/" className={styles.logo}>
              <img
                src={TalisharLogo}
                alt={'Logo Talishar - link to homepage'}
              />
            </Link>
          </li>
          <li>
            <a
              href="https://linktr.ee/Talishar"
              target={'_blank'}
              className={styles.support}
              title={'Patreon Link'}
            >
              Support Us!
            </a>
          </li>
        </ul>
        <ul>
          {isLoggedIn && isMod && (
            <li>
              <Link to="/mod">
                <BsShieldFillCheck size="0.9em"></BsShieldFillCheck> <span>Mod Page</span>
              </Link>
            </li>
          )}
          {isLoggedIn && isMod && (
            <li>
              <Link to="/game/load">
                <MdVideoLibrary></MdVideoLibrary> <span>Replays</span>
              </Link>
            </li>
          )}
          <SocialDropdown />
          <li>
            {isLoggedIn ? (
              <Link to="/user" className={styles.profileLink}>
                <BsPersonFill></BsPersonFill> <span>Profile</span>
                {pendingRequestCount > 0 && (
                  <span className={styles.notificationBadge}>{pendingRequestCount}</span>
                )}
              </Link>
            ) : (
              <Link to="/user/login" className={styles.login}>
                <button>Login</button>
              </Link>
            )}
          </li>
          {isLoggedIn && (
            <li>
              <Link to="/user/settings">
                <BsGear></BsGear> <span>Settings</span>
              </Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <a href="" onClick={handleLogOut}>
                <RiLogoutBoxRLine></RiLogoutBoxRLine> <span>Logout</span>
              </a>
            </li>
          )}
        </ul>
      </nav>
      <Outlet />
      <CookieConsent />
      <AdBlockingRecovery />
      <SessionRecovery />
      <ChatBar />
    </div>
  );
};

export default Header;
