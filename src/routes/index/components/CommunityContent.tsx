import React, { useState, useEffect } from 'react';
import styles from './CommunityContent.module.css';
import {
  fetchDiscordContentCarousel,
  ContentVideo
} from '../../../services/contentService';
import { Trans, useTranslation } from 'react-i18next';
import { AdUnit } from 'components/ads';
import {
  TALISHAR_DISCORD_URL,
  TALISHAR_METAFY_URL
} from 'constants/socialLinks';

interface CommunityContentProps {
  showAds?: boolean;
}

const inferContentType = (title: string, description?: string): string => {
  const text = `${title} ${description ?? ''}`.toLowerCase();
  if (text.includes('podcast') || text.includes('#podcast')) return 'TYPE_PODCAST';
  if (
    text.includes('deck tech') ||
    text.includes('deck guide') ||
    text.includes('decktech')
  )
    return 'TYPE_DECK_TECH';
  if (
    text.includes('recap') ||
    text.includes('calling') ||
    text.includes('pro tour') ||
    text.includes('grand prix') ||
    text.includes('nationals')
  )
    return 'TYPE_LIVE_RECAP';
  return 'TYPE_VIDEO';
};

const CommunityContent: React.FC<CommunityContentProps> = ({ showAds = false }) => {
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const cleanTitle = (title: string): string => {
    let cleaned = title.replace(/https?:\/\/\S+/gi, '').trim();
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    cleaned = cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
    return cleaned.replace(/\s+/g, ' ').trim();
  };

  const getContentTypeLabel = (video: ContentVideo): string => {
    if (video.type === 'metafy') return t('COMMUNITY_CONTENT.TYPE_GUIDE');
    return t(`COMMUNITY_CONTENT.${inferContentType(video.title, video.description)}`);
  };

  const getThumbnail = (video: ContentVideo): string => {
    if (video.type === 'youtube')
      return `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
    if (video.thumbnail) return video.thumbnail;
    if (video.videoId)
      return `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
    return '';
  };

  const handleThumbError = (e: React.SyntheticEvent<HTMLImageElement>, video: ContentVideo) => {
    const img = e.currentTarget;
    if (video.videoId && !img.src.includes('youtube.com')) {
      img.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
    }
  };

  const formatDate = (timestamp: string): string =>
    new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const capitalize = (s: string): string =>
    s.charAt(0).toUpperCase() + s.slice(1);

  const openContent = (video: ContentVideo) => {
    const targetUrl = video.url || video.messageUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const fetchedVideos = await fetchDiscordContentCarousel(20);
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
    const interval = setInterval(loadContent, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className={styles.communityContentContainer}>
        <div className={styles.content}>
          <h2>{t('COMMUNITY_CONTENT.TITLE')}</h2>
          <p className={styles.subtitle}>{t('COMMUNITY_CONTENT.LOADING')}</p>
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <section className={styles.communityContentContainer}>
        <div className={styles.content}>
          <h2>{t('COMMUNITY_CONTENT.TITLE')}</h2>
        </div>
      </section>
    );
  }

  const featured = videos[selectedIndex];
  const secondaryIndex = (selectedIndex + 1) % videos.length;
  const secondary = videos.length > 1 ? videos[secondaryIndex] : null;
  const listVideos = videos
    .map((v, i) => ({ video: v, idx: i }))
    .filter(({ idx }) => idx !== selectedIndex && idx !== secondaryIndex)
    .slice(0, 5);

  const renderEmbed = (video: ContentVideo) => {
    if (video.type === 'metafy') {
      return (
        <button
          type="button"
          className={styles.guideCard}
          onClick={() => openContent(video)}
        >
          {getThumbnail(video) ? (
            <img
              className={styles.guideCardImage}
              src={getThumbnail(video)}
              alt={cleanTitle(video.title)}
              loading="lazy"
            />
          ) : (
            <div className={styles.guideCardFallback} />
          )}
          <div className={styles.guideCardOverlay} />
          <div className={styles.guideCardContent}>
            <span className={styles.guideCardBadge}>{t('COMMUNITY_CONTENT.TYPE_GUIDE')}</span>
            <h4 className={styles.guideCardTitle}>{cleanTitle(video.title)}</h4>
            {video.description && (
              <p className={styles.guideCardDescription}>{video.description}</p>
            )}
          </div>
        </button>
      );
    }

    const src =
      video.type === 'twitch'
        ? `https://player.twitch.tv/?video=${video.videoId}&parent=${window.location.hostname}`
        : `https://www.youtube.com/embed/${video.videoId}?rel=0`;
    return (
      <iframe
        className={styles.videoFrame}
        src={src}
        title={video.title}
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  };

  return (
    <section className={styles.communityContentContainer}>
      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2>{t('COMMUNITY_CONTENT.TITLE')}</h2>
          <p className={styles.subtitle}>{t('COMMUNITY_CONTENT.DISCOVER')}</p>
        </div>

        {/* Hero: featured video + secondary card + ad */}
        <div className={styles.heroLayout}>
          {/* Featured */}
          <div className={styles.featuredSection}>
            <div className={styles.featuredEmbed}>{renderEmbed(featured)}</div>
            <div className={styles.featuredInfo}>
              <h3 className={styles.featuredTitle}>
                {cleanTitle(featured.title)}
              </h3>
              <p className={styles.featuredMeta}>
                <span className={styles.metaAuthor}>
                  {t('COMMUNITY_CONTENT.BY')} {capitalize(featured.author)}
                </span>
                &nbsp;·&nbsp;
                <span className={styles.metaDate}>
                  {formatDate(featured.timestamp)}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.rightColumn}>
            {secondary && (
              <div className={styles.secondarySection}>
                <div className={styles.secondaryEmbed}>
                  {renderEmbed(secondary)}
                </div>
                <div className={styles.secondaryInfo}>
                  <p className={styles.secondaryTitle}>
                    {cleanTitle(secondary.title)}
                  </p>
                  <p className={styles.secondaryMeta}>
                    {t('COMMUNITY_CONTENT.BY')} {capitalize(secondary.author)}&nbsp;·&nbsp;
                    {formatDate(secondary.timestamp)}
                  </p>
                </div>
              </div>
            )}

            {showAds && (
              <div className={styles.communityAdSection}>
                <div className={styles.adHeader}>
                  <a
                    href={TALISHAR_METAFY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.removeAdsLink}
                  >
                    {t('UNITED_GAME_PANEL.REMOVE_ADS')}
                  </a>
                </div>
                <AdUnit placement="mobile-unit-3" />
              </div>
            )}
          </div>
        </div>
        {listVideos.length > 0 && (
          <ul className={styles.videoList}>
            {listVideos.map(({ video, idx }) => (
              <li key={video.videoId}>
                <button
                  className={styles.videoListItem}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <div className={styles.listThumbWrapper}>
                    <img
                      src={getThumbnail(video)}
                      alt={cleanTitle(video.title)}
                      className={styles.thumbImg}
                      loading="lazy"
                      onError={(e) => handleThumbError(e, video)}
                    />
                    <div className={styles.thumbPlayOverlay}>
                      <div className={styles.playCircleSmall} />
                    </div>
                  </div>
                  <div className={styles.listInfo}>
                    <p className={styles.listTitle}>{cleanTitle(video.title)}</p>
                    <p className={styles.listMeta}>
                      {t('COMMUNITY_CONTENT.BY')} {capitalize(video.author)}&nbsp;·&nbsp;
                      {formatDate(video.timestamp)}
                    </p>
                  </div>
                  <span className={styles.contentTypeTag}>
                    {getContentTypeLabel(video)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.ctaBar}>
          <div className={styles.ctaContent}>
            <p className={styles.ctaHeading}>
              {t('COMMUNITY_CONTENT.CTA_HEADING')}
            </p>
            <p className={styles.ctaSub}>
              <Trans i18nKey="COMMUNITY_CONTENT.CTA_SUB" components={{ 1: <strong /> }} />
            </p>
          </div>
          <a
            href={TALISHAR_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.discordButton}
          >
            {t('COMMUNITY_CONTENT.JOIN_DISCORD')}
          </a>
        </div>
          {showAds && (
            <div className={styles.adFooter}>
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
              <AdUnit placement="billboard-1" className={styles.desktopAd} />
              <AdUnit placement="mobile-unit-2" className={styles.mobileAd} />
            </div>
          )}
      </div>
    </section>
  );
};

export default CommunityContent;
