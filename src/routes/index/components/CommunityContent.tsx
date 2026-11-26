import React, { useState, useEffect } from 'react';
import styles from './CommunityContent.module.css';
import {
  fetchDiscordContentCarousel,
  peekDiscordContentCarousel,
  ContentVideo
} from '../../../services/contentService';
import { Trans, useTranslation } from 'react-i18next';
import { FiExternalLink, FiPlay } from 'react-icons/fi';
import { TALISHAR_DISCORD_URL } from 'constants/socialLinks';

interface CommunityContentProps {
  showAds?: boolean;
}

const inferContentType = (title: string, description?: string): string => {
  const text = `${title} ${description ?? ''}`.toLowerCase();
  if (text.includes('podcast') || text.includes('#podcast'))
    return 'TYPE_PODCAST';
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

const CommunityContent: React.FC<CommunityContentProps> = ({
  showAds = false
}) => {
  const [videos, setVideos] = useState<ContentVideo[]>(
    () => peekDiscordContentCarousel(20) ?? []
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(
    () => peekDiscordContentCarousel(20) === undefined
  );
  const { t, i18n } = useTranslation();

  const cleanTitle = (title: string): string => {
    let cleaned = title
      .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, '$1')
      .replace(/<[^>]*>|https?:\/\/[^\s<>]+/gi, '');
    cleaned = cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
    return cleaned.replace(/\s+/g, ' ').trim();
  };

  const getTitle = (video: ContentVideo): string => {
    const mediaTitle = video.mediaTitle?.trim();
    if (mediaTitle) return mediaTitle;

    const caption = cleanTitle(video.title);
    if (/[\p{L}\p{N}]/u.test(caption)) return caption;

    if (video.type === 'metafy') return t('COMMUNITY_CONTENT.FALLBACK_METAFY');
    if (video.type === 'twitch') return t('COMMUNITY_CONTENT.FALLBACK_TWITCH');
    return t('COMMUNITY_CONTENT.FALLBACK_YOUTUBE');
  };

  const getContentTypeLabel = (video: ContentVideo): string => {
    if (video.type === 'metafy') return t('COMMUNITY_CONTENT.TYPE_GUIDE');
    const text = `${video.mediaTitle ?? ''} ${video.title}`;
    switch (inferContentType(text, video.description)) {
      case 'TYPE_PODCAST':
        return t('COMMUNITY_CONTENT.TYPE_PODCAST');
      case 'TYPE_DECK_TECH':
        return t('COMMUNITY_CONTENT.TYPE_DECK_TECH');
      case 'TYPE_LIVE_RECAP':
        return t('COMMUNITY_CONTENT.TYPE_LIVE_RECAP');
      default:
        return t('COMMUNITY_CONTENT.TYPE_VIDEO');
    }
  };

  const getThumbnail = (video: ContentVideo): string => {
    if (video.type === 'youtube' || video.type === 'fabinsights')
      return `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
    return video.thumbnail ?? '';
  };

  const formatDate = (timestamp: string): string =>
    new Date(timestamp).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const capitalize = (s: string): string =>
    s.charAt(0).toUpperCase() + s.slice(1);

  const renderMeta = (video: ContentVideo) => (
    <>
      <span className={styles.metaAuthor}>
        {t('COMMUNITY_CONTENT.BY')} {capitalize(video.author)}
      </span>
      <span aria-hidden="true"> · </span>
      <time dateTime={video.timestamp}>{formatDate(video.timestamp)}</time>
    </>
  );

  const openContent = (video: ContentVideo) => {
    const targetUrl = video.url || video.messageUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    const loadContent = async () => {
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

  const featuredIndex = selectedIndex < videos.length ? selectedIndex : 0;
  const featured = videos[featuredIndex];
  const secondaryIndex = (featuredIndex + 1) % videos.length;
  const secondary = videos.length > 1 ? videos[secondaryIndex] : null;
  const listVideos = videos
    .map((v, i) => ({ video: v, idx: i }))
    .filter(({ idx }) => idx !== featuredIndex && idx !== secondaryIndex)
    .slice(0, 5);

  const renderEmbed = (video: ContentVideo, title: string) => {
    if (video.type === 'metafy') {
      const thumbnail = getThumbnail(video);
      return (
        <button
          type="button"
          className={styles.guideCard}
          aria-label={title}
          onClick={() => openContent(video)}
        >
          <FiExternalLink
            className={styles.guideCardFallback}
            aria-hidden="true"
          />
          {thumbnail && (
            <img
              key={thumbnail}
              className={styles.guideCardImage}
              src={thumbnail}
              alt=""
              loading="lazy"
              onError={(event) => (event.currentTarget.hidden = true)}
            />
          )}
          <span className={styles.guideCardBadge}>
            {t('COMMUNITY_CONTENT.TYPE_GUIDE')}
          </span>
        </button>
      );
    }

    const src =
      video.type === 'twitch'
        ? `https://player.twitch.tv/?video=${video.videoId}&parent=${window.location.hostname}`
        : `https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`;
    return (
      <iframe
        className={styles.videoFrame}
        src={src}
        title={title}
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  };

  const skeletonText = (
    <span className={styles.textSkeleton} aria-hidden="true" />
  );
  const renderCard = (
    video: ContentVideo | undefined | null,
    primary: boolean
  ) => {
    const title = video ? getTitle(video) : undefined;
    return (
      <div
        className={`${styles.mediaCard}${
          primary ? ` ${styles.featuredCard}` : ''
        }${!loading && !video ? ` ${styles.unavailable}` : ''}`}
        data-testid={primary ? 'community-featured' : 'community-secondary'}
      >
        <div
          className={`${styles.mediaEmbed}${
            loading ? ` ${styles.mediaSkeleton}` : ''
          }`}
        >
          {video && title && renderEmbed(video, title)}
        </div>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle} data-compact-tooltip={title} dir="auto">
            {title ?? skeletonText}
          </h3>
          <p className={styles.cardMeta}>
            {video ? renderMeta(video) : skeletonText}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.communityContentContainer}>
      <div className={styles.content}>
        {loading && (
          <span className={styles.loadingStatus} role="status">
            {t('COMMUNITY_CONTENT.LOADING')}
          </span>
        )}
        <div className={styles.sectionHeader}>
          <h2>{t('COMMUNITY_CONTENT.TITLE')}</h2>
          <p className={styles.subtitle}>{t('COMMUNITY_CONTENT.DISCOVER')}</p>
        </div>

        <div className={styles.heroLayout}>
          {renderCard(featured, true)}
          {renderCard(secondary, false)}
        </div>
        <ul className={styles.videoList}>
          {listVideos.map(({ video, idx }) => {
            const title = getTitle(video);
            const thumbnail = getThumbnail(video);
            return (
              <li key={video.videoId}>
                <button
                  type="button"
                  className={styles.videoListItem}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <div className={styles.listThumbWrapper} aria-hidden="true">
                    {video.type === 'metafy' ? <FiExternalLink /> : <FiPlay />}
                    {thumbnail && (
                      <img
                        key={thumbnail}
                        src={thumbnail}
                        alt=""
                        className={styles.thumbImg}
                        loading="lazy"
                        onError={(event) => (event.currentTarget.hidden = true)}
                      />
                    )}
                  </div>
                  <div className={styles.listInfo}>
                    <p
                      className={styles.listTitle}
                      data-compact-tooltip={title}
                      dir="auto"
                    >
                      {title}
                    </p>
                    <p className={styles.listMeta}>{renderMeta(video)}</p>
                  </div>
                  <span className={styles.contentTypeTag}>
                    {getContentTypeLabel(video)}
                  </span>
                </button>
              </li>
            );
          })}
          {Array.from({ length: 5 - listVideos.length }, (_, index) => (
            <li
              key={`placeholder-${index}`}
              className={!loading ? styles.unavailable : undefined}
              aria-hidden="true"
            >
              <div className={styles.videoListItem}>
                <span
                  className={`${styles.listThumbWrapper} ${styles.mediaSkeleton}`}
                />
                <div className={styles.listInfo}>
                  <p className={styles.listTitle}>{skeletonText}</p>
                  <p className={styles.listMeta}>{skeletonText}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.ctaBar}>
          <div className={styles.ctaContent}>
            <p className={styles.ctaHeading}>
              {t('COMMUNITY_CONTENT.CTA_HEADING')}
            </p>
            <p className={styles.ctaSub}>
              <Trans
                i18nKey="COMMUNITY_CONTENT.CTA_SUB"
                components={{ 1: <strong /> }}
              />
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
      </div>
    </section>
  );
};

export default CommunityContent;
