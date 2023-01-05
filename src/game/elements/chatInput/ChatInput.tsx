import { setupListeners } from '@reduxjs/toolkit/dist/query';
import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import { useSubmitChatMutation } from '../../../features/api/apiSlice';
import styles from './ChatInput.module.css';

export const ChatInput = () => {
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const [chatInput, setChatInput] = useState('');
  const [submitChat, submitChatResult] = useSubmitChatMutation();

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (chatInput.trim() === '') {
      return;
    }
    try {
      await submitChat({
        gameID: gameInfo.gameID,
        playerID: gameInfo.playerID,
        authKey: gameInfo.authKey,
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

  return (
    <div className={styles.chatInputContainer}>
      <form onSubmit={handleSubmit}>
        <input
          className={styles.chatInput}
          value={chatInput}
          onChange={handleChange}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          onKeyDownCapture={(e) => {
            e.stopPropagation();
          }}
          placeholder={
            gameInfo.playerID === 3 ? 'Chat Disabled' : 'Hit return to send.'
          }
          disabled={gameInfo.playerID === 3}
        />
      </form>
    </div>
  );
};

export default ChatInput;
