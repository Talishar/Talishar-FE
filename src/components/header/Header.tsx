import useAuth from 'hooks/useAuth';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import styles from './Header.module.scss';
import TalisharLogo from '../../img/CoinLogo.png';
import { BsGithub, BsPersonFill, BsShieldFillCheck, BsGear } from 'react-icons/bs';
import { FaDiscord, FaTwitter } from 'react-icons/fa';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import LanguageSelector from 'components/LanguageSelector/LanguageSelector';
import { useGetPendingRequestsQuery } from 'features/api/apiSlice';
import CookieConsent from 'components/CookieConsent';
import AdBlockingRecovery from 'components/AdBlockingRecovery';
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
              background: 'var(--dark-red)',
              color: 'var(--white)',
              border: '1px solid var(--primary)',
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
          <li className={styles.languageSelectorListElement}>
            <LanguageSelector />
          </li>
          <li>
            <a
              href="https://github.com/Talishar/Talishar"
              target={'_blank'}
              className={styles.social}
              title={'Github Link'}
            >
              <BsGithub></BsGithub>
            </a>
          </li>
          <li>
            <a
              href="https://discord.gg/JykuRkdd5S"
              target={'_blank'}
              className={styles.social}
              title={'Discord Link'}
            >
              <FaDiscord></FaDiscord>
            </a>
          </li>
          <li>
            <a
              href="https://bsky.app/profile/pvtvoid.bsky.social"
              target={'_blank'}
              className={styles.social}
              title={'Bluesky Link'}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://twitter.com/talishar_online"
              target={'_blank'}
              className={styles.social}
              title={'Twitter Link'}
            >
              <FaTwitter></FaTwitter>
            </a>
          </li>
          {/*
            <li>
            <a href="https://beta.talishar.net/game/Roguelike/CreateGame.php">
              <GiTreasureMap></GiTreasureMap> <span>RogueLike</span>
            </a>
            </li>
            */}
          {isLoggedIn && isMod && (
            <li>
              <Link to="/mod">
                <BsShieldFillCheck size="0.9em"></BsShieldFillCheck> <span>Mod Page</span>
              </Link>
            </li>
          )}
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
      <ChatBar />
    </div>
  );
};

export default Header;
