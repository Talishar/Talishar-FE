import React from 'react';
import styles from '../PriorityControl.module.css';
import * as optConst from 'features/options/constants';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { TbShieldHalf } from "react-icons/tb";
import useSetting from 'hooks/useSetting';
import classNames from 'classnames';
import { 
  updateOptions, 
  Setting, 
  getSettingsEntity
} from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';

const SkipDefenseReactionsToggle = () => {
  const settingsData = useAppSelector(getSettingsEntity);
  const dispatch = useAppDispatch();
  const setting = useSetting({
    settingName: optConst.SKIP_DR_WINDOW
  });
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const initialValues = {
    skipDefenseReactions: settingsData['SkipDRWindow']?.value === '1',
  };
  
  const handleClickAlwaysPassDefenseReactions = ({ name, value }: Setting) => {
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const buttonStyle = classNames(styles.btn, {
    [styles.buttonActive]:
      Number(initialValues.skipDefenseReactions) === 1
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Always Pass Defense Reactions"
        onClick={() =>
          handleClickAlwaysPassDefenseReactions({
            name: optConst.SKIP_DR_WINDOW,
            value: initialValues.skipDefenseReactions ? '0' : '1'
          })}
        title="Always Pass Defense Reactions"
        data-tooltip="Always Pass Defense Reactions"
        data-placement="bottom"
        
      >
        <TbShieldHalf aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default SkipDefenseReactionsToggle;
