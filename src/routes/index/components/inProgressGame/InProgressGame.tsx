import classNames from 'classnames';
import React from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { IGameInProgress } from '../gameList/GameList';
import styles from './InProgressGame.module.scss';
import { RiSwordLine } from 'react-icons/ri';
import { generateCroppedImageUrl } from '../../../../utils/cropImages';
import FriendBadge from '../gameList/FriendBadge';
import { useTranslation } from 'react-i18next';

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
  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();

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
        {!!entry.p1Hero && (
          <img
            className={styles.heroImg}
            src={generateCroppedImageUrl(entry.p1Hero)}
          />
        )}
      </div>
      <RiSwordLine />
      <div>
        {!!entry.p2Hero && (
          <img
            className={styles.heroImg}
            src={generateCroppedImageUrl(entry.p2Hero)}
          />
        )}
      </div>
      <FriendBadge
        isFriendsGame={isFriendsGame}
        friendName={friendName}
        size="small"
      />
      <div>
        <a
          className={buttonClass}
          href={`/game/play/${entry.gameName}`}
          role="button"
        >
          {t("IN_PROGRESS_GAME.SPECTATE")}
        </a>
      </div>
    </div>
  );
};

export default InProgressGame;
