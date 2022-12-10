import React from 'react';
import { useAppDispatch } from '../../../app/Hooks';
import gemOn from '../../../img/elements/hexagonRedGemGlow.png';
import gemOff from '../../../img/elements/hexagonGrayGem.png';
import styles from './GemSlider.module.css';
import { submitButton } from '../../../features/game/GameSlice';

interface GemSlider {
  gem?: 'none' | 'inactive' | 'active';
  cardID?: string;
}

const GemSlider = (props: GemSlider) => {
  if (props.gem === undefined) return null;
  if (props.gem === 'none') return null;

  const dispatch = useAppDispatch();

  const onClick = () => {
    console.log('clicked gem');
    dispatch(
      submitButton({ button: { buttonInput: props.cardID, mode: 102 } })
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
