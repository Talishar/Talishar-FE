import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { BsChatFill } from "react-icons/bs";
import useShowModal from 'hooks/useShowModals';
import { toggleShowModals, toggleChatModal } from 'features/game/GameSlice';
import classNames from 'classnames';
import ChatBoxMobile from '../../../elements/chatBox/ChatBoxMobile';

const ShowMobileChat = () => {
  const showChatModal = useAppSelector((state) => state.game.showChatModal);
  const dispatch = useAppDispatch();

  const handleClickShowMobileChatToggle = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.currentTarget.blur();
    dispatch(toggleChatModal());
  };

  return (
    <div>
      <div style={{ width: '10%' }}>
        <button
          className={classNames(styles.btn, {
            [styles.buttonActive]: showChatModal
          })}
          aria-label="Show Chat"
          onClick={handleClickShowMobileChatToggle}
          data-placement="bottom"
        >
          {showChatModal && <BsChatFill aria-hidden="true" style={{ fontSize: '2em', width: '20px' }} />}
          {!showChatModal && <BsChatFill aria-hidden="true" style={{ fontSize: '2em', width: '20px' }} />}
        </button>
      </div>
      {showChatModal && (
        <div>
          <ChatBoxMobile />
        </div>
      )}
    </div>
  );
};

export default ShowMobileChat;