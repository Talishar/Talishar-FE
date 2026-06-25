import React from 'react';
import classNames from 'classnames';
import styles from './HandZone.module.css';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import { Card } from 'features/Card';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { useAppSelector } from 'app/Hooks';

const HandZone = React.memo(function HandZone(prop: Player) {
  const { isPlayer } = prop;

  const handCards = useAppSelector((state: RootState) => {
    const { playerID, isReplay } = state.game.gameInfo;
    const isP2View =
      (playerID === 3 || isReplay) && state.game.spectatorCameraView === 2;
    return isPlayer
      ? (isP2View ? state.game.playerTwo.Hand : state.game.playerOne.Hand)
      : (isP2View ? state.game.playerOne.Hand : state.game.playerTwo.Hand);
  });
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );

  const displayRow = classNames(
    styles.handZone,
    isPlayer ? styles.isPlayer : styles.isOpponent
  );

  if (handCards === undefined || (playerID !== 3 && !isReplay && isPlayer)) {
    return <div className={displayRow}></div>;
  }

  return (
    <div className={displayRow}>
      {handCards.map((card: Card, index) => {
        return <CardDisplay card={card} key={index} isPlayer={isPlayer} />;
      })}
    </div>
  );
});

export default HandZone;
