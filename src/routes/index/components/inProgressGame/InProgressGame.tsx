import classNames from 'classnames';
import React from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { IGameInProgress } from '../gameList/GameList';
import styles from './InProgressGame.module.css';

export const InProgressGame = ({
  ix,
  entry
}: {
  ix: number;
  entry: IGameInProgress;
}) => {
  const navigate = useNavigate();
  const spectateHandler = (gameName: number) => {
    navigate(`/game/play/${gameName}`);
  };
  const buttonClass = classNames(styles.button, 'secondary');
  return (
    <div key={entry.gameName} className={styles.gameItem}>
      <div>
        {!!entry.p1Hero && <img src={`/crops/${entry.p1Hero}_cropped.png`} />}
      </div>{' '}
      -{' '}
      <div>
        {!!entry.p2Hero && <img src={`/crops/${entry.p2Hero}_cropped.png`} />}
      </div>
      <div>
        <button
          className={buttonClass}
          onClick={(e) => {
            e.preventDefault();
            spectateHandler(entry.gameName);
          }}
        >
          Spectate
        </button>
      </div>
    </div>
  );
};

export default InProgressGame;
