import React from 'react';
import styles from '../Menu.module.css';
import localStyles from './ShowMobileChat.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { BsChatFill } from 'react-icons/bs';
import { toggleChatModal } from 'features/game/GameSlice';
import classNames from 'classnames';
import ChatBoxMobile from '../../../elements/chatBox/ChatBoxMobile';

const ShowMobileChat = () => {
  const showChatModal = useAppSelector((state) => state.game.showChatModal);
  const unreadChatCount = useAppSelector((state) => state.game.unreadChatCount ?? 0);
  const dispatch = useAppDispatch();

  const handleClickShowMobileChatToggle = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.currentTarget.blur();
    dispatch(toggleChatModal());
  };

  const hasUnread = unreadChatCount > 0 && !showChatModal;

  return (
    <div>
      <div style={{ width: '10%', zIndex: 1001 }}>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <button
            className={classNames(styles.btn, {
              [styles.buttonActive]: showChatModal,
              [localStyles.chatBtnUnread]: hasUnread
            })}
            aria-label="Show Chat"
            onClick={handleClickShowMobileChatToggle}
            data-placement="bottom"
          >
            <BsChatFill aria-hidden="true" />
          </button>
          {hasUnread && <div className={localStyles.chatBadge} aria-hidden="true" />}
        </div>
      </div>
      {showChatModal && <ChatBoxMobile />}
    </div>
  );
};

export default ShowMobileChat;
