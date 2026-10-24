import React from 'react';
import classNames from 'classnames';
import ActiveEffects from '../activeEffects/ActiveEffects';
import PlayerName from '../elements/playerName/PlayerName';
import DevToolPanel from './DevToolPanel/DevToolPanel';
import ReplayPanel from './ReplayPanel/ReplayPanel';
import SpectatorCameraPanel from './SpectatorCameraPanel/SpectatorCameraPanel';
import styles from './LeftColumn.module.css';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useShowsLandscapeFan } from '../zones/playerHand/useShowsLandscapeFan';
import { useFannedHand } from '../zones/playerHand/useFannedHand';

function LeftColumn() {
  const isMobile = useMediaQuery('(max-width: 1199px)');
  const showsLandscapeFan = useShowsLandscapeFan();
  const fannedHand = useFannedHand();
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );

  const isSpectator = playerID === 3;

  return (
    <div
      className={classNames(styles.leftColumn, {
        [styles.overBoard]:
          isSpectator && isMobile && fannedHand && !showsLandscapeFan
      })}
    >
      {(!isMobile || (isSpectator && !showsLandscapeFan)) && (
        <PlayerName isPlayer={false} />
      )}
      {!showsLandscapeFan && <ActiveEffects />}
      {(!isMobile || (isSpectator && !showsLandscapeFan)) && (
        <PlayerName isPlayer={true} />
      )}
      <ReplayPanel />
      {!isMobile && <SpectatorCameraPanel />}
      <DevToolPanel />
    </div>
  );
}

export default React.memo(LeftColumn);
