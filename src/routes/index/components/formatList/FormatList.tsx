import React from 'react';
import styles from './FormatList.module.css';
import { IOpenGame } from '../gameList/GameList';
import OpenGame from '../openGame/OpenGame';

export interface IFormatList {
  gameList: IOpenGame[];
  name: string;
  isOther?: boolean;
}
const FormatList = ({ gameList, name, isOther }: IFormatList) => {
  if (gameList.length === 0) {
    return null;
  }

  return (
    <div className={styles.groupDiv}>
      <h5 className={styles.subSectionTitle}>{name}</h5>
      {gameList.map((entry, ix: number) => {
        return <OpenGame entry={entry} ix={ix} isOther={isOther} />;
      })}
    </div>
  );
};

export default FormatList;
