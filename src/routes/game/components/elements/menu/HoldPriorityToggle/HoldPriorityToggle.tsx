import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
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

export interface HoldPriorityToggleProps {
  mode: number;
  icon: IconType;
  tooltipKey: string;
  labelKey: string;
  btnClass?: string;
  activeBtnClass?: string;
  showLabel?: boolean;
}

const HoldPriorityToggle = ({
  mode,
  icon: Icon,
  tooltipKey,
  labelKey,
  btnClass,
  activeBtnClass,
  showLabel
}: HoldPriorityToggleProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isDisabled, triggerDisable } = useButtonDisableContext();
  const setting = useSetting({
    settingName: HOLD_PRIORITY_SETTING
  });
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const isActive = Number(setting?.value) === mode;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
    triggerDisable();
    // If already on this mode, turn it off
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [
          {
            name: HOLD_PRIORITY_SETTING,
            value: isActive ? HOLD_PRIORITY_ENUM.AUTO : mode
          }
        ]
      })
    );
  };

  const buttonStyle = classNames(btnClass ?? styles.btn, {
    [activeBtnClass ?? styles.buttonActive]: isActive
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label={t(tooltipKey)}
        onClick={handleClick}
        data-tooltip={t(tooltipKey)}
        data-placement="top"
        disabled={isDisabled}
      >
        <Icon aria-hidden="true" />
        {showLabel && ` ${t(labelKey)}`}
      </button>
    </div>
  );
};

export default HoldPriorityToggle;
