import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import styles from './HealthDisplay.module.css';
import useSetting from 'hooks/useSetting';
import { MANUAL_MODE } from 'features/options/constants';
import { submitButton } from 'features/game/GameSlice';
import { PROCESS_INPUT } from 'appConstants';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

export default function HealthDisplay(props: Player) {
  const health = useAppSelector((state: RootState) =>
    props.isPlayer ? state.game.playerOne.Health : state.game.playerTwo.Health
  );
  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';

  return (
    <div className={styles.health}>
      {health}
      {isManualMode && <ManualMode isPlayer={props.isPlayer} />}
    </div>
  );
}

const ManualMode = ({ isPlayer }: { isPlayer: Boolean }) => {
  const dispatch = useAppDispatch();
  const onAddResourceClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: isPlayer
            ? PROCESS_INPUT.ADD_1_HP_SELF
            : PROCESS_INPUT.ADD_1_HP_OPPOENNT
        }
      })
    );
  };
  const onSubtractResourceClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: isPlayer
            ? PROCESS_INPUT.SUBTRACT_1_HP_SELF
            : PROCESS_INPUT.SUBTRACT_1_HP_OPPONENT
        }
      })
    );
  };
  return (
    <div className={styles.manualMode}>
      <button className={styles.drawButton} onClick={onAddResourceClick}>
        <AiOutlinePlus />
      </button>
      <button className={styles.drawButton} onClick={onSubtractResourceClick}>
        <AiOutlineMinus />
      </button>
    </div>
  );
};
