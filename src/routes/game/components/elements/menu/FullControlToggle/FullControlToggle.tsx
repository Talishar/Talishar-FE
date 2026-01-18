import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { GiUsable } from 'react-icons/gi';
import useSetting from 'hooks/useSetting';
import classNames from 'classnames';
import { updateOptions } from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import {
  HOLD_PRIORITY_SETTING,
  HOLD_PRIORITY_ENUM
} from 'features/options/constants';
import { shallowEqual } from 'react-redux';
import { useButtonDisableContext } from 'contexts/ButtonDisableContext';

const FullControlToggle = () => {
  const dispatch = useAppDispatch();
  const { isDisabled, triggerDisable } = useButtonDisableContext();
  const setting = useSetting({
    settingName: HOLD_PRIORITY_SETTING
  });
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const handleClickFullControl = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
    triggerDisable();
    // If on full control, turn off full control
    if (Number(setting?.value) === HOLD_PRIORITY_ENUM.ALWAYS_HOLD) {
      dispatch(
        updateOptions({
          game: gameInfo,
          settings: [
            {
              name: HOLD_PRIORITY_SETTING,
              value: HOLD_PRIORITY_ENUM.AUTO
            }
          ]
        })
      );
      return;
    }
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [
          {
            name: HOLD_PRIORITY_SETTING,
            value: HOLD_PRIORITY_ENUM.ALWAYS_HOLD
          }
        ]
      })
    );
  };

  const buttonStyle = classNames(styles.btn, {
    [styles.buttonActive]:
      Number(setting?.value) === HOLD_PRIORITY_ENUM.ALWAYS_HOLD
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Always Hold Priority"
        onClick={handleClickFullControl}
        data-tooltip="Always Hold Priority"
        data-placement="bottom"
        disabled={isDisabled}
      >
        <GiUsable aria-hidden="true" />
      </button>
    </div>
  );
};

export default FullControlToggle;
