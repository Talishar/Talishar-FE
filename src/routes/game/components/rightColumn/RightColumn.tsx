import React from 'react';
import PriorityControl from '../elements/priorityControl/PriorityControl';
import LastPlayed from '../elements/lastPlayed/LastPlayed';
import Menu from '../elements/menu/Menu';
import TurnNumber from '../elements/turnNumber/TurnNumber';
import Timer from '../elements/timer/timer';
import SpectatorCount from '../elements/spectatorCount/SpectatorCount';
import styles from './RightColumn.module.css';
import ChatBox from '../elements/chatBox/ChatBox';
import useSetting from 'hooks/useSetting';
import { IS_STREAMER_MODE } from 'features/options/constants';

export default function RightColumn() {
  const isStreamerMode =
    useSetting({ settingName: IS_STREAMER_MODE })?.value === '1';
  return (
    <>
      <div className={styles.mobileTopBar}>
        <Menu />
      </div>
      <div className={styles.rightColumn}>
        <div className={styles.topGroup}>
          <Menu />
          <TurnNumber />
          <Timer />
          <LastPlayed />
          <SpectatorCount />
          <PriorityControl />
        </div>
        <div className={styles.bottomGroup}>
          {isStreamerMode ? <StreamerBox /> : ""}
          <ChatBox />
        </div>
      </div>
    </>
  );
}

const StreamerBox = () => {
  return <div className={styles.streamerBox}></div>;
};
