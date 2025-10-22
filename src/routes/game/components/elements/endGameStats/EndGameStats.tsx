import { Card } from 'features/Card';
import { number } from 'yup';
import { Effect } from '../effects/Effects';
import EndGameMenuOptions from '../endGameMenuOptions/EndGameMenuOptions';
import styles from './EndGameStats.module.css';
import { NumberLiteralType } from 'typescript';
import useAuth from 'hooks/useAuth';
import { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import html2canvas from 'html2canvas';
import TalisharLogo from 'img/TalisharLogo.webp';

export interface EndGameData {
  deckID?: string;
  firstPlayer?: number;
  gameID?: string;
  result?: number;
  turns?: number;
  playerID?: number;
  cardResults: CardResult[];
  turnResults: { [key: string]: TurnResult };
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
  lifeGained: number;
}

export interface EndGameStatsRef {
  exportScreenshot: () => Promise<void>;
  exportCSV: () => void;
}

const EndGameStats = forwardRef<EndGameStatsRef, EndGameData>((data, ref) => {
  const { isPatron } = useAuth();
  const [sortField, setSortField] = useState<'played' | 'blocked' | 'pitched' | 'hits' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const statsRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const [turnSortField, setTurnSortField] = useState<'turnNo' | 'cardsUsed' | 'cardsBlocked' | 'cardsPitched' | 'cardsLeft' | 'resourcesUsed' | 'resourcesLeft' | 'damageThreatened' | 'damageDealt' | 'damageBlocked' | 'damagePrevented' | 'damageTaken' | 'lifeGained' | 'totalValue' | null>(null);
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

  const handleTurnSort = (field: 'turnNo' | 'cardsUsed' | 'cardsBlocked' | 'cardsPitched' | 'cardsLeft' | 'resourcesUsed' | 'resourcesLeft' | 'damageThreatened' | 'damageDealt' | 'damageBlocked' | 'damagePrevented' | 'damageTaken' | 'lifeGained' | 'totalValue') => {
    if (turnSortField === field) {
      // Toggle direction if same field
      setTurnSortDirection(turnSortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // New field, default to descending
      setTurnSortField(field);
      setTurnSortDirection('desc');
    }
  };

  const handleExportScreenshot = async () => {
    if (!statsRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Show watermark and hide card images for export
      const hideElements = statsRef.current.querySelectorAll(`.${styles.hideOnExport}`);
      const watermark = statsRef.current.querySelector(`.${styles.watermark}`) as HTMLElement;
      
      // Hide card image column
      hideElements.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
      
      // Show watermark
      if (watermark) {
        watermark.style.display = 'block';
      }
      
      const canvas = await html2canvas(statsRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Restore original visibility
      hideElements.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });
      
      if (watermark) {
        watermark.style.display = 'none';
      }
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          link.download = `game-stats-${timestamp}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error exporting screenshot:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      // Prepare CSV content
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Add Game Summary Section
      csvContent += 'GAME SUMMARY\n';
      csvContent += `Game ID,${data.gameID || 'N/A'}\n`;
      csvContent += `Deck ID,${data.deckID || 'N/A'}\n`;
      
      // Determine first player label
      let firstPlayerLabel = 'N/A';
      if (data.firstPlayer && data.playerID) {
        // If firstPlayer matches the current playerID we're viewing, it's "You", otherwise "Opponent"
        firstPlayerLabel = data.firstPlayer === data.playerID ? 'You' : 'Opponent';
      } else if (data.firstPlayer) {
        firstPlayerLabel = data.firstPlayer.toString();
      }
      csvContent += `First Player,${firstPlayerLabel}\n`;
      
      csvContent += `Result,${data.result || 'N/A'}\n`;
      csvContent += `Turns,${data.turns || 'N/A'}\n`;
      csvContent += `Your Time,${fancyTimeFormat(data.yourTime)}\n`;
      csvContent += `Total Game Time,${fancyTimeFormat(data.totalTime)}\n\n`;
      
      // Add Statistics Section
      csvContent += 'GAME STATISTICS\n';
      csvContent += `Avg Value per Turn,${isPatron ? data.averageValuePerTurn : 'Patreon Only'}\n`;
      csvContent += `Avg Damage Threatened per Turn,${data.averageDamageThreatenedPerTurn || 0}\n`;
      csvContent += `Avg Damage Dealt per Turn,${data.averageDamageDealtPerTurn || 0}\n`;
      csvContent += `Avg Damage Threatened per Card,${data.averageDamageThreatenedPerCard || 0}\n`;
      csvContent += `Avg Resources Used per Turn,${data.averageResourcesUsedPerTurn || 0}\n`;
      csvContent += `Avg Cards Left Over per Turn,${data.averageCardsLeftOverPerTurn || 0}\n`;
      if (!isPatron) {
        csvContent += `Avg Combat Value per Turn,${data.averageCombatValuePerTurn || 0}\n`;
      }
      csvContent += `Total Damage Threatened,${data.totalDamageThreatened || 0}\n`;
      csvContent += `Total Damage Dealt,${data.totalDamageDealt || 0}\n`;
      csvContent += `Total Damage Prevented,${isPatron ? (data.totalDamagePrevented || 0) : 'Patreon Only'}\n`;
      csvContent += `Total Life Gained,${isPatron ? (data.totalLifeGained || 0) : 'Patreon Only'}\n\n`;
      
      // Add Card Play Stats Section
      csvContent += 'CARD PLAY STATS\n';
      csvContent += 'Card Name,Played,Blocked,Pitched,Times Hit';
      if (numCharged > 0) csvContent += ',Times Charged';
      if (numKatsuDiscard > 0) csvContent += ',Times Katsu Discarded';
      csvContent += '\n';
      
      const cardsToExport = sortedCardResults || data.cardResults;
      cardsToExport?.forEach((result) => {
        const cardName = result.cardName.replace(/,/g, ';'); // Escape commas in card names
        const cardNameWithPitch = result.pitchValue > 0 ? `${cardName} (${result.pitchValue})` : cardName;
        csvContent += `"${cardNameWithPitch}",${result.played},${result.blocked},${result.pitched},${result.hits}`;
        if (numCharged > 0) csvContent += `,${result.charged}`;
        if (numKatsuDiscard > 0) csvContent += `,${result.katsuDiscard}`;
        csvContent += '\n';
      });
      
      // Add Turn by Turn Breakdown Section
      csvContent += '\nTURN BY TURN BREAKDOWN\n';
      csvContent += 'Turn,Cards Played,Cards Blocked,Cards Pitched,Cards Left,Resources Used,Resources Left,';
      csvContent += 'Damage Threatened,Damage Dealt,Damage Blocked,Damage Prevented,Damage Taken,Life Gained,Total Value\n';
      
      if (sortedTurnResults && sortedTurnResults.length > 0) {
        sortedTurnResults.forEach((turnData, ix) => {
          const turnNo = Object.keys(data.turnResults).indexOf(turnData.key) + 1;
          const totalValue = isPatron ? (+turnData.damageThreatened + +turnData.damageBlocked + +turnData.damagePrevented + +turnData.lifeGained) : 'X';
          csvContent += `${turnNo},${turnData.cardsUsed},${turnData.cardsBlocked},${turnData.cardsPitched},${turnData.cardsLeft},`;
          csvContent += `${turnData.resourcesUsed},${turnData.resourcesLeft},`;
          csvContent += `${isPatron ? turnData.damageThreatened : 'X'},${turnData.damageDealt},`;
          csvContent += `${isPatron ? turnData.damageBlocked : 'X'},${isPatron ? turnData.damagePrevented : 'X'},`;
          csvContent += `${turnData.damageTaken},${isPatron ? turnData.lifeGained : 'X'},${totalValue}\n`;
        });
      } else if (data.turnResults && Object.keys(data.turnResults).length > 0) {
        Object.keys(data.turnResults).forEach((key, ix) => {
          const turn = data.turnResults[key];
          const totalValue = isPatron ? (+turn.damageThreatened + +turn.damageBlocked + +turn.damagePrevented + +turn.lifeGained) : 'X';
          csvContent += `${ix + 1},${turn.cardsUsed},${turn.cardsBlocked},${turn.cardsPitched},${turn.cardsLeft},`;
          csvContent += `${turn.resourcesUsed},${turn.resourcesLeft},`;
          csvContent += `${isPatron ? turn.damageThreatened : 'X'},${turn.damageDealt},`;
          csvContent += `${isPatron ? turn.damageBlocked : 'X'},${isPatron ? turn.damagePrevented : 'X'},`;
          csvContent += `${turn.damageTaken},${isPatron ? turn.lifeGained : 'X'},${totalValue}\n`;
        });
      }
      
      // Create and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `game-stats-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  // Expose the export function to parent component
  useImperativeHandle(ref, () => ({
    exportScreenshot: handleExportScreenshot,
    exportCSV: handleExportCSV
  }));

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

      if (turnSortField === 'turnNo') {
        // Sort by turn number (the index in the original object)
        aValue = Object.keys(data.turnResults).indexOf(a.key);
        bValue = Object.keys(data.turnResults).indexOf(b.key);
      } else if (turnSortField === 'totalValue') {
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

      <div ref={statsRef} className={styles.statsContent}>
        <div className={styles.statsContainer}>
        <div className={styles.statsSection}>
          <h2 className={styles.sectionHeader}>Card Play Stats</h2>
          <div className={styles.tableContainer}>
            <table className={styles.cardTable}>
              <thead>
                <tr className={styles.headers}>
                  <th className={`${styles.firstHeadersStats} ${styles.hideOnExport}`}></th>
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
                        <td className={`${styles.card} ${styles.hideOnExport}`}>
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

        {/* Game Time & Summary Section */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionHeader}>Game Time & Summary</h2>
          
          {/* Unified Stats Box */}
          <div className={styles.infoBox}>
            <div className={styles.disclaimer}>
              <em>First turn omitted for first player</em>
            </div>
            
            {/* Avg Value per Turn - Top Priority */}
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
            
            {/* Other Average Values */}
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
            
            {/* Total Damage/Life Values */}
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
            
            {/* Time Values */}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Your Time:</span>
              <span className={styles.infoValue}>{fancyTimeFormat(data.yourTime)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Total Game Time:</span>
              <span className={styles.infoValue}>{fancyTimeFormat(data.totalTime)}</span>
            </div>
          </div>
          
          {/* Watermark - only visible in exports */}
          <div className={styles.watermark}>
            <div className={styles.watermarkContent}>
              <span>Stats provided to you by</span>
              <img src={TalisharLogo} alt="Talishar" className={styles.watermarkLogo} />
              <span>Support our work on <a href="https://linktr.ee/Talishar" target="_blank" rel="noopener noreferrer">Patreon</a>! ❤️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Turn by Turn Breakdown - Full Width Section */}
      <div className={styles.turnBreakdownSection}>
        <h2 className={styles.sectionHeader}>Turn by Turn Breakdown</h2>
        <div className={styles.disclaimer}>
          <em>First turn omitted for first player</em>
        </div>
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
                  <th onClick={() => handleTurnSort('turnNo')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort">
                  # {turnSortField === 'turnNo' && (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
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
});

EndGameStats.displayName = 'EndGameStats';

export default EndGameStats;
