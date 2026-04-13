import { useAppDispatch } from 'app/Hooks';
import { clearGameInfo } from 'features/game/GameSlice';
import { useEffect } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import GameList from './components/gameList';
import styles from './Index.module.css';
import News from 'routes/news';
import DevTool from './components/devTool';
import CommunityContent from './components/CommunityContent';
import { QuickJoinProvider } from './components/quickJoin/QuickJoinContext';
import UnifiedGamePanel from './components/UnifiedGamePanel';
import { useGetSystemMessageQuery, useGetUserProfileQuery } from 'features/api/apiSlice';
import SystemMessageModal from 'components/SystemMessageModal/SystemMessageModal';
import useAuth from 'hooks/useAuth';
import { AdUnit } from 'components/ads';
import useAdScript from 'hooks/useAdScript';
import TalisharLogo from '../../img/TalisharLogo.webp';

const Index = () => {
  usePageTitle('Home');
  const dispatch = useAppDispatch();
  const { isLoggedIn, isLoading } = useAuth();

  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery(
    undefined,
    { skip: !isLoggedIn }
  );

  const isSupporter = isLoggedIn
    ? (isProfileLoading ? true : (profileData?.isMetafySupporter ?? false))
    : false;
  const showAds = !isLoading && !isSupporter;
  useAdScript(showAds);
  const { data: systemMessageData } = useGetSystemMessageQuery(undefined, {
    skip: !isLoggedIn
  });

  useEffect(() => {
    dispatch(clearGameInfo());

    let link = document.getElementById('favicon') as HTMLLinkElement;
    if (link) {
      link.href = '/favicon.ico';
    }

    document.body.setAttribute('data-hero-page', 'true');
    return () => {
      document.body.removeAttribute('data-hero-page');
    };
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.bannerSection}>
        <div className={styles.bannerBackground} />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <img src={TalisharLogo} alt="Talishar" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>
            Jump into a game<br />of Flesh &amp; Blood
          </h1>
          <p className={styles.heroSubtitle}>
            Talishar lets you play online for free, right in your browser.{' '}
            Find opponents, test decks, and get games in whenever you want.
          </p>
          <div className={styles.heroCta}>
            <a href="#games" className={styles.heroCtaPrimary}>Join a game</a>
            <a
              href="https://metafy.gg/@talishar/tiers"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroCtaSecondary}
            >
              Support us on Metafy
            </a>
          </div>
        </div>
      </div>
      <div id="games" className={styles.contentSection}>
        <QuickJoinProvider>
          <div className={`${styles.grid}${!isLoggedIn ? ` ${styles.gridLoggedOut}` : ''}`}>
            {import.meta.env.DEV && <DevTool />}
            <div className={styles.gameListContainer}>
              <GameList />
            </div>
            <div className={styles.createGameContainer}>
              <UnifiedGamePanel />
            </div>
          </div>
        </QuickJoinProvider>
        <section className={styles.newsContainer}>
          <News />
        </section>
        {showAds && (
          <div className={styles.adFooter}>
            <div className={styles.adHeader}>
              <span></span>
              <a
                href="https://metafy.gg/@talishar/tiers"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.removeAdsLink}
              >
                Remove ads
              </a>
            </div>
            <AdUnit placement="leaderboard-1" className={styles.desktopAd} />
          </div>
        )}
        <CommunityContent showAds={showAds} />
      </div>
      {systemMessageData?.systemMessage && (
        <SystemMessageModal message={systemMessageData.systemMessage} />
      )}
    </main>
  );
};

export default Index;
