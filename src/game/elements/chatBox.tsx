import React from 'react';
import styles from './chatBox.module.css';

export function ChatBox() {
  return (
    <div className={styles.chatBoxContainer}>
      <div className={styles.chatBox}>Some text</div>
      <form className={styles.chatInput}>Input</form>
    </div>
  );
}
