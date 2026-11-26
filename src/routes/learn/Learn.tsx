import React, { useState } from 'react';
import styles from './Learn.module.scss';
import { usePageTitle } from 'hooks/usePageTitle';
import GuideGrid from './components/GuideGrid';
import { useGetMetafyGuidesQuery } from 'features/api/apiSlice';
import NavigationPage from 'routes/NavigationPage';
import useAdScript from 'hooks/useAdScript';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { useTranslation } from 'react-i18next';

const Learn: React.FC = () => {
  const { t } = useTranslation();
  const { showAds } = useSupporterStatus();
  useAdScript(showAds);
  usePageTitle(t('LEARN.PAGE_TITLE'));
  const [currentPage, setCurrentPage] = useState(1);
  const { currentData, isFetching, error, refetch } = useGetMetafyGuidesQuery(
    currentPage,
    { refetchOnMountOrArgChange: 60 }
  );
  const guides = currentData?.guides ?? [];
  const totalPages = currentData?.meta.pagination.total_pages ?? 1;

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
    <NavigationPage className={styles.learnPage} title={t('PAGES.LEARN_FAB')}>
      <div className={styles.container}>
        {isFetching && !currentData ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>{t('LEARN.LOADING')}</p>
          </div>
        ) : error && !currentData ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>
              {t('LEARN.LOAD_FAILED', {
                error: 'error' in error ? error.error : t('BASE.UNKNOWN_ERROR')
              })}
            </p>
            <button onClick={() => refetch()} className={styles.retryButton}>
              {t('LEARN.TRY_AGAIN')}
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
                  {t('LEARN.PAGINATION.PREVIOUS')}
                </button>
                <span className={styles.pageInfo}>
                  {t('LEARN.PAGINATION.PAGE_INFO', {
                    page: currentPage,
                    totalPages
                  })}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  {t('LEARN.PAGINATION.NEXT')}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyContainer}>
            <p>{t('LEARN.NO_GUIDES')}</p>
          </div>
        )}
      </div>
    </NavigationPage>
  );
};

export default Learn;
