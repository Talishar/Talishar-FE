import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ChatInput from '../chatInput/ChatInput';
import styles from './ChatBox.module.css';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import classNames from 'classnames';

const CHAT_RE = /<span[^>]*>(.*?):\s<\/span>/;

export default function ChatBox() {
  const amIPlayerOne = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 1;
  });
  const [chatFilter, setChatFilter] = useState<'none' | 'chat' | 'log'>('none');
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);
  const myName =
    String(useAppSelector((state: RootState) => {
      return state.game.playerOne.Name;
    }) ?? 'you');
  const oppName =
    String(useAppSelector((state: RootState) => {
      return state.game.playerTwo.Name;
    }) ?? 'your opponent');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  };

  const chatMessages = chatLog
    ?.filter((message) => {
      switch (chatFilter) {
        case 'none':
          return true;

        case 'chat':
          return message.match(CHAT_RE);

        case 'log':
          return !message.match(CHAT_RE);

        default:
          return true;
      }
    })
    .map((message) => {
      return message
        .replace(
          'Player 1',
          `${
            amIPlayerOne ? myName.substring(0, 15) : oppName.substring(0, 15)
          }`
        )
        .replace(
          'Player 2',
          `${
            amIPlayerOne ? oppName.substring(0, 15) : myName.substring(0, 15)
          }`
        );
    });

  useEffect(() => {
    scrollToBottom();
  }, [chatLog, chatFilter]);

  return (
    // Added inline styles for fixed positioning
    <div className={styles.chatBoxMobileContainer} style={{
      position: 'fixed',
      top: '2vh',
      right: '2vh', 
      zIndex: 1000, 
    }}>
      <div className={styles.chatBoxMobileInner}>
        <div className={styles.chatMobileBox}>
          {chatMessages &&
            chatMessages.map((chat, ix) => {
              return (
                <div key={ix} ref={messagesEndRef}>
                  {parseHtmlToReactElements(chat)}
                </div>
              );
            })}
        </div>
      </div>
      <ChatInput />
    </div>
  );
}
