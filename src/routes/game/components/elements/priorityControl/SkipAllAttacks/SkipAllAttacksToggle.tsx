import React from 'react';
import styles from '../PriorityControl.module.css';
import * as optConst from 'features/options/constants';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { GiBouncingSword } from 'react-icons/gi';
import classNames from 'classnames';
import {
  updateOptions,
  Setting
} from 'features/options/optionsSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import { useButtonDisableContext } from 'contexts/ButtonDisableContext';

const SkipAllAttacksToggle = ({
  btnClass,
  activeBtnClass,
  placement = 'top-end'
}: {
  btnClass?: string;
  activeBtnClass?: string;
  placement?: 'top' | 'top-end' | 'bottom';
} = {}) => {
  const shortcutAttackThreshold = useAppSelector(
    (state) =>
      state.settings.entities[optConst.SHORTCUT_ATTACK_THRESHOLD]?.value
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isDisabled, triggerDisable } = useButtonDisableContext();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const handleClickSkipAllAttacks = ({ name, value }: Setting) => {
    triggerDisable();
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: name, value: value }]
      })
    );
  };

  const buttonStyle = classNames(btnClass ?? styles.btn, {
    [activeBtnClass ?? styles.buttonActive]:
      Number(shortcutAttackThreshold) >= 2
  });
  return (
    <div>
      <button
        className={buttonStyle}
        aria-label={t('MENU.SKIP_ATTACKS')}
        onClick={(e) => {
          e.preventDefault();
          e.currentTarget.blur();
          handleClickSkipAllAttacks({
            name: optConst.SHORTCUT_ATTACK_THRESHOLD,
            value: Number(shortcutAttackThreshold) ? 0 : 99
          });
        }}
        data-tooltip={t('MENU.SKIP_ATTACKS_TOOLTIP')}
        data-placement={placement}
        disabled={isDisabled}
      >
        <GiBouncingSword aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
};

export default SkipAllAttacksToggle;
