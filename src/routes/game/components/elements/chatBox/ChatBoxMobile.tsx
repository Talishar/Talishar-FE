import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ChatInput from '../chatInput/ChatInput';
import styles from './ChatBox.module.css';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';

const CHAT_RE = /<span[^>]*>(.*?):\s<\/span>/;

export default function ChatBox() {
  const amIPlayerOne = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 1;
  });
  const [chatFilter, setChatFilter] = useState<'none' | 'chat' | 'log'>('none');
  const [collapsed, setCollapsed] = useState(false);
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);
  const myName = String(
    useAppSelector((state: RootState) => state.game.playerOne.Name) ?? 'you'
  );
  const oppName = String(
    useAppSelector((state: RootState) => state.game.playerTwo.Name) ?? 'your opponent'
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevChatLengthRef = useRef<number>(0);
  const prevChatFilterRef = useRef<string>('none');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const chatMessages = chatLog
    ?.filter((message) => {
      switch (chatFilter) {
        case 'chat':
          return message.match(CHAT_RE);
        case 'log':
          return !message.match(CHAT_RE);
        default:
          return true;
      }
    })
    .map((message) =>
      message
        .replace(
          /Player 1/g,
          amIPlayerOne ? myName.substring(0, 15) : oppName.substring(0, 15)
        )
        .replace(
          /Player 2/g,
          amIPlayerOne ? oppName.substring(0, 15) : myName.substring(0, 15)
        )
    );

  useEffect(() => {
    if (collapsed) return;

    const currentLength = chatLog?.length ?? 0;
    const filterChanged = chatFilter !== prevChatFilterRef.current;
    const hasNewMessages = currentLength > prevChatLengthRef.current;

    prevChatLengthRef.current = currentLength;
    prevChatFilterRef.current = chatFilter;

    if (hasNewMessages || filterChanged) {
      scrollToBottom();
    }
  }, [chatLog, chatFilter, collapsed]);

  return ReactDOM.createPortal(
    <div className={styles.chatBoxMobileContainer}>
      {/* Message list */}
      {!collapsed && (
        <>
          <div className={styles.chatMobileScrollArea}>
            {chatMessages?.map((chat, ix) => (
              <div key={ix} className={styles.chatMobileMessage}>
                {parseHtmlToReactElements(chat)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput />
        </>
      )}
    </div>,
    document.body
  );
}
