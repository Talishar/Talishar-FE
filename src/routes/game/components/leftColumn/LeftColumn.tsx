import { useState, useEffect } from 'react';
import ActiveEffects from '../activeEffects/ActiveEffects';
import PlayerName from '../elements/playerName/PlayerName';
import DevToolPanel from './DevToolPanel/DevToolPanel';
import ReplayPanel from './ReplayPanel/ReplayPanel';
import SpectatorCameraPanel from './SpectatorCameraPanel/SpectatorCameraPanel';
import styles from './LeftColumn.module.css';
import { useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';

export default function LeftColumn() {

  const [isMobile, setIsMobile] = useState(false);
  const { playerID } = useAppSelector(getGameInfo, shallowEqual);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) { // Standardized breakpoint
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.leftColumn}>
      {!isMobile && (
        <PlayerName isPlayer={false} />
      )}
      <ActiveEffects />
      {(!isMobile || playerID === 3) && (
        <PlayerName isPlayer={true} />
      )}
      <ReplayPanel />
      <SpectatorCameraPanel />
      <DevToolPanel />
    </div>
  );
}
