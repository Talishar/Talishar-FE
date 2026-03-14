import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { BsChatFill } from 'react-icons/bs';
import useShowModal from 'hooks/useShowModals';
import { toggleShowModals, toggleChatModal } from 'features/game/GameSlice';
import classNames from 'classnames';
import ChatBoxMobile from '../../../elements/chatBox/ChatBoxMobile';
import { useButtonDisableContext } from 'contexts/ButtonDisableContext';

const ShowMobileChat = () => {
  const showChatModal = useAppSelector((state) => state.game.showChatModal);
  const dispatch = useAppDispatch();
  const { isDisabled, triggerDisable } = useButtonDisableContext();

  const handleClickShowMobileChatToggle = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.currentTarget.blur();
    triggerDisable();
    dispatch(toggleChatModal());
  };

  return (
    <div>
      <div style={{ width: '10%', position: 'relative', zIndex: 1001 }}>
        <button
          className={classNames(styles.btn, {
            [styles.buttonActive]: showChatModal
          })}
          aria-label="Show Chat"
          onClick={handleClickShowMobileChatToggle}
          data-placement="bottom"
          disabled={isDisabled}
        >
          <BsChatFill aria-hidden="true" />
        </button>
      </div>
      {showChatModal && <ChatBoxMobile />}
    </div>
  );
};

export default ShowMobileChat;
