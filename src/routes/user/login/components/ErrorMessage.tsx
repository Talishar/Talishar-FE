import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import styles from './LoginForm.module.css';

const ErrorMessage = ({ error }: { error: string }) => {
  return (
    <div className={styles.alarm}>
      <FaExclamationCircle /> {error}
    </div>
  );
};

export default ErrorMessage;
