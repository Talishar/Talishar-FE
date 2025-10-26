import { RootState } from 'app/Store';
import styles from './PlayerName.module.css';
import Player from 'interface/Player';
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
      condition: isPatron,
      src: '/images/patronHeart.webp',
      title: 'I am a patron of Talishar!',
      href: 'https://linktr.ee/Talishar'
    },
    {
      condition: isPracticeDummy,
      src: '/images/practiceDummy.webp',
      title: 'I am a bot!'
    }
  ];

  const getStatusClass = () => {
    if (isPvtVoidPatron) return styles.pvtVoidPatron;
    if (isContributor) return styles.contributor;
    if (isPatron) return styles.patron;
    return '';
  };

  return (
    <div className={`${styles.playerName} ${getStatusClass()}`}>
      {iconMap.filter(icon => icon.condition).map(icon => (
        <a href={icon.href} target="_blank" rel="noopener noreferrer" key={icon.src}>
          <img
            className={styles.icon}
            src={icon.src}
            title={icon.title}
            alt={icon.title}
          />
        </a>
      ))}
      {String(playerName ?? '').substring(0, 30).replace('-', `Practice Dummy`)}
    </div>
  );
  }
