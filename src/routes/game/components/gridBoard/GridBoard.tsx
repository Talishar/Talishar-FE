import React from 'react';

import ArsenalZone from '../zones/arsenalZone/ArsenalZone';
import BanishZone from '../zones/banishZone/BanishZone';
import ChestEqZone from '../zones/chestEqZone/ChestEqZone';
import DeckZone from '../zones/deckZone/DeckZone';
import FeetEqZone from '../zones/feetEqZone/FeetEqZone';
import GraveyardZone from '../zones/graveyardZone/GraveyardZone';
import GlovesEqZone from '../zones/glovesEqZone';
import HeadEqZone from '../zones/headEqZone/HeadEqZone';
import HeroZone from '../zones/heroZone/HeroZone';
import PermanentsZone from '../zones/permanentsZone/PermanentsZone';
import PitchZone from '../zones/pitchZone/PitchZone';
import WeaponLZone from '../zones/weaponLZone/WeaponLZone';
import WeaponRZone from '../zones/weaponRZone/WeaponRZone';
import ZoneCounts from '../zones/zoneCountsZone/ZoneCounts';
import CombatChain from '../combatChain/CombatChain';
import PlayerPrompt from '../elements/playerPrompt/PlayerPrompt';
import Playmat from '../elements/playmat';

import styles from './GridBoard.module.css';
import { useCookies } from 'react-cookie';
import ExperimentalTurnWidget from '../elements/experimentalTurnWidget';
import TurnWidget from '../elements/turnWidget/TurnWidget';
import { createPortal } from 'react-dom';

const GridBoard = () => {
  const [cookies] = useCookies(['experimental']);
  return (
    <>
      <div className={styles.gameBoardGrid}>
        <div className={styles.pTwoFeet}>
          <FeetEqZone isPlayer={false} />
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
          <GlovesEqZone isPlayer={false} />
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
          {cookies.experimental ? <ExperimentalTurnWidget /> : <TurnWidget />}
        </div>
        <div className={styles.pOneGraveyard}>
          <GraveyardZone isPlayer={true} />
        </div>
        <div className={styles.pOneHead}>
          <HeadEqZone isPlayer={true} />
        </div>
        <div className={styles.pOneDeck}>
          <DeckZone isPlayer={true} />
        </div>
        <div className={styles.pOnePitch}>
          <PitchZone isPlayer={true} />
        </div>
        <div className={styles.pOneWeaponRZone}>
          <WeaponRZone isPlayer={true} />
        </div>
        <div className={styles.pOneHero}>
          <HeroZone isPlayer={true} />
        </div>
        <div className={styles.pOneWeaponLZone}>
          <WeaponLZone isPlayer={true} />
        </div>
        <div className={styles.pOneHands}>
          <GlovesEqZone isPlayer={true} />
        </div>
        <div className={styles.pOneChest}>
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
        <div className={styles.pOneFeet}>
          <FeetEqZone isPlayer={true} />
        </div>
        <Playmat isPlayer={false} />
        <Playmat isPlayer={true} />
        <div className={styles.combatChain}>
          <CombatChain />
        </div>
        {/* {createPortal(
          <div className={styles.playerPromptWrapper}>
            <PlayerPrompt />
          </div>,
          document.body
        )} */}
      </div>
    </>
  );
};
export default GridBoard;
