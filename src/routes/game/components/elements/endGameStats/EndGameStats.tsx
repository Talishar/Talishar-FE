import { Card } from 'features/Card';
import { number } from 'yup';
import { Effect } from '../effects/Effects';
import EndGameMenuOptions from '../endGameMenuOptions/EndGameMenuOptions';
import styles from './EndGameStats.module.css';
import { NumberLiteralType } from 'typescript';

export interface EndGameData {
  deckID?: string;
  firstPlayer?: number;
  gameID?: string;
  result?: number;
  turns?: number;
  cardResults: CardResult[];
  turnResults: Map<string, TurnResult>;
  totalDamageThreatened?: number;
  totalDamageDealt?: number;
  averageDamageThreatenedPerTurn?: number;
  averageDamageDealtPerTurn?: number;
  averageDamageThreatenedPerCard?: number;
  averageResourcesUsedPerTurn?: number;
  averageCardsLeftOverPerTurn?: number;
  averageValuePerTurn?: number;
}

export interface CardResult {
  cardId: string;
  blocked: number;
  pitched: number;
  played: number;
  cardName: string;
  pitchValue: number;
}

export interface TurnResult {
  cardsBlocked: number;
  cardsLeft: number;
  cardsPitched: number;
  cardsUsed: number;
  damageDealt: number;
  damageTaken: number;
  resourcesUsed: number;
  resourcesLeft: number;
}

const EndGameStats = (data: EndGameData) => {
  return (
    <div className={styles.cardListContents} data-testid="test-stats">
      <EndGameMenuOptions />
      <div className={styles.twoColumn}>
        <div>
          <h2>Card Play Stats</h2>
          <table className={styles.cardTable}>
            <thead>
              <tr>
                <th>Img</th>
                <th>Card Name</th>
                <th>Played</th>
                <th>Blocked</th>
                <th>Pitched</th>
              </tr>
            </thead>
            <tbody>
              {!!data.cardResults &&
                data.cardResults?.map((result, ix) => {
                  const card: Card = { cardNumber: result.cardId };
                  let cardStyle = '';
                  switch (result.pitchValue) {
                    case 1:
                      cardStyle = styles.onePitch;
                      break;
                    case 2:
                      cardStyle = styles.twoPitch;
                      break;
                    case 3:
                      cardStyle = styles.threePitch;
                      break;
                    default:
                  }
                  return (
                    <tr key={`cardList${ix}`}>
                      <td className={styles.card}>
                        <Effect card={card} />
                      </td>
                      <td className={cardStyle}>{result.cardName}</td>
                      <td className={styles.played}>{result.played}</td>
                      <td className={styles.blocked}>{result.blocked}</td>
                      <td className={styles.pitched}>{result.pitched}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Turn Stats</h2>
          <p>
            <em>First turn omitted for first player</em>
            <br /> Total Damage Threatened: {data.totalDamageThreatened}
            <br />
            Total Damage Dealt: {data.totalDamageDealt} <br />
            Average Damage Threatened per turn:{' '}
            {data.averageDamageThreatenedPerTurn} <br />
            Average Damage Dealt per turn: {data.averageDamageDealtPerTurn}{' '}
            <br />
            Average damage threatened per offensive card:{' '}
            {data.averageDamageThreatenedPerCard} <br />
            Average Resources Used per turn: {
              data.averageResourcesUsedPerTurn
            }{' '}
            <br />
            Average Cards Left Over per turn: {
              data.averageCardsLeftOverPerTurn
            }{' '}
            <br />
            Average Value per turn (Damage threatened + block):{' '}
            {data.averageValuePerTurn}
          </p>
          <table className={styles.cardTable}>
            <thead>
              <tr>
                <th>Turn Number</th>
                <th>Cards Played</th>
                <th>Cards Blocked</th>
                <th>Cards Pitched</th>
                <th>Resources Used</th>
                <th>Resources Left</th>
                <th>Cards Left</th>
                <th>Damage Dealt</th>
                <th>Damage Taken</th>
              </tr>
            </thead>
            <tbody>
              {!!data.turnResults &&
                Object.keys(data.turnResults).map((key, ix) => {
                  return (
                    <tr key={`turnList${ix}`}>
                      <td className={styles.turnNo}>{ix + 1}</td>
                      <td className={styles.played}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.cardsUsed}
                      </td>
                      <td className={styles.blocked}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.cardsBlocked}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.cardsPitched}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.resourcesUsed}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.resourcesLeft}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.cardsLeft}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.damageDealt}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.damageTaken}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EndGameStats;
