import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './TurnNumber.module.css';
import useSetting from 'hooks/useSetting';
import { IS_STREAMER_MODE } from 'features/options/constants';

export default function TurnNumber() {
  let turnNumber = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.turnNo
  );

  if (turnNumber === undefined) {
    turnNumber = 0;
  }

  const turnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );

  const amIPlayerOne = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 1;
  });

  const playerName = useAppSelector((state: RootState) =>
    (turnPlayer == 1 && amIPlayerOne || turnPlayer == 2 && !amIPlayerOne) ? state.game.playerOne.Name : state.game.playerTwo.Name
  );

  const isStreamerMode = String(useSetting({ settingName: IS_STREAMER_MODE })?.value) === '1';
  const isOpponentTurn = (turnPlayer == 1 && !amIPlayerOne) || (turnPlayer == 2 && amIPlayerOne);
  const displayName = (isStreamerMode && isOpponentTurn) ? 'Opponent' : String(playerName ?? 'Unknown').substring(0, 15);

  return (
    <div className={styles.turnNumber}>
      <div>{displayName + "'s Turn"}</div>
      <div>Turn #{turnNumber}</div>
    </div>
  );
}