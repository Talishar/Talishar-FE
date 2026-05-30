import React from 'react';
import styles from '../PriorityControl.module.css';
import * as optConst from 'features/options/constants';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { TbSwordOff } from 'react-icons/tb';
import classNames from 'classnames';
import {
  updateOptions,
  getSettingsEntity
} from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import { useButtonDisableContext } from 'contexts/ButtonDisableContext';

const SkipReactionsToggle = () => {
  const settingsData = useAppSelector(getSettingsEntity);
  const dispatch = useAppDispatch();
  const { isDisabled, triggerDisable } = useButtonDisableContext();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const skipAR = settingsData['SkipARWindow']?.value === '1';
  const skipDR = settingsData['SkipDRWindow']?.value === '1';
  const isActive = skipAR && skipDR;

  const handleClick = () => {
    const newValue = isActive ? '0' : '1';
    triggerDisable();
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [
          { name: optConst.SKIP_AR_WINDOW, value: newValue },
          { name: optConst.SKIP_DR_WINDOW, value: newValue }
        ]
      })
    );
  };

  const buttonStyle = classNames(styles.btn, {
    [styles.buttonActive]: isActive
  });

  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Pass Reactions"
        onClick={handleClick}
        data-tooltip="Pass Reactions (resets at the start of each turn)"
        data-placement="top-end"
        disabled={isDisabled}
      >
        <TbSwordOff aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default SkipReactionsToggle;
