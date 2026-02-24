import React, { useContext } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { IOpenGame } from '../gameList/GameList';
import styles from './OpenGame.module.css';
import { generateCroppedImageUrl } from '../../../../utils/cropImages';
import FriendBadge from '../gameList/FriendBadge';
import QuickJoinContext from '../quickJoin/QuickJoinContext';

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
  const quickJoinCtx = useContext(QuickJoinContext);

  const hasDeckReady = !!(quickJoinCtx?.hasDeckConfigured);

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasDeckReady && quickJoinCtx) {
      quickJoinCtx.quickJoin(entry.gameName);
    } else {
      navigate(`/game/join/${entry.gameName}`);
    }
  };

  const buttonClass = classNames(styles.button, 'secondary');

  return (
    <div 
      key={ix} 
      className={styles.gameItem}
      onClick={handleJoin}
      >
      <div>
      {!!entry.p1Hero ? (
        <img className={styles.heroImg} src={generateCroppedImageUrl(entry.p1Hero)} />
      ) : (
        <img className={styles.heroImg} src="https://images.talishar.net/public/crops/UNKNOWNHERO_cropped.webp" />
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
          onClick={handleJoin}
          title={hasDeckReady ? 'Join using your pre-configured deck' : 'Select a deck to join'}
        >
          Join
        </a>
      </div>
    </div>
  );
};

export default OpenGame;
