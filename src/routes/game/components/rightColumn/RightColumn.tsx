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
import { useMediaQuery } from 'hooks/useMediaQuery';

function RightColumn() {
  const isStreamerMode =
    useSetting({ settingName: IS_STREAMER_MODE })?.value === '1';
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isSpectator = playerID === 3;
  // Matches the `max-width: 1200px` swap in RightColumn.module.css. Only the
  // branch the CSS would show is mounted; the other used to render in full
  // under `display: none`, duplicating the menu and the whole chat log.
  const isNarrow = useMediaQuery('(max-width: 1200px)');

  if (isNarrow) {
    return (
      <div className={styles.mobileTopBar}>
        {!isSpectator && (
          <div className={styles.mobileTopBarName}>
            <PlayerName isPlayer={false} />
          </div>
        )}
        <div className={styles.mobileTopBarContent}>
          <Menu />
        </div>
      </div>
    );
  }

  return (
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
  );
}

// RightColumn has no props; its changing inputs come from subscribed hooks.
// Avoid reconciling both menus and the chat tree for parent-only updates.
export default React.memo(RightColumn);

const StreamerBox = () => {
  return <div className={styles.streamerBox}></div>;
};
