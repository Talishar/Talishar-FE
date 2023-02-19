import classNames from 'classnames';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IOpenGame } from '../gameList/GameList';
import styles from './OpenGame.module.css';

const OpenGame = ({ ix, entry }: { ix: number; entry: IOpenGame }) => {
  const navigate = useNavigate();
  const buttonClass = classNames(styles.button, 'secondary');

  return (
    <div key={ix} className={styles.gameItem}>
      <div>
        {!!entry.p1Hero && <img src={`/crops/${entry.p1Hero}_cropped.png`} />}
      </div>
      <div>{entry.description}</div>
      <div>{entry.format}</div>
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
