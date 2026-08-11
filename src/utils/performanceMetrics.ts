export interface TalisharPerformanceMetric {
  name: string;
  value: number;
  rating?: string;
  id?: string;
  path: string;
  timestamp: number;
}

const endpoint = import.meta.env.VITE_PERFORMANCE_ENDPOINT as
  | string
  | undefined;
const pendingMetrics: TalisharPerformanceMetric[] = [];
let flushTimer: number | null = null;
let pageHideRegistered = false;

function flushPerformanceMetrics(): void {
  if (!endpoint || pendingMetrics.length === 0) return;
  if (flushTimer !== null) {
    window.clearTimeout(flushTimer);
    flushTimer = null;
  }

  const body = JSON.stringify(pendingMetrics.splice(0, pendingMetrics.length));
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      endpoint,
      new Blob([body], { type: 'application/json' })
    );
    return;
  }

  void fetch(endpoint, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    credentials: 'omit'
  });
}

function queuePerformanceMetric(metric: TalisharPerformanceMetric): void {
  pendingMetrics.push(metric);
  if (pendingMetrics.length >= 50) {
    flushPerformanceMetrics();
    return;
  }
  if (flushTimer === null) {
    flushTimer = window.setTimeout(flushPerformanceMetrics, 10000);
  }
  if (!pageHideRegistered) {
    window.addEventListener('pagehide', flushPerformanceMetrics);
    pageHideRegistered = true;
  }
}

export function reportPerformanceMetric(
  metric: Omit<TalisharPerformanceMetric, 'path' | 'timestamp'>
): void {
  const payload: TalisharPerformanceMetric = {
    ...metric,
    path: window.location.pathname,
    timestamp: Date.now()
  };

  window.dispatchEvent(
    new CustomEvent<TalisharPerformanceMetric>('talishar:performance', {
      detail: payload
    })
  );

  if (!endpoint) return;

  queuePerformanceMetric(payload);
}

export function measureDuration<T>(name: string, operation: () => T): T {
  const startedAt = performance.now();
  try {
    return operation();
  } finally {
    reportPerformanceMetric({ name, value: performance.now() - startedAt });
  }
}

export function observeLongTasks(): () => void {
  if (!('PerformanceObserver' in window)) return () => undefined;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        reportPerformanceMetric({
          name: 'long-task',
          value: entry.duration
        });
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
    return () => observer.disconnect();
  } catch {
    return () => undefined;
  }
}
