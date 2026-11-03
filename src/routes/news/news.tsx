import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import styles from '../index/Index.module.css';
import {
  fetchDiscordReleaseNotes,
  DiscordMessage,
  DiscordReaction
} from '../../services/contentService';
import {
  TALISHAR_CODED_CARDS_URL,
  TALISHAR_DISCORD_URL
} from 'constants/socialLinks';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import { useTranslation } from 'react-i18next';
import { getReleaseNoteTopic, stripLeadingEmoji } from './releaseNoteTopic';

const formatDate = (timestamp: string, locale: string) => {
  const formatted = new Date(timestamp).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Ordinal suffixes only make sense in English.
  if (!locale.startsWith('en')) return formatted;

  return formatted.replace(/(\d+)/, (day) => {
    const d = parseInt(day);
    const suffix =
      d % 10 === 1 && d !== 11
        ? 'st'
        : d % 10 === 2 && d !== 12
        ? 'nd'
        : d % 10 === 3 && d !== 13
        ? 'rd'
        : 'th';
    return day + suffix;
  });
};

const NewsCard = ({ message }: { message: DiscordMessage }) => {
  const { t, i18n } = useTranslation();
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const topic = getReleaseNoteTopic(message.content);
  const content = stripLeadingEmoji(message.content);
  const contentId = `release-note-${message.id}`;

  // Only offer "Read more" when the line clamp actually hides text.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el || expanded) return;
    const measure = () => setIsClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [content, expanded]);

  return (
    <div
      className={`${styles.newsCard} ${
        expanded ? styles.newsCardExpanded : ''
      }`}
    >
      <span className={styles.newsCardTopic} data-topic={topic}>
        {t(`NEWS.TOPICS.${topic}`)}
      </span>
      <div className={styles.newsCardHeader}>
        <strong className={styles.newsCardAuthor}>{message.author}</strong>
        <span className={styles.newsCardDate}>
          {formatDate(message.timestamp, i18n.language)}
        </span>
      </div>
      {content && (
        <p
          id={contentId}
          ref={contentRef}
          className={`${styles.newsCardContent} ${
            expanded ? styles.newsCardContentExpanded : ''
          }`}
        >
          {parseHtmlToReactElements(content)}
        </p>
      )}
      {(isClamped || expanded) && (
        <button
          type="button"
          className={styles.newsCardReadMore}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t('NEWS.SHOW_LESS') : t('NEWS.READ_MORE')}
        </button>
      )}
      {message.reactions && message.reactions.length > 0 && (
        <div className={styles.newsCardReactions}>
          {message.reactions.map((reaction: DiscordReaction) => (
            <span
              key={reaction.emoji.id ?? reaction.emoji.name}
              className={styles.newsCardReaction}
            >
              {reaction.emoji.id ? (
                <img
                  src={`https://cdn.discordapp.com/emojis/${reaction.emoji.id}.webp?size=16`}
                  alt={reaction.emoji.name}
                  title={reaction.emoji.name}
                />
              ) : (
                reaction.emoji.name
              )}
              {reaction.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const News = () => {
  const [discordMessages, setDiscordMessages] = useState<DiscordMessage[]>([]);
  const [loading, setLoading] = useState(true);
  // Initial stuff to allow the lang to change
  const { t } = useTranslation();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const messages = await fetchDiscordReleaseNotes(3);
        setDiscordMessages(messages);
      } catch (error) {
        console.warn('Error loading release notes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
    const interval = setInterval(loadContent, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.newsInner}>
      <div className={styles.newsSectionHeader}>
        <h2 className={styles.newsSectionTitle}>{t('NEWS.TITLE')}</h2>
        <div className={styles.newsSectionLinks}>
          <a
            href={TALISHAR_CODED_CARDS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.codedCardsBadge}
          >
            {t('NEWS.CODED_CARDS')} →
          </a>
          <a
            href={TALISHAR_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.viewAllLink}
          >
            {t('NEWS.VIEW_ALL')} →
          </a>
        </div>
      </div>
      <div className={styles.newsHorizontalList}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`${styles.newsCard} ${styles.newsCardSkeleton}`}
            />
          ))
        ) : discordMessages.length > 0 ? (
          discordMessages
            .slice(0, 3)
            .map((message) => <NewsCard key={message.id} message={message} />)
        ) : (
          <p>{t('NEWS.NO_NEWS')}</p>
        )}
      </div>
    </div>
  );
};

export default News;
