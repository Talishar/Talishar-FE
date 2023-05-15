import { useNavigate, useRouteError } from 'react-router-dom';
import styles from './errorPage.module.css';

export const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();
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
    statusText = 'An unknown error happened!';
  }

  return (
    <main className={styles.container}>
      <article className={styles.article}>
        <h1 style={{ marginBottom: '12px' }}>Oops!</h1>
        <p>Sorry, an error has occurred.</p>
        {!!errStatus && <p>{errStatus}</p>}
        <p>
          <i>{statusText}</i>
        </p>
        {!!errMessage && <p>{errMessage}</p>}
        <img
          src="/cardimages/WTR224.webp"
          style={{ maxWidth: '100%', maxHeight: '100%', marginBottom: '19px' }}
        />
        <button
          onClick={(e) => {
            e.preventDefault;
            navigate(-1);
          }}
        >
          Back
        </button>
        <button
          onClick={(e) => {
            e.preventDefault;
            navigate('/');
          }}
        >
          Home
        </button>
      </article>
    </main>
  );
};
