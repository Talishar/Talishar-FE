import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import styles from './EndGameScreen.module.css';
import {
  useGetHeroMasteryQuery,
  useGetPopUpContentQuery
} from 'features/api/apiSlice';
import { END_GAME_STATS, PROCESS_INPUT } from 'appConstants';
import { getGameInfo, submitButton } from 'features/game/GameSlice';
import EndGameStats, {
  type EndGameData,
  type EndGameStatsRef
} from '../endGameStats/EndGameStats';
import EndGameMenuOptions from '../endGameMenuOptions/EndGameMenuOptions';
import { shallowEqual } from 'react-redux';
import useShowModal from 'hooks/useShowModals';
import { FaEye, FaEyeSlash, FaEllipsisH, FaExchangeAlt } from 'react-icons/fa';
import classNames from 'classnames';
import { PiFileCsvFill, PiCameraFill } from 'react-icons/pi';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import useSupporterStatus from 'hooks/useSupporterStatus';
import MetafyLogo from 'img/MetafyGradient.svg';
import { useTranslation } from 'react-i18next';
import useAuth from 'hooks/useAuth';
import MasteryProgressCard from 'features/mastery/MasteryProgressCard';
import { RootState } from 'app/Store';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { PHONE_LANDSCAPE_QUERY } from 'routes/game/lobby/phoneLandscape';
import { frameHost } from 'routes/game/play/forcedLayout/forcedLayout';

const END_GAME_OPEN_BODY_CLASS = 'endGameOpen';
const SUMMARY_REM_PER_EM = 1.25;
const MIN_SUMMARY_ZOOM = 0.6;

const EndGameScreen = () => {
  const dispatch = useAppDispatch();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const playerOneHero = useAppSelector(
    (state: RootState) => state.game.playerOne.Hero?.cardNumber
  );
  const playerTwoHero = useAppSelector(
    (state: RootState) => state.game.playerTwo.Hero?.cardNumber
  );
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [playerID, setPlayerID] = useState(gameInfo.playerID === 2 ? 2 : 1);
  const [showStats, setShowStats] = useState(true);
  const [bothPlayersData, setBothPlayersData] = useState<{
    [key: number]: any;
  }>({});
  const [moreOpen, setMoreOpen] = useState(false);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const { isSupporter } = useSupporterStatus();
  const endGameStatsRef = useRef<EndGameStatsRef>(null);
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameID: gameInfo.gameID,
    playerID: playerID,
    authKey: gameInfo.authKey,
    popupType: END_GAME_STATS
  });
  const masteryGameIdentifier = gameInfo.gameGUID || gameInfo.gameID;
  const { data: masteryData } = useGetHeroMasteryQuery(
    { gameKey: `talishar:${masteryGameIdentifier}`, scope: 'award' },
    { skip: !isLoggedIn }
  );

  // Cache both players' data as they're loaded
  React.useEffect(() => {
    if (data && playerID) {
      setBothPlayersData((prev) => ({
        ...prev,
        [playerID]: data
      }));
    }
  }, [data, playerID]);
  const showModal = useShowModal();
  const isPhoneLandscape = useMediaQuery(
    frameHost
      ? PHONE_LANDSCAPE_QUERY.replace('(pointer: coarse)', '(pointer)')
      : PHONE_LANDSCAPE_QUERY
  );
  React.useLayoutEffect(() => {
    if (!showModal || !showStats) return;
    document.body.classList.add(END_GAME_OPEN_BODY_CLASS);
    return () => document.body.classList.remove(END_GAME_OPEN_BODY_CLASS);
  }, [showModal, showStats]);
  const isNarrow = useMediaQuery('(max-width: 1200px)');
  const boxRef = useRef<HTMLDivElement>(null);
  const [summaryZoom, setSummaryZoom] = useState(1);
  React.useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box || isNarrow || isPhoneLandscape) {
      setSummaryZoom(1);
      return;
    }
    const update = () => {
      const em = parseFloat(getComputedStyle(box).fontSize);
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      setSummaryZoom(
        Math.min(1, Math.max(MIN_SUMMARY_ZOOM, (em * SUMMARY_REM_PER_EM) / rem))
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, [showModal, isNarrow, isPhoneLandscape]);
  const cardListBoxStyle =
    summaryZoom < 1
      ? ({ '--summary-zoom': summaryZoom } as React.CSSProperties)
      : undefined;  const cardListBoxClasses = classNames(styles.cardListBox, {
    [styles.reduced]: !showStats
  });
  // Extract heroes from API data first (most reliable source)
  // If API doesn't have them, try gameState as fallback
  const yourHero =
    data?.yourHero ||
    (playerID === 1 ? playerOneHero : playerTwoHero) ||
    null;

  // For opponent hero: get from API data first, then fallback to gameState
  const opponentPlayerID = playerID === 1 ? 2 : 1;
  const opponentHero =
    data?.opponentHero ||
    (opponentPlayerID === 1 ? playerOneHero : playerTwoHero) ||
    null;

  if (!showModal) return null;

  let content;

  if (isLoading) {
    content = <div>{t('END_GAME.LOADING')}</div>;
  } else if (error) {
    content = <div>{JSON.stringify(error)}</div>;
  } else {
    const endGameDataWithHeroes: EndGameData = {
      ...(data as EndGameData),
      yourHero: yourHero,
      opponentHero: opponentHero,
      playerID: playerID,
      authKey: gameInfo.authKey,
      gameID: gameInfo.gameID?.toString(),
      bothPlayersData: bothPlayersData
    };
    const masteryProgress = masteryData?.gameAward ? (
      <MasteryProgressCard
        heroId={masteryData.gameAward.heroId}
        games={masteryData.gameAward.gamesAfter}
        level={masteryData.gameAward.levelAfter}
        nextThreshold={masteryData.gameAward.nextThreshold}
        gamesToNext={masteryData.gameAward.gamesToNext}
        unlocked={masteryData.gameAward.unlocked}
        compact
        showPortrait
        oneLine={isPhoneLandscape}
      />
    ) : undefined;

    content = (
      <EndGameStats
        ref={endGameStatsRef}
        {...endGameDataWithHeroes}
        masteryProgress={masteryProgress}
      />
    );
  }

  const switchPlayer = () => {
    playerID === 2 ? setPlayerID(1) : setPlayerID(2);
  };

  const toggleShowStats = () => {
    setShowStats(!showStats);
  };

  const handleSwapHeroesRematch = () => {
    dispatch(
      submitButton({ button: { mode: PROCESS_INPUT.SWAP_HEROES_REMATCH } })
    );
    setMoreOpen(false);
  };

  const handleExportStats = () => {
    if (!endGameStatsRef.current) {
      console.error('Export ref not available');
      return;
    }
    endGameStatsRef.current.exportScreenshot();
    setMoreOpen(false);
  };

  const handleExportCSV = async () => {
    if (!endGameStatsRef.current) {
      console.error('Export CSV ref not available');
      return;
    }
    await endGameStatsRef.current.exportCSV();
    setMoreOpen(false);
  };

  const handleOpenMore = () => {
    if (!moreOpen && moreBtnRef.current) {
      const rect = moreBtnRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right)
      });
    }
    setMoreOpen((v) => !v);
  };

  return (
    <div className={cardListBoxClasses} style={cardListBoxStyle} ref={boxRef}>
      {showStats && (
        <>
          <div className={styles.cardListTitleContainer}>
            <div className={styles.cardListTitle}>
              <h2 className={styles.title}>{t('END_GAME.GAME_SUMMARY')}</h2>
              <div className={styles.menuOptionsWrapper}>
                <EndGameMenuOptions onSwitchPlayer={switchPlayer} />
              </div>
              <div className={styles.buttonGroup}>
                <button
                  ref={moreBtnRef}
                  className={styles.buttonDiv}
                  onClick={handleOpenMore}
                  aria-label={t('END_GAME.MORE_OPTIONS')}
                >
                  <FaEllipsisH aria-hidden="true" />
                  &nbsp;{t('END_GAME.MORE')}
                </button>
                {moreOpen &&
                  ReactDOM.createPortal(
                    <>
                      <div
                        className={styles.dropdownBackdrop}
                        onClick={() => setMoreOpen(false)}
                      />
                      <div className={styles.dropdownMenu} style={menuStyle}>
                        <button
                          className={styles.dropdownItem}
                          onClick={handleSwapHeroesRematch}
                        >
                          <FaExchangeAlt
                            aria-hidden="true"
                            className={styles.dropdownIcon}
                          />{' '}
                          {t('END_GAME.SWAP_AND_REMATCH')}
                        </button>
                        <button
                          className={styles.dropdownItem}
                          onClick={handleExportStats}
                        >
                          <PiCameraFill
                            aria-hidden="true"
                            className={styles.dropdownIcon}
                          />{' '}
                          {t('END_GAME.EXPORT_AS_IMAGE')}
                        </button>
                        <button
                          className={styles.dropdownItem}
                          onClick={handleExportCSV}
                        >
                          <PiFileCsvFill
                            aria-hidden="true"
                            className={styles.dropdownIcon}
                            style={{ fontSize: '1.6em' }}
                          />{' '}
                          {t('END_GAME.EXPORT_AS_CSV')}
                        </button>
                      </div>
                    </>,
                    document.body
                  )}
                <button
                  type="button"
                  className={`${styles.buttonDiv} ${styles.iconButton}`}
                  onClick={toggleShowStats}
                  aria-label={t('END_GAME.HIDE_STATS')}
                >
                  <FaEye aria-hidden="true" fontSize={'1.5em'} />
                </button>
              </div>
            </div>
          </div>
          {!isSupporter && !isLoading && !error && (
            <div className={styles.supportCta}>
              <a
                href={TALISHAR_METAFY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.supportCtaLink}
              >
                <img
                  src={MetafyLogo}
                  alt={t('END_GAME.METAFY')}
                  className={styles.supportCtaLogo}
                />
                <span className={styles.supportCtaText}>
                  {t('END_GAME.SUPPORT_CTA_TITLE')}
                </span>
                <span className={styles.supportCtaAction}>
                  {t('END_GAME.SUPPORT_CTA_ACTION')}
                </span>
              </a>
            </div>
          )}
          <div className={styles.scaled}>{content}</div>
        </>
      )}
      {!showStats && (
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h2 className={styles.title}>{t('END_GAME.GAME_SUMMARY')}</h2>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.buttonDiv} ${styles.iconButton}`}
                onClick={toggleShowStats}
                aria-label={t('END_GAME.SHOW_STATS')}
              >
                <FaEyeSlash aria-hidden="true" fontSize={'1.5em'} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EndGameScreen);
