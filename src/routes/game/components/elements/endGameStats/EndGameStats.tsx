import { Card } from 'features/Card';
import { number } from 'yup';
import { Effect } from '../effects/Effects';
import EndGameMenuOptions from '../endGameMenuOptions/EndGameMenuOptions';
import styles from './EndGameStats.module.css';
import { NumberLiteralType } from 'typescript';
import useAuth from 'hooks/useAuth';
import { sanitizeHtml } from 'utils/sanitizeHtml';

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
  totalLifeGained?: number;
  totalDamagePrevented?: number;
  averageCombatValuePerTurn?: number;
  averageValuePerTurn?: number;
  yourTime?: number;
  totalTime?: number;
}

export interface CardResult {
  cardId: string;
  blocked: number;
  pitched: number;
  played: number;
  hits: number;
  charged: number;
  cardName: string;
  pitchValue: number;
  katsuDiscard: number;
}

export interface TurnResult {
  cardsBlocked: number;
  cardsLeft: number;
  cardsPitched: number;
  cardsUsed: number;
  damageThreatened: number;
  damageDealt: number;
  damageBlocked: number;
  damagePrevented: number;
  damageTaken: number;
  resourcesUsed: number;
  resourcesLeft: number;
}

const EndGameStats = (data: EndGameData) => {
  const { isPatron } = useAuth();

  function fancyTimeFormat(duration: number | undefined) {
    duration = duration ?? 0;
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    let ret = '';

    if (hrs > 0) {
      ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }

    ret += '' + mins + ':' + (secs < 10 ? '0' : '');
    ret += '' + secs;

    return ret;
  }
  let numCharged: number = 0;
  for (let i = 0; i < data.cardResults.length; i++) {
    numCharged += data.cardResults[i].charged;
  }

  let numKatsuDiscard: number = 0;
  for (let i = 0; i < data.cardResults.length; i++) {
    numKatsuDiscard += data.cardResults[i].katsuDiscard;
  }

  return (
    <div className={styles.endGameStats} data-testid="test-stats">
      <EndGameMenuOptions />
      <div className={styles.twoColumn}>
        <div>
          <h2>Card Play Stats</h2>
          <table className={styles.cardTable}>
            <thead>
              <tr>
                <th className={styles.headersStats}></th>
                <th>Card Name</th>
                <th className={styles.headersStats}>Played</th>
                <th className={styles.headersStats}>Blocked</th>
                <th className={styles.headersStats}>Pitched</th>
                <th className={styles.headersStats}>Times Hit</th>
                {numCharged > 0 && (
                  <th className={styles.headersStats}>Times Charged</th>
                )}
                {numKatsuDiscard > 0 && (
                  <th className={styles.headersStats}>Times Katsu Discarded</th>
                )}
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
                      <th className={styles.cardStat}>{result.hits}</th>
                      {numCharged > 0 && (
                        <th className={styles.cardStat}>{result.charged}</th>
                      )}
                      {numKatsuDiscard > 0 && (
                        <th className={styles.cardStat}>
                          {result.katsuDiscard}
                        </th>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div>
          <h3>Game Time</h3>
          <p>Your Time: {fancyTimeFormat(data.yourTime)}</p>
          <p>Total Game Time: {fancyTimeFormat(data.totalTime)}</p>
          <h3>Turn Stats</h3>
          <p style={{ marginBottom: '1em' }}>
            <em>First turn omitted for first player</em>
            <br /> Total Damage Threatened: {data.totalDamageThreatened}
            <br />
            Total Damage Dealt: {data.totalDamageDealt}
            <br />
            {isPatron ? (
              `Total Damage Prevented: ${data.totalDamagePrevented}`
            ) : (
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml("Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a> to access life gain stats") }} />
            )}
            <br />
            {isPatron ? (
              `Total Life Gained: ${data.totalLifeGained}`
            ) : (
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml("Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a> to access life gain stats") }} />
            )}
            <br />
            Average Damage Threatened per Turn:{' '}
            {data.averageDamageThreatenedPerTurn}
            <br />
            Average Damage Dealt per Turn: {data.averageDamageDealtPerTurn}
            <br />
            Average Damage Threatened per Offensive Card:{' '}
            {data.averageDamageThreatenedPerCard}
            <br />
            Average Resources Used per Turn: {data.averageResourcesUsedPerTurn}
            <br />
            Average Cards Left Over per Turn: {data.averageCardsLeftOverPerTurn}
            {!isPatron ? (
              <>
              <br />
              Average Combat Value per Turn (Damage Threatened + Block): {data.averageCombatValuePerTurn}
              </>
            ) : (
              <></>
            )}
            <br />
            {isPatron ? (
              `Average Value per Turn (Damage, Block, Prevent, Life Gain): ${data.averageValuePerTurn}`
            ) : (
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml("Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a> to access average value per turn") }} />
            )}
          </p>
          <table className={styles.cardTable}>
            <thead>
              <tr>
                <th className={styles.headersStats}>Turn</th>
                <th colSpan={4} className={styles.headersStats}>
                  Cards
                </th>
                <th colSpan={2} className={styles.headersStats}>
                  Resources
                </th>
                <th colSpan={5} className={styles.headersStats}>
                  Damage
                </th>
                <th colSpan={1} className={styles.headersStats}>
                  Life
                </th>
                <th colSpan={1} className={styles.headersStats}>
                  Value
                </th>
              </tr>
              <tr>
                <th className={styles.turnNo}>#</th>
                <th>Played</th>
                <th>Blocked</th>
                <th>Pitched</th>
                <th>Left</th>
                <th>Used</th>
                <th>Left</th>
                <th>Threatened</th>
                <th>Dealt</th>
                <th>Blocked</th>
                <th>Prevented</th>
                <th>Taken</th>
                <th>Life Gained</th>
                <th>This Turn</th>
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
                        {data.turnResults[key]?.cardsLeft}
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
                        {isPatron ? `${data.turnResults[key]?.damageThreatened}` : `X`}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.damageDealt}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {isPatron ? `${data.turnResults[key]?.damageBlocked}` : `X`}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {isPatron ? `${data.turnResults[key]?.damagePrevented}` : `X`}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {data.turnResults[key]?.damageTaken}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {isPatron ? `${data.turnResults[key]?.lifeGained}` : `X`}
                      </td>
                      <td className={styles.pitched}>
                        {/* @ts-ignore */}
                        {isPatron ? (+data.turnResults[key]?.damageThreatened + +data.turnResults[key]?.damageBlocked + +data.turnResults[key]?.damagePrevented + +data.turnResults[key]?.lifeGained).toString() : `X`}
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
