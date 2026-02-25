import React, { useState, useEffect } from 'react';
import styles from './CommunityContent.module.css';
import { fetchDiscordContentCarousel, ContentVideo } from '../../../services/contentService';

const CommunityContent: React.FC = () => {
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoAdvanceInterval, setAutoAdvanceInterval] = useState(5000); // 5 seconds by default
  const autoAdvanceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

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

  // Auto-scroll carousel with resetable timer
  useEffect(() => {
    if (videos.length === 0) return;

    // Clear existing timer if any
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
    }

    // Set new timer with current interval
    autoAdvanceTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, autoAdvanceInterval);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
    };
  }, [videos.length, autoAdvanceInterval]);

  // Helper function to reset the auto-advance timer
  const resetAutoAdvanceTimer = () => {
    setAutoAdvanceInterval(12000); // Set to 12 seconds after user interaction
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    resetAutoAdvanceTimer();
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    resetAutoAdvanceTimer();
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    resetAutoAdvanceTimer();
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
          Discover content, deck tech, and highlights from the Talishar community
        </p>

        {/* Carousel */}
        <div className={styles.carouselContainer}>
          <div className={styles.carouselWrapper}>
            <div className={styles.videoContainer}>
              {renderVideoEmbed()}
            </div>

            {/* Video Info */}
            <div className={styles.videoInfo}>
              <h3>{cleanTitle(currentVideo.title)}</h3>
              <p className={styles.videoMeta}>
                <span className={styles.author}>By {currentVideo.author.charAt(0).toUpperCase() + currentVideo.author.slice(1)}</span>
                <span className={styles.timestamp}>
                  {new Date(currentVideo.timestamp).toLocaleDateString()}
                </span>
              </p>
              {currentVideo.description && (
                <p className={styles.description}>{currentVideo.description}</p>
              )}
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
        </div>
      </div>
    </section>
  );
};

export default CommunityContent;
