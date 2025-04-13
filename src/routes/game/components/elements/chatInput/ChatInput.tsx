import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  useChooseFirstPlayerMutation,
  useSubmitChatMutation,
  useSubmitLobbyInputMutation
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

const submitButtonClass = classNames('secondary', styles.buttonDiv);

const CHAT_WHEEL = new Map<number, string>([
  [1, 'Hello'],
  [2, 'Good luck, have fun'],
  [3, 'Are you there?'],
  [4, 'Be right back'],
  [5, 'Can I undo?'],
  [6, 'Do you want to undo?'],
  [7, 'Good game!'],
  [8, 'Got to go'],
  [9, 'I think there is a bug'],
  [10, 'No'],
  [11, 'No problem!'],
  [12, 'Okay!'],
  [13, 'Refresh the page'],
  [14, 'Sorry!'],
  [15, 'Thanks!'],
  [16, 'Thinking... Please bear with me!'],
  [17, 'Want to Chat?'],
  [18, 'Whoops!'],
  [19, 'Yes']
]);

interface ChatOptionsProps {
  setModalDisplay: (arg0: boolean) => void;
}

export const ChatInput = () => {
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const chatEnabled = useAppSelector((state) => state.game.chatEnabled);

  const [chatInput, setChatInput] = useState('');
  const [submitChat, submitChatResult] = useSubmitChatMutation();

  if (playerID === 3) {
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
  };

  if (chatEnabled) {
    return (
      <div className={styles.chatInputContainer}>
        <div className={styles.flexBox}>
          <input
            className={styles.chatInput}
            value={chatInput}
            onChange={handleChange}
            onKeyDownCapture={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' || e.key === 'Return') {
                handleSubmit(e);
              }
            }}
            placeholder={
              playerID === 3 ? 'Chat Disabled' : 'Hit return to send'
            }
            disabled={playerID === 3}
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
