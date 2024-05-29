import React from 'react';
import styles from '../PriorityControl.module.css';
import * as optConst from 'features/options/constants';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { TbCircleNumber1 } from "react-icons/tb";
import useSetting from 'hooks/useSetting';
import classNames from 'classnames';
import { 
  updateOptions, 
  Setting, 
  getSettingsEntity
} from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';

const Skip1PowerAttacksToggle = () => {
  const settingsData = useAppSelector(getSettingsEntity);
  const dispatch = useAppDispatch();
  const setting = useSetting({
    settingName: optConst.SHORTCUT_ATTACK_THRESHOLD
  });
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const initialValues = {
    shortcutAttackThreshold: settingsData[optConst.SHORTCUT_ATTACK_THRESHOLD]?.value,

  };
  
  const handleClickSkip1PowerAttacks = ({ name, value }: Setting) => {
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const buttonStyle = classNames(styles.btn, {
    [styles.buttonActive]:
    Number(initialValues.shortcutAttackThreshold) === 1
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Skip 1 Power Attacks"
        onClick={() =>
          handleClickSkip1PowerAttacks({
            name: optConst.SHORTCUT_ATTACK_THRESHOLD,
            value: Number(initialValues.shortcutAttackThreshold) ? 0 : 1
          })}
        data-tooltip="Skip 1 Power Attacks"
        data-placement="bottom"
      >
        <TbCircleNumber1 aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default Skip1PowerAttacksToggle;
