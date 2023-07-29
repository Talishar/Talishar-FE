import React from 'react';
import { useAppDispatch } from 'app/Hooks';
import gemOn from '../../../../../img/elements/hexagonRedGemGlow.png';
import gemOff from '../../../../../img/elements/hexagonGrayGem.png';
import styles from './GemSlider.module.css';
import { submitButton } from 'features/game/GameSlice';
import { PROCESS_INPUT } from 'appConstants';
import { useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';

interface GemSlider {
  gem?: 'none' | 'inactive' | 'active';
  cardID?: string;
  zone?: string;
  controller?: number;
}

const GemSlider = (props: GemSlider) => {
  if (props.gem === undefined) return null;
  if (props.gem === 'none') return null;

  const { playerID } = useAppSelector(getGameInfo, shallowEqual);

  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(
      submitButton({
        button: {
          buttonInput: (!!props.zone ? props.zone + '-' : '') + props.cardID,
          mode: !!props.zone
            ? props.controller == playerID
              ? PROCESS_INPUT.TOGGLE_PERMANENT_ACTIVE
              : PROCESS_INPUT.TOGGLE_OPPONENT_PERMANENT_ACTIVE
            : PROCESS_INPUT.TOGGLE_EQUIPMENT_ACTIVE
        }
      })
    );
  };

  const gemImg = props.gem === 'active' ? gemOn : gemOff;
  const gemClass = props.gem === 'active' ? styles.active : styles.inactive;
  return (
    <div
      className={styles.gem}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
    >
      <img src={gemImg} className={gemClass} />
    </div>
  );
};
export default GemSlider;
