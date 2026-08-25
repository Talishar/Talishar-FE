import ActiveEffects from '../activeEffects/ActiveEffects';
import PlayerName from '../elements/playerName/PlayerName';
import DevToolPanel from './DevToolPanel/DevToolPanel';
import ReplayPanel from './ReplayPanel/ReplayPanel';
import SpectatorCameraPanel from './SpectatorCameraPanel/SpectatorCameraPanel';
import styles from './LeftColumn.module.css';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useMediaQuery } from 'hooks/useMediaQuery';

export default function LeftColumn() {
  const isMobile = useMediaQuery('(max-width: 1199px)');
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );

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
