import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { useSubmitChatMutation } from 'features/api/apiSlice';
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
  FloatingFocusManager
} from '@floating-ui/react';
import { createPortal } from 'react-dom';
import { PROCESS_INPUT } from 'appConstants';

const submitButtonClass = classNames('secondary', styles.buttonDiv);

const CHAT_WHEEL = new Map<number, string>([
  [1, 'Hello'],
  [10, 'Good luck, have fun'],
  [2, 'Want to Chat?'],
  [3, 'Mind if I undo?'],
  [4, 'Do you want to undo?'],
  [5, 'Yes'],
  [6, 'No'],
  [7, 'Thanks!'],
  [8, 'Thinking... Please bear with me!'],
  [9, 'Good game!']
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
              playerID === 3 ? 'Chat Disabled' : 'Hit return to send.'
            }
            disabled={playerID === 3}
          />
          <button className={submitButtonClass} onClick={handleSubmit}>
            <GiChatBubble />
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
  const dispatch = useAppDispatch();
  const { refs, floatingStyles, context } = useFloating({
    placement: 'left',
    open: modalDisplay,
    onOpenChange: setModalDisplay,
    middleware: [offset(20), flip(), shift()],
    whileElementsMounted: autoUpdate
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role
  ]);

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
            dispatch(
              submitButton({ button: { mode: PROCESS_INPUT.ENABLE_CHAT } })
            );
          }}
        >
          Invite to Chat
        </button>
      </div>
      {modalDisplay &&
        createPortal(
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className={styles.popOver}
              {...getFloatingProps()}
            >
              <ChatOptions setModalDisplay={setModalDisplay} />
            </div>
          </FloatingFocusManager>,
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
