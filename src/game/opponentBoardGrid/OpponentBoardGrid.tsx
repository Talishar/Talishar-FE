import React from 'react';
import styles from './OpponentBoardGrid.module.css';
import { useAppSelector } from '../../app/Hooks';
import { RootState } from '../../app/Store';
import { DEFAULT_PLAYMAT } from '../../constants';
import HeadEqZone from '../zones/headEqZone/HeadEqZone';
import PermanentsZone from '../zones/permanentsZone/PermanentsZone';
import GraveyardZone from '../zones/graveyardZone/GraveyardZone';
import ChestEqZone from '../zones/chestEqZone/ChestEqZone';
import GlovesEqZone from '../zones/glovesEqZone/GlovesEqZone';
import WeaponLZone from '../zones/weaponLZone/WeaponLZone';
import WeaponRZone from '../zones/weaponRZone/WeaponRZone';
import HeroZone from '../zones/heroZone/HeroZone';
import PitchZone from '../zones/pitchZone/PitchZone';
import DeckZone from '../zones/deckZone/DeckZone';
import FeetEqZone from '../zones/feetEqZone/FeetEqZone';
import ArsenalZone from '../zones/arsenalZone/ArsenalZone';
import ZoneCounts from '../zones/zoneCountsZone/ZoneCounts';
import BanishZone from '../zones/banishZone/BanishZone';

export default function OpponentBoardGrid() {
  let playmat = useAppSelector(
    (state: RootState) => state.game.playerOne.Playmat
  );

  if (playmat === undefined) {
    // playmat = DEFAULT_PLAYMAT;
    playmat = `volcor`;
  }

  const styleToApply = {
    backgroundImage: `url(./playmats/${playmat}.webp)`
  };

  return (
    <div className={styles.playerPlaymat} style={styleToApply}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <HeadEqZone isPlayer={false} />
        <PermanentsZone isPlayer={false} />
        <GraveyardZone isPlayer={false} />
        <ChestEqZone isPlayer={false} />
        <GlovesEqZone isPlayer={false} />
        <WeaponLZone isPlayer={false} />
        <HeroZone isPlayer={false} />
        <WeaponRZone isPlayer={false} />
        <PitchZone isPlayer={false} />
        <DeckZone isPlayer={false} />
        <FeetEqZone isPlayer={false} />
        <ArsenalZone isPlayer={false} />
        <ZoneCounts isPlayer={false} />
        <BanishZone isPlayer={false} />
      </div>
    </div>
  );
}
