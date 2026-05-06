import { useEffect, useState } from 'react';
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
import useAdScript from 'hooks/useAdScript';
import useSupporterStatus from 'hooks/useSupporterStatus';
import squareMemberCTA from '../../../../img/squareMemberCTA.webp';


export default function RightColumn() {
  const isStreamerMode =
    useSetting({ settingName: IS_STREAMER_MODE })?.value === '1';
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isSpectator = playerID === 3;

  const { isSupporter, isLoading } = useSupporterStatus();
  const showAds = !isLoading && !isSupporter;
  useAdScript(showAds);

  const [adBlocked, setAdBlocked] = useState(false);

  useEffect(() => {
    if (!showAds) return;

    const check = async () => {
      try {
        if (typeof window.reviq?.checkAdblock === 'function') {
          const hasAdblock = await window.reviq.checkAdblock();
          if (hasAdblock) setAdBlocked(true);
        } else if (typeof window.reviq?.onAdblock === 'function') {
          window.reviq.onAdblock(() => setAdBlocked(true));
        }
      } catch {
        // Detection unavailable
      }
    };

    check();
  }, [showAds]);

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
        {showAds && (
          <div className={styles.adSection}>
            <div className={styles.adHeader}>
              <span>Community Ads</span>
              <a
                href="https://metafy.gg/@talishar/members"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.removeAdsLink}
              >
                Remove ads
              </a>
            </div>
            {adBlocked ? (
              <div className={styles.ctaWrapper}>
                <a href="https://metafy.gg/@talishar/members" target="_blank" rel="noopener noreferrer">
                  <img src={squareMemberCTA} alt="Support Talishar" width={250} height={250} />
                </a>
              </div>
            ) : (
              <div className={styles.inGameAdWrapper}>
                <div data-ad="in-game-block" />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const StreamerBox = () => {
  return <div className={styles.streamerBox}></div>;
};
