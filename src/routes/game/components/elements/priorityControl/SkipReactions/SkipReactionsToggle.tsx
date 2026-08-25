import React from 'react';
import styles from '../PriorityControl.module.css';
import * as optConst from 'features/options/constants';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { TbSwordOff } from 'react-icons/tb';
import classNames from 'classnames';
import { updateOptions } from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import { useButtonDisableContext } from 'contexts/ButtonDisableContext';

const SkipReactionsToggle = ({
  btnClass,
  activeBtnClass,
  placement = 'top-end'
}: {
  btnClass?: string;
  activeBtnClass?: string;
  placement?: 'top' | 'top-end' | 'bottom';
} = {}) => {
  const isActive = useAppSelector(
    (state) =>
      state.settings.entities[optConst.SKIP_AR_WINDOW]?.value === '1' &&
      state.settings.entities[optConst.SKIP_DR_WINDOW]?.value === '1'
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isDisabled, triggerDisable } = useButtonDisableContext();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
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

  const buttonStyle = classNames(btnClass ?? styles.btn, {
    [activeBtnClass ?? styles.buttonActive]: isActive
  });

  return (
    <div>
      <button
        className={buttonStyle}
        aria-label={t('MENU.PASS_REACTIONS')}
        onClick={handleClick}
        data-tooltip={t('MENU.PASS_REACTIONS_TOOLTIP')}
        data-placement={placement}
        disabled={isDisabled}
      >
        <TbSwordOff aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default SkipReactionsToggle;
