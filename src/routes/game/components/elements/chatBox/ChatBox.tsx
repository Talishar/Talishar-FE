import React, { useEffect, useMemo, useRef } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ChatInput from '../chatInput/ChatInput';
import styles from './ChatBox.module.css';
import { replaceText } from 'utils/ParseEscapedString';

export default function ChatBox() {
  const amIPlayerOne = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 1;
  });
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);
  const myName =
    useAppSelector((state: RootState) => {
      return state.game.playerOne.Name;
    }) ?? 'you';
  const oppName =
    useAppSelector((state: RootState) => {
      return state.game.playerTwo.Name;
    }) ?? 'your opponent';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  };

  const chatMessages = chatLog?.map((message) => {
    return message
      .replace(
        'Player 1',
        `<b>${(amIPlayerOne ? myName : oppName) ?? 'Player 1'}</b>`
      )
      .replace(
        'Player 2',
        `<b>${(amIPlayerOne ? oppName : myName) ?? 'Player 2'}</b>`
      );
  });

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  // TODO We really should not be dangerouslySetInnerHTML
  return (
    <div className={styles.chatBoxContainer}>
      <div className={styles.chatBoxInner}>
        <div className={styles.chatBox}>
          {chatMessages &&
            chatMessages.map((chat, ix) => {
              return (
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceText(chat)
                  }}
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
