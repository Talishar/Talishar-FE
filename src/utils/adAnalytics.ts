import { BACKEND_URL, URL_END_POINT } from 'appConstants';

type Device = 'desktop' | 'mobile';

interface GptSlot {
  getSlotElementId(): string;
  getAdUnitPath(): string;
}

interface GptSlotEvent {
  slot: GptSlot;
  isEmpty?: boolean;
}

interface GoogleTag {
  cmd: Array<() => void>;
  pubads?: () => {
    addEventListener(
      type: string,
      handler: (event: GptSlotEvent) => void
    ): void;
  };
}

interface PrebidBid {
  adUnitCode?: string;
  bidderCode?: string;
  cpm?: number;
}

interface Prebid {
  que: Array<() => void>;
  onEvent?: (type: string, handler: (args: never) => void) => void;
}

interface AdWindow extends Window {
  googletag?: GoogleTag;
  pbjs?: Prebid;
}

const MOUNTS = 0;
const SEEN = 1;
const SLOT_VISIBLE_MS = 2;
const REQUESTS = 3;
const FILLED = 4;
const VIEWABLE = 5;
const CLICKS = 6;
const PREBID_WINS = 7;
const PREBID_MICROS = 8;
const FILL_BID_MICROS = 9;
const PRICED_FILLS = 10;
const SLOT_FIELD_COUNT = 11;

const VIEWS = 0;
const PAGE_VISIBLE_MS = 1;
const ADBLOCK_VIEWS = 2;

const BIDS = 0;
const WINS = 1;
const WIN_MICROS = 2;

const FLUSH_INTERVAL_MS = 5 * 60 * 1000;
const MIN_FLUSH_GAP_MS = 60 * 1000;
const MAX_CPM = 50;
const IN_VIEW_RATIO = 0.5;

const PAGE_KEYS: Array<[RegExp, string]> = [
  [/^\/$/, 'home'],
  [/^\/(?:game\/)?play(?:\/|$)/i, 'game'],
  [/^\/game\/lobby(?:\/|$)/i, 'lobby'],
  [/^\/game\/join(?:\/|$)/i, 'join'],
  [/^\/game\/create(?:\/|$)/i, 'create'],
  [/^\/game\/load(?:\/|$)/i, 'replays'],
  [/^\/(?:replay|snapshot)\//i, 'shared-replay'],
  [/^\/learn(?:\/|$)/i, 'learn'],
  [/^\/about(?:\/|$)/i, 'about'],
  [/^\/premium(?:\/|$)/i, 'premium'],
  [/^\/mastery(?:\/|$)/i, 'mastery'],
  [/^\/user\/profile(?:\/|$)/i, 'profile'],
  [/^\/user\/settings(?:\/|$)/i, 'settings'],
  [/^\/user\/decks(?:\/|$)/i, 'decks'],
  [/^\/user(?:\/|$)/i, 'account'],
  [/^\/(?:privacy|privacy-policy|terms-of-service)(?:\/|$)/i, 'legal']
];
const noop = () => undefined;
const UNTRACKED_PAGE_RE = /^\/(?:mod|ads-test)(?:\/|$)/i;
const SLOT_ID_RE = /^ad_(.+)_(\d+)$/;

const slotCounters = new Map<string, number[]>();
const pageCounters = new Map<string, number[]>();
const bidderCounters = new Map<string, number[]>();
const trackers = new Map<Element, SlotTracker>();
const bestBids = new Map<string, number>();

let currentPage: string | null = null;
let pageSince = 0;
let pageVisible = true;
let providerStarted = false;
let gptReady = false;
let listenersInstalled = false;
let clickArmed = true;
let lastFlush = Date.now();
let observer: IntersectionObserver | null = null;
let mobileQuery: MediaQueryList | null = null;

export function adPageKey(pathname: string): string | null {
  if (UNTRACKED_PAGE_RE.test(pathname)) return null;
  for (const [pattern, key] of PAGE_KEYS) {
    if (pattern.test(pathname)) return key;
  }
  return 'other';
}

function currentDevice(): Device {
  mobileQuery ??= window.matchMedia('(max-width: 728px)');
  return mobileQuery.matches ? 'mobile' : 'desktop';
}

function micros(cpm: unknown): number {
  return typeof cpm === 'number' && cpm > 0
    ? Math.round(Math.min(cpm, MAX_CPM) * 1000)
    : 0;
}

function cleanPlacement(value: string): string | null {
  const placement = value
    .toLowerCase()
    .replace(/[^a-z0-9._#-]/g, '-')
    .slice(0, 40);
  return /^[a-z0-9]/.test(placement) ? placement : null;
}

function placementFromSlotId(id: string): string | null {
  const match = SLOT_ID_RE.exec(id);
  if (!match) return null;
  const index = Number(match[2]);
  return cleanPlacement(index > 0 ? `${match[1]}#${index + 1}` : match[1]);
}

function placementFromElement(el: Element): string | null {
  const fromId = placementFromSlotId(el.id);
  if (fromId) return fromId;
  const code = el.getAttribute('data-ad');
  if (!code) return null;
  const index = Array.from(
    document.querySelectorAll(`[data-ad="${CSS.escape(code)}"]`)
  ).indexOf(el);
  return cleanPlacement(index > 0 ? `${code}#${index + 1}` : code);
}

function placementFromSlot(slot: GptSlot): string | null {
  return (
    placementFromSlotId(slot.getSlotElementId()) ??
    cleanPlacement(slot.getAdUnitPath().split('/').pop() ?? '')
  );
}

function counters(
  map: Map<string, number[]>,
  key: string,
  size: number
): number[] {
  let row = map.get(key);
  if (!row) {
    row = new Array(size).fill(0);
    map.set(key, row);
  }
  return row;
}

function slotRow(page: string, placement: string): number[] {
  return counters(
    slotCounters,
    `${page}\t${placement}\t${currentDevice()}`,
    SLOT_FIELD_COUNT
  );
}

function pageRow(page: string): number[] {
  return counters(pageCounters, `${page}\t${currentDevice()}`, 3);
}

function bidderRow(bidder: string): number[] {
  return counters(bidderCounters, `${bidder}\t${currentDevice()}`, 3);
}

function accruePage(now: number) {
  if (currentPage && pageVisible) {
    pageRow(currentPage)[PAGE_VISIBLE_MS] += now - pageSince;
  }
  pageSince = now;
}

class SlotTracker {
  counted = false;
  seen = false;
  seenCounted = false;
  inView = false;
  since = Date.now();
  pendingMs = 0;

  constructor(readonly el: Element, readonly page: string) {}

  accrue(now: number) {
    if (this.inView && pageVisible) this.pendingMs += now - this.since;
    this.since = now;
  }

  setInView(inView: boolean, now: number) {
    this.accrue(now);
    this.inView = inView;
    if (inView) this.seen = true;
  }

  settle(now: number) {
    this.accrue(now);
    if (!gptReady) return;
    const placement = placementFromElement(this.el);
    if (!placement) return;
    const row = slotRow(this.page, placement);
    if (!this.counted) {
      row[MOUNTS] += 1;
      this.counted = true;
    }
    if (this.seen && !this.seenCounted) {
      row[SEEN] += 1;
      this.seenCounted = true;
    }
    row[SLOT_VISIBLE_MS] += Math.round(this.pendingMs);
    this.pendingMs = 0;
  }
}

function rows(map: Map<string, number[]>) {
  return Array.from(map, ([key, values]) => [
    ...key.split('\t'),
    ...values.map(Math.round)
  ]);
}

function send(body: string) {
  const url = `${BACKEND_URL}${URL_END_POINT.SITE_METRICS}`;
  try {
    if (navigator.sendBeacon?.(url, body)) return;
  } catch {
    // Fall through to fetch when the beacon is refused.
  }
  fetch(url, {
    method: 'POST',
    body,
    keepalive: true,
    credentials: 'omit',
    mode: 'no-cors'
  }).catch(() => undefined);
}

function flush() {
  const now = Date.now();
  accruePage(now);
  trackers.forEach((tracker) => tracker.settle(now));
  lastFlush = now;
  if (!slotCounters.size && !pageCounters.size && !bidderCounters.size) return;
  const body = JSON.stringify({
    p: rows(pageCounters),
    s: rows(slotCounters),
    b: rows(bidderCounters)
  });
  slotCounters.clear();
  pageCounters.clear();
  bidderCounters.clear();
  send(body);
}

function onVisibilityChange() {
  const now = Date.now();
  accruePage(now);
  trackers.forEach((tracker) => tracker.accrue(now));
  pageVisible = document.visibilityState === 'visible';
  if (!pageVisible && now - lastFlush >= MIN_FLUSH_GAP_MS) flush();
}

function onWindowBlur() {
  window.setTimeout(() => {
    const active = document.activeElement;
    if (!clickArmed || !currentPage || !(active instanceof HTMLIFrameElement))
      return;
    const slot = active.closest('[data-ad]');
    const placement = slot && placementFromElement(slot);
    if (!placement) return;
    clickArmed = false;
    slotRow(currentPage, placement)[CLICKS] += 1;
  }, 0);
}

function onIntersection(entries: IntersectionObserverEntry[]) {
  const now = Date.now();
  for (const entry of entries) {
    const tracker = trackers.get(entry.target);
    if (!tracker) continue;
    const inView =
      entry.isIntersecting && entry.intersectionRatio >= IN_VIEW_RATIO;
    if (inView !== tracker.inView) tracker.setInView(inView, now);
  }
}

function installListeners() {
  if (listenersInstalled) return;
  listenersInstalled = true;
  pageVisible = document.visibilityState === 'visible';
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', flush);
  window.addEventListener('blur', onWindowBlur);
  window.addEventListener('focus', () => {
    clickArmed = true;
  });
  window.setInterval(flush, FLUSH_INTERVAL_MS);
}

function checkAdblock(): Promise<boolean> {
  const check = window.reviq?.checkAdblock;
  if (typeof check !== 'function') return Promise.resolve(false);
  return Promise.resolve(check())
    .then(Boolean)
    .catch(() => false);
}

export function beginAdPageView(pathname: string) {
  installListeners();
  const now = Date.now();
  accruePage(now);
  currentPage = adPageKey(pathname);
  if (!currentPage) return;
  const page = currentPage;
  pageRow(page)[VIEWS] += 1;
  checkAdblock().then((blocked) => {
    if (blocked) pageRow(page)[ADBLOCK_VIEWS] += 1;
  });
}

export function endAdPageView() {
  const now = Date.now();
  accruePage(now);
  currentPage = null;
  if (now - lastFlush >= MIN_FLUSH_GAP_MS) flush();
}

export function observeAdSlot(el: HTMLElement): () => void {
  const page = adPageKey(window.location.pathname);
  if (!page || typeof IntersectionObserver === 'undefined') return noop;
  observer ??= new IntersectionObserver(onIntersection, {
    threshold: [0, IN_VIEW_RATIO]
  });
  trackers.set(el, new SlotTracker(el, page));
  observer.observe(el);
  return () => {
    trackers.get(el)?.settle(Date.now());
    trackers.delete(el);
    observer?.unobserve(el);
  };
}

function onSlotRenderEnded({ slot, isEmpty }: GptSlotEvent) {
  const placement = currentPage && placementFromSlot(slot);
  if (!currentPage || !placement) return;
  const row = slotRow(currentPage, placement);
  row[REQUESTS] += 1;
  if (isEmpty) return;
  row[FILLED] += 1;
  const best = micros(bestBids.get(slot.getSlotElementId()));
  if (best > 0) {
    row[FILL_BID_MICROS] += best;
    row[PRICED_FILLS] += 1;
  }
}

function onImpressionViewable({ slot }: GptSlotEvent) {
  const placement = currentPage && placementFromSlot(slot);
  if (!currentPage || !placement) return;
  slotRow(currentPage, placement)[VIEWABLE] += 1;
}

function onAuctionInit(args: { adUnitCodes?: string[] }) {
  args?.adUnitCodes?.forEach((code) => bestBids.delete(code));
}

function onBidResponse(bid: PrebidBid) {
  if (!currentPage || !bid?.adUnitCode || !(Number(bid.cpm) > 0)) return;
  const cpm = Number(bid.cpm);
  bestBids.set(
    bid.adUnitCode,
    Math.max(bestBids.get(bid.adUnitCode) ?? 0, cpm)
  );
  if (bid.bidderCode) bidderRow(bid.bidderCode)[BIDS] += 1;
}

function onBidWon(bid: PrebidBid) {
  const placement =
    bid?.adUnitCode &&
    (placementFromSlotId(bid.adUnitCode) ?? cleanPlacement(bid.adUnitCode));
  if (!currentPage || !placement) return;
  const value = micros(bid.cpm);
  const row = slotRow(currentPage, placement);
  row[PREBID_WINS] += 1;
  row[PREBID_MICROS] += value;
  if (bid.bidderCode) {
    const bidder = bidderRow(bid.bidderCode);
    bidder[WINS] += 1;
    bidder[WIN_MICROS] += value;
  }
}

export function startAdAnalytics() {
  if (providerStarted) return;
  providerStarted = true;
  const w = window as AdWindow;

  w.googletag = w.googletag || { cmd: [] };
  w.googletag.cmd.push(() => {
    gptReady = true;
    const pubads = w.googletag?.pubads?.();
    pubads?.addEventListener('slotRenderEnded', onSlotRenderEnded);
    pubads?.addEventListener('impressionViewable', onImpressionViewable);
  });

  w.pbjs = w.pbjs || { que: [] };
  w.pbjs.que = w.pbjs.que || [];
  w.pbjs.que.push(() => {
    w.pbjs?.onEvent?.('auctionInit', onAuctionInit);
    w.pbjs?.onEvent?.('bidResponse', onBidResponse);
    w.pbjs?.onEvent?.('bidWon', onBidWon);
  });
}
