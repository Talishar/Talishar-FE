import { useRouteError } from 'react-router-dom';

export const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);
  let statusText = '';
  if (typeof error === 'object' && error !== null) {
    if ('statusText' in error) {
      statusText += error.statusText;
    }
    if ('message' in error) {
      statusText += error.message;
    }
  }

  if (statusText === '') {
    statusText = 'An unknown error happened!';
  }

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{statusText}</i>
      </p>
    </div>
  );
};
