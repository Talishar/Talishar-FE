import React, { useEffect } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './errorPage.module.css';
import { CLOUD_IMAGES_URL } from 'appConstants';
import {
  CARD_IMAGES_PATH,
  DEFAULT_LANGUAGE,
  LOCALE_DICTIONARY
} from 'utils/multilanguage/constants';
import {
  attemptAssetRecovery,
  shouldAttemptAssetRecovery
} from 'utils/assetRecovery';

const STALE_ASSET_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'importing a module script failed',
  'is not a valid javascript mime type',
  'disallowed mime type',
  'expected a javascript module script',
  'failed to load module script',
  'loading chunk',
  'chunkloaderror',
  'unable to preload css'
];

export const ERROR_CARD_SRC = `${CLOUD_IMAGES_URL}/${CARD_IMAGES_PATH}/${LOCALE_DICTIONARY[DEFAULT_LANGUAGE]}/WTR224.webp`;

export const shouldAutoReloadForStaleAssets = shouldAttemptAssetRecovery;

export const isStaleAssetError = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  return STALE_ASSET_ERROR_PATTERNS.some((pattern) =>
    normalizedMessage.includes(pattern)
  );
};

export const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation();
  console.error(error);
  let statusText = '';
  let errStatus = '';
  let errMessage = '';
  if (typeof error === 'object' && error !== null) {
    if ('statusText' in error) {
      statusText += error.statusText;
    }
    if ('message' in error) {
      statusText += error.message;
    }
    if ('status' in error) {
      errStatus += error.status;
    }
    if ('error' in error) {
      const nestedError = error.error;
      if (
        typeof nestedError === 'object' &&
        nestedError !== null &&
        'message' in nestedError
      ) {
        errMessage += nestedError.message;
      }
    }
  }

  if (statusText === '') {
    statusText = t('ERROR_PAGE.UNKNOWN_ERROR');
  }

  const hasStaleAssets = isStaleAssetError(`${statusText} ${errMessage}`);

  useEffect(() => {
    if (!hasStaleAssets) return;
    attemptAssetRecovery();
  }, [hasStaleAssets]);

  return (
    <main className={styles.container}>
      <article className={styles.article}>
        <h1 style={{ marginBottom: '12px' }}>
          {t(
            hasStaleAssets ? 'ERROR_PAGE.STALE_CACHE_TITLE' : 'ERROR_PAGE.TITLE'
          )}
        </h1>
        {hasStaleAssets ? (
          <div className={styles.refreshInstructions}>
            <p>{t('ERROR_PAGE.STALE_CACHE_MESSAGE')}</p>
            <p>{t('ERROR_PAGE.STALE_CACHE_INSTRUCTION')}</p>
            <p>
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>{' '}
              <span>{t('ERROR_PAGE.WINDOWS_LINUX')}</span>
            </p>
            <p>
              <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>{' '}
              <span>{t('ERROR_PAGE.MAC')}</span>
            </p>
            <p>
              <kbd>Ctrl</kbd> + <kbd>F5</kbd>{' '}
              <span>{t('ERROR_PAGE.OPERA')}</span>
            </p>
            <p>{t('ERROR_PAGE.STALE_CACHE_MOBILE')}</p>
          </div>
        ) : (
          <>
            <p>{t('ERROR_PAGE.MESSAGE')}</p>
            {!!errStatus && <p>{errStatus}</p>}
            <p>
              <i>{statusText}</i>
            </p>
            {!!errMessage && <p>{errMessage}</p>}
          </>
        )}
        <img
          src={ERROR_CARD_SRC}
          alt=""
          style={{ maxWidth: '100%', maxHeight: '100%', marginBottom: '18px' }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          {t('JOIN.BACK')}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          {t('ERROR_PAGE.HOME')}
        </button>
      </article>
    </main>
  );
};
