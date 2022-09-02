import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import styles from './playerName.module.css';
import { Player } from '../../interface/player';

export function PlayerName(player: Player) {
  const playerName = player.isPlayer
    ? useSelector((state: RootState) => state.game.playerOne.Name)
    : useSelector((state: RootState) => state.game.playerTwo.Name);

  const isVerified = player.isPlayer
    ? useSelector((state: RootState) => state.game.playerOne.IsVerified)
    : useSelector((state: RootState) => state.game.playerTwo.IsVerified);

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
