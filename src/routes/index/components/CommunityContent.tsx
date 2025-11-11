import React, { useState, useEffect } from 'react';
import styles from './CommunityContent.module.css';
import { fetchDiscordContentCarousel, ContentVideo } from '../../../services/contentService';

const CommunityContent: React.FC = () => {
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper function to clean titles by removing HTML tags and URLs
  const cleanTitle = (title: string): string => {
    // Remove URLs
    let cleaned = title.replace(/https?:\/\/\S+/gi, '').trim();
    // Remove HTML tags and decode HTML entities
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    cleaned = cleaned
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
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
    // Refresh every 30 minutes
    const interval = setInterval(loadContent, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    if (videos.length === 0) return;

    const autoScrollInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 5000);

    return () => clearInterval(autoScrollInterval);
  }, [videos.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className={styles.communityContentContainer}>
        <div className={styles.content}>
          <h2>Community & Content Hub</h2>
          <p className={styles.subtitle}>Loading featured content...</p>
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <section className={styles.communityContentContainer}>
        <div className={styles.content}>
          <h2>Community & Content Hub</h2>
          <p className={styles.subtitle}>
            Share your Flesh & Blood gameplay videos in our{' '}
            <a href="https://discord.gg/JykuRkdd5S" target="_blank" rel="noopener noreferrer">
              #talishar-content Discord channel
            </a>
            !
          </p>
        </div>
      </section>
    );
  }

  const currentVideo = videos[currentIndex];

  // Function to render embed based on video type
  const renderVideoEmbed = () => {
    switch (currentVideo.type) {
      case 'youtube':
        return (
          <iframe
            className={styles.videoFrame}
            src={`https://www.youtube.com/embed/${currentVideo.videoId}?rel=0`}
            title={currentVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      case 'twitch':
        return (
          <iframe
            className={styles.videoFrame}
            src={`https://player.twitch.tv/?video=${currentVideo.videoId}&parent=${window.location.hostname}`}
            title={currentVideo.title}
            frameBorder="0"
            allowFullScreen
            allow="autoplay"
          ></iframe>
        );
      default:
        return (
          <iframe
            className={styles.videoFrame}
            src={`https://www.youtube.com/embed/${currentVideo.videoId}?rel=0`}
            title={currentVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
    }
  };

  return (
    <section className={styles.communityContentContainer}>
      <div className={styles.content}>
        <h2>Community & Content Hub</h2>
        <p className={styles.subtitle}>
          Discover featured matches, strategy guides, tournaments, and the latest FAB news
        </p>

        {/* Carousel */}
        <div className={styles.carouselContainer}>
          <div className={styles.carouselWrapper}>
            {/* Video Embed */}
            <div className={styles.videoContainer}>
              {renderVideoEmbed()}
            </div>

            {/* Video Info */}
            <div className={styles.videoInfo}>
              <h3>{cleanTitle(currentVideo.title)}</h3>
              <p className={styles.videoMeta}>
                <span className={styles.author}>By {currentVideo.author}</span>
                <span className={styles.timestamp}>
                  {new Date(currentVideo.timestamp).toLocaleDateString()}
                </span>
              </p>
              {currentVideo.description && (
                <p className={styles.description}>{currentVideo.description}</p>
              )}
              <a
                href={currentVideo.messageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.discordLink}
              >
                View on Discord →
              </a>
            </div>

            {/* Navigation */}
            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={prevSlide}
              aria-label="Previous video"
            >
              ←
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={nextSlide}
              aria-label="Next video"
            >
              →
            </button>
          </div>

          {/* Thumbnails */}
          <div className={styles.thumbnailsContainer}>
            {videos.map((video, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${
                  index === currentIndex ? styles.activeThumbnail : ''
                }`}
                onClick={() => goToSlide(index)}
                title={video.title}
                aria-label={`View video ${index + 1}`}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/default.jpg`}
                  alt={video.title}
                  loading="lazy"
                />
                <div className={styles.thumbnailOverlay}>
                  <span className={styles.playIcon}>▶</span>
                </div>
              </button>
            ))}
          </div>

          {/* Video Counter */}
          <div className={styles.videoCounter}>
            {currentIndex + 1} / {videos.length}
          </div>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <h3>You want us to highlight Your Content?</h3>
          <p>
            Post your Flesh & Blood gameplay videos, podcasts, and strategy content in our{' '}
            <a
              href="https://discord.gg/JykuRkdd5S"
              target="_blank"
              rel="noopener noreferrer"
            >
              #talishar-content Discord channel
            </a>
            ! Share your links and we'll feature your most recent content here.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CommunityContent;
