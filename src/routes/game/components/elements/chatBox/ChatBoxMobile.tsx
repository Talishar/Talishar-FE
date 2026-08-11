import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ChatInput from '../chatInput/ChatInput';
import styles from './ChatBox.module.css';
import GameLogMessages from './GameLogMessages';
import { useTranslation } from 'react-i18next';

const INITIAL_MOBILE_LOG_MESSAGES = 120;
const MOBILE_LOG_PAGE_SIZE = 200;

export default function ChatBox() {
  const { t } = useTranslation();
  const amIPlayerOne = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 1;
  });
  const [chatFilter] = useState<'none' | 'chat' | 'log'>('none');
  const [logReady, setLogReady] = useState(false);
  const [visibleMessageCount, setVisibleMessageCount] = useState(
    INITIAL_MOBILE_LOG_MESSAGES
  );
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);
  const myName = String(
    useAppSelector((state: RootState) => state.game.playerOne.Name) ?? 'you'
  );
  const oppName = String(
    useAppSelector((state: RootState) => state.game.playerTwo.Name) ??
      'your opponent'
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevChatLengthRef = useRef<number>(0);
  const prevChatFilterRef = useRef<string>('none');

  const visibleChatLog = useMemo(
    () => chatLog?.slice(-visibleMessageCount),
    [chatLog, visibleMessageCount]
  );
  const hasEarlierMessages = (chatLog?.length ?? 0) > visibleMessageCount;

  const playerNames = useMemo<[string, string]>(
    () => [amIPlayerOne ? myName : oppName, amIPlayerOne ? oppName : myName],
    [amIPlayerOne, myName, oppName]
  );

  const transformMessage = useMemo(() => {
    const playerOneName = amIPlayerOne
      ? myName.substring(0, 15)
      : oppName.substring(0, 15);
    const playerTwoName = amIPlayerOne
      ? oppName.substring(0, 15)
      : myName.substring(0, 15);

    return (message: string) =>
      message
        .replace(/Player 1/g, playerOneName)
        .replace(/Player 2/g, playerTwoName);
  }, [amIPlayerOne, myName, oppName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  };

  // Mount the panel and controls first, then parse the game log when the
  // browser is idle. This keeps opening chat responsive on slower phones.
  useEffect(() => {
    const idleId = window.requestIdleCallback?.(
      () => setLogReady(true),
      { timeout: 250 }
    );
    const timeoutId =
      idleId === undefined
        ? window.setTimeout(() => setLogReady(true), 0)
        : undefined;

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!logReady) return;

    const currentLength = chatLog?.length ?? 0;
    const filterChanged = chatFilter !== prevChatFilterRef.current;
    const hasNewMessages = currentLength > prevChatLengthRef.current;

    prevChatLengthRef.current = currentLength;
    prevChatFilterRef.current = chatFilter;

    if (hasNewMessages || filterChanged) {
      scrollToBottom();
    }
  }, [chatLog, chatFilter, logReady]);

  return ReactDOM.createPortal(
    <div className={styles.chatBoxMobileContainer}>
      {/* Message list */}
      <div className={styles.chatMobileScrollArea}>
        {logReady && (
          <>
            {hasEarlierMessages && (
              <button
                type="button"
                className={styles.loadEarlierButton}
                onClick={() =>
                  setVisibleMessageCount(
                    (count) => count + MOBILE_LOG_PAGE_SIZE
                  )
                }
              >
                {t('CHAT.LOAD_EARLIER_MESSAGES')}
              </button>
            )}
            <GameLogMessages
              chatLog={visibleChatLog}
              chatFilter={chatFilter}
              transformMessage={transformMessage}
              playerNames={playerNames}
              mobile
            />
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput />
    </div>,
    document.body
  );
}
