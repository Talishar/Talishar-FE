import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './ActionPointDisplay.module.css';
import classNames from 'classnames';

interface ActionPointDisplayProps {
  isPlayer?: boolean;
}

export default function ActionPointDisplay(props: ActionPointDisplayProps) {
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

  const isOtherPlayerTurn = Number(turnPlayer) === Number(otherPlayer);
  const shouldShowRedImage = props.isPlayer ? isOtherPlayerTurn : !isOtherPlayerTurn;

  const actionPointClass = classNames(styles.actionPointCounter, {
    [styles.actionPointRed]: shouldShowRedImage
  });

  return (
    <div className={styles.actionPointDisplay}>
      <div className={actionPointClass}>{`${APAvailable} AP`}</div>
    </div>
  );
}
