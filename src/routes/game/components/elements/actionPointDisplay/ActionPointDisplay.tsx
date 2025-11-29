import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import styles from './ActionPointDisplay.module.css';

export default function ActionPointDisplay(props: Player) {
  const playerOneAP = useAppSelector((state: RootState) =>
    state.game.playerOne.ActionPoints ?? 0
  );
  const playerTwoAP = useAppSelector((state: RootState) =>
    state.game.playerTwo.ActionPoints ?? 0
  );
  const PlayerID = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID;
  });
  const turnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );

  const isPlayer = props.isPlayer;
  const currentAP = isPlayer ? playerOneAP : playerTwoAP;

  // Show opponent display when it's NOT your turn, show player display when it IS your turn
  const isYourTurn = Number(turnPlayer) === Number(PlayerID)
  const shouldHide = (isYourTurn && !isPlayer) || (!isYourTurn && isPlayer) && Number(PlayerID) !== 3;

  return (
    <div className={styles.actionPointDisplay} data-player={isPlayer ? 'player' : 'opponent'} style={{ visibility: shouldHide ? 'hidden' : 'visible' }}>
      <div className={styles.actionPointCounter}>{`${currentAP} AP`}</div>
    </div>
  );
}
