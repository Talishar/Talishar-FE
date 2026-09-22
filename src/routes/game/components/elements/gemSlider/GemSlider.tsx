import { useAppDispatch } from 'app/Hooks';
import gemOn from '../../../../../img/elements/hexagonRedGemGlow.webp';
import gemOff from '../../../../../img/elements/hexagonGrayGem.webp';
import React from 'react';
import styles from './GemSlider.module.css';
import { submitButton } from 'features/game/GameSlice';
import { PROCESS_INPUT } from 'appConstants';
import { useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';
import { useTranslation } from 'react-i18next';
import { TooltipWrapper } from 'components/Tooltip/TooltipWrapper';
import { useCookieString } from 'utils/cookieStore';
import {
  areEquipmentGemButtonsDisabled,
  DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE
} from './equipmentGemPreference';

interface GemSlider {
  gem?: 'none' | 'inactive' | 'active';
  cardID?: string;
  cardIDs?: string[];
  cardNumber?: string;
  zone?: string;
  controller?: number;
}

const HERO_GEM_LABELS: Record<string, [string, string]> = {
  olympia: [
    'GEM_SLIDER.ALWAYS_WAGER_ACTIVE_LABEL',
    'GEM_SLIDER.ALWAYS_WAGER_INACTIVE_LABEL'
  ],
  olympia_prized_fighter: [
    'GEM_SLIDER.ALWAYS_WAGER_ACTIVE_LABEL',
    'GEM_SLIDER.ALWAYS_WAGER_INACTIVE_LABEL'
  ],
  vynnset: [
    'GEM_SLIDER.ALWAYS_PAY_LIFE_ACTIVE_LABEL',
    'GEM_SLIDER.ALWAYS_PAY_LIFE_INACTIVE_LABEL'
  ],
  vynnset_iron_maiden: [
    'GEM_SLIDER.ALWAYS_PAY_LIFE_ACTIVE_LABEL',
    'GEM_SLIDER.ALWAYS_PAY_LIFE_INACTIVE_LABEL'
  ]
};

const GemSlider = (props: GemSlider) => {
  const { playerID } = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const gemButtonsDisabled = useCookieString(
    DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE
  );

  if (props.gem === undefined || props.gem === 'none') return null;

  const isActive = props.gem === 'active';
  const heroGemLabels = props.cardNumber
    ? HERO_GEM_LABELS[props.cardNumber]
    : undefined;
  const equipmentGemHidden =
    !props.zone &&
    !heroGemLabels &&
    areEquipmentGemButtonsDisabled(gemButtonsDisabled);

  if (equipmentGemHidden) return null;

  const stateLabel = heroGemLabels
    ? t(isActive ? heroGemLabels[0] : heroGemLabels[1])
    : t(isActive ? 'GEM_SLIDER.ACTIVE_LABEL' : 'GEM_SLIDER.INACTIVE_LABEL');

  const onClick = () => {
    dispatch(
      submitButton({
        button: {
          buttonInput: props.zone
            ? props.zone +
              '-' +
              (props.cardIDs && props.cardIDs.length > 1
                ? props.cardIDs.join(',')
                : props.cardID)
            : props.cardID,
          mode: props.zone
            ? props.controller == playerID
              ? PROCESS_INPUT.TOGGLE_PERMANENT_ACTIVE
              : PROCESS_INPUT.TOGGLE_OPPONENT_PERMANENT_ACTIVE
            : PROCESS_INPUT.TOGGLE_EQUIPMENT_ACTIVE
        }
      })
    );
  };

  const gemImg = isActive ? gemOn : gemOff;
  const gemClass = isActive ? styles.active : styles.inactive;

  return (
    <TooltipWrapper className={styles.gemTarget} tooltip={stateLabel}>
      <button
        type="button"
        className={styles.gem}
        aria-label={stateLabel}
        aria-pressed={isActive}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClick();
        }}
      >
        <img src={gemImg} className={gemClass} alt="" draggable={false} />
      </button>
    </TooltipWrapper>
  );
};
export default GemSlider;
