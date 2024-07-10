import React from 'react';
import styles from '../PriorityControl.module.css';
import * as optConst from 'features/options/constants';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { TbSwordOff } from 'react-icons/tb';
import useSetting from 'hooks/useSetting';
import classNames from 'classnames';
import {
  updateOptions,
  Setting,
  getSettingsEntity
} from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';

const SkipAttackReactionsToggle = () => {
  const settingsData = useAppSelector(getSettingsEntity);
  const dispatch = useAppDispatch();
  const setting = useSetting({
    settingName: optConst.SKIP_AR_WINDOW
  });
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const initialValues = {
    skipAttackReactions: settingsData['SkipARWindow']?.value === '1'
  };

  const handleClickPassAttackReactions = ({ name, value }: Setting) => {
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const buttonStyle = classNames(styles.btn, {
    [styles.buttonActive]: Number(initialValues.skipAttackReactions) === 1
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Pass Attack Reactions"
        onClick={() =>
          handleClickPassAttackReactions({
            name: optConst.SKIP_AR_WINDOW,
            value: initialValues.skipAttackReactions ? '0' : '1'
          })
        }
        data-tooltip="Pass Attack Reactions"
        data-placement="bottom"
      >
        <TbSwordOff aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default SkipAttackReactionsToggle;
