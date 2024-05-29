import React from 'react';
import styles from '../PriorityControl.module.css';
import * as optConst from 'features/options/constants';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { GiBouncingSword } from "react-icons/gi";
import useSetting from 'hooks/useSetting';
import classNames from 'classnames';
import { 
  updateOptions, 
  Setting, 
  getSettingsEntity
} from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';

const SkipAllAttacksToggle = () => {
  const settingsData = useAppSelector(getSettingsEntity);
  const dispatch = useAppDispatch();
  const setting = useSetting({
    settingName: optConst.SHORTCUT_ATTACK_THRESHOLD
  });
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const initialValues = {
    shortcutAttackThreshold: settingsData[optConst.SHORTCUT_ATTACK_THRESHOLD]?.value,

  };
  
  const handleClickSkipAllAttacks = ({ name, value }: Setting) => {
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const buttonStyle = classNames(styles.btn, {
    [styles.buttonActive]:
    Number(initialValues.shortcutAttackThreshold) >= 2
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Skip All Attacks"
        onClick={() =>
          handleClickSkipAllAttacks({
            name: optConst.SHORTCUT_ATTACK_THRESHOLD,
            value: Number(initialValues.shortcutAttackThreshold) ? 0 : 99
          })}
        data-tooltip="Skip All Attacks"
        data-placement="bottom"
      >
        <GiBouncingSword aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default SkipAllAttacksToggle;
