import classNames from 'classnames';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IOpenGame } from '../gameList/GameList';
import styles from './OpenGame.module.css';
import { generateCroppedImageUrl } from '../../../../utils/cropImages';

const OpenGame = ({
  ix,
  entry,
  isOther
}: {
  ix: number;
  entry: IOpenGame;
  isOther?: boolean;
}) => {
  const navigate = useNavigate();
  const buttonClass = classNames(styles.button, 'secondary');

  return (
    <div key={ix} className={styles.gameItem}>
      <div>
        {!!entry.p1Hero && <img src={generateCroppedImageUrl(entry.p1Hero)} />}
      </div>
      <div>{entry.description}</div>
      {isOther && <div>{entry.formatName}</div>}
      <div>
        <button
          className={buttonClass}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/game/join/${entry.gameName}`);
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default OpenGame;
