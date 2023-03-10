import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { GiUsable } from 'react-icons/gi';
import useSetting from 'hooks/useSetting';
import { HOLD_PRIORITY_SETTING } from 'appConstants';
import classNames from 'classnames';

const FullControlToggle = () => {
  const dispatch = useAppDispatch();
  const setting = useSetting({
    settingName: 'HoldPrioritySetting'
  });

  const handleClickFullControl = () => {
    // IF ON
    if (Number(setting?.value) === HOLD_PRIORITY_SETTING.ALWAYS_HOLD) {
      // API CALL PUT THE SETTING ON
      return;
    }

    // IF ON
    // API CALL PUT OFF
  };

  const buttonStyle = classNames(styles.btn, {
    [styles.buttonActive]:
      Number(setting?.value) === HOLD_PRIORITY_SETTING.ALWAYS_HOLD
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Full Control"
        onClick={handleClickFullControl}
        title="Full Control"
        data-tooltip="Full Control (not implemented)"
        data-placement="bottom"
        disabled
        aria-disabled={true}
      >
        <GiUsable aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default FullControlToggle;
