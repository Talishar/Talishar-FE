import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { BiSkipNextCircle } from "react-icons/bi";
import useSetting from 'hooks/useSetting';
import classNames from 'classnames';
import { updateOptions } from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import {
  HOLD_PRIORITY_SETTING,
  HOLD_PRIORITY_ENUM
} from 'features/options/constants';
import { shallowEqual } from 'react-redux';

const AlwaysPassToggle = () => {
  const dispatch = useAppDispatch();
  const setting = useSetting({
    settingName: HOLD_PRIORITY_SETTING
  });
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const handleClickAlwaysPass = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
    // If on Always Pass, turn off Always Pass
    if (Number(setting?.value) === HOLD_PRIORITY_ENUM.ALWAYS_PASS) {
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
            value: HOLD_PRIORITY_ENUM.ALWAYS_PASS
          }
        ]
      })
    );
  };

  const buttonStyle = classNames(styles.btn, {
    [styles.buttonActive]:
      Number(setting?.value) === HOLD_PRIORITY_ENUM.ALWAYS_PASS
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Always Pass Priority"
        onClick={handleClickAlwaysPass}
        data-tooltip="Always Pass Priority"
        data-placement="bottom"
      >
        <BiSkipNextCircle  aria-hidden="true" fontSize={'2.4em'} />
      </button>
    </div>
  );
};

export default AlwaysPassToggle;
