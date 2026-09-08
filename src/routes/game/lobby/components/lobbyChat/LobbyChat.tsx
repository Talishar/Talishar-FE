import ChatBox from 'routes/game/components/elements/chatBox/ChatBox';
import styles from './LobbyChat.module.css';

const LobbyChat = () => {
  return (
    <div className={styles.container}>
      <ChatBox usePrimary showTabs={false} flushTop />
    </div>
  );
};

export default LobbyChat;
