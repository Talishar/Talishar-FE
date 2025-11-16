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
  const opponentTyping = useAppSelector((state: RootState) => state.game.opponentTyping);
  const myName =
    String(useAppSelector((state: RootState) => {
      return state.game.playerOne.Name;
    }) ?? 'you');
  const oppName =
    String(useAppSelector((state: RootState) => {
      return state.game.playerTwo.Name;
    }) ?? 'your opponent');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
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
          `<b>${
            amIPlayerOne ? myName.substring(0, 15) : oppName.substring(0, 15)
          }</b>`
        )
        .replace(
          'Player 2',
          `<b>${
            amIPlayerOne ? oppName.substring(0, 15) : myName.substring(0, 15)
          }</b>`
        );
    });

  useEffect(() => {
    scrollToBottom();
  }, [chatLog, chatFilter]);

  // Scroll when typing indicator appears (with small delay for DOM to update)
  useEffect(() => {
    if (opponentTyping) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [opponentTyping]);

  return (
    // Added inline styles for fixed positioning
    <div className={styles.chatBoxMobileContainer} style={{
      position: 'fixed',
      top: '2vh',
      right: '2vh', 
      zIndex: 1000, 
    }}>
      <div className={styles.chatBoxMobileInner}>
        <div className={styles.chatMobileBox} ref={chatBoxRef}>
          {chatMessages &&
            chatMessages.map((chat, ix) => {
              return (
                <div key={ix}>
                  {parseHtmlToReactElements(chat)}
                </div>
              );
            })}
          {opponentTyping && (
            <div className={styles.typingIndicator}>
              <i>{oppName.substring(0, 15)} is typing...</i>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput />
    </div>
  );
}
