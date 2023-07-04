import React, { useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { useSubmitChatMutation } from 'features/api/apiSlice';
import styles from './ChatInput.module.css';
import { GiChatBubble } from 'react-icons/gi';
import classNames from 'classnames';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';
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

const submitButtonClass = classNames('secondary', styles.buttonDiv);

export const ChatInput = () => {
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const [chatInput, setChatInput] = useState('');
  const [submitChat, submitChatResult] = useSubmitChatMutation();
  const [chatEnabled, setChatEnabled] = useState<boolean>(false);

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
  return <ChatWheel setChatEnabled={setChatEnabled} />;
};

interface ChatWheelProps {
  setChatEnabled: (boolean) => void;
}

const ChatWheel = ({ setChatEnabled }: ChatWheelProps) => {
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const [modalDisplay, setModalDisplay] = useState<boolean>(false);
  const { refs, floatingStyles, context } = useFloating({
    open: modalDisplay,
    onOpenChange: setModalDisplay,
    middleware: [offset(10), flip(), shift()],
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
        <button ref={refs.setReference} {...getReferenceProps()}>
          Send a Message
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setChatEnabled(true);
          }}
        >
          Invite to Chat
        </button>
      </div>
      {modalDisplay && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className={styles.popOver}
            {...getFloatingProps()}
          >
            <ChatOptions />
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

const ChatOptions = () => {
  return (
    <div>
      <button>Hello</button>
      <button>Can I undo</button>
      <button>You suck</button>
      <button>I suck</button>
    </div>
  );
};

export default ChatInput;
