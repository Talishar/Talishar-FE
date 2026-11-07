import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import ReactDOM from 'react-dom';
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
import { FANNED_HAND_TIP_SEEN } from 'features/options/constants';
import { isUnset } from 'features/settings/syncedValues';
import useAuth from 'hooks/useAuth';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useCookieValue } from 'utils/cookieStore';
import { frameHost } from 'routes/game/play/forcedLayout/forcedLayout';
import {
  ENABLE_FANNED_HAND_PC_COOKIE,
  FANNED_HAND_MOBILE_QUERY
} from '../../../zones/playerHand/fanLayout';
import styles from '../LandscapeTip/LandscapeTip.module.css';

const SHOW_DELAY_MS = 4500;

type TipPosition = {
  top: number;
  left: number;
  width: number;
  arrowLeft: number;
};

export default function FannedHandTip({
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
    (state: RootState) => getSettingsEntity(state)[FANNED_HAND_TIP_SEEN]
  );
  const flagLoaded = flagEntity !== undefined;
  const seen = flagEntity?.value === '1';
  const isMobile = useMediaQuery(FANNED_HAND_MOBILE_QUERY);
  const onByDefault = isUnset(useCookieValue(ENABLE_FANNED_HAND_PC_COOKIE));
  const optionsOpen = useAppSelector(
    (state: RootState) => !!state.game.optionsMenu?.active
  );
  const boardLoaded = useAppSelector(
    (state: RootState) => !!state.game.playerOne?.Hero?.cardNumber
  );
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TipPosition | null>(null);
  const requested = useRef(false);

  const eligible =
    isLoggedIn &&
    settingsLoaded &&
    flagLoaded &&
    !seen &&
    boardLoaded &&
    !isMobile &&
    onByDefault &&
    !optionsOpen &&
    !frameHost;

  const markSeen = useCallback(() => {
    requested.current = true;
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [{ name: FANNED_HAND_TIP_SEEN, value: '1' }]
      })
    );
  }, [dispatch, gameInfo]);

  useEffect(() => {
    if (!eligible || requested.current) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      markSeen();
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [eligible, markSeen]);

  useEffect(() => {
    if (isMobile || optionsOpen) setOpen(false);
  }, [isMobile, optionsOpen]);

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

  const close = () => setOpen(false);

  return ReactDOM.createPortal(
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
        aria-label={t('MENU.FANNED_HAND_TIP.CLOSE')}
        onClick={close}
      >
        <MdClose aria-hidden="true" />
      </button>
      <p className={styles.text}>{t('MENU.FANNED_HAND_TIP.TEXT')}</p>
      <div className={styles.actions}>
        <button className={styles.primary} onClick={close}>
          {t('MENU.FANNED_HAND_TIP.GOT_IT')}
        </button>
      </div>
    </div>,
    document.body
  );
}
