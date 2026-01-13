import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './ActionPointDisplay.module.css';
import classNames from 'classnames';
import ActionPointPopup from '../actionPointPopup/ActionPointPopup';
import { removeActionPointPopup, addActionPointPopup } from 'features/game/GameSlice';

interface ActionPointDisplayProps {
  isPlayer?: boolean;
}

export default function ActionPointDisplay(props: ActionPointDisplayProps) {
  const dispatch = useAppDispatch();
  const previousAPRef = useRef<number | undefined>();

  const APAvailable = useAppSelector((state: RootState) =>
    Math.max(
      state.game.playerOne.ActionPoints ?? 0,
      state.game.playerTwo.ActionPoints ?? 0
    )
  );

  const turnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );

  const otherPlayer = useAppSelector(
    (state: RootState) => state.game.otherPlayer
  );

  const actionPointPopups = useAppSelector((state: RootState) => {
    const popups = props.isPlayer
      ? state.game.actionPointPopups?.playerOne
      : state.game.actionPointPopups?.playerTwo;
    return Array.isArray(popups) ? popups : [];
  });

  // Track AP changes and spawn action point popups for gains only
  useEffect(() => {
    if (previousAPRef.current !== undefined && APAvailable !== undefined) {
      const apDifference = APAvailable - previousAPRef.current;
      if (apDifference > 0) {
        dispatch(
          addActionPointPopup({
            isPlayer: props.isPlayer || false,
            amount: apDifference
          })
        );
      }
    }
    previousAPRef.current = APAvailable;
  }, [APAvailable, dispatch, props.isPlayer]);

  const handleActionPointPopupComplete = (id: string) => {
    dispatch(removeActionPointPopup({ isPlayer: props.isPlayer || false, id }));
  };

  const isOtherPlayerTurn = Number(turnPlayer) === Number(otherPlayer);
  const shouldShowRedImage = props.isPlayer ? isOtherPlayerTurn : !isOtherPlayerTurn;

  const actionPointClass = classNames(styles.actionPointCounter, {
    [styles.actionPointRed]: shouldShowRedImage
  });

  return (
    <div className={styles.actionPointDisplay}>
      <div className={actionPointClass}>{`${APAvailable} AP`}</div>
      {actionPointPopups.map((popup) => (
        <ActionPointPopup
          key={popup.id}
          id={popup.id}
          amount={popup.amount}
          onComplete={handleActionPointPopupComplete}
        />
      ))}
    </div>
  );
}
