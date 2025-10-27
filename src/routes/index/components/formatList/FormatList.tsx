import React from 'react';
import styles from './FormatList.module.css';
import { IOpenGame } from '../gameList/GameList';
import OpenGame from '../openGame/OpenGame';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export interface IFormatList {
  gameList: IOpenGame[];
  name: string;
  isOther?: boolean;
  friendUsernames?: Set<string>;
}
const FormatList = ({ gameList, name, isOther, friendUsernames = new Set() }: IFormatList) => {
  const [parent] = useAutoAnimate();
  if (gameList.length === 0) {
    return null;
  }

  return (
    <div className={styles.groupDiv} ref={parent}>
      <h5 className={styles.subSectionTitle}>{name}</h5>
      {gameList.map((entry, ix: number) => {
        const isFriendsGame = !!(entry.gameCreator && friendUsernames.has(entry.gameCreator));
        return (
          <OpenGame
            entry={entry}
            ix={ix}
            isOther={isOther}
            key={entry.gameName}
            isFriendsGame={isFriendsGame}
          />
        );
      })}
    </div>
  );
};

export default FormatList;
