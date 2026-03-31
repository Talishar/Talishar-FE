import React from 'react';
import PriorityControl from '../elements/priorityControl/PriorityControl';
import LastPlayed from '../elements/lastPlayed/LastPlayed';
import Menu from '../elements/menu/Menu';
import TurnInfo from '../elements/turnInfo/TurnInfo';
import styles from './RightColumn.module.css';
import ChatBox from '../elements/chatBox/ChatBox';
import useSetting from 'hooks/useSetting';
import { IS_STREAMER_MODE } from 'features/options/constants';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import PlayerName from '../elements/playerName/PlayerName';
import { AdUnit } from 'components/ads';
import useAuth from 'hooks/useAuth';


export default function RightColumn() {
  const isStreamerMode =
    useSetting({ settingName: IS_STREAMER_MODE })?.value === '1';
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isSpectator = playerID === 3;
  const { isPatron } = useAuth();
  const showAds = !isPatron || isPatron === '0';

  return (
    <>
    {/* Mobile */}
      <div className={styles.mobileTopBar}>
        <div className={styles.mobileTopBarName}>
          <PlayerName isPlayer={false} />
        </div>
        <div className={styles.mobileTopBarContent}>
          <Menu />
        </div>
      </div>
      {/* Desktop */}
      <div className={styles.rightColumn}>
        <div className={styles.topGroup}>
          <Menu />
          <TurnInfo />
          <LastPlayed />
          {!isSpectator && <PriorityControl />}
        </div>
        <div className={styles.bottomGroup}>
          {isStreamerMode ? <StreamerBox /> : ''}
          <ChatBox />
        </div>
      </div>
    </>
  );
}

const StreamerBox = () => {
  return <div className={styles.streamerBox}></div>;
};
