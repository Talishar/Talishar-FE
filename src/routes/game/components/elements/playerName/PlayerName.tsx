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

  const isPvtVoidPatron = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.isPvtVoidPatron
      : state.game.playerTwo.isPvtVoidPatron
  );

  const isPracticeDummy = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.Name === 'Practice Dummy'
      : state.game.playerTwo.Name === 'Practice Dummy'
  );
  
  const iconMap = [
    {
      condition: isPatron,
      src: '/images/patronHeart.webp',
      title: 'I am a patron of Talishar!',
      href: 'https://linktr.ee/Talishar'
    },
    {
      condition: isContributor,
      src: '/images/copper.webp',
      title: 'I am a contributor to Talishar!',
      href: 'https://linktr.ee/Talishar'
    },
    {
      condition: isPvtVoidPatron,
      src: '/images/patronEye.webp',
      title: 'I am a patron of PvtVoid!',
      href: 'https://linktr.ee/Talishar'
    },
    {
      condition: isPracticeDummy,
      src: '/images/practiceDummy.webp',
      title: 'I am a bot!'
    }
  ];

  return (
    <div className={styles.playerName}>
      {iconMap.map(
        (icon, index) =>
          icon.condition && (
            <a href={icon.href} target="_blank" rel="noopener noreferrer">
              <img
                key={index}
                className={styles.icon}
                src={icon.src}
                title={icon.title}
              />
            </a>
          )
      )}
      {playerName?.substring(0, 30).replace('-', `Practice Dummy`)}
    </div>
  );
}
