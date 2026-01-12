import React from 'react';
import styles from './HandZone.module.css';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import { Card } from 'features/Card';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { useAppSelector } from 'app/Hooks';

export default function HandZone(prop: Player) {
  const { isPlayer } = prop;

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const spectatorCameraView = useAppSelector(
    (state: RootState) => state.game.spectatorCameraView
  );

  // Get both hands
  const playerOneHand = useAppSelector((state: RootState) => state.game.playerOne.Hand);
  const playerTwoHand = useAppSelector((state: RootState) => state.game.playerTwo.Hand);

  let handCards;
  if (playerID === 3) {
    if (spectatorCameraView === 2) {
      handCards = isPlayer ? playerTwoHand : playerOneHand;
    } else {
      handCards = isPlayer ? playerOneHand : playerTwoHand;
    }
  } else {
    handCards = isPlayer ? playerOneHand : playerTwoHand;
  }

  let displayRow = isPlayer ? styles.isPlayer : styles.isOpponent;
  displayRow = `${displayRow} ${styles.handZone}`;

  if (handCards === undefined || (playerID !== 3 && isPlayer)) {
    return <div className={displayRow}></div>;
  }

  return (
    <div className={displayRow}>
      {handCards.map((card: Card, index) => {
        return <CardDisplay card={card} key={index} />;
      })}
    </div>
  );
}
