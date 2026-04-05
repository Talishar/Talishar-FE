import React from 'react';
import TopRow from '../topRow/TopRow';
import MiddleRow from '../middleRow/MiddleRow';
import BottomRow from '../bottomRow/BottomRow';
import styles from './PlayerBoardGrid.module.css';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { DEFAULT_PLAYMAT } from 'appConstants';
import HeadEqZone from '../zones/headEqZone/HeadEqZone';
import PermanentsZone from '../zones/permanentsZone/PermanentsZone';
import GraveyardZone from '../zones/graveyardZone/GraveyardZone';
import ChestEqZone from '../zones/chestEqZone/ChestEqZone';
import ArmsEqZone from '../zones/armsEqZone/ArmsEqZone';
import WeaponLZone from '../zones/weaponLZone/WeaponLZone';
import WeaponRZone from '../zones/weaponRZone/WeaponRZone';
import HeroZone from '../zones/heroZone/HeroZone';
import PitchZone from '../zones/pitchZone/PitchZone';
import DeckZone from '../zones/deckZone/DeckZone';
import LegsEqZone from '../zones/legsEqZone/LegsEqZone';
import ArsenalZone from '../zones/arsenalZone/ArsenalZone';
import ZoneCounts from '../zones/zoneCountsZone/ZoneCounts';
import BanishZone from '../zones/banishZone/BanishZone';

interface Props {
  swapPlayers?: boolean;
}

export default function PlayerBoardGrid({ swapPlayers = false }: Props) {
  const p1Playmat = useAppSelector(
    (state: RootState) => state.game.playerOne.Playmat
  );
  const p2Playmat = useAppSelector(
    (state: RootState) => state.game.playerTwo.Playmat
  );

  const playmat = swapPlayers ? (p2Playmat ?? 'volcor') : (p1Playmat ?? 'aria');
  const isPlayer = !swapPlayers;

  const styleToApply = {
    backgroundImage: `url(/playmats/${playmat}.webp)`
  };

  return (
    <div className={styles.playerPlaymat} style={styleToApply}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <HeadEqZone isPlayer={isPlayer} />
        <PermanentsZone isPlayer={isPlayer} />
        <GraveyardZone isPlayer={isPlayer} />
        <ChestEqZone isPlayer={isPlayer} />
        <ArmsEqZone isPlayer={isPlayer} />
        <WeaponLZone isPlayer={isPlayer} />
        <HeroZone isPlayer={isPlayer} />
        <WeaponRZone isPlayer={isPlayer} />
        <PitchZone isPlayer={isPlayer} />
        <DeckZone isPlayer={isPlayer} />
        <LegsEqZone isPlayer={isPlayer} />
        <ArsenalZone isPlayer={isPlayer} />
        <ZoneCounts isPlayer={isPlayer} />
        <BanishZone isPlayer={isPlayer} />
      </div>
    </div>
  );
}
