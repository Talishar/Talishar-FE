import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useShowModal from 'hooks/useShowModals';
import { toggleShowModals } from 'features/game/GameSlice';
import classNames from 'classnames';

const HideModalsToggle = () => {
  const showModal = useShowModal();
  const dispatch = useAppDispatch();

  const handleClickHideWindowsToggle = () => {
    dispatch(toggleShowModals());
  };

  return (
    <div>
      <button
        className={classNames(styles.btn, {
          [styles.buttonActive]: !showModal
        })}
        aria-label="Hide Windows"
        onClick={handleClickHideWindowsToggle}
        title="Hide Windows"
        data-tooltip="Hide Windows"
        data-placement="bottom"
      >
        {showModal && <FaEye aria-hidden="true" fontSize={'1.5em'} />}
        {!showModal && <FaEyeSlash aria-hidden="true" fontSize={'1.5em'} />}
      </button>
    </div>
  );
};

export default HideModalsToggle;
