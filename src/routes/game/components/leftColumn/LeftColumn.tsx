import { useState, useEffect, useRef } from 'react';
import ActiveEffects from '../activeEffects/ActiveEffects';
import PlayerName from '../elements/playerName/PlayerName';
import DevToolPanel from './DevToolPanel/DevToolPanel';
import ReplayPanel from './ReplayPanel/ReplayPanel';
import SpectatorCameraPanel from './SpectatorCameraPanel/SpectatorCameraPanel';
import styles from './LeftColumn.module.css';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

export default function LeftColumn() {
  const [isMobile, setIsMobile] = useState(false);
  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);

  useEffect(() => {
    const handleResize = () => {
      // Throttle through rAF so rapid window-resize events only cause one
      // setState per animation frame instead of one per pixel dragged.
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setIsMobile(window.innerWidth < 1200);
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isSpectator = playerID === 3;

  return (
    <div className={styles.leftColumn}>
      {(!isMobile || isSpectator) && <PlayerName isPlayer={false} />}
      <ActiveEffects />
      {(!isMobile || isSpectator) && <PlayerName isPlayer={true} />}
      <ReplayPanel />
      {!isMobile && <SpectatorCameraPanel />}
      <DevToolPanel />
    </div>
  );
}