import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAdReportQuery } from 'features/api/apiSlice';
import {
  AdBidderStat,
  AdDailyStat,
  AdDevice,
  AdPageStat,
  AdReportRange,
  AdSlotStat
} from 'interface/API/ModPageAPI';
import styles from './AdStats.module.css';

const RANGES: AdReportRange[] = [1, 7, 30, 90];
const DEVICES: Array<AdDevice | 'all'> = ['all', 'desktop', 'mobile'];
const MIN_SAMPLE = 20;
const RARELY_SEEN_SHARE = 0.05;
const LOW_FILL_RATE = 0.5;
const LOW_VIEWABLE_RATE = 0.5;
const SIGNIFICANT_TIME_SHARE = 0.05;
const NOTABLE_TIME_SHARE = 0.01;

type SlotFlag =
  | 'DUPLICATE'
  | 'WRAPPER'
  | 'NEVER_REQUESTED'
  | 'RARELY_SEEN'
  | 'LOW_FILL'
  | 'LOW_VIEWABILITY';
type PageFlag = 'NO_ADS' | 'UNDER_MONETIZED';

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
  seenRate: number;
  avgInViewMs: number;
  fillRate: number;
  viewableRate: number;
  ctr: number;
  ecpm: number;
  share: number;
  rpm: number;
  flags: SlotFlag[];
}

interface PageRow {
  page: string;
  views: number;
  visibleMs: number;
  adblockViews: number;
  slots: number;
  estMicros: number;
  avgMs: number;
  timeShare: number;
  revenueShare: number;
  rpm: number;
  perHour: number;
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
  rpm: number;
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
const percent = (value: number) =>
  value > 0 && value < 0.005 ? '<1%' : `${Math.round(value * 100)}%`;
const count = (value: number) => value.toLocaleString();
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

function slotFlags(row: AdSlotStat): SlotFlag[] {
  const flags: SlotFlag[] = [];
  if (row.placement.includes('#')) flags.push('DUPLICATE');
  if (row.mounts === 0 && row.requests > 0) flags.push('WRAPPER');
  if (row.seen >= MIN_SAMPLE && row.requests === 0)
    flags.push('NEVER_REQUESTED');
  if (
    row.mounts >= MIN_SAMPLE &&
    ratio(row.seen, row.mounts) < RARELY_SEEN_SHARE
  )
    flags.push('RARELY_SEEN');
  if (
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
  return [sort, toggle] as const;
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
  slots: SlotRow[],
  pages: PageRow[],
  t: Translate,
  pageLabel: (page: string) => string
): string[] {
  const lines: string[] = [];
  const earning = slots.filter((row) => row.estMicros > 0);
  const top = [...earning].sort((a, b) => b.estMicros - a.estMicros)[0];
  if (top) {
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_TOP', {
        slot: top.placement,
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
        slot: silent.placement,
        page: pageLabel(silent.page),
        seen: percent(silent.seenRate)
      })
    );
  }
  const measured = slots.filter(
    (row) => row.mounts >= MIN_SAMPLE && row.requests > 0 && row !== top
  );
  const worst = [...measured].sort((a, b) => a.rpm - b.rpm)[0];
  if (worst) {
    lines.push(
      t('MOD_PAGE.ADS_INSIGHT_WORST', {
        slot: worst.placement,
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
      t('MOD_PAGE.ADS_INSIGHT_UNDER', {
        page: pageLabel(under.page),
        timeShare: percent(under.timeShare),
        revenueShare: percent(under.revenueShare)
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

const DailyChart = ({ days }: { days: DayRow[] }) => {
  const { t } = useTranslation();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...days.map((day) => day.estMicros), 1);
  const focused = active === null ? null : days[active];

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.sectionTitle}>{t('MOD_PAGE.ADS_CHART_TITLE')}</h3>
        <span className={styles.chartReadout} aria-live="polite">
          {focused
            ? t('MOD_PAGE.ADS_CHART_READOUT', {
                day: focused.day,
                revenue: money(focused.estMicros),
                views: count(focused.views),
                rpm: dollars(focused.rpm)
              })
            : t('MOD_PAGE.ADS_CHART_HINT')}
        </span>
      </div>
      <div className={styles.chartBody}>
        <span className={styles.chartMax}>{max > 1 ? money(max) : ''}</span>
        <div className={styles.chartBars} onMouseLeave={() => setActive(null)}>
          {days.map((day, index) => (
            <div
              key={day.day}
              className={styles.chartColumn}
              tabIndex={0}
              aria-label={t('MOD_PAGE.ADS_CHART_READOUT', {
                day: day.day,
                revenue: money(day.estMicros),
                views: count(day.views),
                rpm: dollars(day.rpm)
              })}
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
                style={{ height: `${(day.estMicros / max) * 100}%` }}
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
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [slotSort, toggleSlotSort] = useSort<keyof SlotRow & string>(
    'estMicros'
  );
  const [pageSort, togglePageSort] = useSort<keyof PageRow & string>(
    'visibleMs'
  );
  const [bidderSort, toggleBidderSort] = useSort<keyof BidderRow & string>(
    'winMicros'
  );

  const { data, isFetching, isError } = useGetAdReportQuery(range);

  const pageLabel = (page: string) =>
    t(`MOD_PAGE.ADS_PAGE_${page.toUpperCase().replace(/-/g, '_')}`, {
      defaultValue: page
    });

  const report = useMemo(() => {
    const matches = (row: { device: AdDevice }) =>
      device === 'all' || row.device === device;

    const pageTotals = sumBy<AdPageStat, keyof AdPageStat>(
      (data?.pages ?? []).filter(matches),
      (row) => row.page,
      ['views', 'visibleMs', 'adblockViews']
    );
    const slotTotals = sumBy<AdSlotStat, keyof AdSlotStat>(
      (data?.slots ?? []).filter(matches),
      (row) => `${row.page}\t${row.placement}`,
      SLOT_SUM_FIELDS
    );
    const bidderTotals = sumBy<AdBidderStat, keyof AdBidderStat>(
      (data?.bidders ?? []).filter(matches),
      (row) => row.bidder,
      ['bids', 'wins', 'winMicros']
    );
    const dayTotals = sumBy<AdDailyStat, keyof AdDailyStat>(
      (data?.daily ?? []).filter(matches),
      (row) => row.day,
      ['views', 'estMicros', 'filled']
    );

    const slotsList = Array.from(slotTotals.values());
    const pagesList = Array.from(pageTotals.values());
    const totalMicros = slotsList.reduce((sum, row) => sum + row.estMicros, 0);
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
    const totalRequests = slotsList.reduce((sum, row) => sum + row.requests, 0);
    const totalFilled = slotsList.reduce((sum, row) => sum + row.filled, 0);
    const totalViewable = slotsList.reduce((sum, row) => sum + row.viewable, 0);
    const totalBidderMicros = Array.from(bidderTotals.values()).reduce(
      (sum, row) => sum + row.winMicros,
      0
    );

    const slots: SlotRow[] = slotsList.map((row) => {
      const views = pageTotals.get(row.page)?.views ?? 0;
      return {
        ...row,
        key: `${row.page}\t${row.placement}`,
        seenRate: ratio(row.seen, row.mounts),
        avgInViewMs: ratio(row.visibleMs, row.mounts),
        fillRate: ratio(row.filled, row.requests),
        viewableRate: ratio(row.viewable, row.filled),
        ctr: ratio(row.clicks, row.filled),
        ecpm: perThousand(row.estMicros, row.filled),
        share: ratio(row.estMicros, totalMicros),
        rpm: perThousand(row.estMicros, views),
        flags: slotFlags(row)
      };
    });

    const slotsByPage = new Map<string, { slots: number; micros: number }>();
    for (const row of slots) {
      const entry = slotsByPage.get(row.page) ?? { slots: 0, micros: 0 };
      if (row.mounts > 0) entry.slots += 1;
      entry.micros += row.estMicros;
      slotsByPage.set(row.page, entry);
    }

    const pages: PageRow[] = pagesList.map((row) => {
      const onPage = slotsByPage.get(row.page) ?? { slots: 0, micros: 0 };
      const timeShare = ratio(row.visibleMs, totalVisible);
      const revenueShare = ratio(onPage.micros, totalMicros);
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
        revenueShare < timeShare / 3
      )
        flags.push('UNDER_MONETIZED');
      return {
        ...row,
        slots: onPage.slots,
        estMicros: onPage.micros,
        avgMs: ratio(row.visibleMs, row.views),
        timeShare,
        revenueShare,
        rpm: perThousand(onPage.micros, row.views),
        perHour: ratio(onPage.micros / 1e6, row.visibleMs / 3600000),
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
      .map((row) => ({
        day: row.day,
        views: row.views,
        estMicros: row.estMicros,
        rpm: perThousand(row.estMicros, row.views)
      }));

    return {
      slots,
      pages,
      bidders,
      days,
      totals: {
        micros: totalMicros,
        prebid: totalPrebid,
        views: totalViews,
        visibleMs: totalVisible,
        adblock: totalAdblock,
        requests: totalRequests,
        filled: totalFilled,
        viewable: totalViewable
      }
    };
  }, [data, device]);

  const insights = buildInsights(report.slots, report.pages, t, pageLabel);

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
  const { totals } = report;
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

  const tiles = [
    {
      label: t('MOD_PAGE.ADS_KPI_REVENUE'),
      value: money(totals.micros),
      note: t('MOD_PAGE.ADS_KPI_REVENUE_NOTE', { exact: money(totals.prebid) })
    },
    {
      label: t('MOD_PAGE.ADS_KPI_RPM'),
      value: dollars(perThousand(totals.micros, totals.views)),
      note: t('MOD_PAGE.ADS_KPI_RPM_NOTE')
    },
    {
      label: t('MOD_PAGE.ADS_KPI_VIEWS'),
      value: count(totals.views),
      note: t('MOD_PAGE.ADS_KPI_VIEWS_NOTE', {
        hours: count(Math.round(totals.visibleMs / 3600000))
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

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('MOD_PAGE.ADS_TITLE')}</h2>
          <p className={styles.description}>{t('MOD_PAGE.ADS_DESCRIPTION')}</p>
        </div>
        <div className={styles.headerControls}>
          <div
            className={styles.segmented}
            role="group"
            aria-label={t('MOD_PAGE.ADS_DEVICE')}
          >
            {DEVICES.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={device === value}
                className={
                  device === value
                    ? `${styles.segment} ${styles.segmentActive}`
                    : styles.segment
                }
                onClick={() => setDevice(value)}
              >
                {t(`MOD_PAGE.ADS_DEVICE_${value.toUpperCase()}`)}
              </button>
            ))}
          </div>
          <div
            className={styles.segmented}
            role="group"
            aria-label={t('MOD_PAGE.ADS_RANGE')}
          >
            {RANGES.map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={range === days}
                className={
                  range === days
                    ? `${styles.segment} ${styles.segmentActive}`
                    : styles.segment
                }
                onClick={() => setRange(days)}
              >
                {days === 1
                  ? t('MOD_PAGE.PROMPTS_RANGE_TODAY')
                  : t('MOD_PAGE.PROMPTS_RANGE_DAYS', { days })}
              </button>
            ))}
          </div>
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
            {report.days.length > 1 && <DailyChart days={report.days} />}
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
                  </tr>
                </thead>
                <tbody>
                  {visibleSlots.map((row) => (
                    <tr key={row.key}>
                      <td>
                        <div className={styles.slotName}>
                          <code className={styles.code}>{row.placement}</code>
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
                      <td className={styles.numeric}>
                        {row.filled > 0 ? dollars(row.ecpm) : '-'}
                      </td>
                      <td className={styles.numeric}>{dollars(row.rpm)}</td>
                      <td
                        className={styles.numeric}
                        title={t('MOD_PAGE.ADS_REVENUE_HINT', {
                          exact: money(row.prebidMicros),
                          priced: percent(ratio(row.pricedFills, row.filled))
                        })}
                      >
                        <div className={styles.revenueCell}>
                          <span>{money(row.estMicros)}</span>
                          <span className={styles.shareBar} aria-hidden="true">
                            <span
                              className={styles.shareFill}
                              style={{ width: `${row.share * 100}%` }}
                            />
                          </span>
                          <span className={styles.muted}>
                            {percent(row.share)}
                          </span>
                        </div>
                      </td>
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
                      <td className={styles.numeric}>{dollars(row.rpm)}</td>
                      <td className={styles.numeric}>{dollars(row.perHour)}</td>
                      <td className={styles.numeric}>{money(row.estMicros)}</td>
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
