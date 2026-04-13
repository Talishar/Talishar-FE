import React, { useState, useEffect } from 'react';
import styles from '../index/Index.module.css';
import {
  fetchDiscordReleaseNotes,
  DiscordMessage,
  DiscordReaction
} from '../../services/contentService';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';

const formatDate = (timestamp: string) => {
  return new Date(timestamp)
    .toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    .replace(/(\d+)/, (day) => {
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

const News = () => {
  const [discordMessages, setDiscordMessages] = useState<DiscordMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
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
        <h2 className={styles.newsSectionTitle}>Talishar Release Notes</h2>
        <a
          href="https://discord.gg/JykuRkdd5S"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewAllLink}
        >
          View all →
        </a>
      </div>
      <div className={styles.newsHorizontalList}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${styles.newsCard} ${styles.newsCardSkeleton}`} />
          ))
        ) : discordMessages.length > 0 ? (
          discordMessages.slice(0, 3).map((message) => (
            <div key={message.id} className={styles.newsCard}>
              <div className={styles.newsCardHeader}>
                <strong className={styles.newsCardAuthor}>{message.author}</strong>
                <span className={styles.newsCardDate}>{formatDate(message.timestamp)}</span>
              </div>
              {message.content && (
                <p className={styles.newsCardContent}>
                  {parseHtmlToReactElements(message.content)}
                </p>
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
          ))
        ) : (
          <p>No recent announcements. Join our Discord for updates!</p>
        )}
      </div>
    </div>
  );
};

export default News;
