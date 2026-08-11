import { ReactNode } from 'react';
import SwordLoader from 'components/SwordLoader/SwordLoader';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  message: ReactNode;
  detail?: ReactNode;
}

const LoadingScreen = ({ message, detail }: LoadingScreenProps) => (
  <div className={styles.screen} role="status" aria-live="polite">
    <SwordLoader />
    <p className={styles.message}>{message}</p>
    {detail && <p className={styles.detail}>{detail}</p>}
  </div>
);

export default LoadingScreen;
