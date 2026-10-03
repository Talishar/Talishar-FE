import { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ChatInput from '../chatInput/ChatInput';
import styles from './ChatBox.module.css';
import GameLogMessages from './GameLogMessages';
import { useTranslation } from 'react-i18next';

const INITIAL_MOBILE_LOG_MESSAGES = 120;
const MOBILE_LOG_PAGE_SIZE = 200;
const CHAT_FILTER_STORAGE_KEY = 'mobileChatFilter';

type ChatFilter = 'none' | 'chat' | 'log';

const CHAT_FILTERS: { value: ChatFilter; label: string }[] = [
  { value: 'none', label: 'CHAT.ALL' },
  { value: 'chat', label: 'CHAT.CHAT' },
  { value: 'log', label: 'CHAT.LOG' }
];

const readStoredFilter = (): ChatFilter => {
  try {
    const stored = localStorage.getItem(CHAT_FILTER_STORAGE_KEY);
    return stored === 'chat' || stored === 'log' ? stored : 'none';
  } catch {
    return 'none';
  }
};

const storeFilter = (filter: ChatFilter) => {
  try {
    localStorage.setItem(CHAT_FILTER_STORAGE_KEY, filter);
  } catch {
    return;
  }
};

export default function ChatBox() {
  const { t } = useTranslation();
  const amIPlayerOne = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 1;
  });
  const [chatFilter, setChatFilter] = useState<ChatFilter>(readStoredFilter);
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

  const showFullLog = chatFilter === 'chat';
  const visibleChatLog = useMemo(
    () => (showFullLog ? chatLog : chatLog?.slice(-visibleMessageCount)),
    [chatLog, visibleMessageCount, showFullLog]
  );
  const hasEarlierMessages =
    !showFullLog && (chatLog?.length ?? 0) > visibleMessageCount;

  const selectFilter = (filter: ChatFilter) => {
    setChatFilter(filter);
    storeFilter(filter);
  };

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
    const idleId = window.requestIdleCallback?.(() => setLogReady(true), {
      timeout: 250
    });
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
      <div className={styles.chatMobileHeader}>
        <div
          role="tablist"
          aria-label={t('CHAT.CHAT')}
          className={styles.chatMobileTabs}
        >
          {CHAT_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={chatFilter === value}
              className={
                chatFilter === value
                  ? styles.chatMobileTabActive
                  : styles.chatMobileTab
              }
              onClick={() => selectFilter(value)}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>
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
