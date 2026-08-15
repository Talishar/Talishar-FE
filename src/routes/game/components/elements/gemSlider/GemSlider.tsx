import { useAppDispatch } from 'app/Hooks';
import gemOn from '../../../../../img/elements/hexagonRedGemGlow.png';
import gemOff from '../../../../../img/elements/hexagonGrayGem.png';
import styles from './GemSlider.module.css';
import { submitButton } from 'features/game/GameSlice';
import { PROCESS_INPUT } from 'appConstants';
import { useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';
import { useTranslation } from 'react-i18next';
import { TooltipWrapper } from 'components/Tooltip/TooltipWrapper';
import { useCookies } from 'react-cookie';
import {
  areEquipmentGemButtonsDisabled,
  DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE
} from './equipmentGemPreference';

interface GemSlider {
  gem?: 'none' | 'inactive' | 'active';
  cardID?: string;
  zone?: string;
  controller?: number;
}

const GemSlider = (props: GemSlider) => {
  const { playerID } = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [cookies] = useCookies([DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE]);

  if (props.gem === undefined || props.gem === 'none') return null;

  const isActive = props.gem === 'active';
  const equipmentGemHidden =
    !props.zone &&
    areEquipmentGemButtonsDisabled(
      cookies[DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE]
    );

  if (equipmentGemHidden) return null;

  const stateLabel = t(
    isActive ? 'GEM_SLIDER.ACTIVE_LABEL' : 'GEM_SLIDER.INACTIVE_LABEL'
  );

  const onClick = () => {
    dispatch(
      submitButton({
        button: {
          buttonInput: (props.zone ? props.zone + '-' : '') + props.cardID,
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
