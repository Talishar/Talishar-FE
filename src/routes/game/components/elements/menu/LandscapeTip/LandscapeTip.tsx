import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import { MdClose } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { QUERY_STATUS } from 'appConstants';
import { getGameInfo } from 'features/game/GameSlice';
import {
  getSettingsEntity,
  getSettingsStatus,
  updateOptions
} from 'features/options/optionsSlice';
import { LANDSCAPE_TIP_SEEN } from 'features/options/constants';
import useAuth from 'hooks/useAuth';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { canLockLandscape, lockLandscape } from 'utils/gameFullscreen';
import { FANNED_HAND_MOBILE_QUERY } from '../../../zones/playerHand/fanLayout';
import { useFannedHand } from '../../../zones/playerHand/useFannedHand';
import { useShowsLandscapeFan } from '../../../zones/playerHand/useShowsLandscapeFan';
import styles from './LandscapeTip.module.css';

const SHOW_DELAY_MS = 4500;

type TipPosition = {
  top: number;
  left: number;
  width: number;
  arrowLeft: number;
};

export default function LandscapeTip({
  anchorRef
}: {
  anchorRef: RefObject<HTMLButtonElement>;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const { isLoggedIn } = useAuth();
  const settingsLoaded = useAppSelector(
    (state: RootState) => getSettingsStatus(state) === QUERY_STATUS.SUCCESS
  );
  const flagEntity = useAppSelector(
    (state: RootState) => getSettingsEntity(state)[LANDSCAPE_TIP_SEEN]
  );
  const flagLoaded = flagEntity !== undefined;
  const seen = flagEntity?.value === '1';
  const fannedHand = useFannedHand();
  const isMobile = useMediaQuery(FANNED_HAND_MOBILE_QUERY);
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const inLandscapeFan = useShowsLandscapeFan();
  const boardLoaded = useAppSelector(
    (state: RootState) => !!state.game.playerOne?.Hero?.cardNumber
  );
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TipPosition | null>(null);
  const requested = useRef(false);

  const needsFlag = isLoggedIn && settingsLoaded && flagLoaded && !seen;
  const eligible =
    needsFlag &&
    boardLoaded &&
    fannedHand &&
    isMobile &&
    isPortrait &&
    Math.max(window.screen.width, window.screen.height) <= 1199;

  const markSeen = useCallback(() => {
    requested.current = true;
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: LANDSCAPE_TIP_SEEN, value: '1' }]
      })
    );
  }, [dispatch, gameInfo]);

  useEffect(() => {
    if (needsFlag && inLandscapeFan && !requested.current) markSeen();
  }, [needsFlag, inLandscapeFan, markSeen]);

  useEffect(() => {
    if (!eligible || requested.current) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      markSeen();
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [eligible, markSeen]);

  useEffect(() => {
    if (!isPortrait) setOpen(false);
  }, [isPortrait]);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(280, window.innerWidth - 16);
      const left = Math.min(
        Math.max(rect.right - width, 8),
        window.innerWidth - 8 - width
      );
      setPosition({
        top: rect.bottom + 10,
        left,
        width,
        arrowLeft: rect.left + rect.width / 2 - left
      });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open, anchorRef]);

  if (!open || !position) return null;

  const canLock = canLockLandscape();
  const close = () => setOpen(false);
  const tryItOut = () => {
    lockLandscape();
    setOpen(false);
  };

  return (
    <div
      className={styles.tip}
      role="dialog"
      style={
        {
          top: position.top,
          left: position.left,
          width: position.width,
          '--arrow-left': `${position.arrowLeft}px`
        } as React.CSSProperties
      }
    >
      <button
        className={styles.close}
        aria-label={t('MENU.LANDSCAPE_TIP.CLOSE')}
        onClick={close}
      >
        <MdClose aria-hidden="true" />
      </button>
      <p className={styles.text}>{t('MENU.LANDSCAPE_TIP.TEXT')}</p>
      {!canLock && (
        <p className={styles.hint}>{t('MENU.LANDSCAPE_TIP.ROTATE_HINT')}</p>
      )}
      <div className={styles.actions}>
        {canLock ? (
          <>
            <button className={styles.secondary} onClick={close}>
              {t('MENU.LANDSCAPE_TIP.NOT_NOW')}
            </button>
            <button className={styles.primary} onClick={tryItOut}>
              {t('MENU.LANDSCAPE_TIP.TRY_IT_OUT')}
            </button>
          </>
        ) : (
          <button className={styles.primary} onClick={close}>
            {t('MENU.LANDSCAPE_TIP.GOT_IT')}
          </button>
        )}
      </div>
    </div>
  );
}
