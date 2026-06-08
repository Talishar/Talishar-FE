import { useAppDispatch } from 'app/Hooks';
import { clearGameInfo } from 'features/game/GameSlice';
import { useEffect, useMemo, useState } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import GameList from './components/gameList';
import styles from './Index.module.css';
import News from 'routes/news';
import DevTool from './components/devTool';
import CommunityContent from './components/CommunityContent';
import { QuickJoinProvider } from './components/quickJoin/QuickJoinContext';
import UnifiedGamePanel from './components/UnifiedGamePanel';
import { useGetSystemMessageQuery } from 'features/api/apiSlice';
import SystemMessageModal from 'components/SystemMessageModal/SystemMessageModal';
import useAuth from 'hooks/useAuth';
import useSupporterStatus from 'hooks/useSupporterStatus';
import useAdScript from 'hooks/useAdScript';
import { AdUnit } from 'components/ads';
import TalisharLogo from '../../img/TalisharLogo.webp';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

const Index = () => {
  usePageTitle('Play FaB Online');
  const dispatch = useAppDispatch();
  const { isLoggedIn, currentUserName } = useAuth();
  const { isSupporter, isLoading } = useSupporterStatus();
  const showAds = !isLoading && !isSupporter;
  const [isBannerHidden, setIsBannerHidden] = useState(false);

  const bannerPreferenceKey = useMemo(() => {
    if (!isLoggedIn || !currentUserName) return null;
    return `talishar_home_banner_hidden_v2_${currentUserName}`;
  }, [isLoggedIn, currentUserName]);
  useAdScript(showAds);

  useEffect(() => {
    if (!showAds) return;

    let videoDiv: HTMLDivElement | null = null;
    if (!document.querySelector('[data-ad="video"]')) {
      videoDiv = document.createElement('div');
      videoDiv.setAttribute('data-ad', 'video');
      document.body.appendChild(videoDiv);
    }

    const ANCHOR_SELECTOR = '[data-ad="anchor"]';
    const hideAnchors = () => {
      document.querySelectorAll(ANCHOR_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
    };
    hideAnchors();
    const observer = new MutationObserver(hideAnchors);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      videoDiv?.remove();
    };
  }, [showAds]);

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

  useEffect(() => {
    if (!isLoggedIn) {
      // Logged out users should always see the banner.
      setIsBannerHidden(false);
      return;
    }

    if (!bannerPreferenceKey) {
      setIsBannerHidden(false);
      return;
    }

    try {
      const stored = localStorage.getItem(bannerPreferenceKey);
      setIsBannerHidden(stored === null ? true : stored === '1');
    } catch {
      setIsBannerHidden(true);
    }
  }, [isLoggedIn, bannerPreferenceKey]);

  const handleToggleBanner = () => {
    const nextHiddenValue = !isBannerHidden;
    setIsBannerHidden(nextHiddenValue);

    if (!bannerPreferenceKey) return;

    try {
      localStorage.setItem(bannerPreferenceKey, nextHiddenValue ? '1' : '0');
    } catch {
      // Ignore storage write failures and keep in-memory toggle behavior.
    }
  };

  return (
    <main className={styles.main}>
      <div className={`${styles.bannerSection}${isLoggedIn && isBannerHidden ? ` ${styles.bannerSectionCompact}` : ''}`}>
        {isLoggedIn && (
          <button
            type="button"
            className={styles.bannerToggle}
            onClick={handleToggleBanner}
            aria-pressed={isBannerHidden}
            aria-label={isBannerHidden ? 'Expand banner' : 'Collapse banner'}
            title={isBannerHidden ? 'Expand banner' : 'Collapse banner'}
          >
            {isBannerHidden ? <BsChevronDown /> : <BsChevronUp />}
          </button>
        )}
        <div className={styles.bannerBackground} />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          {!isBannerHidden && (
            <img src={TalisharLogo} alt="Talishar" className={styles.heroLogo} />
          )}
          {!isBannerHidden && (
            <>
              <h1 className={styles.heroTitle}>
                Play Flesh &amp; Blood Online
              </h1>
              <p className={styles.heroSubtitle}>
                Talishar lets you play FaB online for free, right in your browser.{' '}
                Find opponents, test decks, and get games in whenever you want.
              </p>
              <div className={styles.heroCta}>
                <a href="#games" className={styles.heroCtaPrimary}>Join a game</a>
                {!isSupporter && (
                  <a
                    href={TALISHAR_METAFY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.heroCtaSecondary}
                  >
                    Support us on Metafy
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div id="games" className={styles.contentSection}>
        <QuickJoinProvider>
          <div className={styles.gridWrapper}>
            {import.meta.env.DEV && <DevTool />}
            <div className={`${styles.grid}${!isLoggedIn ? ` ${styles.gridLoggedOut}` : ''}`}>
              <div className={styles.gameListContainer}>
                <GameList />
              </div>
              <div className={styles.createGameContainer}>
                <UnifiedGamePanel />
              </div>
            </div>
          </div>
        </QuickJoinProvider>
        <section className={styles.newsContainer}>
          <News />
        </section>
        {showAds && (
          <div className={styles.adFooter}>
            {!isSupporter && (
              <div className={styles.adHeader}>
                <a
                  href={TALISHAR_METAFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.removeAdsLink}
                >
                  Remove ads
                </a>
              </div>
            )}
            <AdUnit placement="billboard-1" className={styles.desktopAd} />
            <AdUnit placement="mobile-unit-1" className={styles.mobileAd} />
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
