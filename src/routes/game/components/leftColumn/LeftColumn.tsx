import { useState, useEffect } from 'react';
import ActiveEffects from '../activeEffects/ActiveEffects';
import PlayerName from '../elements/playerName/PlayerName';
import DevToolPanel from './DevToolPanel/DevToolPanel';
import styles from './LeftColumn.module.css';

export default function LeftColumn() {

  const [isMobile, setIsMobile] = useState(false);

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
      {!isMobile && (
        <PlayerName isPlayer />
      )}
      <DevToolPanel />
    </div>
  );
}
