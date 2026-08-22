import { ReactNode, useEffect, useState } from 'react';
import SwordLoader from 'components/SwordLoader/SwordLoader';
import { LOADING_TRIVIA } from 'constants/loadingTrivia';
import styles from './LoadingScreen.module.css';

// Short loads shouldn't flash a line of trivia at the players
const TRIVIA_DELAY_MS = 700;
const TRIVIA_ROTATE_MS = 12000;

export const pickTrivia = (
  trivia: readonly string[],
  previous: string | null,
  random = Math.random
): string => {
  if (trivia.length === 0) return '';
  if (trivia.length === 1) return trivia[0];

  const previousIndex = previous === null ? -1 : trivia.indexOf(previous);
  const candidateCount = previousIndex === -1 ? trivia.length : trivia.length - 1;
  const candidateIndex = Math.floor(random() * candidateCount);

  // Draw from n - 1 slots and skip the previous slot without allocating a new array.
  return trivia[
    previousIndex !== -1 && candidateIndex >= previousIndex
      ? candidateIndex + 1
      : candidateIndex
  ];
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
      setTrivia(pickTrivia(LOADING_TRIVIA, null));
      rotateInterval = setInterval(
        () =>
          setTrivia((previous) => pickTrivia(LOADING_TRIVIA, previous)),
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
