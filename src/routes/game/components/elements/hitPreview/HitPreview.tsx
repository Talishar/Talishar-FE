import { useEffect, useLayoutEffect, useState } from 'react';
import classNames from 'classnames';
import { shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import ParseGameState from 'app/ParseGameState';
import { apiSlice } from 'features/api/apiSlice';
import {
  getGameInfo,
  hideHitPreview,
  showHitPreview
} from 'features/game/GameSlice';
import {
  HitPreviewMark,
  selectIsHitPreviewing
} from 'features/game/hitPreview';
import { useCookieString } from 'utils/cookieStore';
import styles from './HitPreview.module.css';

const SHUT_EYE = [
  'M9,50 Q50,64 91,50 Q50,66 9,50Z',
  'M28,59 L23,67 M39,63 L36,72 M50,64.5 L50,74 M61,63 L64,72 M72,59 L77,67'
];

type Placement = { left: number; top: number; width: number; height: number };

export const hitPreviewGlow = (glow: HitPreviewMark['glow']) =>
  glow && styles[`${glow}Glow`];

export const hitPreviewBadge = (value?: number | string, className?: string) =>
  value ? (
    <span
      className={classNames(
        styles.badge,
        { [styles.loss]: Number(value) < 0 },
        className
      )}
      aria-hidden="true"
    >
      {typeof value === 'string'
        ? value
        : value > 0
        ? `+${value}`
        : `−${-value}`}
    </span>
  ) : null;

const measurePlacement = (anchors: HTMLElement[]): Placement | null => {
  const rects: Record<string, DOMRect[]> = {};
  for (const anchor of anchors) {
    const rect = anchor.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    for (const name of (anchor.dataset.hitPreview ?? '').split(' ')) {
      (rects[name] ??= []).push(rect);
    }
  }
  const board = rects.board?.[0];
  if (!board) return null;
  const rows = (rects.permanents ?? []).sort((a, b) => a.top - b.top);
  const top =
    rows.length >= 2
      ? (rows[0].bottom + rows[rows.length - 1].top) / 2
      : board.top + board.height / 2;
  const effects = rects.effects?.find((rect) => rect.width >= 20);
  const head = rects.head?.[0];
  if (!effects || !head) {
    return { left: board.left + 19, top, width: 34, height: 34 };
  }
  const size = Math.round(head.width * 0.46);
  const tab = rects.tab?.[0];
  return {
    left: effects.left + effects.width / 2,
    top: tab ? tab.top - 6 - size / 2 : top,
    width: size,
    height: size
  };
};

const useEyePlacement = (enabled: boolean): Placement | null => {
  const [placement, setPlacement] = useState<Placement | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const observed = new Set<Element>();
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    const mutations = new MutationObserver(schedule);
    const update = () => {
      frame = 0;
      const anchors = Array.from(
        document.querySelectorAll<HTMLElement>('[data-hit-preview]')
      );
      observed.forEach((element) => {
        if (element.isConnected) return;
        resize.unobserve(element);
        observed.delete(element);
      });
      anchors.forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        resize.observe(element);
      });
      const next = measurePlacement(anchors);
      setPlacement((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next
      );
    };
    resize.observe(document.documentElement);
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      resize.disconnect();
      mutations.disconnect();
    };
  }, [enabled]);

  return enabled ? placement : null;
};

export default function HitPreviewEye() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { gameID, playerID, authKey, isReplay } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const enabled = useCookieString('hitPreviewEye') === 'true' && !isReplay;
  const isOpen = useAppSelector((state) => !!state.game.hitPreviewOpen);
  const lastUpdate = useAppSelector(
    (state) => state.game.gameDynamicInfo.lastUpdate ?? 0
  );
  const previewing = useAppSelector(selectIsHitPreviewing);
  const [hoveredAt, setHoveredAt] = useState<number | null>(null);
  const [fetchPreview] = apiSlice.endpoints.getPopUpContent.useLazyQuery();
  const placement = useEyePlacement(enabled);
  const highlighted = isOpen && hoveredAt === lastUpdate;
  const active = enabled && highlighted;

  useEffect(() => {
    if (!active) {
      dispatch(hideHitPreview());
      return;
    }
    if (previewing) return;
    let cancelled = false;
    fetchPreview(
      { gameID, playerID, authKey, popupType: 'hitPreview', lastUpdate },
      true
    )
      .unwrap()
      .then((data) => {
        if (cancelled || !data || typeof data !== 'object' || data.error) {
          return;
        }
        dispatch(
          showHitPreview({
            preview: ParseGameState(data),
            changes: Array.isArray(data.hitPreview) ? data.hitPreview : []
          })
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [
    active,
    previewing,
    gameID,
    playerID,
    authKey,
    lastUpdate,
    fetchPreview,
    dispatch
  ]);

  useEffect(() => () => void dispatch(hideHitPreview()), [dispatch]);

  useEffect(() => {
    document.body.classList.toggle('hitPreviewActive', previewing);
    return () => document.body.classList.remove('hitPreviewActive');
  }, [previewing]);

  if (!enabled || !placement) return null;

  return (
    <>
      {previewing && <div className={styles.veil} />}
      <button
        type="button"
        className={classNames(styles.eye, {
          [styles.closed]: !isOpen,
          [styles.highlighted]: highlighted
        })}
        style={placement}
        aria-label={t('SETTINGS.HIT_PREVIEW_EYE_ARIA')}
        aria-disabled={!isOpen}
        data-suppress-touch-menu
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse' && isOpen) setHoveredAt(lastUpdate);
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== 'mouse' && isOpen) setHoveredAt(lastUpdate);
        }}
        onPointerLeave={() => setHoveredAt(null)}
        onPointerUp={(event) => {
          if (event.pointerType !== 'mouse') setHoveredAt(null);
        }}
        onPointerCancel={() => setHoveredAt(null)}
      >
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          fill="none"
          stroke="url(#hitPreviewEyeGold)"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="hitPreviewEyeGold" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0"
                style={{ stopColor: 'var(--theme-primary-hover)' }}
              />
              <stop offset=".5" style={{ stopColor: 'var(--theme-primary)' }} />
              <stop
                offset="1"
                style={{ stopColor: 'var(--theme-primary-focus)' }}
              />
            </linearGradient>
            <radialGradient id="hitPreviewEyeDisc" cx=".5" cy=".42" r=".6">
              <stop
                offset="0"
                style={{ stopColor: 'var(--theme-card-background)' }}
              />
              <stop
                offset="1"
                style={{ stopColor: 'var(--theme-primary-inverse)' }}
              />
            </radialGradient>
            <clipPath id="hitPreviewEyeLens">
              <circle cx="50" cy="50" r="44" />
            </clipPath>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="url(#hitPreviewEyeDisc)"
            stroke="none"
          />
          <image
            href="/images/hitPreviewEye.webp"
            x="6"
            y="6"
            width="88"
            height="88"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#hitPreviewEyeLens)"
            opacity={isOpen ? 1 : 0}
          />
          {!isOpen &&
            SHUT_EYE.map((d) => <path key={d} d={d} strokeWidth="3" />)}
          <circle
            cx="50"
            cy="50"
            r="46"
            strokeWidth={highlighted ? 5.5 : 4.5}
          />
        </svg>
      </button>
    </>
  );
}
