import React, { useState, useEffect } from 'react';
import { useAcknowledgeSystemMessageMutation } from 'features/api/apiSlice';
import styles from './SystemMessageModal.module.css';

interface SystemMessageModalProps {
  message: string;
}

const COUNTDOWN_SECONDS = 5;
const CIRCUMFERENCE = 2 * Math.PI * 10;

const SystemMessageModal: React.FC<SystemMessageModalProps> = ({ message }) => {
  const [acknowledge, { isLoading }] = useAcknowledgeSystemMessageMutation();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleAcknowledge = async () => {
    try {
      await acknowledge().unwrap();
    } catch (err) {
      console.error('Failed to acknowledge system message:', err);
    }
  };

  const isDisabled = countdown > 0 || isLoading;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>System Message</h2>
        <div className={styles.message}>{message}</div>
        <button
          className={styles.acknowledgeBtn}
          onClick={handleAcknowledge}
          disabled={isDisabled}
        >
          {countdown > 0 ? (
            <span className={styles.countdownWrapper}>
              <svg width="22" height="22" viewBox="0 0 24 24" className={styles.countdownSvg}>
                <circle cx="12" cy="12" r="10" className={styles.countdownTrack} />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  className={styles.countdownCircle}
                  style={{
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: CIRCUMFERENCE * (1 - countdown / COUNTDOWN_SECONDS),
                  }}
                />
                <text x="12" y="12" className={styles.countdownText}>{countdown}</text>
              </svg>
              <span>Please wait...</span>
            </span>
          ) : isLoading ? (
            'Acknowledging...'
          ) : (
            'Acknowledge'
          )}
        </button>
      </div>
    </div>
  );
};

export default SystemMessageModal;
