import React from 'react';
import styles from './OpponentBoardGrid.module.css';
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

export default function OpponentBoardGrid() {
  let playmat = useAppSelector(
    (state: RootState) => state.game.playerTwo.Playmat
  );

  if (playmat === undefined) {
    playmat = `volcor`;
  }

  const styleToApply = {
    backgroundImage: `url(/playmats/${playmat}.webp)`
  };

  return (
    <div className={styles.playerPlaymat} style={styleToApply}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <HeadEqZone isPlayer={false} />
        <PermanentsZone isPlayer={false} />
        <GraveyardZone isPlayer={false} />
        <ChestEqZone isPlayer={false} />
        <ArmsEqZone isPlayer={false} />
        <WeaponLZone isPlayer={false} />
        <HeroZone isPlayer={false} />
        <WeaponRZone isPlayer={false} />
        <PitchZone isPlayer={false} />
        <DeckZone isPlayer={false} />
        <LegsEqZone isPlayer={false} />
        <ArsenalZone isPlayer={false} />
        <ZoneCounts isPlayer={false} />
        <BanishZone isPlayer={false} />
      </div>
    </div>
  );
}
