import React, { useEffect, useRef } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ChatInput from '../chatInput/ChatInput';
import styles from './ChatBox.module.css';
import { replaceText } from 'utils/ParseEscapedString';

export default function ChatBox() {
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  // TODO We really should not be dangerouslySetInnerHTML it's pretty bad mmkay
  return (
    <div className={styles.chatBoxContainer}>
      <div className={styles.chatBoxInner}>
        <div className={styles.chatBox}>
          {chatLog &&
            chatLog.map((chat, ix) => {
              return (
                <div
                  dangerouslySetInnerHTML={{ __html: replaceText(chat) }}
                  key={ix}
                  ref={messagesEndRef}
                ></div>
              );
            })}
        </div>
      </div>
      <ChatInput />
    </div>
  );
}
