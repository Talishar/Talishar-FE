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

const submitButtonClass = classNames('secondary', styles.buttonDiv);

interface ChatOptionsProps {
  setModalDisplay: (arg0: boolean) => void;
}

export const ChatInput = () => {
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
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Report typing to backend
    try {
      await reportTyping({
        gameID: gameID,
        playerID: playerID
      });
    } catch (err) {
      console.error('Failed to report typing:', err);
    }

    // Set timeout to stop reporting after 5 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 5000);
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
          <button className={submitButtonClass} onClick={handleSubmit}>
            <div className={styles.icon}>
              <GiChatBubble />
            </div>
          </button>
        </div>
      </div>
    );
  }
  return <ChatWheel />;
};

const ChatWheel = () => {
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
      <div className={styles.quickChatButton}>
        <button
          ref={refs.setReference}
          {...getReferenceProps({ onClick: (e) => e.preventDefault() })}
        >
          Send a Message
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
            <FloatingFocusManager context={context} modal={false}>
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

const ChatOptions = ({ setModalDisplay }: ChatOptionsProps) => {
  const [submitChat, submitChatResult] = useSubmitChatMutation();
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const elements = [] as React.ReactNode[];

  CHAT_WHEEL.forEach((value, key) =>
    elements.push(
      <button
        key={`quickChat${key}`}
        className={styles.chatWheelButton}
        onClick={(e) => {
          e.preventDefault();
          submitChat({
            playerID,
            gameID,
            authKey,
            quickChat: key
          });
          setModalDisplay(false);
        }}
      >
        {value}
      </button>
    )
  );

  return (
    <>
      <h4 className={styles.quickChatHeader}>Quick Chat</h4>
      {elements.map((item) => item)}
    </>
  );
};

export default ChatInput;
