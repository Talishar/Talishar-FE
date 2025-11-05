import React, { useState, useEffect } from 'react';
import styles from '../index/Index.module.css';
import NewSetLogo from '../../img/NewSetLogo.webp';
import { fetchDiscordReleaseNotes, DiscordMessage } from '../../services/contentService';

const News = () => {
  const [discordMessages, setDiscordMessages] = useState<DiscordMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const messages = await fetchDiscordReleaseNotes(20); // amount of messages to fetch
        setDiscordMessages(messages);
      } catch (error) {
        console.warn('Error loading release notes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
    // Refresh content every 30 minutes
    const interval = setInterval(loadContent, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.newsWrapper}>
      {/* Featured Section */}
{/*       <h4 className={styles.headlines}> ❄️ Silver Age now available on Talishar! ❄️</h4>
       <a href="https://fabtcg.com/products/product/silver-age/" target="_blank" rel="noopener noreferrer">
        <img src={NewSetLogo} className={styles.NewsLogoSquare} alt="Silver Age - Latest Flesh and Blood expansion set" />
      </a> */}
      

      {/* Release Notes Section - Always Visible */}
      <h3>Latest Release Notes</h3>
      <div className={styles.newsContent}>
        {loading ? (
          <p>Loading release notes...</p>
        ) : discordMessages.length > 0 ? (
          <div className={styles.messagesList}>
            {discordMessages.map((message) => (
              <div key={message.id} className={styles.messageItem}>
                <div className={styles.messageHeader}>
                  <strong>
                    {message.author} - {new Date(message.timestamp).toLocaleDateString('en-US', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }).replace(/(\d+)/, (day) => {
                      const d = parseInt(day);
                      const suffix = d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th';
                      return day + suffix;
                    })}
                  </strong>
                </div>
                {message.content && (
                  <p 
                    className={styles.messageContent}
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                )}
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className={styles.messageAttachments}>
                    {message.attachments.map((attachment, idx) => (
                      <a key={idx} href={attachment.url} target="_blank" rel="noopener noreferrer" className={styles.attachment}>
                        {attachment.content_type?.startsWith('image/') ? (
                          <img src={attachment.url} alt={attachment.filename} className={styles.attachmentImage} />
                        ) : (
                          <div className={styles.attachmentFile}>📎 {attachment.filename}</div>
                        )}
                      </a>
                    ))}
                  </div>
                )}
                
                {/* Embeds */}
                {message.embeds && message.embeds.length > 0 && (
                  <div className={styles.messageEmbeds}>
                    {message.embeds.map((embed, idx) => (
                      <div key={idx} className={styles.messageEmbed}>
                        {embed.title && <h4>{embed.title}</h4>}
                        {embed.description && <p>{embed.description}</p>}
                        {embed.image && <img src={embed.image.url} alt={embed.title} className={styles.embedImage} />}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className={styles.messageReactions}>
                    {message.reactions.map((reaction, idx) => (
                      <span 
                        key={idx} 
                        className={styles.reaction} 
                        title={reaction.emoji.name}
                      >
                        {reaction.emoji.id ? (
                          <img src={`https://cdn.discordapp.com/emojis/${reaction.emoji.id}.webp`} alt={reaction.emoji.name} className={styles.reactionEmoji} />
                        ) : (
                          reaction.emoji.name
                        )}
                        <span className={styles.reactionCount}>{reaction.count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No recent announcements. Join our Discord for updates!</p>
        )}
      </div>
    </div>
  );
};

export default News;
