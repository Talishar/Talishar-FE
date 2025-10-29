import classNames from 'classnames';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IOpenGame } from '../gameList/GameList';
import styles from './OpenGame.module.css';
import { generateCroppedImageUrl } from '../../../../utils/cropImages';
import FriendBadge from '../gameList/FriendBadge';

const OpenGame = ({
  ix,
  entry,
  isOther,
  isFriendsGame = false
}: {
  ix: number;
  entry: IOpenGame;
  isOther?: boolean;
  isFriendsGame?: boolean;
}) => {
  const navigate = useNavigate();
  const buttonClass = classNames(styles.button, 'secondary');

  return (
    <div 
      key={ix} 
      className={styles.gameItem}
      onClick={(e) => {
        e.preventDefault();
        navigate(`/game/join/${entry.gameName}`);
      }}
      >
      <div>
      {!!entry.p1Hero ? (
        <img className={styles.heroImg} src={generateCroppedImageUrl(entry.p1Hero)} />
      ) : (
        <img className={styles.heroImg} src="https://images.talishar.net/public/crops/UNKNOWNHERO_cropped.png" />
      )}
      </div>
      <div className={styles.description}>{entry.description}</div>
      {isOther && <div className={styles.formatName}>{entry.formatName}</div>}
      <FriendBadge isFriendsGame={isFriendsGame} size="small" />
      <div>
        <a
          className={buttonClass}
          href={`/game/join/${entry.gameName}`}
          role="button"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/game/join/${entry.gameName}`);
          }}
        >
          Join
        </a>
      </div>
    </div>
  );
};

export default OpenGame;
