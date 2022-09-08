import React from 'react';
import { RootState } from '../../app/Store';
import styles from './PlayerName.module.css';
import Player from '../../interface/Player';
import { useAppSelector } from '../../app/Hooks';

export default function PlayerName(player: Player) {
  const playerName = useAppSelector((state: RootState) =>
    player.isPlayer ? state.game.playerOne.Name : state.game.playerTwo.Name
  );

  const isVerified = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.IsVerified
      : state.game.playerTwo.IsVerified
  );

  return (
    <div className={styles.playerName}>
      {playerName}

      {isVerified ? (
        <i className="fa fa-certificate" aria-hidden="true" />
      ) : (
        <></>
      )}
    </div>
  );
}
