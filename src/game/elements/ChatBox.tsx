import React from 'react';
import styles from './ChatBox.module.css';

export default function ChatBox() {
  return (
    <div className={styles.chatBoxContainer}>
      <div className={styles.chatBox}>Some text</div>
      <form className={styles.chatInput}>Input</form>
    </div>
  );
}
