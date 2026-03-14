import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useShowModal from 'hooks/useShowModals';
import { toggleShowModals } from 'features/game/GameSlice';
import classNames from 'classnames';

const HideModalsToggle = ({
  btnClass,
  activeBtnClass,
  showLabel
}: {
  btnClass?: string;
  activeBtnClass?: string;
  showLabel?: boolean;
} = {}) => {
  const showModal = useShowModal();
  const dispatch = useAppDispatch();

  const handleClickHideWindowsToggle = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.currentTarget.blur();
    dispatch(toggleShowModals());
  };

  const buttonStyle = classNames(btnClass ?? styles.btn, {
    [activeBtnClass ?? styles.buttonActive]: !showModal
  });

  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Show Arena"
        onClick={handleClickHideWindowsToggle}
        data-tooltip="Show Arena"
        data-placement="bottom"
      >
        {showModal && <FaEye aria-hidden="true" />}
        {!showModal && <FaEyeSlash aria-hidden="true" />}
        {showLabel && (showModal ? ' Show Arena' : ' Hide Arena')}
      </button>
    </div>
  );
};

export default HideModalsToggle;
