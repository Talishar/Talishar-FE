import { ReactNode, useEffect, useState } from 'react';
import SwordLoader from 'components/SwordLoader/SwordLoader';
import { LOADING_TRIVIA } from 'constants/loadingTrivia';
import styles from './LoadingScreen.module.css';

// Short loads shouldn't flash a line of trivia at the players
const TRIVIA_DELAY_MS = 700;
const TRIVIA_ROTATE_MS = 12000;

const pickTrivia = (previous: string | null): string => {
  if (LOADING_TRIVIA.length === 0) return '';
  const candidates =
    LOADING_TRIVIA.length > 1
      ? LOADING_TRIVIA.filter((trivia) => trivia !== previous)
      : LOADING_TRIVIA;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

const useLoadingTrivia = (enabled: boolean) => {
  const [trivia, setTrivia] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setTrivia(null);
      return;
    }

    let rotateInterval: ReturnType<typeof setInterval> | undefined;
    const showTimeout = setTimeout(() => {
      setTrivia(pickTrivia(null));
      rotateInterval = setInterval(
        () => setTrivia((previous) => pickTrivia(previous)),
        TRIVIA_ROTATE_MS
      );
    }, TRIVIA_DELAY_MS);

    return () => {
      clearTimeout(showTimeout);
      if (rotateInterval) clearInterval(rotateInterval);
    };
  }, [enabled]);

  return trivia;
};

interface LoadingScreenProps {
  message: ReactNode;
  detail?: ReactNode;
  showTrivia?: boolean;
}

const LoadingScreen = ({
  message,
  detail,
  showTrivia = true
}: LoadingScreenProps) => {
  const trivia = useLoadingTrivia(showTrivia && !detail);

  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <SwordLoader />
      <p className={styles.message}>{message}</p>
      {detail && <p className={styles.detail}>{detail}</p>}
      {trivia && (
        <p className={styles.trivia} aria-hidden="true" key={trivia}>
          {trivia}
        </p>
      )}
    </div>
  );
};

export default LoadingScreen;
