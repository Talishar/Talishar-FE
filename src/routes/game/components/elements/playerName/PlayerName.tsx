import React from 'react';
import { RootState } from 'app/Store';
import styles from './PlayerName.module.css';
import Player from 'interface/Player';
import { FaCertificate } from 'react-icons/fa';
import { useAppSelector } from 'app/Hooks';

export default function PlayerName(player: Player) {
  const playerName = useAppSelector((state: RootState) =>
    player.isPlayer ? state.game.playerOne.Name : state.game.playerTwo.Name
  );

  const isPatron = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.isPatron
      : state.game.playerTwo.isPatron
  );

  const isContributor = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.isContributor
      : state.game.playerTwo.isContributor
  );

  return (
    <div className={styles.playerName}>
      {isPatron ? (
        <img
          className={styles.icon}
          src="/images/patronHeart.webp"
          title="I am a patreon of Talishar!"
        />
      ) : null}
      {isContributor ? (
        <img
          className={styles.icon}
          src="/images/copper.webp"
          title="I am a contributor to Talishar!"
        />
      ) : null}
      {playerName}
    </div>
  );
}
