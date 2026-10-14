import { useMemo } from 'react';
import { useAppSelector } from 'app/Hooks';
import { getSettingsEntity } from 'features/options/optionsSlice';
import * as optConst from 'features/options/constants';
import { RootState } from 'app/Store';
import classNames from 'classnames';

import ArsenalZone from '../zones/arsenalZone/ArsenalZone';
import BanishZone from '../zones/banishZone/BanishZone';
import ChestEqZone from '../zones/chestEqZone/ChestEqZone';
import DeckZone from '../zones/deckZone/DeckZone';
import LegsEqZone from '../zones/legsEqZone/LegsEqZone';
import GraveyardZone from '../zones/graveyardZone/GraveyardZone';
import ArmsEqZone from '../zones/armsEqZone/ArmsEqZone';
import HeadEqZone from '../zones/headEqZone/HeadEqZone';
import HeroZone from '../zones/heroZone/HeroZone';
import PermanentsZone from '../zones/permanentsZone/PermanentsZone';
import PitchZone from '../zones/pitchZone/PitchZone';
import WeaponLZone from '../zones/weaponLZone/WeaponLZone';
import WeaponRZone from '../zones/weaponRZone/WeaponRZone';
import ZoneCounts from '../zones/zoneCountsZone/ZoneCounts';
import CombatChain, {
  CombatChainPlayerPrompt
} from '../combatChain/CombatChain';
import Playmat from '../elements/playmat';
import AmbientParticles from '../elements/ambientParticles';
import PlayerName from '../elements/playerName/PlayerName';
import Effects from '../elements/effects/Effects';
import LandmarkZone from '../zones/LandmarkZone';

import styles from './GridBoard.module.css';
import { useCookieString } from 'utils/cookieStore';
import ExperimentalTurnWidget from '../elements/experimentalTurnWidget';
import TurnWidget, {
  TurnWidgetVitals
} from '../elements/turnWidget/TurnWidget';
import { useShowsLandscapeFan } from '../zones/playerHand/useShowsLandscapeFan';
import ManualModePanel from '../leftColumn/ManualModePanel/ManualModePanel';
import usePlayerPromptOwner from '../elements/playerPrompt/usePlayerPromptOwner';

const BoardPlayerPromptSlot = () => {
  const promptOwner = usePlayerPromptOwner();
  return promptOwner === 'board' ? (
    <CombatChainPlayerPrompt standalone />
  ) : null;
};

const ChainPromptTopBarSlot = () => {
  const promptOwner = usePlayerPromptOwner();
  return promptOwner === 'combatChain' ? (
    <CombatChainPlayerPrompt topBar />
  ) : null;
};

const GridBoard = () => {
  const experimental = useCookieString('experimental');
  const showsLandscapeFan = useShowsLandscapeFan();
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const spectatorCameraView = useAppSelector(
    (state: RootState) => state.game.spectatorCameraView
  );
  const isMirroredOpponent = useAppSelector(
    (state: RootState) =>
      getSettingsEntity(state)?.[optConst.MIRRORED_BOARD_LAYOUT]?.value === '1'
  );
  const isMirroredPlayer = useAppSelector(
    (state: RootState) =>
      getSettingsEntity(state)?.[optConst.MIRRORED_PLAYER_BOARD_LAYOUT]
        ?.value === '1'
  );

  // For spectators and replay viewers, check if they want to view from player 2's perspective
  const isSpectatorViewingPlayer2 =
    (playerID === 3 || isReplay) && spectatorCameraView === 2;
  const gridBoardClass = useMemo(
    () =>
      classNames(styles.boardGrid, {
        [styles.SwappedGameBoardGrid]:
          isSpectatorViewingPlayer2 && !isMirroredOpponent && !isMirroredPlayer,
        [styles.SwappedMirroredOpponentGameBoardGrid]:
          isSpectatorViewingPlayer2 && isMirroredOpponent && !isMirroredPlayer,
        [styles.SwappedMirroredPlayerGameBoardGrid]:
          isSpectatorViewingPlayer2 && isMirroredPlayer && !isMirroredOpponent,
        [styles.SwappedMirroredBothGameBoardGrid]:
          isSpectatorViewingPlayer2 && isMirroredOpponent && isMirroredPlayer,
        [styles.gameBoardGrid]:
          !isSpectatorViewingPlayer2 &&
          !isMirroredOpponent &&
          !isMirroredPlayer,
        [styles.MirroredOpponentGameBoardGrid]:
          !isSpectatorViewingPlayer2 && isMirroredOpponent && !isMirroredPlayer,
        [styles.MirroredPlayerGameBoardGrid]:
          !isSpectatorViewingPlayer2 && isMirroredPlayer && !isMirroredOpponent,
        [styles.MirroredBothGameBoardGrid]:
          !isSpectatorViewingPlayer2 && isMirroredOpponent && isMirroredPlayer,
        [styles.fanWidgets]: showsLandscapeFan && !experimental
      }),
    [
      isSpectatorViewingPlayer2,
      isMirroredOpponent,
      isMirroredPlayer,
      showsLandscapeFan,
      experimental
    ]
  );

  return (
    <>
      <ManualModePanel />
      <div className={gridBoardClass}>
        {showsLandscapeFan && (
          <div className={styles.fanOpponentName}>
            <PlayerName isPlayer={false} />
          </div>
        )}
        {showsLandscapeFan && (
          <div className={styles.fanLandmark}>
            <LandmarkZone />
          </div>
        )}
        {showsLandscapeFan && (
          <div className={styles.fanOpponentEffects}>
            <Effects isPlayer={false} />
          </div>
        )}
        {showsLandscapeFan && (
          <div className={styles.fanPlayerEffects}>
            <Effects isPlayer />
          </div>
        )}
        <div className={styles.pTwoLegs}>
          <LegsEqZone isPlayer={false} />
        </div>
        <div className={styles.pTwoPermanents}>
          <PermanentsZone isPlayer={false} />
        </div>
        <div className={styles.pTwoArsenal}>
          <ArsenalZone isPlayer={false} />
        </div>
        <div className={styles.pTwoCount}>
          <ZoneCounts isPlayer={false} />
        </div>
        <div className={styles.pTwoBanish}>
          <BanishZone isPlayer={false} />
        </div>
        <div className={styles.pTwoChest}>
          <ChestEqZone isPlayer={false} />
        </div>
        <div className={styles.pTwoHands}>
          <ArmsEqZone isPlayer={false} />
        </div>
        <div className={styles.pTwoWeaponLZone}>
          <WeaponLZone isPlayer={false} />
        </div>
        <div className={styles.pTwoHero}>
          <HeroZone isPlayer={false} />
        </div>
        <div className={styles.pTwoWeaponRZone}>
          <WeaponRZone isPlayer={false} />
        </div>
        <div className={styles.pTwoPitch}>
          <PitchZone isPlayer={false} />
        </div>
        <div className={styles.pTwoDeck}>
          <DeckZone isPlayer={false} />
        </div>
        <div className={styles.pTwoHead}>
          <HeadEqZone isPlayer={false} />
        </div>
        <div className={styles.pTwoGraveyard}>
          <GraveyardZone isPlayer={false} />
        </div>
        <div className={styles.healthWidget}>
          {experimental ? (
            <ExperimentalTurnWidget />
          ) : (
            <TurnWidget passOnly={showsLandscapeFan} />
          )}
        </div>
        {showsLandscapeFan && !experimental && (
          <div className={styles.fanVitals}>
            <TurnWidgetVitals />
          </div>
        )}
        <div className={styles.pOneGraveyard}>
          <GraveyardZone isPlayer={true} />
        </div>
        <div className={styles.pOneHead} data-fan-keep-open="">
          <HeadEqZone isPlayer={true} />
        </div>
        <div className={styles.pOneDeck}>
          <DeckZone isPlayer={true} />
        </div>
        <div className={styles.pOnePitch} data-fan-side-column="">
          <PitchZone isPlayer={true} />
        </div>
        <div className={styles.pOneWeaponRZone} data-fan-keep-open="">
          <WeaponRZone isPlayer={true} />
        </div>
        <div className={styles.pOneHero} data-fan-dock-start="">
          <HeroZone isPlayer={true} />
        </div>
        <div className={styles.pOneWeaponLZone} data-fan-keep-open="">
          <WeaponLZone isPlayer={true} />
        </div>
        <div
          className={styles.pOneHands}
          data-fan-side-column=""
          data-fan-keep-open=""
        >
          <ArmsEqZone isPlayer={true} />
        </div>
        <div className={styles.pOneChest} data-fan-keep-open="">
          <ChestEqZone isPlayer={true} />
        </div>
        <div className={styles.pOneBanish}>
          <BanishZone isPlayer={true} />
        </div>
        <div className={styles.pOneCount}>
          <ZoneCounts isPlayer={true} />
        </div>
        <div className={styles.pOneArsenal}>
          <ArsenalZone isPlayer={true} />
        </div>
        <div className={styles.pOnePermanents}>
          <PermanentsZone isPlayer={true} />
        </div>
        <div className={styles.pOneLegs} data-fan-keep-open="">
          <LegsEqZone isPlayer={true} />
        </div>
        <Playmat isPlayer={false} />
        <Playmat isPlayer={true} />
        <AmbientParticles />
        <div className={styles.combatChain}>
          <CombatChain />
          <BoardPlayerPromptSlot />
        </div>
        {showsLandscapeFan && <ChainPromptTopBarSlot />}
      </div>
    </>
  );
};
export default GridBoard;
