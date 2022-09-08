import React from 'react';
import { useAppSelector } from '../../app/Hooks';
import { RootState } from '../../app/Store';
import styles from './ChatBox.module.css';

export default function ChatBox() {
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);

  // TODO We really should not be dangerouslySetInnerHTML it's pretty bad mmkay
  return (
    <div className={styles.chatBoxContainer}>
      <div className={styles.chatBox}>
        {chatLog &&
          chatLog.map((chat, ix) => {
            return (
              <div dangerouslySetInnerHTML={{ __html: chat }} key={ix}></div>
            );
          })}
      </div>
      <form className={styles.chatInput}>Input</form>
    </div>
  );
}
