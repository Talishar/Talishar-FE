import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useShowChatMobile from 'hooks/useShowChatMobile';
import { toggleShowChatMobile } from 'features/game/GameSlice';
import classNames from 'classnames';

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
        className={classNames(styles.btn, {
          [styles.buttonActive]: !showChatMobile
        })}
        aria-label="Show Chat"
        onClick={handleClickHideChatToggle}
        title="Show Chat"
        data-tooltip="Show Chat"
        data-placement="bottom"
      >
        {showChatMobile && <FaEye aria-hidden="true" fontSize={'2em'} />}
        {!showChatMobile && <FaEyeSlash aria-hidden="true" fontSize={'2em'} />}
      </button>
    </div>
  );
};

export default HideChatMobileToggle;
