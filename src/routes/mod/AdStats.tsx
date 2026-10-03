import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAdReportQuery } from 'features/api/apiSlice';
import { IN_GAME_AD_MIN_VIEWPORT_HEIGHT } from 'config/ads';
import {
  AdBidderStat,
  AdDailyStat,
  AdDevice,
  AdEventStat,
  AdPageStat,
  AdReportRange,
  AdSlotStat
} from 'interface/API/ModPageAPI';
import styles from './AdStats.module.css';

type Measure = 'impressions' | 'revenue';

const RANGES: AdReportRange[] = [1, 7, 30, 90];
const DEVICES: Array<AdDevice | 'all'> = ['all', 'desktop', 'mobile'];
const MEASURES: Measure[] = ['impressions', 'revenue'];
const MIN_SAMPLE = 20;
const RARELY_SEEN_SHARE = 0.05;
const LOW_FILL_RATE = 0.5;
const LOW_VIEWABLE_RATE = 0.5;
const HIDDEN_SHARE = 0.05;
const MIN_HIDDEN = 5;
const SIGNIFICANT_TIME_SHARE = 0.05;
const NOTABLE_TIME_SHARE = 0.01;
const MISSED_REWARDED_SHARE = 0.2;
const PRICE_STORAGE_KEY = 'talishar_mod_ad_cpms';
const MEASURE_STORAGE_KEY = 'talishar_mod_ad_measure';
const REWARDED_RE = /reward/i;
const VIDEO_PLACEMENT = 'video';
const REWARDED_PLACEMENT = 'rewarded';
const IN_GAME_PLACEMENT = 'in-game-block';
// Used while a CPM field is empty. No price reaches the browser for these and
// RevIQ's dashboard does not split them out, so they are benchmarks.
const ESTIMATED_CPM = { video: 0.75, rewarded: 2 };

type SlotFlag =
  | 'HIDDEN'
  | 'DUPLICATE'
  | 'WRAPPER'
  | 'NEVER_REQUESTED'
  | 'RARELY_SEEN'
  | 'LOW_FILL'
  | 'LOW_VIEWABILITY';
type PageFlag = 'NO_ADS' | 'UNDER_MONETIZED';
type SlotKind = 'display' | 'wrapper' | 'video' | 'rewarded';
type Prices = { display: number; video: number; rewarded: number };
type EventCounts = Record<string, number>;

const PRICE_FIELDS: Array<keyof Prices> = ['display', 'video', 'rewarded'];

interface SlotRow {
  key: string;
  page: string;
  placement: string;
  mounts: number;
  seen: number;
  visibleMs: number;
  requests: number;
  filled: number;
  viewable: number;
  clicks: number;
  prebidWins: number;
  prebidMicros: number;
  estMicros: number;
  pricedFills: number;
  kind: SlotKind;
  events: EventCounts;
  impressions: number;
  hidden: number;
  seenRate: number;
  avgInViewMs: number;
  fillRate: number;
  viewableRate: number;
  ctr: number;
  ecpm: number;
  share: number;
  rpm: number;
  impressionsPer1k: number;
  impressionShare: number;
  flags: SlotFlag[];
}

interface PageRow {
  page: string;
  views: number;
  visibleMs: number;
  adblockViews: number;
  slots: number;
  estMicros: number;
  impressions: number;
  avgMs: number;
  timeShare: number;
  revenueShare: number;
  impressionShare: number;
  rpm: number;
  perHour: number;
  impressionsPer1k: number;
  impressionsPerHour: number;
  adblockRate: number;
  flags: PageFlag[];
}

interface BidderRow {
  bidder: string;
  bids: number;
  wins: number;
  winMicros: number;
  winRate: number;
  avgCpm: number;
  share: number;
}

interface DayRow {
  day: string;
  views: number;
  estMicros: number;
  impressions: number;
}

interface RewardedSummary {
  clicks: number;
  shown: number;
  granted: number;
  closed: number;
  requests: number;
  filled: number;
  micros: number;
  missUnfilled: number;
  missSpent: number;
  missBlocked: number;
  shownLate: number;
}

interface InGameGate {
  ok: number;
  short: number;
  narrow: number;
  states: Record<InGameState, number>;
}

// What the in-game block showed, sampled every 10 seconds while it had room.
const IN_GAME_STATES = [
  'ad',
  'empty',
  'covered',
  'below',
  'offscreen',
  'hidden',
  'noslot'
] as const;
type InGameState = (typeof IN_GAME_STATES)[number];
const QUICK_CLICK_SHARE = 0.25;

interface InsightInput {
  slots: SlotRow[];
  pages: PageRow[];
  rewarded: RewardedSummary;
  inGameGate: InGameGate;
  estimated: number;
  used: Prices;
}

type SortState<K extends string> = { key: K; descending: boolean };
type Translate = ReturnType<typeof useTranslation>['t'];

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});
const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : 0);
const dollars = (value: number) =>
  value > 0 && value < 0.005 ? '<$0.01' : usd.format(value);
const money = (micros: number) => dollars(micros / 1e6);
const perThousand = (micros: number, count: number) =>
  ratio(micros / 1e6, count) * 1000;
const perThousandCount = (part: number, whole: number) =>
  ratio(part, whole) * 1000;
const percent = (value: number) =>
  value > 0 && value < 0.005 ? '<1%' : `${Math.round(value * 100)}%`;
const count = (value: number) => value.toLocaleString();
const rate = (value: number) =>
  value.toLocaleString(undefined, {
    maximumFractionDigits: value < 10 ? 1 : 0
  });
const seconds = (ms: number) => `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)}s`;
const duration = (ms: number) => {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return seconds(ms);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

function sumBy<T, K extends keyof T>(
  rows: T[],
  key: (row: T) => string,
  fields: K[]
): Map<string, T> {
  const merged = new Map<string, T>();
  for (const row of rows) {
    const id = key(row);
    const existing = merged.get(id);
    if (!existing) {
      merged.set(id, { ...row });
      continue;
    }
    for (const field of fields) {
      (existing[field] as unknown as number) += row[field] as unknown as number;
    }
  }
  return merged;
}

const cpmMicros = (cpm: number) => Math.round(cpm * 1000);

function loadPrices(): Prices {
  try {
    const stored = JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY) ?? '{}');
    return Object.fromEntries(
      PRICE_FIELDS.map((field) => [
        field,
        Math.max(0, Number(stored[field]) || 0)
      ])
    ) as Prices;
  } catch {
    return { display: 0, video: 0, rewarded: 0 };
  }
}

function savePrices(prices: Prices) {
  try {
    localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(prices));
  } catch {
    // Prices then only last for this visit.
  }
}

function loadMeasure(): Measure {
  try {
    return localStorage.getItem(MEASURE_STORAGE_KEY) === 'revenue'
      ? 'revenue'
      : 'impressions';
  } catch {
    return 'impressions';
  }
}

function saveMeasure(measure: Measure) {
  try {
    localStorage.setItem(MEASURE_STORAGE_KEY, measure);
  } catch {
    // The choice then only lasts for this visit.
  }
}

function slotKind(row: AdSlotStat): SlotKind {
  if (row.placement === VIDEO_PLACEMENT) return 'video';
  if (REWARDED_RE.test(row.placement)) return 'rewarded';
  if (row.mounts === 0 && row.requests > 0) return 'wrapper';
  return 'display';
}

function unpricedFills(row: { filled: number; pricedFills: number }) {
  return Math.max(0, row.filled - row.pricedFills);
}

// The video player's AdImpression event misses some ads that still start,
// become viewable and play to the end, so video takes the largest count.
function slotImpressions(row: AdSlotStat, kind: SlotKind, events: EventCounts) {
  if (kind === 'video')
    return Math.max(
      row.filled,
      row.viewable,
      events.started ?? 0,
      events.complete ?? 0
    );
  if (kind === 'rewarded') return events.shown ?? 0;
  return row.filled;
}

function slotMicros(
  row: AdSlotStat,
  kind: SlotKind,
  impressions: number,
  prices: Prices
) {
  if (kind === 'video' || kind === 'rewarded')
    return impressions * cpmMicros(prices[kind]);
  return row.estMicros + unpricedFills(row) * cpmMicros(prices.display);
}

const emptySlot = (page: string, placement: string): AdSlotStat => ({
  page,
  placement,
  device: 'desktop',
  mounts: 0,
  seen: 0,
  visibleMs: 0,
  requests: 0,
  filled: 0,
  viewable: 0,
  clicks: 0,
  prebidWins: 0,
  prebidMicros: 0,
  estMicros: 0,
  pricedFills: 0
});

const SLOT_SUM_FIELDS: Array<keyof AdSlotStat> = [
  'mounts',
  'seen',
  'visibleMs',
  'requests',
  'filled',
  'viewable',
  'clicks',
  'prebidWins',
  'prebidMicros',
  'estMicros',
  'pricedFills'
];

const DAY_SUM_FIELDS: Array<keyof AdDailyStat> = [
  'views',
  'estMicros',
  'unpricedFills',
  'displayImpressions',
  'videoImpressions',
  'videoViewable',
  'videoStarts',
  'videoCompletes',
  'rewardedShows'
];

function slotFlags(row: AdSlotStat, kind: SlotKind, hidden: number) {
  const flags: SlotFlag[] = [];
  if (kind === 'rewarded') return flags;
  if (hidden >= MIN_HIDDEN && ratio(hidden, row.filled) >= HIDDEN_SHARE)
    flags.push('HIDDEN');
  if (row.placement.includes('#')) flags.push('DUPLICATE');
  if (kind === 'wrapper') flags.push('WRAPPER');
  if (row.seen >= MIN_SAMPLE && row.requests === 0 && row.filled === 0)
    flags.push('NEVER_REQUESTED');
  if (
    row.mounts >= MIN_SAMPLE &&
    ratio(row.seen, row.mounts) < RARELY_SEEN_SHARE
  )
    flags.push('RARELY_SEEN');
  if (
    kind !== 'video' &&
    row.requests >= MIN_SAMPLE &&
    ratio(row.filled, row.requests) < LOW_FILL_RATE
  )
    flags.push('LOW_FILL');
  if (
    row.filled >= MIN_SAMPLE &&
    ratio(row.viewable, row.filled) < LOW_VIEWABLE_RATE
  )
    flags.push('LOW_VIEWABILITY');
  return flags;
}

function useSort<K extends string>(initial: K) {
  const [sort, setSort] = useState<SortState<K>>({
    key: initial,
    descending: true
  });
  const toggle = (key: K) =>
    setSort((current) =>
      current.key === key
        ? { key, descending: !current.descending }
        : { key, descending: true }
    );
  const reset = (key: K) => setSort({ key, descending: true });
  return [sort, toggle, reset] as const;
}

function sorted<T, K extends keyof T & string>(
  rows: T[],
  sort: SortState<K>
): T[] {
  const direction = sort.descending ? -1 : 1;
  return [...rows].sort((a, b) => {
    const left = a[sort.key];
    const right = b[sort.key];
    if (typeof left === 'number' && typeof right === 'number')
      return (left - right) * direction;
    return String(left).localeCompare(String(right)) * direction;
  });
}

function buildInsights(
  { slots, pages, rewarded, inGameGate, estimated, used }: InsightInput,
  measure: Measure,
  t: Translate,
  pageLabel: (page: string) => string,
  slotLabel: (row: SlotRow) => string
): string[] {
  const lines: string[] = [];
  const byImpressions = measure === 'impressions';
  const hidden = slots.filter((row) => row.hidden > 0);
  if (hidden.length > 0) {
    const worstHidden = [...hidden].sort((a, b) => b.hidden - a.hidden)[0];
    const total = hidden.reduce((sum, row) => sum + row.hidden, 0);
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_HIDDEN', {
        count: total,
        total: count(total),
        slot: slotLabel(worstHidden),
        page: pageLabel(worstHidden.page)
      })
    );
  }
  if (!byImpressions && estimated > 0) {
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_ESTIMATED', {
        count: estimated,
        total: count(estimated),
        display: dollars(used.display),
        video: dollars(used.video),
        rewarded: dollars(used.rewarded)
      })
    );
  }
  const reachable = rewarded.clicks - rewarded.missBlocked;
  const missed = Math.max(0, reachable - rewarded.shown);
  if (
    reachable >= MIN_SAMPLE &&
    ratio(missed, reachable) >= MISSED_REWARDED_SHARE
  ) {
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_REWARDED_MISSED', {
        missed: count(missed),
        clicks: count(reachable)
      })
    );
  }
  const clicked = slots
    .filter((row) => row.clicks >= MIN_SAMPLE)
    .sort((a, b) => b.clicks - a.clicks)[0];
  const quick = clicked?.events['click-quick'] ?? 0;
  if (clicked && ratio(quick, clicked.clicks) >= QUICK_CLICK_SHARE) {
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_QUICK_CLICKS', {
        share: percent(ratio(quick, clicked.clicks)),
        slot: slotLabel(clicked),
        page: pageLabel(clicked.page)
      })
    );
  }
  const value = (row: SlotRow) =>
    byImpressions ? row.impressions : row.estMicros;
  const top = slots
    .filter((row) => value(row) > 0)
    .sort((a, b) => value(b) - value(a))[0];
  if (top) {
    lines.push(
      byImpressions
        ? t('MOD_PAGE.ADS_INSIGHT_TOP_IMPRESSIONS', {
            slot: slotLabel(top),
            page: pageLabel(top.page),
            share: percent(top.impressionShare),
            rate: rate(top.impressionsPer1k)
          })
        : t('MOD_PAGE.ADS_INSIGHT_TOP', {
            slot: slotLabel(top),
            page: pageLabel(top.page),
            share: percent(top.share),
            rpm: dollars(top.rpm)
          })
    );
  }
  const silent = slots.find((row) => row.flags.includes('NEVER_REQUESTED'));
  if (silent) {
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_NEVER_REQUESTED', {
        slot: slotLabel(silent),
        page: pageLabel(silent.page),
        seen: percent(silent.seenRate)
      })
    );
  }
  const perView = (row: SlotRow) =>
    byImpressions ? row.impressionsPer1k : row.rpm;
  const worst = slots
    .filter(
      (row) => row.mounts >= MIN_SAMPLE && row.requests > 0 && row !== top
    )
    .sort((a, b) => perView(a) - perView(b))[0];
  if (worst) {
    lines.push(
      byImpressions
        ? t('MOD_PAGE.ADS_INSIGHT_WORST_IMPRESSIONS', {
            slot: slotLabel(worst),
            page: pageLabel(worst.page),
            rate: rate(worst.impressionsPer1k),
            seen: percent(worst.seenRate)
          })
        : t('MOD_PAGE.ADS_INSIGHT_WORST', {
            slot: slotLabel(worst),
            page: pageLabel(worst.page),
            rpm: dollars(worst.rpm),
            seen: percent(worst.seenRate)
          })
    );
  }
  const pagesByTime = [...pages].sort((a, b) => b.visibleMs - a.visibleMs);
  const empty = pagesByTime.find((row) => row.flags.includes('NO_ADS'));
  if (empty) {
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_NO_ADS', {
        page: pageLabel(empty.page),
        share: percent(empty.timeShare),
        avg: duration(empty.avgMs)
      })
    );
  }
  const under = pagesByTime.find((row) =>
    row.flags.includes('UNDER_MONETIZED')
  );
  if (under) {
    lines.push(
      byImpressions
        ? t('MOD_PAGE.ADS_INSIGHT_UNDER_IMPRESSIONS', {
            page: pageLabel(under.page),
            timeShare: percent(under.timeShare),
            impressionShare: percent(under.impressionShare)
          })
        : t('MOD_PAGE.ADS_INSIGHT_UNDER', {
            page: pageLabel(under.page),
            timeShare: percent(under.timeShare),
            revenueShare: percent(under.revenueShare)
          })
    );
  }
  const gateTotal = inGameGate.ok + inGameGate.short + inGameGate.narrow;
  if (gateTotal >= MIN_SAMPLE) {
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_IN_GAME_GATE', {
        ok: percent(ratio(inGameGate.ok, gateTotal)),
        short: percent(ratio(inGameGate.short, gateTotal)),
        narrow: percent(ratio(inGameGate.narrow, gateTotal)),
        height: IN_GAME_AD_MIN_VIEWPORT_HEIGHT
      })
    );
  }
  const states = inGameGate.states;
  const sampled = IN_GAME_STATES.reduce((sum, state) => sum + states[state], 0);
  if (sampled >= MIN_SAMPLE) {
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_IN_GAME_STATES', {
        ad: percent(ratio(states.ad, sampled)),
        empty: percent(ratio(states.empty, sampled)),
        off: percent(ratio(states.below + states.offscreen, sampled)),
        covered: percent(ratio(states.covered, sampled)),
        missing: percent(ratio(states.hidden + states.noslot, sampled))
      })
    );
  }
  const flagged = slots.filter((row) =>
    row.flags.some((flag) => flag !== 'WRAPPER')
  ).length;
  if (flagged > 0) {
    lines.push(t('MOD_PAGE.ADS_INSIGHT_FLAGGED', { count: flagged }));
  }
  return lines;
}

const DailyChart = ({
  days,
  measure
}: {
  days: DayRow[];
  measure: Measure;
}) => {
  const { t } = useTranslation();
  const [active, setActive] = useState<number | null>(null);
  const byImpressions = measure === 'impressions';
  const value = (day: DayRow) =>
    byImpressions ? day.impressions : day.estMicros;
  const peak = Math.max(0, ...days.map(value));
  const max = Math.max(peak, 1);
  const focused = active === null ? null : days[active];
  const readout = (day: DayRow) =>
    byImpressions
      ? t('MOD_PAGE.ADS_CHART_READOUT_IMPRESSIONS', {
          day: day.day,
          impressions: count(day.impressions),
          views: count(day.views),
          rate: rate(perThousandCount(day.impressions, day.views))
        })
      : t('MOD_PAGE.ADS_CHART_READOUT', {
          day: day.day,
          revenue: money(day.estMicros),
          views: count(day.views),
          rpm: dollars(perThousand(day.estMicros, day.views))
        });

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.sectionTitle}>
          {byImpressions
            ? t('MOD_PAGE.ADS_CHART_TITLE_IMPRESSIONS')
            : t('MOD_PAGE.ADS_CHART_TITLE')}
        </h3>
        <span className={styles.chartReadout} aria-live="polite">
          {focused ? readout(focused) : t('MOD_PAGE.ADS_CHART_HINT')}
        </span>
      </div>
      <div className={styles.chartBody}>
        <span className={styles.chartMax}>
          {peak > 0 ? (byImpressions ? count(peak) : money(peak)) : ''}
        </span>
        <div className={styles.chartBars} onMouseLeave={() => setActive(null)}>
          {days.map((day, index) => (
            <div
              key={day.day}
              className={styles.chartColumn}
              tabIndex={0}
              aria-label={readout(day)}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
            >
              <span
                className={
                  active === index
                    ? `${styles.chartBar} ${styles.chartBarActive}`
                    : styles.chartBar
                }
                style={{ height: `${(value(day) / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.chartAxis}>
        <span>{days[0]?.day}</span>
        <span>{days[days.length - 1]?.day}</span>
      </div>
    </div>
  );
};

const AdStats: React.FC = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<AdReportRange>(7);
  const [device, setDevice] = useState<AdDevice | 'all'>('all');
  const [measure, setMeasure] = useState<Measure>(loadMeasure);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [prices, setPrices] = useState<Prices>(loadPrices);
  const byImpressions = measure === 'impressions';
  const [slotSort, toggleSlotSort, resetSlotSort] = useSort<
    keyof SlotRow & string
  >(byImpressions ? 'impressions' : 'estMicros');
  const [pageSort, togglePageSort, resetPageSort] = useSort<
    keyof PageRow & string
  >('visibleMs');
  const [bidderSort, toggleBidderSort] = useSort<keyof BidderRow & string>(
    'winMicros'
  );

  const { data, isFetching, isError } = useGetAdReportQuery(range);

  const pageLabel = (page: string) =>
    t(`MOD_PAGE.ADS_PAGE_${page.toUpperCase().replace(/-/g, '_')}`, {
      defaultValue: page
    });

  const updatePrice = (field: keyof Prices, value: string) => {
    const next = { ...prices, [field]: Math.max(0, Number(value) || 0) };
    setPrices(next);
    savePrices(next);
  };

  const changeMeasure = (next: Measure) => {
    setMeasure(next);
    saveMeasure(next);
    resetSlotSort(next === 'impressions' ? 'impressions' : 'estMicros');
    resetPageSort('visibleMs');
  };

  const slotLabel = (row: SlotRow) =>
    row.kind === 'video'
      ? t('MOD_PAGE.ADS_SLOT_VIDEO')
      : row.kind === 'rewarded'
      ? t('MOD_PAGE.ADS_SLOT_REWARDED')
      : row.placement;

  const report = useMemo(() => {
    const matches = (row: { device: AdDevice }) =>
      device === 'all' || row.device === device;

    const pageTotals = sumBy<AdPageStat, keyof AdPageStat>(
      (data?.pages ?? []).filter(matches),
      (row) => row.page,
      ['views', 'visibleMs', 'adblockViews']
    );
    const slotTotals = sumBy<AdSlotStat, keyof AdSlotStat>(
      (data?.slots ?? [])
        .filter(matches)
        .map((row) =>
          REWARDED_RE.test(row.placement)
            ? { ...row, placement: REWARDED_PLACEMENT }
            : row
        ),
      (row) => `${row.page}\t${row.placement}`,
      SLOT_SUM_FIELDS
    );
    const bidderTotals = sumBy<AdBidderStat, keyof AdBidderStat>(
      (data?.bidders ?? []).filter(matches),
      (row) => row.bidder,
      ['bids', 'wins', 'winMicros']
    );
    const dayTotals = sumBy<AdDailyStat, keyof AdDailyStat>(
      (data?.daily ?? []).filter(matches).map((row) => ({
        displayImpressions: 0,
        videoViewable: 0,
        videoStarts: 0,
        videoCompletes: 0,
        ...row
      })),
      (row) => row.day,
      DAY_SUM_FIELDS
    );

    const eventsBySlot = new Map<string, EventCounts>();
    for (const row of (data?.events ?? []).filter(matches) as AdEventStat[]) {
      const placement = REWARDED_RE.test(row.placement)
        ? REWARDED_PLACEMENT
        : row.placement;
      const key = `${row.page}\t${placement}`;
      const events = eventsBySlot.get(key) ?? {};
      events[row.event] = (events[row.event] ?? 0) + row.count;
      eventsBySlot.set(key, events);
      if (!slotTotals.has(key))
        slotTotals.set(key, emptySlot(row.page, placement));
    }

    const slotsList = Array.from(slotTotals.values());
    const pagesList = Array.from(pageTotals.values());
    const slotInputs = slotsList.map((row) => {
      const kind = slotKind(row);
      const events = eventsBySlot.get(`${row.page}\t${row.placement}`) ?? {};
      return {
        row,
        kind,
        events,
        impressions: slotImpressions(row, kind, events)
      };
    });
    const displayRows = slotInputs
      .filter(({ kind }) => kind === 'display' || kind === 'wrapper')
      .map(({ row }) => row);
    const prebidCpm = perThousand(
      displayRows.reduce((sum, row) => sum + row.estMicros, 0),
      displayRows.reduce((sum, row) => sum + row.pricedFills, 0)
    );
    const used: Prices = {
      display: prices.display || prebidCpm,
      video: prices.video || ESTIMATED_CPM.video,
      rewarded: prices.rewarded || ESTIMATED_CPM.rewarded
    };
    const pricedInputs = slotInputs.map((input) => ({
      ...input,
      micros: slotMicros(input.row, input.kind, input.impressions, used)
    }));

    const byKind = { display: 0, video: 0, rewarded: 0 };
    for (const { kind, impressions } of slotInputs) {
      byKind[kind === 'wrapper' ? 'display' : kind] += impressions;
    }
    const totalImpressions = byKind.display + byKind.video + byKind.rewarded;
    const totalMicros = pricedInputs.reduce(
      (sum, slot) => sum + slot.micros,
      0
    );
    const totalPrebid = slotsList.reduce(
      (sum, row) => sum + row.prebidMicros,
      0
    );
    const totalViews = pagesList.reduce((sum, row) => sum + row.views, 0);
    const totalVisible = pagesList.reduce((sum, row) => sum + row.visibleMs, 0);
    const totalAdblock = pagesList.reduce(
      (sum, row) => sum + row.adblockViews,
      0
    );
    const totalRequests = displayRows.reduce(
      (sum, row) => sum + row.requests,
      0
    );
    const totalFilled = displayRows.reduce((sum, row) => sum + row.filled, 0);
    const totalViewable = displayRows.reduce(
      (sum, row) => sum + row.viewable,
      0
    );
    const totalBidderMicros = Array.from(bidderTotals.values()).reduce(
      (sum, row) => sum + row.winMicros,
      0
    );

    const slots: SlotRow[] = pricedInputs.map(
      ({ row, kind, events, impressions, micros }) => {
        const views = pageTotals.get(row.page)?.views ?? 0;
        const hidden = events.hidden ?? 0;
        const viewable =
          kind === 'video' ? Math.min(row.viewable, impressions) : row.viewable;
        return {
          ...row,
          viewable,
          estMicros: micros,
          kind,
          events,
          impressions,
          hidden,
          key: `${row.page}\t${row.placement}`,
          seenRate: Math.min(1, ratio(row.seen, row.mounts)),
          avgInViewMs: ratio(row.visibleMs, row.mounts),
          fillRate: ratio(row.filled, row.requests),
          viewableRate: ratio(
            viewable,
            kind === 'video' ? impressions : row.filled
          ),
          ctr: ratio(row.clicks, row.filled),
          ecpm: perThousand(micros, impressions),
          share: ratio(micros, totalMicros),
          rpm: perThousand(micros, views),
          impressionsPer1k: perThousandCount(impressions, views),
          impressionShare: ratio(impressions, totalImpressions),
          flags: slotFlags(row, kind, hidden)
        };
      }
    );

    const rewarded: RewardedSummary = {
      clicks: 0,
      shown: 0,
      granted: 0,
      closed: 0,
      requests: 0,
      filled: 0,
      micros: 0,
      missUnfilled: 0,
      missSpent: 0,
      missBlocked: 0,
      shownLate: 0
    };
    for (const row of slots.filter((slot) => slot.kind === 'rewarded')) {
      rewarded.clicks += row.events.click ?? 0;
      rewarded.shown += row.events.shown ?? 0;
      rewarded.granted += row.events.granted ?? 0;
      rewarded.closed += row.events.closed ?? 0;
      rewarded.requests += row.requests;
      rewarded.filled += row.filled;
      rewarded.micros += row.estMicros;
      rewarded.missUnfilled += row.events['miss-unfilled'] ?? 0;
      rewarded.missSpent += row.events['miss-spent'] ?? 0;
      rewarded.missBlocked += row.events['miss-blocked'] ?? 0;
      rewarded.shownLate += row.events['shown-late'] ?? 0;
    }

    const inGameGate: InGameGate = {
      ok: 0,
      short: 0,
      narrow: 0,
      states: Object.fromEntries(
        IN_GAME_STATES.map((state) => [state, 0])
      ) as Record<InGameState, number>
    };
    eventsBySlot.forEach((events, key) => {
      if (!key.endsWith(`\t${IN_GAME_PLACEMENT}`)) return;
      inGameGate.ok += events['gate-ok'] ?? 0;
      inGameGate.short += events['gate-short'] ?? 0;
      inGameGate.narrow += events['gate-narrow'] ?? 0;
      for (const state of IN_GAME_STATES)
        inGameGate.states[state] += events[`ok-${state}`] ?? 0;
    });

    const estimated =
      (prices.display > 0
        ? 0
        : displayRows.reduce((sum, row) => sum + unpricedFills(row), 0)) +
      (prices.video > 0 ? 0 : byKind.video) +
      (prices.rewarded > 0 ? 0 : byKind.rewarded);

    const slotsByPage = new Map<
      string,
      { slots: number; micros: number; impressions: number }
    >();
    for (const row of slots) {
      const entry = slotsByPage.get(row.page) ?? {
        slots: 0,
        micros: 0,
        impressions: 0
      };
      if (row.mounts > 0 || (row.kind === 'video' && row.impressions > 0))
        entry.slots += 1;
      entry.micros += row.estMicros;
      entry.impressions += row.impressions;
      slotsByPage.set(row.page, entry);
    }

    const pages: PageRow[] = pagesList.map((row) => {
      const onPage = slotsByPage.get(row.page) ?? {
        slots: 0,
        micros: 0,
        impressions: 0
      };
      const timeShare = ratio(row.visibleMs, totalVisible);
      const revenueShare = ratio(onPage.micros, totalMicros);
      const impressionShare = ratio(onPage.impressions, totalImpressions);
      const valueShare =
        measure === 'impressions' ? impressionShare : revenueShare;
      const flags: PageFlag[] = [];
      if (
        row.views >= MIN_SAMPLE &&
        timeShare >= NOTABLE_TIME_SHARE &&
        onPage.slots === 0
      )
        flags.push('NO_ADS');
      else if (
        row.views >= MIN_SAMPLE &&
        timeShare >= SIGNIFICANT_TIME_SHARE &&
        valueShare < timeShare / 3
      )
        flags.push('UNDER_MONETIZED');
      return {
        ...row,
        slots: onPage.slots,
        estMicros: onPage.micros,
        impressions: onPage.impressions,
        avgMs: ratio(row.visibleMs, row.views),
        timeShare,
        revenueShare,
        impressionShare,
        rpm: perThousand(onPage.micros, row.views),
        perHour: ratio(onPage.micros / 1e6, row.visibleMs / 3600000),
        impressionsPer1k: perThousandCount(onPage.impressions, row.views),
        impressionsPerHour: ratio(onPage.impressions, row.visibleMs / 3600000),
        adblockRate: ratio(row.adblockViews, row.views),
        flags
      };
    });

    const bidders: BidderRow[] = Array.from(bidderTotals.values()).map(
      (row) => ({
        ...row,
        winRate: ratio(row.wins, row.bids),
        avgCpm: perThousand(row.winMicros, row.wins),
        share: ratio(row.winMicros, totalBidderMicros)
      })
    );

    const days: DayRow[] = Array.from(dayTotals.values())
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((row) => {
        const videoImpressions = Math.max(
          row.videoImpressions,
          row.videoViewable ?? 0,
          row.videoStarts ?? 0,
          row.videoCompletes ?? 0
        );
        return {
          day: row.day,
          views: row.views,
          estMicros:
            row.estMicros +
            row.unpricedFills * cpmMicros(used.display) +
            videoImpressions * cpmMicros(used.video) +
            row.rewardedShows * cpmMicros(used.rewarded),
          impressions:
            (row.displayImpressions ?? 0) + videoImpressions + row.rewardedShows
        };
      });

    return {
      slots,
      pages,
      bidders,
      days,
      rewarded,
      inGameGate,
      estimated,
      used,
      totals: {
        micros: totalMicros,
        prebid: totalPrebid,
        impressions: totalImpressions,
        byKind,
        views: totalViews,
        visibleMs: totalVisible,
        adblock: totalAdblock,
        requests: totalRequests,
        filled: totalFilled,
        viewable: totalViewable
      }
    };
  }, [data, device, prices, measure]);

  const revenueHint = (row: SlotRow) => {
    if (row.kind === 'video')
      return t('MOD_PAGE.ADS_REVENUE_HINT_VIDEO', {
        impressions: count(row.impressions),
        complete: count(row.events.complete ?? 0),
        cpm: dollars(report.used.video)
      });
    if (row.kind === 'rewarded')
      return t('MOD_PAGE.ADS_REVENUE_HINT_REWARDED', {
        shown: count(row.impressions),
        cpm: dollars(report.used.rewarded)
      });
    return t('MOD_PAGE.ADS_REVENUE_HINT', {
      exact: money(row.prebidMicros),
      unpriced: count(unpricedFills(row)),
      cpm: dollars(report.used.display)
    });
  };

  const insights = buildInsights(report, measure, t, pageLabel, slotLabel);

  const flagLabel = (flag: SlotFlag | PageFlag) =>
    t(`MOD_PAGE.ADS_FLAG_${flag}`);
  const flagHint = (flag: SlotFlag | PageFlag) =>
    t(`MOD_PAGE.ADS_FLAG_${flag}_HINT`);

  const flaggedCount = report.slots.filter(
    (row) => row.flags.length > 0
  ).length;
  const visibleSlots = sorted(
    flaggedOnly
      ? report.slots.filter((row) => row.flags.length > 0)
      : report.slots,
    slotSort
  );
  const visiblePages = sorted(report.pages, pageSort);
  const visibleBidders = sorted(report.bidders, bidderSort);
  const { totals, rewarded, used } = report;
  const missed = Math.max(
    0,
    rewarded.clicks - rewarded.shown - rewarded.missBlocked
  );
  const rewardedTiles = [
    {
      label: t('MOD_PAGE.ADS_REWARDED_CLICKS'),
      value: count(rewarded.clicks),
      note: t('MOD_PAGE.ADS_REWARDED_CLICKS_NOTE')
    },
    {
      label: t('MOD_PAGE.ADS_REWARDED_SHOWN'),
      value: count(rewarded.shown),
      note:
        rewarded.shownLate > 0
          ? t('MOD_PAGE.ADS_REWARDED_SHOWN_LATE_NOTE', {
              share: percent(ratio(rewarded.shown, rewarded.clicks)),
              late: count(rewarded.shownLate)
            })
          : t('MOD_PAGE.ADS_REWARDED_SHOWN_NOTE', {
              share: percent(ratio(rewarded.shown, rewarded.clicks))
            })
    },
    {
      label: t('MOD_PAGE.ADS_REWARDED_BLOCKED'),
      value: count(rewarded.missBlocked),
      note: t('MOD_PAGE.ADS_REWARDED_BLOCKED_NOTE')
    },
    {
      label: t('MOD_PAGE.ADS_REWARDED_MISSED'),
      value: count(missed),
      note:
        rewarded.missUnfilled + rewarded.missSpent > 0
          ? t('MOD_PAGE.ADS_REWARDED_MISSED_SPLIT', {
              unfilled: count(rewarded.missUnfilled),
              spent: count(rewarded.missSpent)
            })
          : t('MOD_PAGE.ADS_REWARDED_MISSED_NOTE')
    },
    {
      label: t('MOD_PAGE.ADS_REWARDED_GRANTED'),
      value: count(rewarded.granted),
      note: t('MOD_PAGE.ADS_REWARDED_GRANTED_NOTE', {
        share: percent(ratio(rewarded.granted, rewarded.shown)),
        closed: count(Math.max(0, rewarded.closed - rewarded.granted))
      })
    },
    {
      label: t('MOD_PAGE.ADS_REWARDED_READY'),
      value: percent(ratio(rewarded.filled, rewarded.requests)),
      note: t('MOD_PAGE.ADS_REWARDED_READY_NOTE', {
        filled: count(rewarded.filled),
        requests: count(rewarded.requests)
      })
    },
    {
      label: t('MOD_PAGE.ADS_KPI_REVENUE'),
      value: money(rewarded.micros),
      note:
        prices.rewarded > 0
          ? t('MOD_PAGE.ADS_REWARDED_REVENUE_NOTE', {
              cpm: dollars(used.rewarded)
            })
          : t('MOD_PAGE.ADS_REWARDED_REVENUE_NOTE_ESTIMATED', {
              cpm: dollars(used.rewarded)
            })
    }
  ];
  const hasRewarded = rewarded.requests > 0 || rewarded.clicks > 0;
  const hasData = report.slots.length > 0 || report.pages.length > 0;

  const header = <K extends string>(
    sort: SortState<K>,
    toggle: (key: K) => void,
    key: K,
    label: string,
    numeric = true,
    hint?: string
  ) => (
    <th
      scope="col"
      className={numeric ? styles.numeric : undefined}
      aria-sort={
        sort.key === key
          ? sort.descending
            ? 'descending'
            : 'ascending'
          : 'none'
      }
      title={hint}
    >
      <button
        type="button"
        className={styles.sortButton}
        onClick={() => toggle(key)}
      >
        {label}
        <span className={styles.sortIndicator} aria-hidden="true">
          {sort.key === key ? (sort.descending ? '▼' : '▲') : ''}
        </span>
      </button>
    </th>
  );

  const flagList = (flags: Array<SlotFlag | PageFlag>) =>
    flags.length > 0 && (
      <div className={styles.flags}>
        {flags.map((flag) => (
          <span key={flag} className={styles.flag} title={flagHint(flag)}>
            {flagLabel(flag)}
          </span>
        ))}
      </div>
    );

  const shareCell = (label: string, share: number, hint?: string) => (
    <td className={styles.numeric} title={hint}>
      <div className={styles.revenueCell}>
        <span>{label}</span>
        <span className={styles.shareBar} aria-hidden="true">
          <span
            className={styles.shareFill}
            style={{ width: `${share * 100}%` }}
          />
        </span>
        <span className={styles.muted}>{percent(share)}</span>
      </div>
    </td>
  );

  const hours = totals.visibleMs / 3600000;
  const sharedTiles = [
    {
      label: t('MOD_PAGE.ADS_KPI_VIEWS'),
      value: count(totals.views),
      note: t('MOD_PAGE.ADS_KPI_VIEWS_NOTE', {
        hours: count(Math.round(hours))
      })
    },
    {
      label: t('MOD_PAGE.ADS_KPI_FILL'),
      value: percent(ratio(totals.filled, totals.requests)),
      note: t('MOD_PAGE.ADS_KPI_FILL_NOTE', {
        filled: count(totals.filled),
        requests: count(totals.requests)
      })
    },
    {
      label: t('MOD_PAGE.ADS_KPI_VIEWABILITY'),
      value: percent(ratio(totals.viewable, totals.filled)),
      note: t('MOD_PAGE.ADS_KPI_VIEWABILITY_NOTE')
    },
    {
      label: t('MOD_PAGE.ADS_KPI_ADBLOCK'),
      value: percent(ratio(totals.adblock, totals.views)),
      note: t('MOD_PAGE.ADS_KPI_ADBLOCK_NOTE')
    }
  ];
  const tiles = byImpressions
    ? [
        {
          label: t('MOD_PAGE.ADS_KPI_IMPRESSIONS'),
          value: count(totals.impressions),
          note: t('MOD_PAGE.ADS_KPI_IMPRESSIONS_NOTE', {
            display: count(totals.byKind.display),
            video: count(totals.byKind.video),
            rewarded: count(totals.byKind.rewarded)
          })
        },
        {
          label: t('MOD_PAGE.ADS_KPI_PER_HOUR'),
          value: rate(ratio(totals.impressions, hours)),
          note: t('MOD_PAGE.ADS_KPI_PER_HOUR_NOTE', {
            perView: rate(ratio(totals.impressions, totals.views))
          })
        },
        ...sharedTiles
      ]
    : [
        {
          label: t('MOD_PAGE.ADS_KPI_REVENUE'),
          value: money(totals.micros),
          note: t('MOD_PAGE.ADS_KPI_REVENUE_NOTE', {
            exact: money(totals.prebid)
          })
        },
        {
          label: t('MOD_PAGE.ADS_KPI_RPM'),
          value: dollars(perThousand(totals.micros, totals.views)),
          note: t('MOD_PAGE.ADS_KPI_RPM_NOTE')
        },
        ...sharedTiles
      ];

  const segmented = <V extends string | number>(
    label: string,
    values: V[],
    current: V,
    onSelect: (value: V) => void,
    text: (value: V) => string
  ) => (
    <div className={styles.segmented} role="group" aria-label={label}>
      {values.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={current === value}
          className={
            current === value
              ? `${styles.segment} ${styles.segmentActive}`
              : styles.segment
          }
          onClick={() => onSelect(value)}
        >
          {text(value)}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('MOD_PAGE.ADS_TITLE')}</h2>
          <p className={styles.description}>{t('MOD_PAGE.ADS_DESCRIPTION')}</p>
        </div>
        <div className={styles.headerControls}>
          {segmented(
            t('MOD_PAGE.ADS_MEASURE'),
            MEASURES,
            measure,
            changeMeasure,
            (value) => t(`MOD_PAGE.ADS_MEASURE_${value.toUpperCase()}`)
          )}
          {segmented(
            t('MOD_PAGE.ADS_DEVICE'),
            DEVICES,
            device,
            setDevice,
            (value) => t(`MOD_PAGE.ADS_DEVICE_${value.toUpperCase()}`)
          )}
          {segmented(t('MOD_PAGE.ADS_RANGE'), RANGES, range, setRange, (days) =>
            days === 1
              ? t('MOD_PAGE.PROMPTS_RANGE_TODAY')
              : t('MOD_PAGE.PROMPTS_RANGE_DAYS', { days })
          )}
        </div>
      </div>

      {data && !isError && !data.error && (
        <p className={styles.summary}>
          {t('MOD_PAGE.ADS_SUMMARY', { since: data.since })}
          {isFetching && (
            <span className={styles.muted}> {t('MOD_PAGE.LOADING')}</span>
          )}
        </p>
      )}

      <div
        className={styles.prices}
        role="group"
        aria-label={t('MOD_PAGE.ADS_PRICES_TITLE')}
      >
        <div className={styles.pricesText}>
          <span className={styles.pricesTitle}>
            {t('MOD_PAGE.ADS_PRICES_TITLE')}
          </span>
          <span className={styles.muted}>
            {t('MOD_PAGE.ADS_PRICES_DESCRIPTION', {
              video: dollars(ESTIMATED_CPM.video),
              rewarded: dollars(ESTIMATED_CPM.rewarded)
            })}
          </span>
        </div>
        {PRICE_FIELDS.map((field) => (
          <label key={field} className={styles.priceField}>
            <span>
              {t(`MOD_PAGE.ADS_PRICE_${field.toUpperCase()}`)}{' '}
              {prices[field] === 0 && (
                <span className={styles.estimateTag}>
                  {t('MOD_PAGE.ADS_PRICE_ESTIMATE')}
                </span>
              )}
            </span>
            <span className={styles.priceInput}>
              <span aria-hidden="true">$</span>
              <input
                type="number"
                min={0}
                step={0.01}
                inputMode="decimal"
                value={prices[field] || ''}
                placeholder={used[field].toFixed(2)}
                onChange={(event) => updatePrice(field, event.target.value)}
              />
            </span>
          </label>
        ))}
      </div>

      {isError || data?.error ? (
        <p className={styles.empty}>{t('MOD_PAGE.ADS_LOAD_FAILED')}</p>
      ) : !data ? (
        <p className={styles.empty}>{t('MOD_PAGE.LOADING')}</p>
      ) : !hasData ? (
        <p className={styles.empty}>{t('MOD_PAGE.ADS_EMPTY')}</p>
      ) : (
        <>
          <div className={styles.tiles}>
            {tiles.map((tile) => (
              <div key={tile.label} className={styles.tile}>
                <span className={styles.tileLabel}>{tile.label}</span>
                <span className={styles.tileValue}>{tile.value}</span>
                <span className={styles.tileNote}>{tile.note}</span>
              </div>
            ))}
          </div>

          <div className={styles.overview}>
            {report.days.length > 1 && (
              <DailyChart days={report.days} measure={measure} />
            )}
            {insights.length > 0 && (
              <div className={styles.insights}>
                <h3 className={styles.sectionTitle}>
                  {t('MOD_PAGE.ADS_INSIGHTS_TITLE')}
                </h3>
                <ul className={styles.insightList}>
                  {insights.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {hasRewarded && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    {t('MOD_PAGE.ADS_REWARDED_TITLE')}
                  </h3>
                  <p className={styles.sectionDescription}>
                    {t('MOD_PAGE.ADS_REWARDED_DESCRIPTION')}
                  </p>
                </div>
              </div>
              <div className={styles.tiles}>
                {rewardedTiles.map((tile) => (
                  <div key={tile.label} className={styles.tile}>
                    <span className={styles.tileLabel}>{tile.label}</span>
                    <span className={styles.tileValue}>{tile.value}</span>
                    <span className={styles.tileNote}>{tile.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>
                  {t('MOD_PAGE.ADS_SLOTS_TITLE')}
                </h3>
                <p className={styles.sectionDescription}>
                  {t('MOD_PAGE.ADS_SLOTS_DESCRIPTION')}
                </p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={flaggedOnly}
                  onChange={(event) => setFlaggedOnly(event.target.checked)}
                />
                {t('MOD_PAGE.ADS_FLAGGED_ONLY', { total: flaggedCount })}
              </label>
            </div>
            <div className={styles.tableWrap}>
              <table className={`${styles.table} ${styles.slotTable}`}>
                <thead>
                  <tr>
                    {header(
                      slotSort,
                      toggleSlotSort,
                      'placement',
                      t('MOD_PAGE.ADS_COL_SLOT'),
                      false
                    )}
                    {header(
                      slotSort,
                      toggleSlotSort,
                      'seenRate',
                      t('MOD_PAGE.ADS_COL_SEEN'),
                      true,
                      t('MOD_PAGE.ADS_COL_SEEN_HINT')
                    )}
                    {header(
                      slotSort,
                      toggleSlotSort,
                      'avgInViewMs',
                      t('MOD_PAGE.ADS_COL_IN_VIEW'),
                      true,
                      t('MOD_PAGE.ADS_COL_IN_VIEW_HINT')
                    )}
                    {header(
                      slotSort,
                      toggleSlotSort,
                      'requests',
                      t('MOD_PAGE.ADS_COL_REQUESTS')
                    )}
                    {header(
                      slotSort,
                      toggleSlotSort,
                      'fillRate',
                      t('MOD_PAGE.ADS_COL_FILL')
                    )}
                    {header(
                      slotSort,
                      toggleSlotSort,
                      'viewableRate',
                      t('MOD_PAGE.ADS_COL_VIEWABLE')
                    )}
                    {header(
                      slotSort,
                      toggleSlotSort,
                      'ctr',
                      t('MOD_PAGE.ADS_COL_CTR')
                    )}
                    {byImpressions ? (
                      <>
                        {header(
                          slotSort,
                          toggleSlotSort,
                          'impressionsPer1k',
                          t('MOD_PAGE.ADS_COL_RPM'),
                          true,
                          t('MOD_PAGE.ADS_COL_IMPRESSIONS_PER_1K_HINT')
                        )}
                        {header(
                          slotSort,
                          toggleSlotSort,
                          'impressions',
                          t('MOD_PAGE.ADS_COL_IMPRESSIONS'),
                          true,
                          t('MOD_PAGE.ADS_COL_IMPRESSIONS_HINT')
                        )}
                      </>
                    ) : (
                      <>
                        {header(
                          slotSort,
                          toggleSlotSort,
                          'ecpm',
                          t('MOD_PAGE.ADS_COL_ECPM'),
                          true,
                          t('MOD_PAGE.ADS_COL_ECPM_HINT')
                        )}
                        {header(
                          slotSort,
                          toggleSlotSort,
                          'rpm',
                          t('MOD_PAGE.ADS_COL_RPM'),
                          true,
                          t('MOD_PAGE.ADS_COL_RPM_HINT')
                        )}
                        {header(
                          slotSort,
                          toggleSlotSort,
                          'estMicros',
                          t('MOD_PAGE.ADS_COL_REVENUE')
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleSlots.map((row) => (
                    <tr key={row.key}>
                      <td>
                        <div className={styles.slotName}>
                          <code className={styles.code}>{slotLabel(row)}</code>
                          <span className={styles.muted}>
                            {pageLabel(row.page)}
                          </span>
                        </div>
                        {flagList(row.flags)}
                      </td>
                      <td className={styles.numeric}>
                        {row.mounts > 0 ? percent(row.seenRate) : '-'}
                      </td>
                      <td className={styles.numeric}>
                        {row.mounts > 0 ? duration(row.avgInViewMs) : '-'}
                      </td>
                      <td className={styles.numeric}>{count(row.requests)}</td>
                      <td className={styles.numeric}>
                        {row.requests > 0 ? percent(row.fillRate) : '-'}
                      </td>
                      <td className={styles.numeric}>
                        {row.filled > 0 ? percent(row.viewableRate) : '-'}
                      </td>
                      <td className={styles.numeric}>
                        {row.filled > 0
                          ? `${(row.ctr * 100).toFixed(2)}%`
                          : '-'}
                      </td>
                      {byImpressions ? (
                        <>
                          <td className={styles.numeric}>
                            {rate(row.impressionsPer1k)}
                          </td>
                          {shareCell(
                            count(row.impressions),
                            row.impressionShare,
                            row.hidden > 0
                              ? t('MOD_PAGE.ADS_HIDDEN_HINT', {
                                  count: row.hidden,
                                  total: count(row.hidden)
                                })
                              : undefined
                          )}
                        </>
                      ) : (
                        <>
                          <td className={styles.numeric}>
                            {row.impressions > 0 ? dollars(row.ecpm) : '-'}
                          </td>
                          <td className={styles.numeric}>{dollars(row.rpm)}</td>
                          {shareCell(
                            money(row.estMicros),
                            row.share,
                            revenueHint(row)
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>
                  {t('MOD_PAGE.ADS_PAGES_TITLE')}
                </h3>
                <p className={styles.sectionDescription}>
                  {t('MOD_PAGE.ADS_PAGES_DESCRIPTION')}
                </p>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {header(
                      pageSort,
                      togglePageSort,
                      'page',
                      t('MOD_PAGE.ADS_COL_PAGE'),
                      false
                    )}
                    {header(
                      pageSort,
                      togglePageSort,
                      'views',
                      t('MOD_PAGE.ADS_COL_VIEWS')
                    )}
                    {header(
                      pageSort,
                      togglePageSort,
                      'avgMs',
                      t('MOD_PAGE.ADS_COL_AVG_TIME')
                    )}
                    {header(
                      pageSort,
                      togglePageSort,
                      'visibleMs',
                      t('MOD_PAGE.ADS_COL_TIME_SHARE')
                    )}
                    {header(
                      pageSort,
                      togglePageSort,
                      'slots',
                      t('MOD_PAGE.ADS_COL_SLOTS')
                    )}
                    {byImpressions ? (
                      <>
                        {header(
                          pageSort,
                          togglePageSort,
                          'impressionsPer1k',
                          t('MOD_PAGE.ADS_COL_RPM'),
                          true,
                          t('MOD_PAGE.ADS_COL_IMPRESSIONS_PER_1K_HINT')
                        )}
                        {header(
                          pageSort,
                          togglePageSort,
                          'impressionsPerHour',
                          t('MOD_PAGE.ADS_COL_PER_HOUR'),
                          true,
                          t('MOD_PAGE.ADS_COL_IMPRESSIONS_PER_HOUR_HINT')
                        )}
                        {header(
                          pageSort,
                          togglePageSort,
                          'impressions',
                          t('MOD_PAGE.ADS_COL_IMPRESSIONS'),
                          true,
                          t('MOD_PAGE.ADS_COL_IMPRESSIONS_HINT')
                        )}
                      </>
                    ) : (
                      <>
                        {header(
                          pageSort,
                          togglePageSort,
                          'rpm',
                          t('MOD_PAGE.ADS_COL_RPM')
                        )}
                        {header(
                          pageSort,
                          togglePageSort,
                          'perHour',
                          t('MOD_PAGE.ADS_COL_PER_HOUR'),
                          true,
                          t('MOD_PAGE.ADS_COL_PER_HOUR_HINT')
                        )}
                        {header(
                          pageSort,
                          togglePageSort,
                          'estMicros',
                          t('MOD_PAGE.ADS_COL_REVENUE')
                        )}
                      </>
                    )}
                    {header(
                      pageSort,
                      togglePageSort,
                      'adblockRate',
                      t('MOD_PAGE.ADS_COL_ADBLOCK')
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visiblePages.map((row) => (
                    <tr key={row.page}>
                      <td>
                        <span className={styles.pageName}>
                          {pageLabel(row.page)}
                        </span>
                        {flagList(row.flags)}
                      </td>
                      <td className={styles.numeric}>{count(row.views)}</td>
                      <td className={styles.numeric}>{duration(row.avgMs)}</td>
                      <td className={styles.numeric}>
                        {percent(row.timeShare)}
                      </td>
                      <td className={styles.numeric}>{row.slots}</td>
                      {byImpressions ? (
                        <>
                          <td className={styles.numeric}>
                            {rate(row.impressionsPer1k)}
                          </td>
                          <td className={styles.numeric}>
                            {rate(row.impressionsPerHour)}
                          </td>
                          <td className={styles.numeric}>
                            {count(row.impressions)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className={styles.numeric}>{dollars(row.rpm)}</td>
                          <td className={styles.numeric}>
                            {dollars(row.perHour)}
                          </td>
                          <td className={styles.numeric}>
                            {money(row.estMicros)}
                          </td>
                        </>
                      )}
                      <td className={styles.numeric}>
                        {percent(row.adblockRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {visibleBidders.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    {t('MOD_PAGE.ADS_BIDDERS_TITLE')}
                  </h3>
                  <p className={styles.sectionDescription}>
                    {t('MOD_PAGE.ADS_BIDDERS_DESCRIPTION')}
                  </p>
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table className={`${styles.table} ${styles.bidderTable}`}>
                  <thead>
                    <tr>
                      {header(
                        bidderSort,
                        toggleBidderSort,
                        'bidder',
                        t('MOD_PAGE.ADS_COL_BIDDER'),
                        false
                      )}
                      {header(
                        bidderSort,
                        toggleBidderSort,
                        'bids',
                        t('MOD_PAGE.ADS_COL_BIDS')
                      )}
                      {header(
                        bidderSort,
                        toggleBidderSort,
                        'wins',
                        t('MOD_PAGE.ADS_COL_WINS')
                      )}
                      {header(
                        bidderSort,
                        toggleBidderSort,
                        'winRate',
                        t('MOD_PAGE.ADS_COL_WIN_RATE')
                      )}
                      {header(
                        bidderSort,
                        toggleBidderSort,
                        'avgCpm',
                        t('MOD_PAGE.ADS_COL_AVG_CPM')
                      )}
                      {header(
                        bidderSort,
                        toggleBidderSort,
                        'winMicros',
                        t('MOD_PAGE.ADS_COL_PREBID_REVENUE')
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBidders.map((row) => (
                      <tr key={row.bidder}>
                        <td>
                          <code className={styles.code}>{row.bidder}</code>
                        </td>
                        <td className={styles.numeric}>{count(row.bids)}</td>
                        <td className={styles.numeric}>{count(row.wins)}</td>
                        <td className={styles.numeric}>
                          {percent(row.winRate)}
                        </td>
                        <td className={styles.numeric}>
                          {row.wins > 0 ? dollars(row.avgCpm) : '-'}
                        </td>
                        <td className={styles.numeric}>
                          {money(row.winMicros)}{' '}
                          <span className={styles.muted}>
                            {percent(row.share)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <details className={styles.method}>
            <summary>{t('MOD_PAGE.ADS_HOW_TITLE')}</summary>
            <ul>
              <li>{t('MOD_PAGE.ADS_HOW_IMPRESSIONS')}</li>
              <li>{t('MOD_PAGE.ADS_HOW_SEEN')}</li>
              <li>{t('MOD_PAGE.ADS_HOW_FILL')}</li>
              <li>{t('MOD_PAGE.ADS_HOW_REVENUE')}</li>
              <li>{t('MOD_PAGE.ADS_HOW_RPM')}</li>
              <li>{t('MOD_PAGE.ADS_HOW_CLICKS')}</li>
              <li>{t('MOD_PAGE.ADS_HOW_SCOPE')}</li>
            </ul>
          </details>
        </>
      )}
    </div>
  );
};

export default AdStats;
