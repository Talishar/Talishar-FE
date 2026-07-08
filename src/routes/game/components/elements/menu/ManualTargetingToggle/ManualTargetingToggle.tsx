import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { BiSolidBullseye } from 'react-icons/bi';
import useSetting from 'hooks/useSetting';
import classNames from 'classnames';
import { updateOptions } from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { AUTO_TARGET_OPPONENT } from 'features/options/constants';
import { shallowEqual } from 'react-redux';
import { useButtonDisableContext } from 'contexts/ButtonDisableContext';

const ManualTargetingToggle = ({
  btnClass,
  activeBtnClass,
  showLabel,
  placement = 'top'
}: {
  btnClass?: string;
  activeBtnClass?: string;
  showLabel?: boolean;
  placement?: 'top' | 'top-end';
} = {}) => {
  const dispatch = useAppDispatch();
  const { isDisabled, triggerDisable } = useButtonDisableContext();
  const setting = useSetting({
    settingName: AUTO_TARGET_OPPONENT
  });
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  // Manual Targeting is on when AutoTargetOpponent is '0' (reversed).
  const isManualTargeting = setting?.value === '0';

  const handleClickManualTargeting = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
    triggerDisable();
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [
          {
            name: AUTO_TARGET_OPPONENT,
            value: isManualTargeting ? '1' : '0'
          }
        ]
      })
    );
  };

  const buttonStyle = classNames(btnClass ?? styles.btn, {
    [activeBtnClass ?? styles.buttonActive]: isManualTargeting
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label="Manual Targeting"
        onClick={handleClickManualTargeting}
        data-tooltip="Manual Targeting"
        data-placement={placement}
        disabled={isDisabled}
      >
        <BiSolidBullseye aria-hidden="true" />
        {showLabel && ' Manual Targeting'}
      </button>
    </div>
  );
};

export default ManualTargetingToggle;
