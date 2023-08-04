import React from 'react';
import LastPlayed from '../elements/lastPlayed/LastPlayed';
import Menu from '../elements/menu/Menu';
import TurnNumber from '../elements/turnNumber/TurnNumber';
import styles from './RightColumn.module.css';
import ChatBox from '../elements/chatBox/ChatBox';
import PhaseTracker from '../elements/phaseTracker/PhaseTracker';
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
          <LastPlayed />
          {isStreamerMode ? <StreamerBox /> : <PhaseTracker />}
        </div>
        <div className={styles.bottomGroup}>
          <ChatBox />
        </div>
      </div>
    </>
  );
}

const StreamerBox = () => {
  return <div className={styles.streamerBox}></div>;
};
