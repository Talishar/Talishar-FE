import { Card } from 'features/Card';
import { Effect } from '../effects/Effects';
import styles from './EndGameStats.module.css';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { AdUnit } from 'components/ads';
import {
  ReactNode,
  useState,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  KeyboardEvent,
  ThHTMLAttributes,
  ReactElement
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import TalisharLogo from 'img/TalisharLogo.webp';
import { BACKEND_URL } from 'appConstants';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import { useTheme } from 'themes/ThemeContext';
import useSetting from 'hooks/useSetting';
import { COLORBLIND_MODE } from 'features/options/constants';
import RemoveAdsLink from 'components/RemoveAdsLink/RemoveAdsLink';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  YAxisProps
} from 'recharts';

const getSortableHeaderProps = (
  onSort: () => void,
  isActive: boolean,
  direction: 'asc' | 'desc'
): ThHTMLAttributes<HTMLTableCellElement> => ({
  onClick: onSort,
  tabIndex: 0,
  'aria-sort': isActive
    ? direction === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none',
  onKeyDown: (event: KeyboardEvent<HTMLTableCellElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSort();
    }
  }
});

type CardSortField =
  | 'played'
  | 'blocked'
  | 'pitched'
  | 'discarded'
  | 'hits'
  | 'cardName';

type TurnSortField =
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
  | 'totalValue';

interface SortState<TField extends string> {
  field: TField | null;
  direction: 'asc' | 'desc';
  toggle: (field: TField) => void;
}

const useSortState = <TField extends string>(): SortState<TField> => {
  const [field, setField] = useState<TField | null>(null);
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  const toggle = (next: TField) => {
    if (field === next) {
      // Toggle direction if same field
      setDirection(direction === 'desc' ? 'asc' : 'desc');
    } else {
      // New field, default to descending
      setField(next);
      setDirection('desc');
    }
  };

  return { field, direction, toggle };
};

const SortHeader = <TField extends string>({
  field,
  label,
  sort,
  className,
  title
}: {
  field: TField;
  label: ReactNode;
  sort: SortState<TField>;
  className?: string;
  title?: string;
}) => (
  <th
    {...getSortableHeaderProps(
      () => sort.toggle(field),
      sort.field === field,
      sort.direction
    )}
    className={className}
    title={title}
  >
    {label} {sort.field === field && (sort.direction === 'desc' ? '↓' : '↑')}
  </th>
);

const ScrollableTable = ({ children }: { children: ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateOverflow = () => {
      setIsOverflowing(container.scrollWidth > container.clientWidth + 1);
    };

    updateOverflow();
    window.addEventListener('resize', updateOverflow, { passive: true });

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateOverflow);
    resizeObserver?.observe(container);
    if (container.firstElementChild) {
      resizeObserver?.observe(container.firstElementChild);
    }

    return () => {
      window.removeEventListener('resize', updateOverflow);
      resizeObserver?.disconnect();
    };
  });

  return (
    <div
      ref={containerRef}
      className={`${styles.tableContainer} ${
        isOverflowing ? styles.tableContainerOverflowing : ''
      }`}
    >
      {children}
    </div>
  );
};

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
  cardResults?: CardResult[];
  tokenResults?: CardResult[];
  arenaCardResults?: CardResult[];
  turnResults?: { [key: string]: TurnResult };
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
  activated?: number;
  passiveTriggered?: number;
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
  lifeAtTurnEnd?: number | null;
  opponentLifeAtTurnEnd?: number | null;
  turnNo?: number;
}

export interface EndGameStatsRef {
  exportScreenshot: () => Promise<void>;
  exportCSV: () => Promise<void>;
}

interface EndGameStatsProps extends EndGameData {
  masteryProgress?: React.ReactNode;
}

const ConfettiSvg = () => (
  <svg
    className={styles.outcomeSvg}
    viewBox="0 0 300 70"
    aria-hidden="true"
    overflow="visible"
  >
    {/* 10 pieces all start centered at (150, 35); keyframes burst them outward */}
    <rect
      className={`${styles.cfBase} ${styles.cfP1}`}
      x="146"
      y="33"
      width="8"
      height="4"
      fill="#FFD700"
      rx="1"
    />
    <circle
      className={`${styles.cfBase} ${styles.cfP2}`}
      cx="150"
      cy="35"
      r="4"
      fill="#D4691F"
    />
    <rect
      className={`${styles.cfBase} ${styles.cfP3}`}
      x="147"
      y="32"
      width="6"
      height="6"
      fill="#FF6B6B"
      rx="1"
    />
    <circle
      className={`${styles.cfBase} ${styles.cfP4}`}
      cx="150"
      cy="35"
      r="3"
      fill="#4B84FF"
    />
    <rect
      className={`${styles.cfBase} ${styles.cfP5}`}
      x="145"
      y="33"
      width="10"
      height="3"
      fill="#5FCA5F"
      rx="1"
    />
    <circle
      className={`${styles.cfBase} ${styles.cfP6}`}
      cx="150"
      cy="35"
      r="4"
      fill="#FF69B4"
    />
    <circle
      className={`${styles.cfBase} ${styles.cfP7}`}
      cx="150"
      cy="35"
      r="3"
      fill="#FFD700"
    />
    <rect
      className={`${styles.cfBase} ${styles.cfP8}`}
      x="146"
      y="33"
      width="8"
      height="3"
      fill="#D4691F"
      rx="1"
    />
    <circle
      className={`${styles.cfBase} ${styles.cfP9}`}
      cx="150"
      cy="35"
      r="3"
      fill="#FF6B6B"
    />
    <rect
      className={`${styles.cfBase} ${styles.cfP10}`}
      x="147"
      y="32"
      width="6"
      height="6"
      fill="#4B84FF"
      rx="1"
    />
  </svg>
);

const DROP = 'M 0,-7 C 5,0 5,5 0,8 C -5,5 -5,0 0,-7 Z';

const RainSvg = () => (
  <svg
    className={styles.outcomeSvg}
    viewBox="0 0 300 70"
    aria-hidden="true"
    overflow="visible"
  >
    <path
      className={`${styles.rdBase} ${styles.rdP1}`}
      d={DROP}
      fill="#5B89B4"
    />
    <path
      className={`${styles.rdBase} ${styles.rdP2}`}
      d={DROP}
      fill="#5B89B4"
    />
    <path
      className={`${styles.rdBase} ${styles.rdP3}`}
      d={DROP}
      fill="#7AAAD0"
    />
    <path
      className={`${styles.rdBase} ${styles.rdP4}`}
      d={DROP}
      fill="#5B89B4"
    />
    <path
      className={`${styles.rdBase} ${styles.rdP5}`}
      d={DROP}
      fill="#7AAAD0"
    />
  </svg>
);

function mergeCompanionPairs(cards: CardResult[]): CardResult[] {
  const merged = new Map<string, CardResult>();
  for (const card of cards) {
    const baseId = card.cardId.endsWith('_ally')
      ? card.cardId.slice(0, -5)
      : card.cardId;
    const existing = merged.get(baseId);
    if (existing) {
      merged.set(baseId, {
        ...existing,
        played: existing.played + card.played,
        blocked: existing.blocked + card.blocked,
        pitched: existing.pitched + card.pitched,
        hits: existing.hits + card.hits,
        charged: existing.charged + card.charged,
        katsuDiscard: existing.katsuDiscard + card.katsuDiscard,
        discarded: existing.discarded + card.discarded,
        activated: (existing.activated ?? 0) + (card.activated ?? 0),
        passiveTriggered:
          (existing.passiveTriggered ?? 0) + (card.passiveTriggered ?? 0)
      });
    } else {
      merged.set(baseId, { ...card, cardId: baseId });
    }
  }
  return Array.from(merged.values());
}

const getPitchStyles = (pitchValue?: number) => {
  switch (pitchValue) {
    case 1:
      return { text: styles.onePitch, border: styles.cardOnePitch };
    case 2:
      return { text: styles.twoPitch, border: styles.cardTwoPitch };
    case 3:
      return { text: styles.threePitch, border: styles.cardThreePitch };
    default:
      return { text: styles.zeroPitch, border: styles.cardZeroPitch };
  }
};

const CardThumbnailCell = ({
  cardId,
  imgClassName
}: {
  cardId: string;
  imgClassName: string;
}) => (
  <td className={`${styles.card} ${styles.hideOnExport}`}>
    <Effect card={{ cardNumber: cardId } as Card} imgClassName={imgClassName} />
  </td>
);

/** Chart palette used when the colorblind accessibility setting is on. */
const ACCESSIBLE_CHART_COLORS = { you: '#4DA3FF', opponent: '#F0554E' };

type ChartSeries = {
  dataKey: string;
  name: string;
  color: string;
  gradientId: string;
  fillOpacity: number;
};

const ChartSeriesLegend = ({ series }: { series: ChartSeries[] }) => (
  <div
    style={{
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      fontSize: '0.68em',
      paddingBottom: '6px',
      color: 'rgba(255,255,255,0.6)'
    }}
  >
    {series.map((entry) => (
      <span
        key={entry.dataKey}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <svg width="14" height="4">
          <line
            x1="0"
            y1="2"
            x2="14"
            y2="2"
            stroke={entry.color}
            strokeWidth="2"
          />
        </svg>
        {entry.name}
      </span>
    ))}
  </div>
);

const StatsAreaChart = ({
  title,
  data,
  series,
  tooltip,
  onHoverTurn,
  legendSeries,
  referenceValue,
  referenceLabel,
  xTickFormatter,
  yDomain
}: {
  title: string;
  data: Record<string, number>[];
  series: ChartSeries[];
  tooltip: ReactElement;
  onHoverTurn: (turn: number | null) => void;
  legendSeries?: ChartSeries[];
  referenceValue?: number;
  referenceLabel?: string;
  xTickFormatter?: (value: number) => string;
  yDomain?: YAxisProps['domain'];
}) => (
  <div className={styles.turnBreakdownSection}>
    <h2 className={styles.sectionHeader}>{title}</h2>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
        onMouseMove={(e) => {
          if (e.activeLabel !== undefined) onHoverTurn(Number(e.activeLabel));
        }}
        onMouseLeave={() => onHoverTurn(null)}
      >
        <defs>
          {series.map((entry) => (
            <linearGradient
              key={entry.gradientId}
              id={entry.gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={entry.color}
                stopOpacity={entry.fillOpacity}
              />
              <stop offset="95%" stopColor={entry.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
        <XAxis
          dataKey="turn"
          stroke="rgba(255,255,255,0.25)"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          tickFormatter={xTickFormatter}
        />
        <YAxis
          stroke="rgba(255,255,255,0.25)"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          width={30}
          domain={yDomain}
        />
        <Tooltip
          content={tooltip}
          cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
        />
        {!!legendSeries && (
          <Legend
            verticalAlign="top"
            content={() => <ChartSeriesLegend series={legendSeries} />}
          />
        )}
        {referenceValue !== undefined && referenceValue > 0 && (
          <ReferenceLine
            y={referenceValue}
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="5 3"
            label={{
              value: referenceLabel,
              position: 'insideTopLeft',
              fill: 'rgba(255,255,255,0.4)',
              fontSize: 10
            }}
          />
        )}
        {series.map((entry) => (
          <Area
            key={entry.dataKey}
            type="monotone"
            dataKey={entry.dataKey}
            name={entry.name}
            stroke={entry.color}
            strokeWidth={2}
            fill={`url(#${entry.gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: entry.color }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

function downloadViaBackend(
  type: 'csv' | 'png',
  filename: string,
  data: string
) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `${BACKEND_URL}APIs/DownloadStats.php`;
  form.style.display = 'none';

  [
    ['type', type],
    ['filename', filename],
    ['data', data]
  ].forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name as string;
    input.value = value as string;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

const EndGameStats = forwardRef<EndGameStatsRef, EndGameStatsProps>(
  (data, ref) => {
    const [statsTab, setStatsTab] = useState<'deck' | 'activated'>('deck');
    const cardSort = useSortState<CardSortField>();
    const [showAllCards, setShowAllCards] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);
    const [heroDataUrls, setHeroDataUrls] = useState<{
      yourHero?: string;
      opponentHero?: string;
    }>({});
    const [excludeLastTurn, setExcludeLastTurn] = useState(false);
    const [hoveredChartTurn, setHoveredChartTurn] = useState<number | null>(
      null
    );
    const [isExportingImage, setIsExportingImage] = useState(false);

    const { t } = useTranslation();

    const { currentTheme } = useTheme();
    const themeColor = currentTheme.colors.primary;

    const colorblindSetting = useSetting({ settingName: COLORBLIND_MODE });
    const useAccessibleCharts = String(colorblindSetting?.value) === '1';

    const chartColors =
      useAccessibleCharts && !isExportingImage
        ? ACCESSIBLE_CHART_COLORS
        : { you: themeColor, opponent: '#ef4444' };

    const { isSupporter, showAds } = useSupporterStatus();

    const turnSort = useSortState<TurnSortField>();

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
      const opponentData = data.bothPlayersData?.[
        data.playerID === 1 ? 2 : 1
      ] as EndGameData | undefined;
      const opponentStartingLife =
        data.opponentStartingLife ?? opponentData?.startingLife ?? 40;

      const entries = Object.entries(data.turnResults)
        .map(([key, turn]) => ({
          turnNo:
            turn.turnNo !== undefined
              ? turn.turnNo
              : Number(key.replace('turn_', '')),
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

        if (turn.lifeAtTurnEnd != null) {
          yourLife = Number(turn.lifeAtTurnEnd);
        } else {
          yourLife -= +turn.damageTaken || 0;
          yourLife += +turn.lifeLost || 0; // lifeLost is stored negative by backend
          yourLife += +turn.lifeGained || 0;
          yourLife = Math.max(0, yourLife);
        }

        if (turn.opponentLifeAtTurnEnd != null) {
          opponentLife = Number(turn.opponentLifeAtTurnEnd);
        } else {
          opponentLife -= turnDealt;
          opponentLife = Math.max(0, opponentLife);
        }

        const turnTaken = parseInt(String(turn.damageTaken), 10) || 0;

        return {
          turn: turnNo,
          avgValue: turnValue,
          avgThreatened: parseInt(String(turn.damageThreatened), 10) || 0,
          avgDealt: turnDealt,
          damageTaken: turnTaken,
          yourLife,
          opponentLife
        };
      });
    }, [
      data.turnResults,
      data.startingLife,
      data.opponentStartingLife,
      data.playerID,
      data.bothPlayersData
    ]);

    const filteredChartData = useMemo(() => {
      if (!excludeLastTurn || chartData.length === 0) return chartData;
      return chartData.slice(0, -1);
    }, [chartData, excludeLastTurn]);

    const lifeChartData = useMemo(() => {
      const oppPlayerID = data.playerID === 1 ? 2 : 1;
      const oppData = data.bothPlayersData?.[oppPlayerID] as
        | EndGameData
        | undefined;
      const startYour = data.startingLife ?? 40;
      const startOpp = data.opponentStartingLife ?? oppData?.startingLife ?? 40;
      return [
        { turn: 0, yourLife: startYour, opponentLife: startOpp },
        ...filteredChartData
      ];
    }, [
      filteredChartData,
      data.startingLife,
      data.opponentStartingLife,
      data.playerID,
      data.bothPlayersData
    ]);

    const avgChartValue = useMemo(() => {
      if (filteredChartData.length === 0) return 0;
      return Math.round(
        filteredChartData.reduce((sum, d) => sum + d.avgValue, 0) /
          filteredChartData.length
      );
    }, [filteredChartData]);

    const avgThreatenedValue = useMemo(() => {
      if (filteredChartData.length === 0) return 0;
      return Math.round(
        filteredChartData.reduce((sum, d) => sum + d.avgThreatened, 0) /
          filteredChartData.length
      );
    }, [filteredChartData]);

    const yourLifeSeries: ChartSeries = {
      dataKey: 'yourLife',
      name: t('END_GAME.YOUR_LIFE'),
      color: chartColors.you,
      gradientId: 'egsColorYourLife',
      fillOpacity: 0.2
    };

    const opponentLifeSeries: ChartSeries = {
      dataKey: 'opponentLife',
      name: t('END_GAME.OPP_LIFE'),
      color: chartColors.opponent,
      gradientId: 'egsColorOppLife',
      fillOpacity: 0.15
    };

    const threatenedSeries: ChartSeries = {
      dataKey: 'avgThreatened',
      name: t('END_GAME.YOU_THREATENED'),
      color: chartColors.you,
      gradientId: 'egsColorThreatened2',
      fillOpacity: 0.25
    };

    const damageTakenSeries: ChartSeries = {
      dataKey: 'damageTaken',
      name: t('END_GAME.YOU_TOOK'),
      color: chartColors.opponent,
      gradientId: 'egsColorTaken',
      fillOpacity: 0.2
    };

    const handleExportScreenshot = async () => {
      if (!statsRef.current) return;

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      const filename = `game-stats-${timestamp}.png`;

      // Request save dialog while user gesture is still fresh, before any async work
      let fileHandle: any = null;
      if ('showSaveFilePicker' in window) {
        try {
          fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: t('END_GAME.PNG_IMAGE'),
                accept: { 'image/png': ['.png'] }
              }
            ]
          });
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
        }
      }

      setIsExportingImage(true);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const exportEl = statsRef.current;
      if (!exportEl) {
        setIsExportingImage(false);
        return;
      }

      try {
        // html2canvas is large. Start loading it only after a player chooses to export.
        const html2canvasPromise = import('html2canvas-pro');

        // Wait for hero images to load if they haven't yet
        const requiredHeroImages: string[] = [];
        if (data.yourHero) requiredHeroImages.push('yourHero');
        if (data.opponentHero) requiredHeroImages.push('opponentHero');

        if (requiredHeroImages.length > 0) {
          const startTime = Date.now();
          const maxWait = 5000;
          while (Date.now() - startTime < maxWait) {
            const allLoaded = requiredHeroImages.every(
              (hero) => heroDataUrls[hero as keyof typeof heroDataUrls]
            );
            if (allLoaded) break;
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        // Pre-load all img elements
        const images = exportEl.querySelectorAll('img');
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) resolve();
                else {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                }
              })
          )
        );

        const { default: html2canvas } = await html2canvasPromise;
        const canvas = await html2canvas(exportEl, {
          backgroundColor: '#0a0a0a',
          scale: Math.min(window.devicePixelRatio, 2),
          logging: false,
          useCORS: true,
          allowTaint: true,
          onclone: (clonedDocument) => {
            const clonedExportEl = clonedDocument.querySelector(
              `.${styles.statsContainer}`
            );
            if (!clonedExportEl) return;

            // html2canvas parses styles even on display:none descendants. Remove
            // excluded charts so their modern CSS colors never reach its parser.
            clonedExportEl
              .querySelectorAll(`.${styles.hideOnExport}`)
              .forEach((element) => element.remove());

            const watermark = clonedExportEl.querySelector(
              `.${styles.watermark}`
            ) as HTMLElement | null;
            const heroPortraits = clonedExportEl.querySelector(
              `.${styles.showOnExport}`
            ) as HTMLElement | null;
            if (watermark) watermark.style.display = 'block';
            if (heroPortraits) heroPortraits.style.display = 'flex';
          }
        });

        if (fileHandle) {
          const pngBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve)
          );
          if (!pngBlob) throw new Error('Failed to convert canvas to blob');
          const writable = await fileHandle.createWritable();
          await writable.write(pngBlob);
          await writable.close();
        } else {
          downloadViaBackend('png', filename, canvas.toDataURL('image/png'));
        }
      } catch (error) {
        console.error('Error exporting screenshot:', error);
        alert(t('END_GAME.EXPORT_IMAGE_ERROR', { error }));
      } finally {
        setIsExportingImage(false);
      }
    };

    const handleExportCSV = async () => {
      try {
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, -5);
        let csvContent = '';

        csvContent += '========== STATS PROVIDED BY TALISHAR ==========\n';
        csvContent += 'Support our work on Metafy!\n';
        csvContent += 'https://metafy.gg/@Talishar\n\n';

        const formatHeroName = (heroName: string): string => {
          return heroName
            .split('_')
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
          content += `Total Life Self-Lost,${
            playerData.totalLifeLost || 0
          }\n\n`;

          content += 'CARD PLAY STATS\n';
          content += 'Card Name,Played,Blocked,Pitched,Discarded,Times Hit';

          const hasCharged = playerData.cardResults?.some((c) => c.charged > 0);
          const hasKatsuDiscard = playerData.cardResults?.some(
            (c) => c.katsuDiscard > 0
          );

          if (hasCharged) content += ',Times Charged';
          if (hasKatsuDiscard) content += ',Times Katsu Discarded';
          content += '\n';

          const csvPlayedCards = [
            ...(playerData.cardResults ?? []),
            ...(playerData.arenaCardResults ?? []).filter((r) => r.pitched > 0)
          ];
          csvPlayedCards.forEach((result) => {
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

          const activatedArenaResults = mergeCompanionPairs([
            ...(playerData.arenaCardResults ?? []).filter(
              (r) =>
                (r.activated ?? 0) > 0 ||
                (r.passiveTriggered ?? 0) > 0 ||
                r.hits > 0 ||
                r.blocked > 0
            ),
            ...(playerData.cardResults ?? []).filter(
              (r) => (r.activated ?? 0) > 0 || (r.passiveTriggered ?? 0) > 0
            )
          ]).sort((a, b) => a.cardName.localeCompare(b.cardName));
          if (activatedArenaResults.length > 0) {
            const csvHasPitched = activatedArenaResults.some(
              (r) => r.pitched > 0
            );
            content += '\nCARD ACTIVATED STATS\n';
            content += `Card Name,Activated,Passive Triggers,Blocked${
              csvHasPitched ? ',Pitched' : ''
            },Times Hit\n`;
            activatedArenaResults.forEach((result) => {
              const cardName = result.cardName.replace(/,/g, ';');
              content += `"${cardName}",${result.activated ?? 0},${
                result.passiveTriggered ?? 0
              },${result.blocked}${csvHasPitched ? `,${result.pitched}` : ''},${
                result.hits
              }\n`;
            });
          }

          const playedTokenResults = playerData.tokenResults?.filter(
            (r) => r.played > 0
          );
          if (playedTokenResults && playedTokenResults.length > 0) {
            content += '\nNON-DECK CARDS\n';
            content += 'Card Name,Played,Blocked,Pitched,Times Hit\n';
            playedTokenResults.forEach((result) => {
              const cardName = result.cardName.replace(/,/g, ';');
              content += `"${cardName}",${result.played},${result.blocked},${result.pitched},${result.hits}\n`;
            });
          }

          content += '\nTURN BY TURN BREAKDOWN\n';
          content +=
            'Turn,Cards Played,Cards Blocked,Cards Pitched,Cards Discarded,Cards Left,Resources Used,Resources Left,';
          content +=
            'Damage Threatened,Damage Dealt,Damage Blocked,Damage Prevented,Damage Taken,Life Gained,Total Value\n';

          if (
            playerData.turnResults &&
            Object.keys(playerData.turnResults).length > 0
          ) {
            const playerTurnResults = playerData.turnResults;
            Object.keys(playerTurnResults).forEach((key, ix) => {
              const turn = playerTurnResults[key];
              const totalValue =
                +turn.damageThreatened +
                +turn.damageBlocked +
                +turn.damagePrevented +
                +turn.lifeGained +
                +turn.lifeLost;
              content += `${ix + 1},${turn.cardsUsed},${turn.cardsBlocked},${
                turn.cardsPitched
              },${turn.cardsDiscarded},${turn.cardsLeft},`;
              content += `${turn.resourcesUsed},${turn.resourcesLeft},`;
              content += `${turn.damageThreatened},${turn.damageDealt},`;
              content += `${turn.damageBlocked},${turn.damagePrevented},`;
              content += `${turn.damageTaken},${turn.lifeGained},${totalValue}\n`;
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

        if ('showSaveFilePicker' in window) {
          try {
            const handle = await (window as any).showSaveFilePicker({
              suggestedName: `game-stats-${timestamp}.csv`,
              types: [
                {
                  description: t('END_GAME.CSV_FILE'),
                  accept: { 'text/csv': ['.csv'] }
                }
              ]
            });
            const writable = await handle.createWritable();
            await writable.write(
              new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            );
            await writable.close();
            return;
          } catch (e) {
            if ((e as Error).name === 'AbortError') return;
          }
        }
        downloadViaBackend('csv', `game-stats-${timestamp}.csv`, csvContent);
      } catch (error) {
        console.error('Error exporting CSV:', error);
        alert(t('END_GAME.EXPORT_CSV_ERROR', { error }));
      }
    };

    // Expose the export function to parent component
    useImperativeHandle(ref, () => ({
      exportScreenshot: handleExportScreenshot,
      exportCSV: handleExportCSV
    }));

    const filteredCardResults = useMemo(() => {
      if (!data.cardResults) return data.cardResults;
      // Non-deck cards that were pitched (e.g. Heart of Fyendal gem) belong in the played stats view
      const pitchedArenaCards = (data.arenaCardResults ?? []).filter(
        (r) => r.pitched > 0
      );
      if (showAllCards) return [...data.cardResults, ...pitchedArenaCards];
      return [
        ...data.cardResults.filter(
          (r) =>
            r.played > 0 ||
            r.blocked > 0 ||
            r.pitched > 0 ||
            r.discarded > 0 ||
            r.hits > 0
        ),
        ...pitchedArenaCards
      ];
    }, [data.cardResults, data.arenaCardResults, showAllCards]);

    const activatedCardResults = useMemo(() => {
      const fromArena = (data.arenaCardResults ?? []).filter(
        (r) =>
          (r.activated ?? 0) > 0 ||
          (r.passiveTriggered ?? 0) > 0 ||
          r.hits > 0 ||
          r.blocked > 0
      );
      const fromDeck = (data.cardResults ?? []).filter(
        (r) => (r.activated ?? 0) > 0 || (r.passiveTriggered ?? 0) > 0
      );
      return mergeCompanionPairs([...fromArena, ...fromDeck]).sort((a, b) =>
        a.cardName.localeCompare(b.cardName)
      );
    }, [data.arenaCardResults, data.cardResults]);

    const activatedColumns = useMemo(
      () => ({
        activated: activatedCardResults.some((r) => (r.activated ?? 0) > 0),
        passiveTriggered: activatedCardResults.some(
          (r) => (r.passiveTriggered ?? 0) > 0
        ),
        blocked: activatedCardResults.some((r) => r.blocked > 0),
        pitched: activatedCardResults.some((r) => r.pitched > 0),
        hits: activatedCardResults.some((r) => r.hits > 0)
      }),
      [activatedCardResults]
    );

    const sortedCardResults = useMemo(() => {
      const sortBy = cardSort.field;
      if (!filteredCardResults || !sortBy) {
        return filteredCardResults;
      }

      return [...filteredCardResults].sort((a, b) => {
        if (sortBy === 'cardName') {
          const aValue = a.cardName.toLowerCase();
          const bValue = b.cardName.toLowerCase();

          if (cardSort.direction === 'desc') {
            return bValue.localeCompare(aValue);
          } else {
            return aValue.localeCompare(bValue);
          }
        } else {
          const aValue = a[sortBy];
          const bValue = b[sortBy];

          if (cardSort.direction === 'desc') {
            return bValue - aValue;
          } else {
            return aValue - bValue;
          }
        }
      });
    }, [filteredCardResults, cardSort.field, cardSort.direction]);

    const sortedTurnResults = useMemo(() => {
      const sortBy = turnSort.field;
      if (!data.turnResults || !sortBy) {
        return null;
      }

      const turnResults = data.turnResults;
      const turnArray = Object.entries(turnResults).map(([key, value]) => ({
        key,
        ...value
      }));

      const sorted = turnArray.sort((a, b) => {
        let aValue: number;
        let bValue: number;

        if (sortBy === 'turnNo') {
          // Sort by turn number (use turnNo from data or fallback to calculation)
          aValue =
            a.turnNo !== undefined
              ? a.turnNo
              : Object.keys(turnResults).indexOf(a.key);
          bValue =
            b.turnNo !== undefined
              ? b.turnNo
              : Object.keys(turnResults).indexOf(b.key);
        } else if (sortBy === 'totalValue') {
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
          aValue = a[sortBy] || 0;
          bValue = b[sortBy] || 0;
        }

        if (turnSort.direction === 'desc') {
          return bValue - aValue;
        } else {
          return aValue - bValue;
        }
      });

      return sorted;
    }, [data.turnResults, turnSort.field, turnSort.direction]);

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
    const ChartTooltip = ({
      active,
      payload,
      label
    }: {
      active?: boolean;
      payload?: any[];
      label?: number;
    }) => {
      if (!active || !payload?.length) return null;
      return (
        <div
          style={{
            background: 'rgba(10,10,10,0.92)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '0.68em',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <p style={{ margin: '0 0 2px', color: 'rgba(255,255,255,0.45)' }}>
            {label === 0
              ? t('END_GAME.START')
              : t('END_GAME.TURN_LABEL', { turn: label })}
          </p>
          {payload.map((entry, i) => (
            <p
              key={i}
              style={{
                margin: 0,
                color: entry.color ?? chartColors.you,
                fontWeight: 600
              }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    };

    let numCharged = 0;
    for (let i = 0; i < (data.cardResults?.length ?? 0); i++) {
      numCharged += data.cardResults![i].charged;
    }

    let numKatsuDiscard = 0;
    for (let i = 0; i < (data.cardResults?.length ?? 0); i++) {
      numKatsuDiscard += data.cardResults![i].katsuDiscard;
    }

    let numDiscarded = 0;
    for (let i = 0; i < (data.cardResults?.length ?? 0); i++) {
      numDiscarded += data.cardResults![i].discarded;
    }

    return (
      <div
        ref={statsRef}
        className={styles.endGameStats}
        data-testid="test-stats"
      >
        <div className={styles.statsContent}>
          <div className={styles.statsContainer}>
            {/* Game Time & Summary Section */}
            <div className={styles.statsSection}>
              {data.winner !== undefined &&
                data.playerID !== undefined &&
                data.playerID !== 3 && (
                  <div
                    className={
                      data.winner === data.playerID
                        ? styles.outcomeVictory
                        : styles.outcomeDefeat
                    }
                  >
                    {data.winner === data.playerID ? (
                      <ConfettiSvg />
                    ) : (
                      <RainSvg />
                    )}
                    {data.winner === data.playerID
                      ? t('END_GAME.VICTORY')
                      : t('END_GAME.DEFEAT')}
                  </div>
                )}

              <div className={styles.keyStats}>
                <div className={styles.keyStat}>
                  <span className={styles.keyStatValue}>
                    {stats.totalDamageThreatened ?? 0}
                  </span>
                  <span className={styles.keyStatLabel}>
                    {t('END_GAME.DAMAGE_THREATENED')}
                  </span>
                </div>
                <div className={styles.keyStat}>
                  <span className={styles.keyStatValue}>
                    {stats.totalDamageDealt ?? 0}
                  </span>
                  <span className={styles.keyStatLabel}>
                    {t('END_GAME.DAMAGE_DEALT')}
                  </span>
                </div>
                <div className={styles.keyStat}>
                  <span className={styles.keyStatValue}>
                    {stats.totalDamageBlocked ?? 0}
                  </span>
                  <span className={styles.keyStatLabel}>
                    {t('END_GAME.DAMAGE_BLOCKED')}
                  </span>
                </div>
                {(stats.totalDamagePrevented ?? 0) > 0 && (
                  <div className={styles.keyStat}>
                    <span className={styles.keyStatValue}>
                      {stats.totalDamagePrevented}
                    </span>
                    <span className={styles.keyStatLabel}>
                      {t('END_GAME.DAMAGE_PREVENTED')}
                    </span>
                  </div>
                )}
              </div>

              {data.masteryProgress && (
                <div className={styles.masteryProgress}>
                  {data.masteryProgress}
                </div>
              )}

              <hr className={styles.statsDivider} />

              {/* Unified Stats Box */}
              <div className={styles.infoBox}>
                <div className={styles.disclaimer}>
                  <em>{t('END_GAME.TURN_0_OMITTED')}</em>
                  <label className={styles.excludeLastTurnLabel}>
                    <input
                      type="checkbox"
                      checked={excludeLastTurn}
                      onChange={(e) => setExcludeLastTurn(e.target.checked)}
                      className={styles.excludeLastTurnCheckbox}
                    />
                    <span className={styles.excludeLastTurnText}>
                      {t('END_GAME.EXCLUDE_LAST_TURN')}
                    </span>
                  </label>
                </div>

                {/* Avg Value per Turn - Top Priority */}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.AVG_VALUE_PER_TURN')}
                    <span
                      className={styles.tooltipIcon}
                      data-tooltip={t('END_GAME.AVG_VALUE_PER_TURN_TOOLTIP')}
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
                    {t('END_GAME.AVG_DMG_THREATENED_PER_TURN')}
                  </span>
                  <span className={styles.infoValue}>
                    {stats.averageDamageThreatenedPerTurn}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.AVG_DMG_DEALT_PER_TURN')}
                  </span>
                  <span className={styles.infoValue}>
                    {stats.averageDamageDealtPerTurn}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.AVG_DMG_THREATENED_PER_CARD')}
                  </span>
                  <span className={styles.infoValue}>
                    {stats.averageDamageThreatenedPerCard}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.AVG_RESOURCES_USED_PER_TURN')}
                  </span>
                  <span className={styles.infoValue}>
                    {stats.averageResourcesUsedPerTurn}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.AVG_CARDS_LEFT_OVER_PER_TURN')}
                  </span>
                  <span className={styles.infoValue}>
                    {stats.averageCardsLeftOverPerTurn}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.AVG_COMBAT_VALUE_PER_TURN')}
                  </span>
                  <span className={styles.infoValue}>
                    {stats.averageCombatValuePerTurn}
                  </span>
                </div>

                {/* Total Damage/Life Values */}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.TOTAL_DAMAGE_THREATENED')}
                  </span>
                  <span className={styles.infoValue}>
                    {stats.totalDamageThreatened}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.TOTAL_DAMAGE_DEALT')}
                  </span>
                  <span className={styles.infoValue}>
                    {stats.totalDamageDealt}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.TOTAL_DAMAGE_BLOCKED')}
                  </span>
                  <span className={styles.infoValue}>
                    {stats.totalDamageBlocked}
                  </span>
                </div>

                {(stats.totalDamagePrevented ?? 0) > 0 && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>
                      {t('END_GAME.TOTAL_DAMAGE_PREVENTED')}
                      <span
                        className={styles.tooltipIcon}
                        data-tooltip={t(
                          'END_GAME.TOTAL_DAMAGE_PREVENTED_TOOLTIP'
                        )}
                      >
                        ?
                      </span>
                    </span>
                    <span className={styles.infoValue}>
                      {stats.totalDamagePrevented}
                    </span>
                  </div>
                )}

                {!!stats.totalLifeGained && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>
                      {t('END_GAME.TOTAL_LIFE_GAINED')}
                    </span>
                    <span className={styles.infoValue}>
                      {stats.totalLifeGained}
                    </span>
                  </div>
                )}
                {!!stats.totalLifeLost && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>
                      {t('END_GAME.TOTAL_LIFE_SELF_LOST')}
                    </span>
                    <span className={styles.infoValue}>
                      {stats.totalLifeLost}
                    </span>
                  </div>
                )}

                {/* Time Values */}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.YOUR_TIME')}
                  </span>
                  <span className={styles.infoValue}>
                    {fancyTimeFormat(data.yourTime)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {t('END_GAME.TOTAL_GAME_TIME')}
                  </span>
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
                  <h3 className={styles.heroTitle}>
                    {t('END_GAME.HERO_MATCHUP')}
                  </h3>
                  <div className={styles.heroPortraits}>
                    <div className={styles.heroColumn}>
                      <p className={styles.heroLabel}>
                        {t('END_GAME.YOUR_HERO')}
                      </p>
                      <div className={styles.heroImageWrapper}>
                        {heroDataUrls.yourHero ? (
                          <img
                            src={heroDataUrls.yourHero}
                            alt={t('END_GAME.YOUR_HERO')}
                            className={styles.heroImage}
                            onError={(e) => {
                              console.error(
                                'Failed to display your hero image'
                              );
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
                          <div className={styles.winnerBadge}>
                            {t('END_GAME.WINNER')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.heroVsLabel}>{t('END_GAME.VS')}</div>
                    <div className={styles.heroColumn}>
                      <p className={styles.heroLabel}>
                        {t('END_GAME.OPPONENT_HERO')}
                      </p>
                      <div className={styles.heroImageWrapper}>
                        {heroDataUrls.opponentHero ? (
                          <img
                            src={heroDataUrls.opponentHero}
                            alt={t('END_GAME.OPPONENT_HERO')}
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
                            <div className={styles.winnerBadge}>
                              {t('END_GAME.WINNER')}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Watermark - only visible in exports */}
              <div className={styles.watermark}>
                <div className={styles.watermarkContent}>
                  <span>{t('END_GAME.STATS_PROVIDED_BY')}</span>
                  <img
                    src={TalisharLogo}
                    alt={t('END_GAME.TALISHAR')}
                    className={styles.watermarkLogo}
                  />
                  <span>
                    <Trans
                      i18nKey="END_GAME.WATERMARK"
                      components={{
                        2: (
                          <a
                            href={TALISHAR_METAFY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        )
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.statsSection}>
              <div className={styles.sectionHeaderContainer}>
                <div className={styles.statsTabs}>
                  <button
                    className={`${styles.statsTab} ${
                      statsTab === 'deck' ? styles.statsTabActive : ''
                    }`}
                    onClick={() => setStatsTab('deck')}
                  >
                    {t('END_GAME.CARD_PLAYED_STATS')}
                  </button>
                  <button
                    className={`${styles.statsTab} ${
                      statsTab === 'activated' ? styles.statsTabActive : ''
                    }`}
                    onClick={() => setStatsTab('activated')}
                  >
                    {t('END_GAME.CARD_ACTIVATED_STATS')}
                  </button>
                </div>
                {statsTab === 'deck' && (
                  <label
                    className={styles.excludeLastTurnLabel}
                    title={t('END_GAME.SHOW_ALL_CARDS_TITLE')}
                  >
                    <input
                      type="checkbox"
                      checked={showAllCards}
                      onChange={(e) => setShowAllCards(e.target.checked)}
                      className={styles.excludeLastTurnCheckbox}
                    />
                    <span className={styles.excludeLastTurnText}>
                      {t('END_GAME.SHOW_ALL_CARDS')}
                    </span>
                  </label>
                )}
              </div>
              {statsTab === 'activated' ? (
                <ScrollableTable>
                  <table className={styles.cardTable}>
                    <thead>
                      <tr className={styles.headers}>
                        <th
                          className={`${styles.firstHeadersStats} ${styles.hideOnExport}`}
                        ></th>
                        <th
                          className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                        >
                          {t('END_GAME.CARD_NAME')}
                        </th>
                        {activatedColumns.activated && (
                          <th
                            className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                          >
                            {t('END_GAME.ACTIVATED')}
                          </th>
                        )}
                        {activatedColumns.passiveTriggered && (
                          <th
                            className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                          >
                            {t('END_GAME.PASSIVE_TRIGGERED')}
                          </th>
                        )}
                        {activatedColumns.blocked && (
                          <th
                            className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                          >
                            {t('END_GAME.BLOCKED')}
                          </th>
                        )}
                        {activatedColumns.pitched && (
                          <th
                            className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                          >
                            {t('END_GAME.PITCHED')}
                          </th>
                        )}
                        {activatedColumns.hits && (
                          <th
                            className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                          >
                            {t('END_GAME.TIMES_HIT')}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {activatedCardResults.map((result, ix) => {
                        return (
                          <tr key={`activatedList${ix}`}>
                            <CardThumbnailCell
                              cardId={result.cardId}
                              imgClassName={styles.cardZeroPitch}
                            />
                            <td
                              className={styles.zeroPitch}
                              title={result.cardName}
                            >
                              {result.cardName}
                            </td>
                            {activatedColumns.activated && (
                              <td className={styles.played}>
                                {result.activated ?? 0}
                              </td>
                            )}
                            {activatedColumns.passiveTriggered && (
                              <td className={styles.cardStat}>
                                {result.passiveTriggered ?? 0}
                              </td>
                            )}
                            {activatedColumns.blocked && (
                              <td className={styles.cardStat}>
                                {result.blocked}
                              </td>
                            )}
                            {activatedColumns.pitched && (
                              <td className={styles.cardStat}>
                                {result.pitched}
                              </td>
                            )}
                            {activatedColumns.hits && (
                              <td className={styles.cardStat}>{result.hits}</td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ScrollableTable>
              ) : (
                <ScrollableTable>
                  <table className={styles.cardTable}>
                    <thead>
                      <tr className={styles.headers}>
                        <th
                          className={`${styles.firstHeadersStats} ${styles.hideOnExport}`}
                        ></th>
                        <SortHeader
                          field="cardName"
                          label={t('END_GAME.CARD_NAME')}
                          sort={cardSort}
                          className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                          title={t('END_GAME.CLICK_TO_SORT')}
                        />
                        <SortHeader
                          field="played"
                          label={t('END_GAME.PLAYED')}
                          sort={cardSort}
                          className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                          title={t('END_GAME.CLICK_TO_SORT')}
                        />
                        <SortHeader
                          field="blocked"
                          label={t('END_GAME.BLOCKED')}
                          sort={cardSort}
                          className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                          title={t('END_GAME.CLICK_TO_SORT')}
                        />
                        <SortHeader
                          field="pitched"
                          label={t('END_GAME.PITCHED')}
                          sort={cardSort}
                          className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                          title={t('END_GAME.CLICK_TO_SORT')}
                        />
                        {numDiscarded > 0 && (
                          <SortHeader
                            field="discarded"
                            label={t('END_GAME.DISCARDED')}
                            sort={cardSort}
                            className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                            title={t('END_GAME.CLICK_TO_SORT')}
                          />
                        )}
                        <SortHeader
                          field="hits"
                          label={t('END_GAME.TIMES_HIT')}
                          sort={cardSort}
                          className={`${styles.headersStats} ${styles.sortableHeader} ${styles.headerGroupSeparator}`}
                          title={t('END_GAME.CLICK_TO_SORT')}
                        />
                        {numCharged > 0 && (
                          <th
                            className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                          >
                            {t('END_GAME.TIMES_CHARGED')}
                          </th>
                        )}
                        {numKatsuDiscard > 0 && (
                          <th
                            className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                          >
                            {t('END_GAME.TIMES_KATSU_DISCARDED')}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {!!sortedCardResults &&
                        sortedCardResults?.map((result, ix) => {
                          const pitchStyles = getPitchStyles(result.pitchValue);
                          return (
                            <tr key={`cardList${ix}`}>
                              <CardThumbnailCell
                                cardId={result.cardId}
                                imgClassName={pitchStyles.border}
                              />
                              <td
                                className={pitchStyles.text}
                                title={result.cardName}
                              >
                                {result.cardName}
                              </td>
                              <td className={styles.played}>{result.played}</td>
                              <td className={styles.blocked}>
                                {result.blocked}
                              </td>
                              <td className={styles.pitched}>
                                {result.pitched}
                              </td>
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
                </ScrollableTable>
              )}
              {statsTab === 'deck' &&
                data.tokenResults &&
                data.tokenResults.filter((r) => r.played > 0).length > 0 && (
                  <>
                    <h3 className={styles.subSectionHeader}>
                      {t('END_GAME.NON_DECK_CARDS_PLAYED')}
                    </h3>
                    <ScrollableTable>
                      <table className={styles.cardTable}>
                        <thead>
                          <tr className={styles.headers}>
                            <th
                              className={`${styles.firstHeadersStats} ${styles.hideOnExport}`}
                            ></th>
                            <th
                              className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                            >
                              {t('END_GAME.CARD_NAME')}
                            </th>
                            <th
                              className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                            >
                              {t('END_GAME.PLAYED')}
                            </th>
                            <th
                              className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                            >
                              {t('END_GAME.BLOCKED')}
                            </th>
                            <th
                              className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                            >
                              {t('END_GAME.PITCHED')}
                            </th>
                            <th
                              className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                            >
                              {t('END_GAME.TIMES_HIT')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.tokenResults
                            .filter((r) => r.played > 0)
                            .map((result, ix) => {
                              return (
                                <tr key={`tokenList${ix}`}>
                                  <CardThumbnailCell
                                    cardId={result.cardId}
                                    imgClassName={
                                      getPitchStyles(result.pitchValue).border
                                    }
                                  />
                                  <td
                                    className={styles.zeroPitch}
                                    title={result.cardName}
                                  >
                                    {result.cardName}
                                  </td>
                                  <td className={styles.played}>
                                    {result.played}
                                  </td>
                                  <td className={styles.blocked}>
                                    {result.blocked}
                                  </td>
                                  <td className={styles.pitched}>
                                    {result.pitched}
                                  </td>
                                  <td className={styles.cardStat}>
                                    {result.hits}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </ScrollableTable>
                  </>
                )}
            </div>
          </div>

          {/* Ad above Turn by Turn Breakdown */}
          {showAds && (
            <div className={`${styles.adBlock} ${styles.hideOnExport}`}>
              {!isSupporter && (
                <div className={styles.adHeader}>
                  <RemoveAdsLink />
                </div>
              )}
              <AdUnit placement="billboard-1" className={styles.desktopAd} />
              <AdUnit placement="mobile-unit-1" className={styles.mobileAd} />
            </div>
          )}

          {/* Turn by Turn Breakdown - Full Width Section */}
          <div className={styles.turnBreakdownSection}>
            <h2 className={styles.sectionHeader}>
              {t('END_GAME.TURN_BY_TURN_BREAKDOWN')}
              <span
                className={styles.tooltipIconBreakdown}
                data-tooltip={t('END_GAME.TURN_BREAKDOWN_TOOLTIP')}
              >
                ?
              </span>
            </h2>
            <ScrollableTable>
              <table className={styles.cardTable}>
                <thead>
                  <tr>
                    <th
                      className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                    >
                      {t('END_GAME.TURN')}
                    </th>
                    <th
                      colSpan={shouldHideCardsDiscarded ? 4 : 5}
                      className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                    >
                      {t('END_GAME.CARDS')}
                    </th>
                    <th
                      colSpan={2}
                      className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                    >
                      {t('END_GAME.RESOURCES')}
                    </th>
                    <th
                      colSpan={shouldHideDamagePrevented ? 4 : 5}
                      className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                    >
                      {t('END_GAME.DAMAGE')}
                    </th>
                    {lifeColSpan > 0 && (
                      <th
                        colSpan={lifeColSpan}
                        className={`${styles.headersStats} ${styles.headerGroupSeparator}`}
                      >
                        {t('END_GAME.LIFE')}
                      </th>
                    )}
                    <th colSpan={1} className={styles.headersStats}>
                      {t('END_GAME.VALUE')}
                    </th>
                  </tr>
                  <tr>
                    <SortHeader
                      field="turnNo"
                      label={'#'}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    <SortHeader
                      field="cardsUsed"
                      label={t('END_GAME.PLAYED')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    <SortHeader
                      field="cardsBlocked"
                      label={t('END_GAME.BLOCKED')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    <SortHeader
                      field="cardsPitched"
                      label={t('END_GAME.PITCHED')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    {!shouldHideCardsDiscarded && (
                      <SortHeader
                        field="cardsDiscarded"
                        label={t('END_GAME.DISCARDED')}
                        sort={turnSort}
                        className={styles.sortableHeader}
                        title={t('END_GAME.CLICK_TO_SORT')}
                      />
                    )}
                    <SortHeader
                      field="cardsLeft"
                      label={t('END_GAME.LEFT')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    <SortHeader
                      field="resourcesUsed"
                      label={t('END_GAME.USED')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    <SortHeader
                      field="resourcesLeft"
                      label={t('END_GAME.LEFT')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    <SortHeader
                      field="damageThreatened"
                      label={t('END_GAME.THREATENED')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    <SortHeader
                      field="damageDealt"
                      label={t('END_GAME.DEALT')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    <SortHeader
                      field="damageBlocked"
                      label={t('END_GAME.BLOCKED')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    {!shouldHideDamagePrevented && (
                      <SortHeader
                        field="damagePrevented"
                        label={t('END_GAME.PREVENTED')}
                        sort={turnSort}
                        className={styles.sortableHeader}
                        title={t('END_GAME.PREVENTED_TOOLTIP')}
                      />
                    )}
                    <SortHeader
                      field="damageTaken"
                      label={t('END_GAME.TAKEN')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                    {!shouldHideLifeGained && (
                      <SortHeader
                        field="lifeGained"
                        label={t('END_GAME.LIFE_GAINED')}
                        sort={turnSort}
                        className={styles.sortableHeader}
                        title={t('END_GAME.CLICK_TO_SORT')}
                      />
                    )}
                    {!shouldHideLifeLost && (
                      <SortHeader
                        field="lifeLost"
                        label={t('END_GAME.SELF_LOST')}
                        sort={turnSort}
                        className={styles.sortableHeader}
                        title={t('END_GAME.CLICK_TO_SORT')}
                      />
                    )}
                    <SortHeader
                      field="totalValue"
                      label={t('END_GAME.THIS_TURN')}
                      sort={turnSort}
                      className={styles.sortableHeader}
                      title={t('END_GAME.CLICK_TO_SORT')}
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortedTurnResults
                    ? sortedTurnResults.map((turnData, ix) => {
                        // Hide turn #0 for the non-first player
                        const rowTurnNo =
                          turnData.turnNo !== undefined
                            ? turnData.turnNo
                            : Object.keys(data.turnResults ?? {}).indexOf(
                                turnData.key
                              );
                        return (
                          <tr
                            key={`turnList${ix}`}
                            className={
                              hoveredChartTurn === rowTurnNo
                                ? styles.chartHighlightedRow
                                : undefined
                            }
                          >
                            <td className={styles.turnNo}>
                              {turnData.turnNo !== undefined
                                ? turnData.turnNo
                                : Object.keys(data.turnResults ?? {}).indexOf(
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
                              {parseInt(
                                String(turnData.damageThreatened),
                                10
                              ) || 0}
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
                      Object.keys(data.turnResults ?? {}).map((key, ix) => {
                        const turnRow = data.turnResults?.[key];
                        const turnNo = turnRow?.turnNo;
                        const rowTurnNo = turnNo !== undefined ? turnNo : ix;
                        // Hide turn #0 for the non-first player
                        return (
                          <tr
                            key={`turnList${ix}`}
                            className={
                              hoveredChartTurn === rowTurnNo
                                ? styles.chartHighlightedRow
                                : undefined
                            }
                          >
                            <td className={styles.turnNo}>
                              {turnNo !== undefined ? turnNo : ix}
                            </td>
                            <td className={styles.played}>
                              {/* @ts-ignore */}
                              {turnRow?.cardsUsed}
                            </td>
                            <td className={styles.blocked}>
                              {/* @ts-ignore */}
                              {turnRow?.cardsBlocked}
                            </td>
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {turnRow?.cardsPitched}
                            </td>
                            {!shouldHideCardsDiscarded && (
                              <td className={styles.pitched}>
                                {/* @ts-ignore */}
                                {turnRow?.cardsDiscarded}
                              </td>
                            )}
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {turnRow?.cardsLeft}
                            </td>
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {turnRow?.resourcesUsed}
                            </td>
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {turnRow?.resourcesLeft}
                            </td>
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {parseInt(
                                String(turnRow?.damageThreatened),
                                10
                              ) || 0}
                            </td>
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {parseInt(String(turnRow?.damageDealt), 10) || 0}
                            </td>
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {turnRow?.damageBlocked}
                            </td>
                            {!shouldHideDamagePrevented && (
                              <td className={styles.pitched}>
                                {/* @ts-ignore */}
                                {turnRow?.damagePrevented}
                              </td>
                            )}
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {turnRow?.damageTaken}
                            </td>
                            {!shouldHideLifeGained && (
                              <td className={styles.pitched}>
                                {/* @ts-ignore */}
                                {turnRow?.lifeGained}
                              </td>
                            )}
                            {!shouldHideLifeLost && (
                              <td className={styles.pitched}>
                                {/* @ts-ignore */}
                                {turnRow?.lifeLost}
                              </td>
                            )}
                            <td className={styles.pitched}>
                              {/* @ts-ignore */}
                              {(
                                +(turnRow?.damageThreatened ?? 0) +
                                +(turnRow?.damageBlocked ?? 0) +
                                +(turnRow?.damagePrevented ?? 0) +
                                +(turnRow?.lifeGained ?? 0) +
                                +(turnRow?.lifeLost ?? 0)
                              ).toString()}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </ScrollableTable>
          </div>
        </div>

        {/* Per Turn Charts - SVGs are converted to static images before html2canvas capture */}
        {filteredChartData.length > 1 && (
          <div className={`${styles.chartsGrid} ${styles.hideOnExport}`}>
            <StatsAreaChart
              title={t('END_GAME.VALUE_PER_TURN')}
              data={filteredChartData}
              tooltip={<ChartTooltip />}
              onHoverTurn={setHoveredChartTurn}
              referenceValue={avgChartValue}
              referenceLabel={t('END_GAME.AVG_LABEL', {
                value: avgChartValue
              })}
              series={[
                {
                  dataKey: 'avgValue',
                  name: t('END_GAME.VALUE'),
                  color: chartColors.you,
                  gradientId: 'egsColorValue',
                  fillOpacity: 0.3
                }
              ]}
            />

            <StatsAreaChart
              title={t('END_GAME.LIFE_TOTALS')}
              data={lifeChartData}
              tooltip={<ChartTooltip />}
              onHoverTurn={setHoveredChartTurn}
              xTickFormatter={(v) =>
                v === 0 ? t('END_GAME.START') : String(v)
              }
              yDomain={[0, 'auto']}
              series={[opponentLifeSeries, yourLifeSeries]}
              legendSeries={[yourLifeSeries, opponentLifeSeries]}
            />

            <StatsAreaChart
              title={t('END_GAME.PRESSURE_EXCHANGE')}
              data={filteredChartData}
              tooltip={<ChartTooltip />}
              onHoverTurn={setHoveredChartTurn}
              referenceValue={avgThreatenedValue}
              referenceLabel={t('END_GAME.AVG_LABEL', {
                value: avgThreatenedValue
              })}
              series={[threatenedSeries, damageTakenSeries]}
              legendSeries={[threatenedSeries, damageTakenSeries]}
            />
          </div>
        )}

        {/* Ad under charts */}
        {showAds && (
          <div className={`${styles.adBlock} ${styles.hideOnExport}`}>
            {!isSupporter && (
              <div className={styles.adHeader}>
                <RemoveAdsLink />
              </div>
            )}
            <AdUnit placement="billboard-2" className={styles.desktopAd} />
            <AdUnit placement="mobile-unit-2" className={styles.mobileAd} />
          </div>
        )}
      </div>
    );
  }
);

EndGameStats.displayName = 'EndGameStats';

export default EndGameStats;
