import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  useChooseFirstPlayerMutation,
  useSubmitChatMutation,
  useSubmitLobbyInputMutation,
  useReportTypingMutation
} from 'features/api/apiSlice';
import styles from './ChatInput.module.css';
import { GiChatBubble } from 'react-icons/gi';
import classNames from 'classnames';
import { shallowEqual } from 'react-redux';
import { getGameInfo, submitButton } from 'features/game/GameSlice';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
  FloatingOverlay
} from '@floating-ui/react';
import { createPortal } from 'react-dom';
import { PROCESS_INPUT } from 'appConstants';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuth from 'hooks/useAuth';
import { CHAT_WHEEL } from 'constants/chatMessages';

const submitButtonClass = classNames(styles.buttonDiv);

interface ChatOptionsProps {
  setModalDisplay: (arg0: boolean) => void;
}

export const ChatInput = ({ usePrimary = false }: { usePrimary?: boolean }) => {
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const { isMod } = useAuth();
  const chatEnabled = useAppSelector((state) => state.game.chatEnabled);
  const dispatch = useAppDispatch();

  const [chatInput, setChatInput] = useState('');
  const [submitChat, submitChatResult] = useSubmitChatMutation();
  const [reportTyping] = useReportTypingMutation();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Allow players (playerID 1-2) or mods spectating (playerID 3 but isMod true)
  const canChat = playerID !== 3 || (playerID === 3 && isMod);

  const handleTyping = async () => {
    // TEMPORARILY DISABLED: ChatTyping reporting
    // // Clear existing timeout
    // if (typingTimeoutRef.current) {
    //   clearTimeout(typingTimeoutRef.current);
    // }
    //
    // // Report typing to backend
    // try {
    //   await reportTyping({
    //     gameID: gameID,
    //     playerID: playerID
    //   });
    // } catch (err) {
    //   console.error('Failed to report typing:', err);
    // }
    //
    // // Set timeout to stop reporting after 5 seconds of inactivity
    // typingTimeoutRef.current = setTimeout(() => {
    //   typingTimeoutRef.current = null;
    // }, 5000);
  };

  const handleInputFocus = () => {
    handleTyping();

    // Start refresh interval to keep sending typing updates every 2.5 seconds
    if (typingRefreshRef.current) {
      clearInterval(typingRefreshRef.current);
    }
    typingRefreshRef.current = setInterval(() => {
      handleTyping();
    }, 2500);
  };

  const handleInputBlur = () => {
    // Clear timeout when input loses focus
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    // Clear refresh interval
    if (typingRefreshRef.current) {
      clearInterval(typingRefreshRef.current);
      typingRefreshRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingRefreshRef.current) {
        clearInterval(typingRefreshRef.current);
      }
    };
  }, []);

  if (!canChat) {
    return null;
  }

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (chatInput.trim() === '') {
      return;
    }
    try {
      await submitChat({
        gameID: gameID,
        playerID: playerID,
        authKey: authKey,
        chatText: chatInput
      });
    } catch (err) {
      console.error(err);
    }
    setChatInput('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.stopPropagation();
    setChatInput(e.target?.value);
    if (e.target?.value.trim() !== '') {
      handleTyping();
    }
  };

  if (chatEnabled) {
    return (
      <div className={styles.chatInputContainer}>
        <div className={styles.flexBox}>
          <input
            className={styles.chatInput}
            value={chatInput}
            onChange={handleChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDownCapture={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' || e.key === 'Return') {
                handleSubmit(e);
              }
            }}
            placeholder={
              playerID === 3 && !isMod ? 'Chat Disabled' : 'Hit return to send'
            }
            disabled={playerID === 3 && !isMod}
          />
          <button
            className={classNames(styles.buttonDiv, { secondary: !usePrimary })}
            onClick={handleSubmit}>
            <div className={styles.icon}>
              <GiChatBubble />
            </div>
          </button>
        </div>
      </div>
    );
  }
  return <ChatWheel usePrimary={usePrimary} />;
};

const ChatWheel = ({ usePrimary = false }: { usePrimary?: boolean }) => {
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const [modalDisplay, setModalDisplay] = useState<boolean>(false);
  const [chooseFirstPlayer, chooseFirstPlayerData] =
    useChooseFirstPlayerMutation();
  const [submitLobbyInput, submitLobbyInputData] =
    useSubmitLobbyInputMutation();
  const dispatch = useAppDispatch();
  const { refs, floatingStyles, context } = useFloating({
    placement: 'left',
    open: modalDisplay,
    onOpenChange: setModalDisplay,
    middleware: [offset(20), flip(), shift()],
    whileElementsMounted: autoUpdate
  });
  const location = useLocation();
  const [sentChatRequest, setSentChatRequest] = useState<boolean>(false);

  // Press Q to open, Escape closes via FloatingUI dismiss
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'Q') {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        setModalDisplay((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role
  ]);

  const submitChatRequest = async () => {
    if (location.pathname.includes('/lobby/')) {
      try {
        await submitLobbyInput({
          gameName: gameID,
          playerID: playerID,
          authKey: authKey,
          action: 'Request Chat'
        });
        setSentChatRequest(true);
      } catch (err) {
        console.warn(err);
        toast.error('There has been an error!');
      }
    } else {
      dispatch(
        submitButton({ button: { mode: PROCESS_INPUT.ENABLE_CHAT } })
      ).then(() => setSentChatRequest(true));
    }
  };

  return (
    <>
      <div className={classNames(styles.quickChatButton, { [styles.primaryQuickChatButton]: usePrimary })}>
        <button
          ref={refs.setReference}
          className={styles.quickChatToggleButton}
          {...getReferenceProps({ onClick: (e) => e.preventDefault() })}
        >
          Quick Chat
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            submitChatRequest();
          }}
          disabled={sentChatRequest}
        >
          Invite to Chat
        </button>
      </div>
      {modalDisplay &&
        createPortal(
          <FloatingOverlay lockScroll className={styles.floatingOverlay}>
            <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                className={styles.popOver}
                {...getFloatingProps()}
              >
                <div className={styles.chatOptionsContainer}>
                  <ChatOptions setModalDisplay={setModalDisplay} />
                </div>
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>,
          document.body
        )}
    </>
  );
};

const RECENTS_KEY = 'talishar_chat_recents';
const RECENTS_COLLAPSED_KEY = 'talishar_chat_recents_collapsed';
const MAX_RECENTS = 5;

function getRecents(): number[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function addRecent(key: number): void {
  const recents = getRecents().filter((k) => k !== key);
  recents.unshift(key);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
}

const QUICK_CHAT_COOLDOWN_MS = 3000;
let lastQuickChatSent = 0;
let quickChatToastPending = false;

const ChatOptions = ({ setModalDisplay }: ChatOptionsProps) => {
  const [submitChat] = useSubmitChatMutation();
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const [recents, setRecents] = React.useState<number[]>(getRecents);
  const [recentsCollapsed, setRecentsCollapsed] = React.useState<boolean>(
    () => localStorage.getItem(RECENTS_COLLAPSED_KEY) === 'true'
  );
  const allEntries = React.useMemo(() => Array.from(CHAT_WHEEL.entries()), []);

  const toggleRecentsCollapsed = () => {
    setRecentsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(RECENTS_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  const handleSend = (key: number) => {
    const now = Date.now();
    if (now - lastQuickChatSent < QUICK_CHAT_COOLDOWN_MS) {
      if (!quickChatToastPending) {
        quickChatToastPending = true;
        toast.error('Please wait before sending another quick chat.', { duration: 2000 });
        setTimeout(() => { quickChatToastPending = false; }, 2000);
      }
      return;
    }
    lastQuickChatSent = now;
    submitChat({ playerID, gameID, authKey, quickChat: key });
    addRecent(key);
    setRecents(getRecents());
    setModalDisplay(false);
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (n >= 1 && n <= 9) {
        const entry = allEntries[n - 1];
        if (entry) {
          e.preventDefault();
          handleSend(entry[0]);
        }
      } else if (e.key === '0') {
        const entry = allEntries[9];
        if (entry) {
          e.preventDefault();
          handleSend(entry[0]);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [allEntries]);

  return (
    <>
      {recents.length > 0 && (
        <>
          <div
            className={styles.sectionLabel}
            onClick={toggleRecentsCollapsed}
            role="button"
            aria-expanded={!recentsCollapsed}
          >
            ⭐ Recent
            <span className={`${styles.sectionChevron} ${recentsCollapsed ? styles.sectionChevronCollapsed : ''}`}>▾</span>
          </div>
          {!recentsCollapsed && recents.map((key) => (
            <button
              key={`recent${key}`}
              className={styles.chatWheelButton}
              onClick={(e) => { e.preventDefault(); handleSend(key); }}
            >
              {CHAT_WHEEL.get(key)}
            </button>
          ))}
          <div className={styles.sectionDivider} />
        </>
      )}
      {allEntries.map(([key, value], index) => (
        <button
          key={`quickChat${key}`}
          className={styles.chatWheelButton}
          onClick={(e) => { e.preventDefault(); handleSend(key); }}
        >
          {index <= 9 && <span className={styles.keyHint}>{index < 9 ? index + 1 : 0}</span>}
          {value}
        </button>
      ))}
    </>
  );
};

export default ChatInput;
