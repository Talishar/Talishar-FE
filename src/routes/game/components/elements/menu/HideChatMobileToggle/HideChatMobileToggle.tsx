import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useShowChatMobile from 'hooks/useShowChatMobile';
import { toggleShowChatMobile } from 'features/game/GameSlice';
import classNames from 'classnames';
import { BsChatFill } from 'react-icons/bs';

const HideChatMobileToggle = () => {
  const showChatMobile = useShowChatMobile();
  const dispatch = useAppDispatch();

  const handleClickHideChatToggle = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.currentTarget.blur();
    dispatch(toggleShowChatMobile());
  };

  return (
    <div>
      <button
        className={classNames(styles.btn)}
        aria-label="Show Chat"
        onClick={handleClickHideChatToggle}
        title="Show Chat"
        data-tooltip="Show Chat"
        data-placement="bottom"
      >
        <BsChatFill aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default HideChatMobileToggle;
