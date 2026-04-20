import React, { useState, useEffect } from 'react';
import styles from './Learn.module.scss';
import { usePageTitle } from 'hooks/usePageTitle';
import GuideGrid from './components/GuideGrid';
import { fetchMetafyGuides, MetafyGuide } from '../../services/metafyService';
import useSupporterStatus from 'hooks/useSupporterStatus';
import useAdScript from 'hooks/useAdScript';
import PageBanner from 'components/PageBanner/PageBanner';

const Learn: React.FC = () => {
  usePageTitle('Learn');
  const { isSupporter, isLoading: isAuthLoading } = useSupporterStatus();
  const showAds = !isAuthLoading && !isSupporter;
  useAdScript(showAds);
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
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load guides: ${errorMsg}`);
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
      <PageBanner
        title="Learn Flesh & Blood"
        subtitle="Master your skills with expert guides from our community"
      />
      <div className={styles.container}>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading guides...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button
              onClick={() => loadGuides(1)}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        ) : guides.length > 0 ? (
          <>
            <GuideGrid guides={guides} showAds={showAds} />

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
