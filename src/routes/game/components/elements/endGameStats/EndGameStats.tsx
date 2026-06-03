import { Card } from 'features/Card';
import { Effect } from '../effects/Effects';
import styles from './EndGameStats.module.css';
import useAuth from 'hooks/useAuth';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { AdUnit } from 'components/ads';
import {
  useState,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect
} from 'react';
import html2canvas from 'html2canvas';
import TalisharLogo from 'img/TalisharLogo.webp';
import { BACKEND_URL } from 'appConstants';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import { useTheme } from 'themes/ThemeContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

export interface EndGameData {
  deckID?: string;
  firstPlayer?: number;
  gameID?: string;
  result?: number;
  turns?: number;
  playerID?: number;
  yourHero?: string;
  opponentHero?: string;
  winner?: number;
  authKey?: string;
  bothPlayersData?: { [key: number]: any };
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
  totalDamageBlocked?: number;
  totalDamagePrevented?: number;
  totalLifeLost?: number;
  averageCombatValuePerTurn?: number;
  averageValuePerTurn?: number;
  totalDamageThreatened_NoLast?: number;
  totalDamageDealt_NoLast?: number;
  averageDamageThreatenedPerTurn_NoLast?: number;
  averageDamageDealtPerTurn_NoLast?: number;
  averageDamageThreatenedPerCard_NoLast?: number;
  averageResourcesUsedPerTurn_NoLast?: number;
  averageCardsLeftOverPerTurn_NoLast?: number;
  totalLifeGained_NoLast?: number;
  totalDamageBlocked_NoLast?: number;
  totalDamagePrevented_NoLast?: number;
  totalLifeLost_NoLast?: number;
  averageCombatValuePerTurn_NoLast?: number;
  averageValuePerTurn_NoLast?: number;
  yourTime?: number;
  totalTime?: number;
  startingLife?: number;
  opponentStartingLife?: number;
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
  discarded: number;
}

export interface TurnResult {
  cardsBlocked: number;
  cardsLeft: number;
  cardsPitched: number;
  cardsUsed: number;
  cardsDiscarded: number;
  damageThreatened: number;
  damageDealt: number;
  damageBlocked: number;
  damagePrevented: number;
  damageTaken: number;
  resourcesUsed: number;
  resourcesLeft: number;
  lifeGained: number;
  lifeLost: number;
  turnNo?: number;
}

export interface EndGameStatsRef {
  exportScreenshot: () => Promise<void>;
  exportCSV: () => Promise<void>;
}

const ConfettiSvg = () => (
  <svg className={styles.outcomeSvg} viewBox="0 0 300 70" aria-hidden="true" overflow="visible">
    {/* 10 pieces all start centered at (150, 35); keyframes burst them outward */}
    <rect  className={`${styles.cfBase} ${styles.cfP1}`}  x="146" y="33" width="8"  height="4" fill="#FFD700" rx="1" />
    <circle className={`${styles.cfBase} ${styles.cfP2}`}  cx="150" cy="35" r="4"                fill="#D4691F" />
    <rect  className={`${styles.cfBase} ${styles.cfP3}`}  x="147" y="32" width="6"  height="6" fill="#FF6B6B" rx="1" />
    <circle className={`${styles.cfBase} ${styles.cfP4}`}  cx="150" cy="35" r="3"                fill="#4B84FF" />
    <rect  className={`${styles.cfBase} ${styles.cfP5}`}  x="145" y="33" width="10" height="3" fill="#5FCA5F" rx="1" />
    <circle className={`${styles.cfBase} ${styles.cfP6}`}  cx="150" cy="35" r="4"                fill="#FF69B4" />
    <circle className={`${styles.cfBase} ${styles.cfP7}`}  cx="150" cy="35" r="3"                fill="#FFD700" />
    <rect  className={`${styles.cfBase} ${styles.cfP8}`}  x="146" y="33" width="8"  height="3" fill="#D4691F" rx="1" />
    <circle className={`${styles.cfBase} ${styles.cfP9}`}  cx="150" cy="35" r="3"                fill="#FF6B6B" />
    <rect  className={`${styles.cfBase} ${styles.cfP10}`} x="147" y="32" width="6"  height="6" fill="#4B84FF" rx="1" />
  </svg>
);

const DROP = 'M 0,-7 C 5,0 5,5 0,8 C -5,5 -5,0 0,-7 Z';

const RainSvg = () => (
  <svg className={styles.outcomeSvg} viewBox="0 0 300 70" aria-hidden="true" overflow="visible">
    <path className={`${styles.rdBase} ${styles.rdP1}`} d={DROP} fill="#5B89B4" />
    <path className={`${styles.rdBase} ${styles.rdP2}`} d={DROP} fill="#5B89B4" />
    <path className={`${styles.rdBase} ${styles.rdP3}`} d={DROP} fill="#7AAAD0" />
    <path className={`${styles.rdBase} ${styles.rdP4}`} d={DROP} fill="#5B89B4" />
    <path className={`${styles.rdBase} ${styles.rdP5}`} d={DROP} fill="#7AAAD0" />
  </svg>
);

const EndGameStats = forwardRef<EndGameStatsRef, EndGameData>((data, ref) => {
  const [sortField, setSortField] = useState<
    'played' | 'blocked' | 'pitched' | 'discarded' | 'hits' | 'cardName' | null
  >(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAllCards, setShowAllCards] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [heroDataUrls, setHeroDataUrls] = useState<{
    yourHero?: string;
    opponentHero?: string;
  }>({});
  const [excludeLastTurn, setExcludeLastTurn] = useState(false);
  const [hoveredChartTurn, setHoveredChartTurn] = useState<number | null>(null);

  const { currentTheme } = useTheme();
  const themeColor = currentTheme.colors.primary;

  const { isSupporter, isLoading: isSupporterLoading } = useSupporterStatus();
  const showAds = !isSupporterLoading && !isSupporter;

  const [turnSortField, setTurnSortField] = useState<
    | 'turnNo'
    | 'cardsUsed'
    | 'cardsBlocked'
    | 'cardsPitched'
    | 'cardsDiscarded'
    | 'cardsLeft'
    | 'resourcesUsed'
    | 'resourcesLeft'
    | 'damageThreatened'
    | 'damageDealt'
    | 'damageBlocked'
    | 'damagePrevented'
    | 'damageTaken'
    | 'lifeGained'
    | 'lifeLost'
    | 'totalValue'
    | null
  >(null);
  const [turnSortDirection, setTurnSortDirection] = useState<'asc' | 'desc'>(
    'desc'
  );

  const imageToDataUrl = async (heroName: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `${BACKEND_URL}GetHeroImage.php?hero=${encodeURIComponent(heroName)}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.error) {
        return null;
      }

      if (data.dataUrl) {
        return data.dataUrl;
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Load hero images on component mount or when data changes
  useEffect(() => {
    const loadHeroImages = async () => {
      const urls: { yourHero?: string; opponentHero?: string } = {};

      if (data.yourHero) {
        const dataUrl = await imageToDataUrl(data.yourHero);
        if (dataUrl) {
          urls.yourHero = dataUrl;
        }
      }

      if (data.opponentHero) {
        const dataUrl = await imageToDataUrl(data.opponentHero);
        if (dataUrl) {
          urls.opponentHero = dataUrl;
        }
      }

      setHeroDataUrls(urls);
    };

    // Don't fetch hero images for spectators
    if (data.playerID !== 3) {
      loadHeroImages();
    }
  }, [data.yourHero, data.opponentHero, data.playerID]);

  const handleSort = (
    field: 'played' | 'blocked' | 'pitched' | 'discarded' | 'hits' | 'cardName'
  ) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTurnSort = (
    field:
      | 'turnNo'
      | 'cardsUsed'
      | 'cardsBlocked'
      | 'cardsPitched'
      | 'cardsDiscarded'
      | 'cardsLeft'
      | 'resourcesUsed'
      | 'resourcesLeft'
      | 'damageThreatened'
      | 'damageDealt'
      | 'damageBlocked'
      | 'damagePrevented'
      | 'damageTaken'
      | 'lifeGained'
      | 'lifeLost'
      | 'totalValue'
  ) => {
    if (turnSortField === field) {
      // Toggle direction if same field
      setTurnSortDirection(turnSortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // New field, default to descending
      setTurnSortField(field);
      setTurnSortDirection('desc');
    }
  };

  // Helper function to get stats based on toggle
  const getStats = () => {
    if (excludeLastTurn) {
      return {
        totalDamageThreatened: data.totalDamageThreatened_NoLast,
        totalDamageDealt: data.totalDamageDealt_NoLast,
        averageDamageThreatenedPerTurn:
          data.averageDamageThreatenedPerTurn_NoLast,
        averageDamageDealtPerTurn: data.averageDamageDealtPerTurn_NoLast,
        averageDamageThreatenedPerCard:
          data.averageDamageThreatenedPerCard_NoLast,
        averageResourcesUsedPerTurn: data.averageResourcesUsedPerTurn_NoLast,
        averageCardsLeftOverPerTurn: data.averageCardsLeftOverPerTurn_NoLast,
        totalLifeGained: data.totalLifeGained_NoLast,
        totalDamageBlocked: data.totalDamageBlocked_NoLast,
        totalDamagePrevented: data.totalDamagePrevented_NoLast,
        totalLifeLost: data.totalLifeLost_NoLast,
        averageCombatValuePerTurn: data.averageCombatValuePerTurn_NoLast,
        averageValuePerTurn: data.averageValuePerTurn_NoLast
      };
    }
    return {
      totalDamageThreatened: data.totalDamageThreatened,
      totalDamageDealt: data.totalDamageDealt,
      averageDamageThreatenedPerTurn: data.averageDamageThreatenedPerTurn,
      averageDamageDealtPerTurn: data.averageDamageDealtPerTurn,
      averageDamageThreatenedPerCard: data.averageDamageThreatenedPerCard,
      averageResourcesUsedPerTurn: data.averageResourcesUsedPerTurn,
      averageCardsLeftOverPerTurn: data.averageCardsLeftOverPerTurn,
      totalLifeGained: data.totalLifeGained,
      totalDamageBlocked: data.totalDamageBlocked,
      totalDamagePrevented: data.totalDamagePrevented,
      totalLifeLost: data.totalLifeLost,
      averageCombatValuePerTurn: data.averageCombatValuePerTurn,
      averageValuePerTurn: data.averageValuePerTurn
    };
  };

  const stats = useMemo(getStats, [excludeLastTurn, data]);

  const chartData = useMemo(() => {
    if (!data.turnResults) return [];

    const yourStartingLife = data.startingLife ?? 40;
    const opponentPlayerID = data.playerID === 1 ? 2 : 1;
    const opponentData = data.bothPlayersData?.[opponentPlayerID] as EndGameData | undefined;
    const opponentStartingLife = data.opponentStartingLife ?? opponentData?.startingLife ?? 40;
    const opponentTurnResults = opponentData?.turnResults;

    const entries = Object.entries(data.turnResults)
      .map(([key, turn]) => ({
        turnNo: turn.turnNo !== undefined ? turn.turnNo : Number(key.replace('turn_', '')),
        turn
      }))
      .sort((a, b) => a.turnNo - b.turnNo)
      .filter((e) => e.turnNo > 0);

    let yourLife = yourStartingLife;
    let opponentLife = opponentStartingLife;

    return entries.map(({ turnNo, turn }) => {
      const turnValue =
        (+turn.damageThreatened || 0) +
        (+turn.damageBlocked || 0) +
        (+turn.damagePrevented || 0) +
        (+turn.lifeGained || 0) +
        (+turn.lifeLost || 0);
      const turnDealt = parseInt(String(turn.damageDealt), 10) || 0;

      yourLife -= (+turn.damageTaken || 0) + (+turn.lifeLost || 0);
      yourLife += +turn.lifeGained || 0;

      const oppTurn = opponentTurnResults?.[`turn_${turnNo}`];
      if (oppTurn) {
        opponentLife -= (+oppTurn.damageTaken || 0) + (+oppTurn.lifeLost || 0);
        opponentLife += +oppTurn.lifeGained || 0;
      } else {
        opponentLife -= turnDealt;
      }

      const turnTaken = parseInt(String(turn.damageTaken), 10) || 0;

      return {
        turn: turnNo,
        avgValue: turnValue,
        avgThreatened: parseInt(String(turn.damageThreatened), 10) || 0,
        avgDealt: turnDealt,
        damageTaken: turnTaken,
        yourLife: Math.max(0, yourLife),
        opponentLife: Math.max(0, opponentLife)
      };
    });
  }, [data.turnResults, data.startingLife, data.playerID, data.bothPlayersData]);

  const lifeChartData = useMemo(() => {
    const oppPlayerID = data.playerID === 1 ? 2 : 1;
    const oppData = data.bothPlayersData?.[oppPlayerID] as EndGameData | undefined;
    const startYour = data.startingLife ?? 40;
    const startOpp = data.opponentStartingLife ?? oppData?.startingLife ?? 40;
    return [{ turn: 0, yourLife: startYour, opponentLife: startOpp }, ...chartData];
  }, [chartData, data.startingLife, data.opponentStartingLife, data.playerID, data.bothPlayersData]);

  const avgChartValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(chartData.reduce((sum, d) => sum + d.avgValue, 0) / chartData.length);
  }, [chartData]);

  const handleExportScreenshot = async () => {
    if (!statsRef.current) return;

    setIsExporting(true);

    try {
      // Wait for hero images to load if they haven't yet
      const requiredHeroImages = [];
      if (data.yourHero) requiredHeroImages.push('yourHero');
      if (data.opponentHero) requiredHeroImages.push('opponentHero');

      // Wait for all required hero images to be loaded (max 5 seconds)
      if (requiredHeroImages.length > 0) {
        const startTime = Date.now();
        const maxWait = 5000; // 5 second timeout

        while (Date.now() - startTime < maxWait) {
          const allLoaded = requiredHeroImages.every(
            (hero) => heroDataUrls[hero as keyof typeof heroDataUrls]
          );
          if (allLoaded) {
            console.log('All hero images loaded');
            break;
          }
          // Wait a bit before checking again
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (
          !requiredHeroImages.every(
            (hero) => heroDataUrls[hero as keyof typeof heroDataUrls]
          )
        ) {
          console.warn(
            'Some hero images did not load within timeout, proceeding with export anyway'
          );
        }
      }

      // Pre-load all images in the canvas to ensure they're rendered
      const images = statsRef.current.querySelectorAll('img');
      const imageLoadPromises = Array.from(images).map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if image fails
          }
        });
      });

      await Promise.all(imageLoadPromises);

      // Show watermark and hide card images for export
      const hideElements = statsRef.current.querySelectorAll(
        `.${styles.hideOnExport}`
      );
      const watermark = statsRef.current.querySelector(
        `.${styles.watermark}`
      ) as HTMLElement;
      const heroPortraits = statsRef.current.querySelector(
        `.${styles.showOnExport}`
      ) as HTMLElement;

      // Hide card image column
      hideElements.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      if (watermark) {
        watermark.style.display = 'block';
      }

      if (heroPortraits) {
        heroPortraits.style.display = 'flex';
      }

      // Add small delay to ensure DOM has settled
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(statsRef.current, {
        backgroundColor: '#0a0a0a',
        scale: Math.min(window.devicePixelRatio, 2),
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      hideElements.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });

      if (watermark) {
        watermark.style.display = 'none';
      }

      if (heroPortraits) {
        heroPortraits.style.display = 'none';
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-')
            .slice(0, -5);
          link.download = `game-stats-${timestamp}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      });
    } catch (error) {
      console.error('Error exporting screenshot:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      console.log('=== Starting CSV export ===');
      console.log('Current player ID:', data.playerID);
      console.log('Both players data available:', data.bothPlayersData);

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      let csvContent = 'data:text/csv;charset=utf-8,';

      csvContent += '========== STATS PROVIDED BY TALISHAR ==========\n';
      csvContent += 'Support our work on Metafy!\n';
      csvContent += 'https://metafy.gg/@Talishar\n\n';

      const formatHeroName = (heroName: string): string => {
        return heroName
          .split('_')
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(' ');
      };

      const generatePlayerStatsSection = (
        playerData: EndGameData,
        playerName: string,
        heroName?: string
      ) => {
        let content = `\n========== ${playerName} ==========\n`;
        if (heroName) {
          const formattedHeroName = formatHeroName(heroName);
          content += `Hero: ${formattedHeroName}\n`;
        }
        content += `\nGAME SUMMARY\n`;

        let firstPlayerLabel = 'N/A';
        if (
          playerData.firstPlayer !== undefined &&
          playerData.firstPlayer !== null
        ) {
          if (
            playerData.playerID &&
            playerData.firstPlayer === playerData.playerID
          ) {
            firstPlayerLabel = 'Yes';
          } else if (
            playerData.playerID &&
            playerData.firstPlayer !== playerData.playerID
          ) {
            firstPlayerLabel = 'No';
          } else {
            firstPlayerLabel = playerData.firstPlayer.toString();
          }
        }
        content += `First Player,${firstPlayerLabel}\n`;

        let resultLabel = 'N/A';
        if (playerData.result !== undefined && playerData.result !== null) {
          if (playerData.playerID) {
            resultLabel = playerData.result === 1 ? 'Winner' : 'Loser';
          } else {
            resultLabel =
              playerData.result === 1 ? 'Player 1 Wins' : 'Player 2 Wins';
          }
        }
        // Override resultLabel if we have winner data available
        if (
          data.winner !== undefined &&
          data.winner !== null &&
          playerData.playerID
        ) {
          resultLabel =
            data.winner === playerData.playerID ? 'Winner' : 'Loser';
        }
        content += `Result,${resultLabel}\n`;
        content += `Turns,${playerData.turns || 'N/A'}\n`;
        content += `Your Time,${fancyTimeFormat(playerData.yourTime)}\n`;
        content += `Total Game Time,${fancyTimeFormat(
          playerData.totalTime
        )}\n\n`;

        content += 'GAME STATISTICS\n';
        content += `Avg Value per Turn,${
          playerData.averageValuePerTurn || 0
        }\n`;
        content += `Avg Damage Threatened per Turn,${
          playerData.averageDamageThreatenedPerTurn || 0
        }\n`;
        content += `Avg Damage Dealt per Turn,${
          playerData.averageDamageDealtPerTurn || 0
        }\n`;
        content += `Avg Damage Threatened per Card,${
          playerData.averageDamageThreatenedPerCard || 0
        }\n`;
        content += `Avg Resources Used per Turn,${
          playerData.averageResourcesUsedPerTurn || 0
        }\n`;
        content += `Avg Cards Left Over per Turn,${
          playerData.averageCardsLeftOverPerTurn || 0
        }\n`;
        content += `Avg Combat Value per Turn,${
          playerData.averageCombatValuePerTurn || 0
        }\n`;
        content += `Total Damage Threatened,${
          playerData.totalDamageThreatened || 0
        }\n`;
        content += `Total Damage Dealt,${playerData.totalDamageDealt || 0}\n`;
        content += `Total Damage Blocked,${
          playerData.totalDamageBlocked || 0
        }\n`;
        content += `Total Damage Prevented,${
          playerData.totalDamagePrevented || 0
        }\n`;
        content += `Total Life Gained,${playerData.totalLifeGained || 0}\n\n`;
        content += `Total Life Self-Lost,${playerData.totalLifeLost || 0}\n\n`;

        content += 'CARD PLAY STATS\n';
        content += 'Card Name,Played,Blocked,Pitched,Discarded,Times Hit';

        const hasCharged = playerData.cardResults?.some((c) => c.charged > 0);
        const hasKatsuDiscard = playerData.cardResults?.some(
          (c) => c.katsuDiscard > 0
        );

        if (hasCharged) content += ',Times Charged';
        if (hasKatsuDiscard) content += ',Times Katsu Discarded';
        content += '\n';

        playerData.cardResults?.forEach((result) => {
          const cardName = result.cardName.replace(/,/g, ';');
          const cardNameWithPitch =
            result.pitchValue > 0
              ? `${cardName} (${result.pitchValue})`
              : cardName;
          content += `"${cardNameWithPitch}",${result.played},${result.blocked},${result.pitched},${result.discarded},${result.hits}`;
          if (hasCharged) content += `,${result.charged}`;
          if (hasKatsuDiscard) content += `,${result.katsuDiscard}`;
          content += '\n';
        });

        content += '\nTURN BY TURN BREAKDOWN\n';
        content +=
          'Turn,Cards Played,Cards Blocked,Cards Pitched,Cards Discarded,Cards Left,Resources Used,Resources Left,';
        content +=
          'Damage Threatened,Damage Dealt,Damage Blocked,Damage Prevented,Damage Taken,Life Gained,Total Value\n';

        if (
          playerData.turnResults &&
          Object.keys(playerData.turnResults).length > 0
        ) {
          Object.keys(playerData.turnResults).forEach((key, ix) => {
            const turn = playerData.turnResults[key];
            const totalValue =
              +turn.damageThreatened +
              +turn.damageBlocked +
              +turn.damagePrevented +
              +turn.lifeGained +
              +turn.lifeLost;
            content += `${ix + 1},${turn.cardsUsed},${turn.cardsBlocked},${
              turn.cardsPitched
            },${turn.cardsDiscarded},${turn.cardsLeft}`;
            content += `${turn.resourcesUsed},${turn.resourcesLeft},`;
            content += `${turn.damageThreatened},${turn.damageDealt},`;
            content += `${turn.damageBlocked},${turn.damagePrevented},`;
            content += `${turn.damageTaken},${turn.lifeGained},${totalValue}\n`;
            content += `${turn.lifeLost}\n`;
          });
        }

        return content;
      };

      csvContent += generatePlayerStatsSection(
        data,
        `PLAYER ${data.playerID}`,
        data.yourHero
      );

      if (data.bothPlayersData) {
        const opponentPlayerID = data.playerID === 1 ? 2 : 1;
        const opponentData = data.bothPlayersData[opponentPlayerID];

        if (opponentData && opponentData.cardResults) {
          console.log(
            'Using cached opponent data for player',
            opponentPlayerID
          );
          const opponentDataWithID = {
            ...opponentData,
            playerID: opponentPlayerID
          };
          csvContent += generatePlayerStatsSection(
            opponentDataWithID as EndGameData,
            `PLAYER ${opponentPlayerID}`,
            data.opponentHero
          );
        } else {
          console.warn(
            'Opponent data not yet loaded. Please click "Switch player stats" to load opponent data before exporting.'
          );
          csvContent +=
            '\n\nNote: Opponent stats not available. Click "Switch player stats" to load them first.\n';
        }
      } else {
        console.warn('No bothPlayersData cache available');
        csvContent += '\n\nNote: Opponent stats not available\n';
      }

      // Create and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `game-stats-${timestamp}.csv`);
      document.body.appendChild(link);
      console.log('Triggering CSV download');
      link.click();
      document.body.removeChild(link);
      console.log('CSV download completed');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert(`Error exporting CSV: ${error}`);
    }
  };

  // Expose the export function to parent component
  useImperativeHandle(ref, () => ({
    exportScreenshot: handleExportScreenshot,
    exportCSV: handleExportCSV
  }));

  const filteredCardResults = useMemo(() => {
    if (!data.cardResults) return data.cardResults;
    if (showAllCards) return data.cardResults;
    return data.cardResults.filter(
      (r) => r.played > 0 || r.blocked > 0 || r.pitched > 0 || r.discarded > 0 || r.hits > 0
    );
  }, [data.cardResults, showAllCards]);

  const sortedCardResults = useMemo(() => {
    if (!filteredCardResults || !sortField) {
      return filteredCardResults;
    }

    return [...filteredCardResults].sort((a, b) => {
      if (sortField === 'cardName') {
        const aValue = a.cardName.toLowerCase();
        const bValue = b.cardName.toLowerCase();

        if (sortDirection === 'desc') {
          return bValue.localeCompare(aValue);
        } else {
          return aValue.localeCompare(bValue);
        }
      } else {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (sortDirection === 'desc') {
          return bValue - aValue;
        } else {
          return aValue - bValue;
        }
      }
    });
  }, [filteredCardResults, sortField, sortDirection]);

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
        // Sort by turn number (use turnNo from data or fallback to calculation)
        aValue =
          a.turnNo !== undefined
            ? a.turnNo
            : Object.keys(data.turnResults).indexOf(a.key);
        bValue =
          b.turnNo !== undefined
            ? b.turnNo
            : Object.keys(data.turnResults).indexOf(b.key);
      } else if (turnSortField === 'totalValue') {
        aValue =
          (+a.damageThreatened || 0) +
          (+a.damageBlocked || 0) +
          (+a.damagePrevented || 0) +
          (+a.lifeGained || 0) +
          (+a.lifeLost || 0);
        bValue =
          (+b.damageThreatened || 0) +
          (+b.damageBlocked || 0) +
          (+b.damagePrevented || 0) +
          (+b.lifeGained || 0) +
          (+b.lifeLost || 0);
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

  // Helper function to check if columns should be hidden - We hide those 3 collumns for irrelevant heroes
  const shouldHideDamagePrevented = useMemo(() => {
    if (!data.turnResults || Object.keys(data.turnResults).length === 0)
      return true;
    const hasAnyNonZero = Object.values(data.turnResults).some((turn) => {
      const value = parseInt(String(turn.damagePrevented), 10) || 0;
      return value !== 0;
    });
    return !hasAnyNonZero;
  }, [data.turnResults]);

  const shouldHideLifeGained = useMemo(() => {
    if (!data.turnResults || Object.keys(data.turnResults).length === 0)
      return true;
    const hasAnyNonZero = Object.values(data.turnResults).some((turn) => {
      const value = parseInt(String(turn.lifeGained), 10) || 0;
      return value !== 0;
    });
    return !hasAnyNonZero;
  }, [data.turnResults]);

  const shouldHideLifeLost = useMemo(() => {
    if (!data.turnResults || Object.keys(data.turnResults).length === 0)
      return true;
    const hasAnyNonZero = Object.values(data.turnResults).some((turn) => {
      const value = parseInt(String(turn.lifeLost), 10) || 0;
      return value !== 0;
    });
    return !hasAnyNonZero;
  }, [data.turnResults]);

  const shouldHideCardsDiscarded = useMemo(() => {
    if (!data.turnResults || Object.keys(data.turnResults).length === 0)
      return true;
    const hasAnyNonZero = Object.values(data.turnResults).some((turn) => {
      const value = parseInt(String(turn.cardsDiscarded), 10) || 0;
      return value !== 0;
    });
    return !hasAnyNonZero;
  }, [data.turnResults]);

  // Calculate the Life column span based on hidden columns
  const lifeColSpan =
    (shouldHideLifeGained ? 0 : 1) + (shouldHideLifeLost ? 0 : 1);

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
  const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: number }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'rgba(10,10,10,0.92)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.68em', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <p style={{ margin: '0 0 2px', color: 'rgba(255,255,255,0.45)' }}>After turn {label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ margin: 0, color: entry.color ?? themeColor, fontWeight: 600 }}>{entry.name}: {entry.value}</p>
        ))}
      </div>
    );
  };

  let numCharged: number = 0;
  for (let i = 0; i < (data.cardResults?.length ?? 0); i++) {
    numCharged += data.cardResults[i].charged;
  }

  let numKatsuDiscard: number = 0;
  for (let i = 0; i < (data.cardResults?.length ?? 0); i++) {
    numKatsuDiscard += data.cardResults[i].katsuDiscard;
  }

  let numDiscarded: number = 0;
  for (let i = 0; i < (data.cardResults?.length ?? 0); i++) {
    numDiscarded += data.cardResults[i].discarded;
  }

  return (
    <div className={styles.endGameStats} data-testid="test-stats">
      <div ref={statsRef} className={styles.statsContent}>
        <div className={styles.statsContainer}>
                    {/* Game Time & Summary Section */}
          <div className={styles.statsSection}>
            {data.winner !== undefined && data.playerID !== undefined && data.playerID !== 3 && (
              <div
                className={
                  data.winner === data.playerID
                    ? styles.outcomeVictory
                    : styles.outcomeDefeat
                }
              >
                {data.winner === data.playerID ? <ConfettiSvg /> : <RainSvg />}
                {data.winner === data.playerID ? 'Victory' : 'Defeat'}
              </div>
            )}

            <div className={styles.keyStats}>
              <div className={styles.keyStat}>
                <span className={styles.keyStatValue}>{stats.totalDamageThreatened ?? 0}</span>
                <span className={styles.keyStatLabel}>Damage Threatened</span>
              </div>
              <div className={styles.keyStat}>
                <span className={styles.keyStatValue}>{stats.totalDamageDealt ?? 0}</span>
                <span className={styles.keyStatLabel}>Damage Dealt</span>
              </div>
              <div className={styles.keyStat}>
                <span className={styles.keyStatValue}>{stats.totalDamageBlocked ?? 0}</span>
                <span className={styles.keyStatLabel}>Damage Blocked</span>
              </div>
              {(stats.totalDamagePrevented ?? 0) > 0 && (
                <div className={styles.keyStat}>
                  <span className={styles.keyStatValue}>{stats.totalDamagePrevented}</span>
                  <span className={styles.keyStatLabel}>Damage Prevented</span>
                </div>
              )}
            </div>

            <hr className={styles.statsDivider} />

            {/* Unified Stats Box */}
            <div className={styles.infoBox}>
              <div className={styles.disclaimer}>
                <em>Turn 0 automatically omitted for average calculations</em>
                <label className={styles.excludeLastTurnLabel}>
                  <input
                    type="checkbox"
                    checked={excludeLastTurn}
                    onChange={(e) => setExcludeLastTurn(e.target.checked)}
                    className={styles.excludeLastTurnCheckbox}
                  />
                  <span className={styles.excludeLastTurnText}>
                    Exclude Last Turn
                  </span>
                </label>
              </div>

              {/* Avg Value per Turn - Top Priority */}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  Avg Value per Turn:
                  <span
                    className={styles.tooltipIcon}
                    data-tooltip="(Damage Threatened + Damage Blocked + Life Gained - Life Self-Lost + Damage Prevented) ÷ Number of Turns (Excluding turn 0)"
                  >
                    ?
                  </span>
                </span>
                <span className={styles.infoValue}>
                  {stats.averageValuePerTurn}
                </span>
              </div>

              {/* Other Average Values */}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  Avg Damage Threatened per Turn:
                </span>
                <span className={styles.infoValue}>
                  {stats.averageDamageThreatenedPerTurn}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  Avg Damage Dealt per Turn:
                </span>
                <span className={styles.infoValue}>
                  {stats.averageDamageDealtPerTurn}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  Avg Damage Threatened per Card:
                </span>
                <span className={styles.infoValue}>
                  {stats.averageDamageThreatenedPerCard}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  Avg Resources Used per Turn:
                </span>
                <span className={styles.infoValue}>
                  {stats.averageResourcesUsedPerTurn}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  Avg Cards Left Over per Turn:
                </span>
                <span className={styles.infoValue}>
                  {stats.averageCardsLeftOverPerTurn}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  Avg Combat Value per Turn:
                </span>
                <span className={styles.infoValue}>
                  {stats.averageCombatValuePerTurn}
                </span>
              </div>

              {/* Total Damage/Life Values */}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  Total Damage Threatened:
                </span>
                <span className={styles.infoValue}>
                  {stats.totalDamageThreatened}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Total Damage Dealt:</span>
                <span className={styles.infoValue}>
                  {stats.totalDamageDealt}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Total Damage Blocked:</span>
                <span className={styles.infoValue}>
                  {stats.totalDamageBlocked}
                </span>
              </div>

              {(stats.totalDamagePrevented ?? 0) > 0 && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    Total Damage Prevented:
                  </span>
                  <span className={styles.infoValue}>
                    {stats.totalDamagePrevented}
                  </span>
                </div>
              )}

              {!!stats.totalLifeGained && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Total Life Gained:</span>
                  <span className={styles.infoValue}>
                    {stats.totalLifeGained}
                  </span>
                </div>
              )}
              {!!stats.totalLifeLost && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    Total Life Self-Lost:
                  </span>
                  <span className={styles.infoValue}>
                    {stats.totalLifeLost}
                  </span>
                </div>
              )}

              {/* Time Values */}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Your Time:</span>
                <span className={styles.infoValue}>
                  {fancyTimeFormat(data.yourTime)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Total Game Time:</span>
                <span className={styles.infoValue}>
                  {fancyTimeFormat(data.totalTime)}
                </span>
              </div>
            </div>

            {/* Hero Portraits Section */}
            {data.yourHero && data.opponentHero && (
              <div
                className={`${styles.heroPortraitsContainer} ${styles.showOnExport}`}
              >
                <h3 className={styles.heroTitle}>Hero Matchup</h3>
                <div className={styles.heroPortraits}>
                  <div className={styles.heroColumn}>
                    <p className={styles.heroLabel}>Your Hero</p>
                    <div className={styles.heroImageWrapper}>
                      {heroDataUrls.yourHero ? (
                        <img
                          src={heroDataUrls.yourHero}
                          alt="Your Hero"
                          className={styles.heroImage}
                          onError={(e) => {
                            console.error('Failed to display your hero image');
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      ) : (
                        <div className={styles.heroNameBox}>
                          {data.yourHero}
                        </div>
                      )}
                      {data.winner === data.playerID && (
                        <div className={styles.winnerBadge}>Winner!</div>
                      )}
                    </div>
                  </div>
                  <div className={styles.heroVsLabel}>VS</div>
                  <div className={styles.heroColumn}>
                    <p className={styles.heroLabel}>Opponent Hero</p>
                    <div className={styles.heroImageWrapper}>
                      {heroDataUrls.opponentHero ? (
                        <img
                          src={heroDataUrls.opponentHero}
                          alt="Opponent Hero"
                          className={styles.heroImage}
                          onError={(e) => {
                            console.error(
                              'Failed to display opponent hero image'
                            );
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      ) : (
                        <div className={styles.heroNameBox}>
                          {data.opponentHero}
                        </div>
                      )}
                      {data.winner !== data.playerID &&
                        data.winner !== undefined && (
                          <div className={styles.winnerBadge}>Winner!</div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Watermark - only visible in exports */}
            <div className={styles.watermark}>
              <div className={styles.watermarkContent}>
                <span>Stats provided to you by</span>
                <img
                  src={TalisharLogo}
                  alt="Talishar"
                  className={styles.watermarkLogo}
                />
                <span>
                  Support our work on{' '}
                  <a
                    href="https://metafy.gg/@talishar/members"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Metafy
                  </a>
                  ! ❤️
                </span>
              </div>
            </div>
          </div>
          <div className={styles.statsSection}>
            <div className={styles.sectionHeaderContainer}>
              <h2 className={styles.sectionHeader}>Card Play Stats</h2>
              <label className={styles.excludeLastTurnLabel}>
                <input
                  type="checkbox"
                  checked={showAllCards}
                  onChange={(e) => setShowAllCards(e.target.checked)}
                  className={styles.excludeLastTurnCheckbox}
                />
                <span className={styles.excludeLastTurnText}>Show all cards</span>
              </label>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.cardTable}>
                <thead>
                  <tr className={styles.headers}>
                    <th
                      className={`${styles.firstHeadersStats} ${styles.hideOnExport}`}
                    ></th>
                    <th
                      onClick={() => handleSort('cardName')}
                      className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                      title="Click to sort"
                    >
                      Card Name{' '}
                      {sortField === 'cardName' &&
                        (sortDirection === 'desc' ? '↓' : '↑')}
                    </th>
                    <th
                      className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                      onClick={() => handleSort('played')}
                      title="Click to sort"
                    >
                      Played{' '}
                      {sortField === 'played' &&
                        (sortDirection === 'desc' ? '↓' : '↑')}
                    </th>
                    <th
                      className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                      onClick={() => handleSort('blocked')}
                      title="Click to sort"
                    >
                      Blocked{' '}
                      {sortField === 'blocked' &&
                        (sortDirection === 'desc' ? '↓' : '↑')}
                    </th>
                    <th
                      className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                      onClick={() => handleSort('pitched')}
                      title="Click to sort"
                    >
                      Pitched{' '}
                      {sortField === 'pitched' &&
                        (sortDirection === 'desc' ? '↓' : '↑')}
                    </th>
                    {numDiscarded > 0 && (
                      <th
                        className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                        onClick={() => handleSort('discarded')}
                        title="Click to sort"
                      >
                        Discarded{' '}
                        {sortField === 'discarded' &&
                          (sortDirection === 'desc' ? '↓' : '↑')}
                      </th>
                    )}
                    <th
                      className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                      onClick={() => handleSort('hits')}
                      title="Click to sort"
                    >
                      Times Hit{' '}
                      {sortField === 'hits' &&
                        (sortDirection === 'desc' ? '↓' : '↑')}
                    </th>
                    {numCharged > 0 && (
                      <th
                        className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                      >
                        Times Charged
                      </th>
                    )}
                    {numKatsuDiscard > 0 && (
                      <th
                        className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                      >
                        Times Katsu Discarded
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {!!sortedCardResults &&
                    sortedCardResults?.map((result, ix) => {
                      const card: Card = { cardNumber: result.cardId };
                      let cardStyle = '';
                      let cardBorderStyle = '';
                      switch (result.pitchValue) {
                        case 1:
                          cardStyle = styles.onePitch;
                          cardBorderStyle = styles.cardOnePitch;
                          break;
                        case 2:
                          cardStyle = styles.twoPitch;
                          cardBorderStyle = styles.cardTwoPitch;
                          break;
                        case 3:
                          cardStyle = styles.threePitch;
                          cardBorderStyle = styles.cardThreePitch;
                          break;
                        default:
                          cardStyle = styles.zeroPitch;
                          cardBorderStyle = styles.cardZeroPitch;
                      }
                      return (
                        <tr key={`cardList${ix}`}>
                          <td
                            className={`${styles.card} ${styles.hideOnExport}`}
                          >
                            <Effect
                              card={card}
                              imgClassName={cardBorderStyle}
                            />
                          </td>
                          <td className={cardStyle} title={result.cardName}>
                            {result.cardName}
                          </td>
                          <td className={styles.played}>{result.played}</td>
                          <td className={styles.blocked}>{result.blocked}</td>
                          <td className={styles.pitched}>{result.pitched}</td>
                          {numDiscarded > 0 && (
                            <td className={styles.cardStat}>
                              {result.discarded}
                            </td>
                          )}
                          <td className={styles.cardStat}>{result.hits}</td>
                          {numCharged > 0 && (
                            <td className={styles.cardStat}>
                              {result.charged}
                            </td>
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


        </div>

        {/* Ad above Turn by Turn Breakdown */}
        {showAds && (
          <div className={`${styles.adBlock} ${styles.hideOnExport}`}>
            {!isSupporter && (
              <div className={styles.adHeader}>
                <a
                  href="https://metafy.gg/@talishar/members"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.removeAdsLink}
                >
                  Remove ads
                </a>
              </div>
            )}
            <AdUnit placement="billboard-1" className={styles.desktopAd} />
            <AdUnit placement="mobile-unit-1" className={styles.mobileAd} />
          </div>
        )}

        {/* Turn by Turn Breakdown - Full Width Section */}
        <div className={styles.turnBreakdownSection}>
          <h2 className={styles.sectionHeader}>
            Turn by Turn Breakdown
            <span
              className={styles.tooltipIconBreakdown}
              data-tooltip="Certain columns may be hidden if they contain no data (e.g. Damage Prevented, Life Gained/Self-Lost)"
            >
              ?
            </span>
          </h2>
          <div className={styles.tableContainer}>
            <table className={styles.cardTable}>
              <thead>
                <tr>
                  <th
                    className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                  >
                    Turn
                  </th>
                  <th
                    colSpan={shouldHideCardsDiscarded ? 4 : 5}
                    className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                  >
                    Cards
                  </th>
                  <th
                    colSpan={2}
                    className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                  >
                    Resources
                  </th>
                  <th
                    colSpan={shouldHideDamagePrevented ? 4 : 5}
                    className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                  >
                    Damage
                  </th>
                  {lifeColSpan > 0 && (
                    <th
                      colSpan={lifeColSpan}
                      className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                    >
                      Life
                    </th>
                  )}
                  <th colSpan={1} className={styles.headersStats}>
                    Value
                  </th>
                </tr>
                <tr>
                  <th
                    onClick={() => handleTurnSort('turnNo')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    #{' '}
                    {turnSortField === 'turnNo' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('cardsUsed')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Played{' '}
                    {turnSortField === 'cardsUsed' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('cardsBlocked')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Blocked{' '}
                    {turnSortField === 'cardsBlocked' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('cardsPitched')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Pitched{' '}
                    {turnSortField === 'cardsPitched' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  {!shouldHideCardsDiscarded && (
                    <th
                      onClick={() => handleTurnSort('cardsDiscarded')}
                      className={styles.sortableHeader}
                      title="Click to sort"
                    >
                      Discarded{' '}
                      {turnSortField === 'cardsDiscarded' &&
                        (turnSortDirection === 'desc' ? '↓' : '↑')}
                    </th>
                  )}
                  <th
                    onClick={() => handleTurnSort('cardsLeft')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Left{' '}
                    {turnSortField === 'cardsLeft' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('resourcesUsed')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Used{' '}
                    {turnSortField === 'resourcesUsed' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('resourcesLeft')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Left{' '}
                    {turnSortField === 'resourcesLeft' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('damageThreatened')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Threatened{' '}
                    {turnSortField === 'damageThreatened' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('damageDealt')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Dealt{' '}
                    {turnSortField === 'damageDealt' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    onClick={() => handleTurnSort('damageBlocked')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Blocked{' '}
                    {turnSortField === 'damageBlocked' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  {!shouldHideDamagePrevented && (
                    <th
                      onClick={() => handleTurnSort('damagePrevented')}
                      className={styles.sortableHeader}
                      title="Click to sort"
                    >
                      Prevented{' '}
                      {turnSortField === 'damagePrevented' &&
                        (turnSortDirection === 'desc' ? '↓' : '↑')}
                    </th>
                  )}
                  <th
                    onClick={() => handleTurnSort('damageTaken')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    Taken{' '}
                    {turnSortField === 'damageTaken' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  {!shouldHideLifeGained && (
                    <th
                      onClick={() => handleTurnSort('lifeGained')}
                      className={styles.sortableHeader}
                      title="Click to sort"
                    >
                      Life Gained{' '}
                      {turnSortField === 'lifeGained' &&
                        (turnSortDirection === 'desc' ? '↓' : '↑')}
                    </th>
                  )}
                  {!shouldHideLifeLost && (
                    <th
                      onClick={() => handleTurnSort('lifeLost')}
                      className={styles.sortableHeader}
                      title="Click to sort"
                    >
                      Self-Lost{' '}
                      {turnSortField === 'lifeLost' &&
                        (turnSortDirection === 'desc' ? '↓' : '↑')}
                    </th>
                  )}
                  <th
                    onClick={() => handleTurnSort('totalValue')}
                    className={styles.sortableHeader}
                    title="Click to sort"
                  >
                    This Turn{' '}
                    {turnSortField === 'totalValue' &&
                      (turnSortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTurnResults
                  ? sortedTurnResults.map((turnData, ix) => {
                      // Hide turn #0 for the non-first player
                      const rowTurnNo = turnData.turnNo !== undefined ? turnData.turnNo : Object.keys(data.turnResults).indexOf(turnData.key);
                      return (
                        <tr key={`turnList${ix}`} className={hoveredChartTurn === rowTurnNo ? styles.chartHighlightedRow : undefined}>
                          <td className={styles.turnNo}>
                            {turnData.turnNo !== undefined
                              ? turnData.turnNo
                              : Object.keys(data.turnResults).indexOf(
                                  turnData.key
                                )}
                          </td>
                          <td className={styles.played}>
                            {turnData.cardsUsed}
                          </td>
                          <td className={styles.blocked}>
                            {turnData.cardsBlocked}
                          </td>
                          <td className={styles.pitched}>
                            {turnData.cardsPitched}
                          </td>
                          {!shouldHideCardsDiscarded && (
                            <td className={styles.pitched}>
                              {turnData.cardsDiscarded}
                            </td>
                          )}
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
                            {parseInt(String(turnData.damageThreatened), 10) ||
                              0}
                          </td>
                          <td className={styles.pitched}>
                            {parseInt(String(turnData.damageDealt), 10) || 0}
                          </td>
                          <td className={styles.pitched}>
                            {turnData.damageBlocked}
                          </td>
                          {!shouldHideDamagePrevented && (
                            <td className={styles.pitched}>
                              {turnData.damagePrevented}
                            </td>
                          )}
                          <td className={styles.pitched}>
                            {turnData.damageTaken}
                          </td>
                          {!shouldHideLifeGained && (
                            <td className={styles.pitched}>
                              {turnData.lifeGained}
                            </td>
                          )}
                          {!shouldHideLifeLost && (
                            <td className={styles.pitched}>
                              {turnData.lifeLost}
                            </td>
                          )}
                          <td className={styles.pitched}>
                            {(
                              +turnData.damageThreatened +
                              +turnData.damageBlocked +
                              +turnData.damagePrevented +
                              +turnData.lifeGained +
                              +turnData.lifeLost
                            ).toString()}
                          </td>
                        </tr>
                      );
                    })
                  : !!data.turnResults &&
                    Object.keys(data.turnResults).map((key, ix) => {
                      const turnNo = data.turnResults[key]?.turnNo;
                      const rowTurnNo = turnNo !== undefined ? turnNo : ix;
                      // Hide turn #0 for the non-first player
                      return (
                        <tr key={`turnList${ix}`} className={hoveredChartTurn === rowTurnNo ? styles.chartHighlightedRow : undefined}>
                          <td className={styles.turnNo}>
                            {turnNo !== undefined ? turnNo : ix}
                          </td>
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
                          {!shouldHideCardsDiscarded && (
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {data.turnResults[key]?.cardsDiscarded}
                            </td>
                          )}
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
                            {parseInt(
                              String(data.turnResults[key]?.damageThreatened),
                              10
                            ) || 0}
                          </td>
                          <td className={styles.pitched}>
                            {/* @ts-ignore */}
                            {parseInt(
                              String(data.turnResults[key]?.damageDealt),
                              10
                            ) || 0}
                          </td>
                          <td className={styles.pitched}>
                            {/* @ts-ignore */}
                            {data.turnResults[key]?.damageBlocked}
                          </td>
                          {!shouldHideDamagePrevented && (
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {data.turnResults[key]?.damagePrevented}
                            </td>
                          )}
                          <td className={styles.pitched}>
                            {/* @ts-ignore */}
                            {data.turnResults[key]?.damageTaken}
                          </td>
                          {!shouldHideLifeGained && (
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {data.turnResults[key]?.lifeGained}
                            </td>
                          )}
                          {!shouldHideLifeLost && (
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {data.turnResults[key]?.lifeLost}
                            </td>
                          )}
                          <td className={styles.pitched}>
                            {/* @ts-ignore */}
                            {(
                              +data.turnResults[key]?.damageThreatened +
                              +data.turnResults[key]?.damageBlocked +
                              +data.turnResults[key]?.damagePrevented +
                              +data.turnResults[key]?.lifeGained +
                              +data.turnResults[key]?.lifeLost
                            ).toString()}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Per Turn Charts - outside statsRef so html2canvas doesn't process SVG elements */}
      {chartData.length > 1 && (
        <div className={styles.chartsGrid}>
            {/* Chart 1: Value Per Turn with reference lines */}
            <div className={styles.turnBreakdownSection}>
              <h2 className={styles.sectionHeader}>Value Per Turn</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }} onMouseMove={(e) => { if (e.activeLabel !== undefined) setHoveredChartTurn(Number(e.activeLabel)); }} onMouseLeave={() => setHoveredChartTurn(null)}>
                  <defs>
                    <linearGradient id="egsColorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="turn" stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={30} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                  <ReferenceLine y={12} stroke="rgba(180,130,40,0.5)" strokeDasharray="3 4" label={{ value: '12', position: 'insideTopRight', fill: 'rgba(180,130,40,0.7)', fontSize: 10 }} />
                  <ReferenceLine y={16} stroke="rgba(180,130,40,0.5)" strokeDasharray="3 4" label={{ value: '16', position: 'insideTopRight', fill: 'rgba(180,130,40,0.7)', fontSize: 10 }} />
                  {avgChartValue > 0 && <ReferenceLine y={avgChartValue} stroke="rgba(255,255,255,0.3)" strokeDasharray="5 3" label={{ value: `avg ${avgChartValue}`, position: 'insideTopLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />}
                  <Area type="monotone" dataKey="avgValue" name="Value" stroke={themeColor} strokeWidth={2} fill="url(#egsColorValue)" dot={false} activeDot={{ r: 4, fill: themeColor }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Life Totals - both heroes overlaid */}
            <div className={styles.turnBreakdownSection}>
              <h2 className={styles.sectionHeader}>Life Totals</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={lifeChartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }} onMouseMove={(e) => { if (e.activeLabel !== undefined) setHoveredChartTurn(Number(e.activeLabel)); }} onMouseLeave={() => setHoveredChartTurn(null)}>
                  <defs>
                    <linearGradient id="egsColorYourLife" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeColor} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="egsColorOppLife" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="turn" stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => v === 0 ? 'Start' : String(v)} />
                  <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={30} domain={[0, 'auto']} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                  <Legend verticalAlign="top" content={() => (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '0.68em', paddingBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke={themeColor} strokeWidth="2"/></svg>Your Life</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke="#ef4444" strokeWidth="2"/></svg>Opp Life</span>
                    </div>
                  )} />
                  <Area type="monotone" dataKey="opponentLife" name="Opp Life" stroke="#ef4444" strokeWidth={2} fill="url(#egsColorOppLife)" dot={false} activeDot={{ r: 4, fill: '#ef4444' }} />
                  <Area type="monotone" dataKey="yourLife" name="Your Life" stroke={themeColor} strokeWidth={2} fill="url(#egsColorYourLife)" dot={false} activeDot={{ r: 4, fill: themeColor }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 3: Pressure Exchange - your threatened vs damage taken */}
            <div className={styles.turnBreakdownSection}>
              <h2 className={styles.sectionHeader}>Pressure Exchange</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }} onMouseMove={(e) => { if (e.activeLabel !== undefined) setHoveredChartTurn(Number(e.activeLabel)); }} onMouseLeave={() => setHoveredChartTurn(null)}>
                  <defs>
                    <linearGradient id="egsColorThreatened2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="egsColorTaken" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                  <XAxis dataKey="turn" stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={30} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                  <Legend verticalAlign="top" content={() => (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '0.68em', paddingBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke={themeColor} strokeWidth="2"/></svg>You Threatened</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke="#ef4444" strokeWidth="2"/></svg>You Took</span>
                    </div>
                  )} />
                  <Area type="monotone" dataKey="avgThreatened" name="You Threatened" stroke={themeColor} strokeWidth={2} fill="url(#egsColorThreatened2)" dot={false} activeDot={{ r: 4, fill: themeColor }} />
                  <Area type="monotone" dataKey="damageTaken" name="You Took" stroke="#ef4444" strokeWidth={2} fill="url(#egsColorTaken)" dot={false} activeDot={{ r: 4, fill: '#ef4444' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Ad under charts */}
        {showAds && (
          <div className={`${styles.adBlock} ${styles.hideOnExport}`}>
            {!isSupporter && (
              <div className={styles.adHeader}>
                <a
                  href="https://metafy.gg/@talishar/members"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.removeAdsLink}
                >
                  Remove ads
                </a>
              </div>
            )}
            <AdUnit placement="billboard-2" className={styles.desktopAd} />
            <AdUnit placement="mobile-unit-2" className={styles.mobileAd} />
          </div>
        )}
    </div>
  );
});

EndGameStats.displayName = 'EndGameStats';

export default EndGameStats;
