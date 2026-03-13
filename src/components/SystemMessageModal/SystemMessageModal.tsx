import React from 'react';
import { useAcknowledgeSystemMessageMutation } from 'features/api/apiSlice';
import styles from './SystemMessageModal.module.css';

interface SystemMessageModalProps {
  message: string;
}

const SystemMessageModal: React.FC<SystemMessageModalProps> = ({ message }) => {
  const [acknowledge, { isLoading }] = useAcknowledgeSystemMessageMutation();

  const handleAcknowledge = async () => {
    try {
      await acknowledge().unwrap();
    } catch (err) {
      console.error('Failed to acknowledge system message:', err);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>System Message</h2>
        <div className={styles.message}>{message}</div>
        <button
          className={styles.acknowledgeBtn}
          onClick={handleAcknowledge}
          disabled={isLoading}
        >
          {isLoading ? 'Acknowledging...' : 'Acknowledge'}
        </button>
      </div>
    </div>
  );
};

export default SystemMessageModal;
