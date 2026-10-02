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
import useSupporterStatus from 'hooks/useSupporterStatus';
import {
  IN_GAME_AD_MIN_VIEWPORT_HEIGHT,
  IN_GAME_AD_SIZE,
  IN_GAME_ADS_ENABLED
} from 'config/ads';
import InGameAd from './InGameAd';

const adColumnStyle = {
  '--in-game-ad-size': `${IN_GAME_AD_SIZE}px`
} as React.CSSProperties;

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
  const hasRoomForAd = useMediaQuery(
    `(min-height: ${IN_GAME_AD_MIN_VIEWPORT_HEIGHT}px)`
  );
  const { showAds } = useSupporterStatus();
  const showInGameAd = IN_GAME_ADS_ENABLED && showAds && hasRoomForAd;

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
    <div
      className={
        showInGameAd
          ? `${styles.rightColumn} ${styles.rightColumnWithAd}`
          : styles.rightColumn
      }
      style={showInGameAd ? adColumnStyle : undefined}
    >
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
      {showInGameAd && <InGameAd />}
    </div>
  );
}

// RightColumn has no props; its changing inputs come from subscribed hooks.
// Avoid reconciling both menus and the chat tree for parent-only updates.
export default React.memo(RightColumn);

const StreamerBox = () => {
  return <div className={styles.streamerBox}></div>;
};
