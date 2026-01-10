import classNames from 'classnames';
import React from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { IGameInProgress } from '../gameList/GameList';
import styles from './InProgressGame.module.scss';
import { RiSwordLine } from 'react-icons/ri';
import { generateCroppedImageUrl } from '../../../../utils/cropImages';
import FriendBadge from '../gameList/FriendBadge';

export const InProgressGame = ({
  ix,
  entry,
  isFriendsGame = false,
  friendName
}: {
  ix: number;
  entry: IGameInProgress;
  isFriendsGame?: boolean;
  friendName?: string;
}) => {
  const navigate = useNavigate();
  const spectateHandler = (gameName: number) => {
    navigate(`/game/play/${gameName}`);
  };
  const buttonClass = classNames(styles.button, 'secondary');
  return (
    <div
      key={entry.gameName}
      className={styles.gameItem}
      onClick={(e) => {
        e.preventDefault();
        spectateHandler(entry.gameName);
      }}
    >
      <div>
        {!!entry.p1Hero && <img className={styles.heroImg} src={generateCroppedImageUrl(entry.p1Hero)} />}
      </div>
      <RiSwordLine />
      <div>
        {!!entry.p2Hero && <img className={styles.heroImg} src={generateCroppedImageUrl(entry.p2Hero)} />}
      </div>
      <FriendBadge isFriendsGame={isFriendsGame} friendName={friendName} size="small" />
      <div>
        <a className={buttonClass} href={`/game/play/${entry.gameName}`} role="button">Spectate</a>
      </div>
    </div>
  );
};

export default InProgressGame;
