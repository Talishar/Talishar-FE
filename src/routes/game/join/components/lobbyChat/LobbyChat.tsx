import React from 'react';
import ChatBox from 'routes/game/components/elements/chatBox/ChatBox';
import styles from './LobbyChat.module.css';

const LobbyChat = () => {
  return (
    <div className={styles.container}>
      <ChatBox />
    </div>
  );
};

export default LobbyChat;
