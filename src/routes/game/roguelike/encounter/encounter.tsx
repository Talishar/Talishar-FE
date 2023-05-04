import React from 'react';
import styles from './encounter.module.css';
import { GiCoins, GiGoldStack, GiHeartPlus } from 'react-icons/gi';
import CardDisplay from 'routes/game/components/elements/cardDisplay/CardDisplay';
import CardPopUp from 'routes/game/components/elements/cardPopUp/CardPopUp';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';

const Encounter = () => {
  return (
    <div className={styles.mapBackDrop}>
      <TopBar />
      <div className={styles.container}>
        <EncounterContainer />
      </div>
      <PlayerStats />
    </div>
  );
};

const TopBar = () => {
  return (
    <div className={styles.topBar}>
      <div className={styles.container}>
        <div className={styles.topBarContainer}>
          <PlayerHealth />
          <PlayerGold />
        </div>
      </div>
    </div>
  );
};

const EncounterContainer = () => {
  return (
    <article className={styles.encounterContainer}>
      <EncounterTitle />
      <EncounterImage />
      <EncounterDescription />
      <EncounterOptions />
    </article>
  );
};

const EncounterTitle = () => {
  return (
    <div className={styles.encounterTitle}>
      <h1>Once Upon A Beginning...</h1>
    </div>
  );
};

const EncounterImage = () => {
  return (
    <div className={styles.encounterImageContainer}>
      <img
        src="https://beta.talishar.net/game/crops/ROGUELORE001_cropped.png"
        className={styles.encounterImage}
      />
    </div>
  );
};

const EncounterDescription = () => {
  return (
    <div>
      Blackjack's Tavern is a lively space. You have been here many times
      before, and you come today with purpose. <br />
      What will you do?
    </div>
  );
};

const EncounterOptions = () => {
  return (
    <div className={styles.buttonSelection}>
      <button className="outline">Change your hero</button>
      <button className="outline">Change your bounty</button>
      <button className="outline">Change your difficulty</button>
      <button>Begin Adventure</button>
    </div>
  );
};

const PlayerStats = () => {
  return (
    <footer className={styles.playerStatsContainer}>
      <div className={styles.container} style={{ height: '100%' }}>
        <div className={styles.playerGridContainer}>
          <PlayerHero />
          <PlayerDeck />
          <div>Hey we got the game log here...</div>
        </div>
      </div>
    </footer>
  );
};

const PlayerHealth = () => {
  return (
    <div className={styles.statsContainer}>
      <GiHeartPlus />
      20
    </div>
  );
};

const PlayerGold = () => {
  return (
    <div className={styles.statsContainer}>
      <GiCoins /> 5
    </div>
  );
};

const PlayerHero = () => {
  const cardString = 'WTR114';
  return (
    <div className={styles.heroCardContainer}>
      <CardDisplay card={{ cardNumber: cardString }} />
    </div>
  );
};

const PlayerDeck = () => {
  const cardString = 'CardBack';
  return (
    <div className={styles.heroCardContainer}>
      <CardDisplay card={{ cardNumber: cardString }} num={9} />
    </div>
  );
};

export default Encounter;
