import { useAppDispatch } from 'app/Hooks';
import { clearGameInfo } from 'features/game/GameSlice';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from 'hooks/usePageTitle';
import GameList from './components/gameList';
import { DEV_FAKE_MODE } from './components/gameList/GameList';
import styles from './Index.module.css';
import News from 'routes/news';
import CommunityContent from './components/CommunityContent';
import { QuickJoinProvider } from './components/quickJoin/QuickJoinContext';
import UnifiedGamePanel from './components/UnifiedGamePanel';
import { useGetSystemMessageQuery } from 'features/api/apiSlice';
import SystemMessageModal from 'components/SystemMessageModal/SystemMessageModal';
import useAuth from 'hooks/useAuth';
import useSupporterStatus from 'hooks/useSupporterStatus';
import useAdScript from 'hooks/useAdScript';
import { AdUnit } from 'components/ads/AdUnit';
import TalisharLogo from '../../img/TalisharLogo.webp';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import { Link } from 'react-router-dom';
import RemoveAdsLink from 'components/RemoveAdsLink/RemoveAdsLink';

const LAST_HOME_USER_KEY = 'talishar_home_last_user_v1';

const Index = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.PLAY_FAB_ONLINE'));
  const dispatch = useAppDispatch();
  const { isLoggedIn, isLoading: isAuthLoading, currentUserName } = useAuth();
  const { isSupporter, showAds } = useSupporterStatus();
  const [cachedUserName, setCachedUserName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_HOME_USER_KEY) || null;
    } catch {
      return null;
    }
  });
  const isAuthReady = !isAuthLoading && (!isLoggedIn || !!currentUserName);
  // This is a layout hint only. Queries and account actions still use real auth.
  const layoutUserName = isAuthReady
    ? isLoggedIn
      ? currentUserName
      : null
    : currentUserName || cachedUserName;
  const hasUserLayout = !!layoutUserName;
  const [bannerOverride, setBannerOverride] = useState<{
    key: string | null;
    hidden: boolean;
  } | null>(null);

  const bannerPreferenceKey = useMemo(() => {
    if (!layoutUserName) return null;
    return `talishar_home_banner_hidden_v2_${layoutUserName}`;
  }, [layoutUserName]);
  // Resolve the saved layout during render, before the hero can be painted.
  const savedBannerHidden = useMemo(() => {
    if (!bannerPreferenceKey) return false;
    try {
      const stored = localStorage.getItem(bannerPreferenceKey);
      return stored === null ? true : stored === '1';
    } catch {
      return true;
    }
  }, [bannerPreferenceKey]);
  const isBannerHidden =
    hasUserLayout &&
    (bannerOverride?.key === bannerPreferenceKey
      ? bannerOverride.hidden
      : savedBannerHidden);
  useAdScript(showAds);

  useEffect(() => {
    if (!isAuthReady) return;
    const nextUserName = isLoggedIn ? currentUserName : null;
    setCachedUserName(nextUserName);
    try {
      if (nextUserName) {
        localStorage.setItem(LAST_HOME_USER_KEY, nextUserName);
      } else {
        localStorage.removeItem(LAST_HOME_USER_KEY);
      }
    } catch {
      // Rendering and auth continue normally if storage is unavailable.
    }
  }, [isAuthReady, isLoggedIn, currentUserName]);

  const { data: systemMessageData } = useGetSystemMessageQuery(undefined, {
    skip: !isLoggedIn
  });

  useEffect(() => {
    dispatch(clearGameInfo());

    const link = document.getElementById('favicon') as HTMLLinkElement;
    if (link) {
      link.href = '/favicon.ico';
    }

    document.body.setAttribute('data-hero-page', 'true');
    return () => {
      document.body.removeAttribute('data-hero-page');
    };
  }, []);

  const handleToggleBanner = () => {
    const nextHiddenValue = !isBannerHidden;
    setBannerOverride({ key: bannerPreferenceKey, hidden: nextHiddenValue });

    if (!bannerPreferenceKey) return;

    try {
      localStorage.setItem(bannerPreferenceKey, nextHiddenValue ? '1' : '0');
    } catch {
      // Ignore storage write failures and keep in-memory toggle behavior.
    }
  };

  const gameGrid = (
    <div className={styles.gridWrapper}>
      <div
        className={`${styles.grid}${
          !hasUserLayout ? ` ${styles.gridLoggedOut}` : ''
        }`}
      >
        {(hasUserLayout || DEV_FAKE_MODE) && (
          <div className={styles.gameListContainer}>
            <GameList />
          </div>
        )}
        <div className={styles.createGameContainer}>
          <UnifiedGamePanel userLayout={hasUserLayout} />
        </div>
      </div>
    </div>
  );

  return (
    <main className={styles.main}>
      <div
        className={`${styles.bannerSection}${
          isBannerHidden ? ` ${styles.bannerSectionCompact}` : ''
        }`}
      >
        {hasUserLayout && (
          <button
            type="button"
            className={styles.bannerToggle}
            onClick={handleToggleBanner}
            aria-pressed={isBannerHidden}
            aria-label={
              isBannerHidden
                ? t('HOME.HERO.EXPAND_BANNER')
                : t('HOME.HERO.COLLAPSE_BANNER')
            }
            title={
              isBannerHidden
                ? t('HOME.HERO.EXPAND_BANNER')
                : t('HOME.HERO.COLLAPSE_BANNER')
            }
          >
            {isBannerHidden ? <BsChevronDown /> : <BsChevronUp />}
          </button>
        )}
        <div className={styles.bannerBackground} />
        <div className={styles.bannerOverlay} />
        <div
          className={`${styles.bannerContent}${
            !hasUserLayout ? ` ${styles.bannerContentGuest}` : ''
          }`}
        >
          {!isBannerHidden && (
            <img
              src={TalisharLogo}
              width={1080}
              height={483}
              alt={t('HOME.HERO.LOGO_ALT')}
              className={styles.heroLogo}
            />
          )}
          {!isBannerHidden && (
            <>
              <h1 className={styles.heroTitle}>{t('HOME.HERO.TITLE')}</h1>
              <p className={styles.heroSubtitle}>{t('HOME.HERO.SUBTITLE')}</p>
              <div className={styles.heroCta}>
                {hasUserLayout ? (
                  <>
                    <a href="#games" className={styles.heroCtaPrimary}>
                      {t('HOME.HERO.JOIN_CTA')}
                    </a>
                    {!isSupporter && (
                      <a
                        href={TALISHAR_METAFY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.heroCtaSecondary}
                      >
                        {t('HOME.HERO.SUPPORT_CTA')}
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/user/login" className={styles.heroCtaPrimary}>
                      {t('HOME.HERO.LOGIN_CTA')}
                    </Link>
                    <Link
                      to="/user/login/signup"
                      className={styles.heroCtaSecondary}
                    >
                      {t('HOME.HERO.SIGN_UP_CTA')}
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div id="games" className={styles.contentSection}>
        <QuickJoinProvider>{gameGrid}</QuickJoinProvider>
        <section className={styles.newsContainer}>
          <News />
        </section>
        {showAds && (
          <div className={styles.adFooter}>
            {!isSupporter && (
              <div className={styles.adHeader}>
                <RemoveAdsLink />
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
