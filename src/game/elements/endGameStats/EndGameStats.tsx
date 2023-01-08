import { Card } from '../../../features/Card';
import { Effect } from '../effects/Effects';
import styles from './EndGameStats.module.css';

export interface EndGameData {
  deckID?: string;
  firstPlayer?: number;
  gameID?: string;
  result?: number;
  turns?: number;
  cardResults: CardResult[];
  turnResults: Map<string, TurnResult>;
}

export interface CardResult {
  cardId: string;
  blocked: number;
  pitched: number;
  played: number;
}

export interface TurnResult {
  cardsBlocked: number;
  cardsLeft: number;
  cardsPitched: number;
  cardsUsed: number;
  damageDealt: number;
  damageTaken: number;
  resourcesUsed: number;
}

const EndGameStats = (data: EndGameData) => {
  console.log(data.cardResults);
  return (
    <div className={styles.cardListContents}>
      <div>
        <h2>Card Play Stats</h2>
        <table className={styles.cardTable}>
          <thead>
            <tr>
              <th>Card ID</th>
              <th>Times Played</th>
              <th>Times Blocked</th>
              <th>Times Pitched</th>
            </tr>
          </thead>
          <tbody>
            {!!data.cardResults &&
              data.cardResults?.map((result, ix) => {
                const card: Card = { cardNumber: result.cardId };
                return (
                  <tr key={`cardList${ix}`}>
                    <td className={styles.card}>
                      <Effect card={card} />
                    </td>
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
        <h2>Stuff</h2>
        <div>TODO: Add more stuff here</div>
      </div>
      <div>
        <h2>Turn Stats</h2>
        <table className={styles.cardTable}>
          <thead>
            <tr>
              <th>Turn Number</th>
              <th>Cards Played</th>
              <th>Cards Blocked</th>
              <th>Cards Pitched</th>
              <th>Resources Used</th>
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
  );
};

export default EndGameStats;
