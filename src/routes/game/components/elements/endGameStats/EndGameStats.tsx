import { Card } from 'features/Card';
import { number } from 'yup';
import { Effect } from '../effects/Effects';
import EndGameMenuOptions from '../endGameMenuOptions/EndGameMenuOptions';
import styles from './EndGameStats.module.css';
import { NumberLiteralType } from 'typescript';
import useAuth from 'hooks/useAuth';
import { useState, useMemo } from 'react';

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
  const [sortField, setSortField] = useState<'played' | 'blocked' | 'pitched' | 'hits' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [turnSortField, setTurnSortField] = useState<'cardsUsed' | 'cardsBlocked' | 'cardsPitched' | 'cardsLeft' | 'resourcesUsed' | 'resourcesLeft' | 'damageThreatened' | 'damageDealt' | 'damageBlocked' | 'damagePrevented' | 'damageTaken' | 'lifeGained' | 'totalValue' | null>(null);
  const [turnSortDirection, setTurnSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'played' | 'blocked' | 'pitched' | 'hits') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTurnSort = (field: 'cardsUsed' | 'cardsBlocked' | 'cardsPitched' | 'cardsLeft' | 'resourcesUsed' | 'resourcesLeft' | 'damageThreatened' | 'damageDealt' | 'damageBlocked' | 'damagePrevented' | 'damageTaken' | 'lifeGained' | 'totalValue') => {
    if (turnSortField === field) {
      // Toggle direction if same field
      setTurnSortDirection(turnSortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // New field, default to descending
      setTurnSortField(field);
      setTurnSortDirection('desc');
    }
  };

  const sortedCardResults = useMemo(() => {
    if (!data.cardResults || !sortField) {
      return data.cardResults;
    }

    return [...data.cardResults].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });
  }, [data.cardResults, sortField, sortDirection]);

  const sortedTurnResults = useMemo(() => {
    if (!data.turnResults || !turnSortField) {
      return null;
    }

    const turnArray = Object.entries(data.turnResults).map(([key, value]) => ({
      key,
      ...value
    }));

    const sorted = turnArray.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      if (turnSortField === 'totalValue') {
        aValue = (a.damageThreatened || 0) + (a.damageBlocked || 0) + (a.damagePrevented || 0) + (a.lifeGained || 0);
        bValue = (b.damageThreatened || 0) + (b.damageBlocked || 0) + (b.damagePrevented || 0) + (b.lifeGained || 0);
      } else {
        aValue = a[turnSortField] || 0;
        bValue = b[turnSortField] || 0;
      }
      
      if (turnSortDirection === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    return sorted;
  }, [data.turnResults, turnSortField, turnSortDirection]);

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
      
      <div className={styles.statsContainer}>
        <div className={styles.statsSection}>
          <h2 className={styles.sectionHeader}>Card Play Stats</h2>
          <div className={styles.tableContainer}>
            <table className={styles.cardTable}>
              <thead>
                <tr className={styles.headers}>
                  <th className={styles.firstHeadersStats}></th>
                  <th>Card Name</th>
                  <th 
                    className={styles.headersStats} 
                    onClick={() => handleSort('played')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Played {sortField === 'played' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className={styles.headersStats}
                    onClick={() => handleSort('blocked')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Blocked {sortField === 'blocked' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className={styles.headersStats}
                    onClick={() => handleSort('pitched')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Pitched {sortField === 'pitched' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className={styles.headersStats}
                    onClick={() => handleSort('hits')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Times Hit {sortField === 'hits' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  {numCharged > 0 && (
                    <th className={styles.headersStats}>Times Charged</th>
                  )}
                  {numKatsuDiscard > 0 && (
                    <th className={styles.headersStats}>Times Katsu Discarded</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {!!sortedCardResults &&
                  sortedCardResults?.map((result, ix) => {
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
                        <td className={cardStyle} title={result.cardName}>{result.cardName}</td>
                        <td className={styles.played}>{result.played}</td>
                        <td className={styles.blocked}>{result.blocked}</td>
                        <td className={styles.pitched}>{result.pitched}</td>
                        <td className={styles.cardStat}>{result.hits}</td>
                        {numCharged > 0 && (
                          <td className={styles.cardStat}>{result.charged}</td>
                        )}
                        {numKatsuDiscard > 0 && (
                          <td className={styles.cardStat}>
                            {result.katsuDiscard}
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Game Time & Turn Stats Section */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionHeader}>Game Time & Summary</h2>
          
          {/* Unified Stats Box */}
          <div className={styles.infoBox}>
            <div className={styles.disclaimer}>
              <em>First turn omitted for first player</em>
            </div>
            
            {/* Game Time */}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Your Time:</span>
              <span className={styles.infoValue}>{fancyTimeFormat(data.yourTime)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Total Game Time:</span>
              <span className={styles.infoValue}>{fancyTimeFormat(data.totalTime)}</span>
            </div>
            
            {/* Turn Stats Summary */}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Total Damage Threatened:</span>
              <span className={styles.infoValue}>{data.totalDamageThreatened}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Total Damage Dealt:</span>
              <span className={styles.infoValue}>{data.totalDamageDealt}</span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Total Damage Prevented:</span>
              <span className={styles.infoValue}>
                {isPatron ? (
                  data.totalDamagePrevented
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: "Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a>" }} />
                )}
              </span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Total Life Gained:</span>
              <span className={styles.infoValue}>
                {isPatron ? (
                  data.totalLifeGained
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: "Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a>" }} />
                )}
              </span>
            </div>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Avg Damage Threatened per Turn:</span>
              <span className={styles.infoValue}>{data.averageDamageThreatenedPerTurn}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Avg Damage Dealt per Turn:</span>
              <span className={styles.infoValue}>{data.averageDamageDealtPerTurn}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Avg Damage Threatened per Card:</span>
              <span className={styles.infoValue}>{data.averageDamageThreatenedPerCard}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Avg Resources Used per Turn:</span>
              <span className={styles.infoValue}>{data.averageResourcesUsedPerTurn}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Avg Cards Left Over per Turn:</span>
              <span className={styles.infoValue}>{data.averageCardsLeftOverPerTurn}</span>
            </div>
            
            {!isPatron && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Avg Combat Value per Turn:</span>
                <span className={styles.infoValue}>{data.averageCombatValuePerTurn}</span>
              </div>
            )}
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Avg Value per Turn:</span>
              <span className={styles.infoValue}>
                {isPatron ? (
                  data.averageValuePerTurn
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: "Support our <a href='https://linktr.ee/Talishar' target='_blank'>patreon</a>" }} />
                )}
              </span>
            </div>
          </div>

          <h3 className={styles.sectionHeader} style={{ marginTop: '1rem' }}>Turn by Turn Breakdown</h3>
          <div className={styles.tableContainer}>
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
                  <th
                    onClick={() => handleTurnSort('cardsUsed')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Played {turnSortField === 'cardsUsed' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('cardsBlocked')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Blocked {turnSortField === 'cardsBlocked' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('cardsPitched')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Pitched {turnSortField === 'cardsPitched' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('cardsLeft')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Left {turnSortField === 'cardsLeft' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('resourcesUsed')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Used {turnSortField === 'resourcesUsed' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('resourcesLeft')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Left {turnSortField === 'resourcesLeft' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('damageThreatened')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Threatened {turnSortField === 'damageThreatened' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('damageDealt')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Dealt {turnSortField === 'damageDealt' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('damageBlocked')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Blocked {turnSortField === 'damageBlocked' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('damagePrevented')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Prevented {turnSortField === 'damagePrevented' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('damageTaken')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Taken {turnSortField === 'damageTaken' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('lifeGained')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    Life Gained {turnSortField === 'lifeGained' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('totalValue')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort"
                  >
                    This Turn {turnSortField === 'totalValue' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTurnResults ? (
                  sortedTurnResults.map((turnData, ix) => {
                    return (
                      <tr key={`turnList${ix}`}>
                        <td className={styles.turnNo}>{Object.keys(data.turnResults).indexOf(turnData.key) + 1}</td>
                        <td className={styles.played}>
                          {turnData.cardsUsed}
                        </td>
                        <td className={styles.blocked}>
                          {turnData.cardsBlocked}
                        </td>
                        <td className={styles.pitched}>
                          {turnData.cardsPitched}
                        </td>
                        <td className={styles.pitched}>
                          {turnData.cardsLeft}
                        </td>
                        <td className={styles.pitched}>
                          {turnData.resourcesUsed}
                        </td>
                        <td className={styles.pitched}>
                          {turnData.resourcesLeft}
                        </td>
                        <td className={styles.pitched}>
                          {isPatron ? `${turnData.damageThreatened}` : `X`}
                        </td>
                        <td className={styles.pitched}>
                          {turnData.damageDealt}
                        </td>
                        <td className={styles.pitched}>
                          {isPatron ? `${turnData.damageBlocked}` : `X`}
                        </td>
                        <td className={styles.pitched}>
                          {isPatron ? `${turnData.damagePrevented}` : `X`}
                        </td>
                        <td className={styles.pitched}>
                          {turnData.damageTaken}
                        </td>
                        <td className={styles.pitched}>
                          {isPatron ? `${turnData.lifeGained}` : `X`}
                        </td>
                        <td className={styles.pitched}>
                          {isPatron ? (+turnData.damageThreatened + +turnData.damageBlocked + +turnData.damagePrevented + +turnData.lifeGained).toString() : `X`}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  !!data.turnResults &&
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndGameStats;
