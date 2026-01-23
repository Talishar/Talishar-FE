import React, { useState, useEffect } from 'react';
import styles from './Learn.module.scss';
import { usePageTitle } from 'hooks/usePageTitle';
import GuideGrid from './components/GuideGrid';
import { fetchMetafyGuides, MetafyGuide } from '../../services/metafyService';

const Learn: React.FC = () => {
  usePageTitle('Learn');
  const [guides, setGuides] = useState<MetafyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadGuides(currentPage);
  }, [currentPage]);

  const loadGuides = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchMetafyGuides(page, 20);
      setGuides(result.guides);
      setTotalPages(result.meta.pagination.total_pages);
    } catch (err) {
      setError('Failed to load guides. Please try again later.');
      console.error('Error loading guides:', err);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <main className={styles.learnPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Learn Flesh & Blood</h1>
          <p className={styles.subtitle}>
            Master your skills with expert guides from our community
          </p>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading guides...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button onClick={() => loadGuides(1)} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        ) : guides.length > 0 ? (
          <>
            <GuideGrid guides={guides} />
            
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  ← Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyContainer}>
            <p>No guides available at this time.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Learn;
