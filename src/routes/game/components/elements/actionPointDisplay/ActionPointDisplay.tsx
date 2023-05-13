import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import styles from './ActionPointDisplay.module.css';
import { PROCESS_INPUT } from 'appConstants';
import { submitButton } from 'features/game/GameSlice';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import useSetting from 'hooks/useSetting';
import { MANUAL_MODE } from 'features/options/constants';

export default function ActionPointDisplay(props: Player) {
  const APAvailable = useAppSelector((state: RootState) =>
    Math.max(
      state.game.playerOne.ActionPoints ?? 0,
      state.game.playerTwo.ActionPoints ?? 0
    )
  );
  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';

  return (
    <div className={styles.actionPointDisplay}>
      <div className={styles.actionPointCounter}>{`${APAvailable} AP`}</div>
      {isManualMode && <ManualMode />}
    </div>
  );
}

const ManualMode = () => {
  const dispatch = useAppDispatch();
  const onAddResourceClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: PROCESS_INPUT.ADD_ACTION_POINT
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
          mode: PROCESS_INPUT.SUBTRACT_ACTION_POINT
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
