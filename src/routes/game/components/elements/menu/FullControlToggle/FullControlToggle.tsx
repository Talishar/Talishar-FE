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
        title="enter or leave full control mode"
        data-tooltip="Full Control"
        data-placement="bottom"
      >
        <GiUsable aria-hidden="true" fontSize={'1.5em'} />
      </button>
    </div>
  );
};

export default FullControlToggle;
