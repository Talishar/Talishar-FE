import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { GiUsable } from 'react-icons/gi';

const FullControlToggle = () => {
  const dispatch = useAppDispatch();
  const handleClickFullControl = () => {
    console.log('ARGH');
  };
  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Full Control"
        onClick={handleClickFullControl}
        title="Full Control"
        data-tooltip="Full Control"
        data-placement="bottom"
      >
        <GiUsable aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default FullControlToggle;
