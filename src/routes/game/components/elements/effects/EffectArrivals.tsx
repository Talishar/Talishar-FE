import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { useAppSelector } from 'app/Hooks';
import { Card } from 'features/Card';
import { selectIsP2View, selectSidePlayer } from 'features/game/perspective';
import { useReducedMotionSetting } from 'features/settings/accessibility';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_IMAGES_PATH, getCollectionCardImagePath } from 'utils';
import { generateCroppedImageUrl } from 'utils/cropImages';
import {
  EffectSide,
  effectKeys,
  setEffectArrival
} from './effectArrivalStore';
import styles from './EffectArrivals.module.css';

const MOBILE_QUERY = '(max-width: 1200px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FLY_MS = 420;
const HOLD_MS = 1200;
const HOLD_QUEUED_MS = 1000;
const SHRINK_MS = 480;
const CARD_RATIO = 628 / 450;

interface Arrival {
  uid: number;
  side: EffectSide;
  key: string;
  cardNumber: string;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const boxFrames = (b: Box) => ({
  left: `${b.left}px`,
  top: `${b.top}px`,
  width: `${b.width}px`,
  height: `${b.height}px`
});

const centeredBox = (cx: number, cy: number, width: number): Box => {
  const height = width * CARD_RATIO;
  return { left: cx - width / 2, top: cy - height / 2, width, height };
};

const bigBox = (): Box => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(vw * 0.62, 280, (vh * 0.52) / CARD_RATIO);
  return centeredBox(vw / 2, vh * 0.45, width);
};

const originBox = (): Box => centeredBox(window.innerWidth / 2, -40, 64);

const findSlot = (side: EffectSide, key: string): Box | null => {
  const candidates = document.querySelectorAll<HTMLElement>(
    `[data-effects-side="${side}"] [data-effect-key="${CSS.escape(key)}"]`
  );
  for (const el of Array.from(candidates)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    }
  }
  return null;
};

const preload = (src: string) =>
  Promise.race([
    new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    }),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 500))
  ]);

const ATTACK_TYPES = ['W', 'AA'];

const isAttackSource = (card: Card, attackingCard: string | undefined) =>
  card.cardNumber === attackingCard ||
  (card.type ?? '').split(',').some((t) => ATTACK_TYPES.includes(t));

function useNewEffects(
  side: EffectSide,
  effects: Card[] | undefined,
  attackingCard: string | undefined,
  enabled: boolean,
  perspective: boolean,
  enqueue: (side: EffectSide, key: string, cardNumber: string) => void
) {
  const known = useRef<Set<string> | null>(null);
  const lastPerspective = useRef(perspective);
  const attackingRef = useRef(attackingCard);
  attackingRef.current = attackingCard;

  useLayoutEffect(() => {
    if (effects === undefined) return;
    if (lastPerspective.current !== perspective) {
      lastPerspective.current = perspective;
      known.current = null;
    }
    const keys = effectKeys(effects);
    if (known.current !== null && enabled) {
      const seen = known.current;
      keys.forEach((key, i) => {
        if (seen.has(key)) return;
        if (isAttackSource(effects[i], attackingRef.current)) return;
        setEffectArrival(side, key, 'arriving');
        enqueue(side, key, effects[i].cardNumber);
      });
    }
    known.current = new Set(keys);
  }, [effects, enabled, perspective, side, enqueue]);
}

export default function EffectArrivals() {
  const mobile = useMediaQuery(MOBILE_QUERY);
  const osReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const reducedMotion = useReducedMotionSetting();
  const enabled = mobile && !reducedMotion && !osReducedMotion;
  const perspective = useAppSelector(selectIsP2View);
  const opponentEffects = useAppSelector(
    (state) => selectSidePlayer(state, false).Effects
  );
  const attackingCard = useAppSelector(
    (state) => state.game.activeChainLink?.attackingCard?.cardNumber
  );
  const [queue, setQueue] = useState<Arrival[]>([]);
  const nextUid = useRef(0);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const enqueue = useCallback(
    (side: EffectSide, key: string, cardNumber: string) => {
      const uid = nextUid.current++;
      setQueue((q) => [...q, { uid, side, key, cardNumber }]);
    },
    []
  );

  useNewEffects(
    'opponent',
    opponentEffects,
    attackingCard,
    enabled,
    perspective,
    enqueue
  );

  useEffect(() => {
    if (enabled || queueRef.current.length === 0) return;
    queueRef.current.forEach((a) => setEffectArrival(a.side, a.key, null));
    setQueue([]);
  }, [enabled]);

  const finish = useCallback(() => setQueue((q) => q.slice(1)), []);

  const active = queue[0];
  if (!enabled || !active) return null;
  return (
    <ArrivalCard
      key={active.uid}
      arrival={active}
      hasQueue={queue.length > 1}
      onDone={finish}
    />
  );
}

function ArrivalCard({
  arrival,
  hasQueue,
  onDone
}: {
  arrival: Arrival;
  hasQueue: boolean;
  onDone: () => void;
}) {
  const { side, key, cardNumber } = arrival;
  const { getLanguage } = useLanguageSelector();
  const cardRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<HTMLImageElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const skipHold = useRef<() => void>(() => undefined);
  const hasQueueRef = useRef(hasQueue);
  hasQueueRef.current = hasQueue;

  const fullSrc = getCollectionCardImagePath({
    path: CARD_IMAGES_PATH,
    locale: getLanguage(),
    cardNumber
  });
  const cropSrc = generateCroppedImageUrl(cardNumber);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const full = fullRef.current;
    const crop = cropRef.current;
    const dim = dimRef.current;
    if (!card || !full || !crop || !dim) return;
    let cancelled = false;
    const running: Animation[] = [];
    const play = (
      el: Element,
      frames: Keyframe[],
      duration: number,
      id: string
    ) => {
      const a = el.animate(frames, {
        duration,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards'
      });
      a.id = id;
      running.push(a);
      return a.finished.catch(() => undefined);
    };
    setEffectArrival(side, key, 'arriving');

    const run = async () => {
      const big = bigBox();
      Object.assign(card.style, boxFrames(big));
      card.style.opacity = '0';
      const loaded = await preload(fullSrc);
      if (cancelled) return;
      if (!loaded) {
        setEffectArrival(side, key, null);
        onDone();
        return;
      }

      const start = originBox();
      await Promise.all([
        play(
          card,
          [
            { ...boxFrames(start), opacity: 0 },
            { ...boxFrames(big), opacity: 1 }
          ],
          FLY_MS,
          'fx-arrival-fly'
        ),
        play(dim, [{ opacity: 0 }, { opacity: 1 }], FLY_MS, 'fx-arrival-dim')
      ]);
      if (cancelled) return;

      card.classList.add(styles.holding);
      await new Promise<void>((resolve) => {
        const t = setTimeout(
          resolve,
          hasQueueRef.current ? HOLD_QUEUED_MS : HOLD_MS
        );
        skipHold.current = () => {
          clearTimeout(t);
          resolve();
        };
      });
      card.classList.remove(styles.holding);
      if (cancelled) return;

      const slot = findSlot(side, key);
      const shrink = slot
        ? [
            play(
              card,
              [
                { ...boxFrames(big), borderRadius: '4.5%' },
                { ...boxFrames(slot), borderRadius: '2px' }
              ],
              SHRINK_MS,
              'fx-arrival-shrink'
            ),
            play(
              full,
              [{ opacity: 1 }, { opacity: 0, offset: 0.6 }, { opacity: 0 }],
              SHRINK_MS,
              'fx-arrival-full'
            ),
            play(
              crop,
              [{ opacity: 0 }, { opacity: 1, offset: 0.6 }, { opacity: 1 }],
              SHRINK_MS,
              'fx-arrival-crop'
            )
          ]
        : [
            play(
              card,
              [{ opacity: 1 }, { opacity: 0 }],
              250,
              'fx-arrival-fade'
            )
          ];
      await Promise.all([
        ...shrink,
        play(dim, [{ opacity: 1 }, { opacity: 0 }], SHRINK_MS, 'fx-arrival-undim')
      ]);
      if (cancelled) return;

      setEffectArrival(side, key, null);
      onDone();
    };
    run();

    return () => {
      cancelled = true;
      skipHold.current();
      running.forEach((a) => a.cancel());
      setEffectArrival(side, key, null);
    };
  }, [side, key, fullSrc, onDone]);

  return (
    <div className={styles.layer} aria-hidden>
      <div ref={dimRef} className={styles.dim} />
      <div
        ref={cardRef}
        className={side === 'player' ? styles.cardPlayer : styles.cardOpponent}
        onPointerDown={() => skipHold.current()}
      >
        <img ref={fullRef} className={styles.full} src={fullSrc} alt="" />
        <img ref={cropRef} className={styles.crop} src={cropSrc} alt="" />
      </div>
    </div>
  );
}
