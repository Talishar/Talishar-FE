import { useNavigate, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './errorPage.module.css';
import { CARD_IMAGES_PATH, getCollectionCardImagePath } from 'utils';

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
      //@ts-ignore
      if ('message' in error.error) {
        errMessage += error.error.message;
      }
    }
  }

  if (statusText === '') {
    statusText = t('ERROR_PAGE.UNKNOWN_ERROR');
  }

  const errorCardSrc = getCollectionCardImagePath({
    path: CARD_IMAGES_PATH,
    locale: 'en',
    cardNumber: 'WTR224'
  });

  return (
    <main className={styles.container}>
      <article className={styles.article}>
        <h1 style={{ marginBottom: '12px' }}>{t('ERROR_PAGE.TITLE')}</h1>
        <p>{t('ERROR_PAGE.MESSAGE')}</p>
        {!!errStatus && <p>{errStatus}</p>}
        <p>
          <i>{statusText}</i>
        </p>
        {!!errMessage && <p>{errMessage}</p>}
        <img
          src={errorCardSrc}
          alt=""
          style={{ maxWidth: '100%', maxHeight: '100%', marginBottom: '19px' }}
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
