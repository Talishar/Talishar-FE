import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import styles from './EndGameScreen.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import { END_GAME_STATS, PROCESS_INPUT } from 'appConstants';
import { getGameInfo, submitButton } from 'features/game/GameSlice';
import EndGameStats, {
  EndGameData,
  EndGameStatsRef
} from '../endGameStats/EndGameStats';
import EndGameMenuOptions from '../endGameMenuOptions/EndGameMenuOptions';
import { shallowEqual } from 'react-redux';
import useShowModal from 'hooks/useShowModals';
import { FaEye, FaEyeSlash, FaEllipsisH, FaList, FaExchangeAlt } from 'react-icons/fa';
import classNames from 'classnames';
import useAuth from 'hooks/useAuth';
import { PiFileCsvFill, PiCameraFill } from 'react-icons/pi';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import useSupporterStatus from 'hooks/useSupporterStatus';
import MetafyLogo from 'img/MetafyGradient.svg';

const EndGameScreen = () => {
  const dispatch = useAppDispatch();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const gameState = useAppSelector((state: any) => state.game, shallowEqual);
  const [playerID, setPlayerID] = useState(gameInfo.playerID === 2 ? 2 : 1);
  const [showStats, setShowStats] = useState(true);
  const [showFullLog, setShowFullLog] = useState(false);
  const [bothPlayersData, setBothPlayersData] = useState<{
    [key: number]: any;
  }>({});
  const [moreOpen, setMoreOpen] = useState(false);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const { isPatron } = useAuth();
  const { isSupporter } = useSupporterStatus();
  const endGameStatsRef = useRef<EndGameStatsRef>(null);
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameID: gameInfo.gameID,
    playerID: playerID,
    authKey: gameInfo.authKey,
    popupType: END_GAME_STATS
  });

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
  const cardListBoxClasses = classNames(styles.cardListBox, {
    [styles.reduced]: !showStats
  });
  const fullLogClasses = classNames(styles.fullLog, {});

  // Extract heroes from API data first (most reliable source)
  // If API doesn't have them, try gameState as fallback
  const yourHero =
    data?.yourHero ||
    (playerID === 1
      ? gameState?.playerOne?.Hero?.cardNumber
      : gameState?.playerTwo?.Hero?.cardNumber) ||
    null;

  // For opponent hero: get from API data first, then fallback to gameState
  const opponentPlayerID = playerID === 1 ? 2 : 1;
  const opponentHero =
    data?.opponentHero ||
    (opponentPlayerID === 1
      ? gameState?.playerOne?.Hero?.cardNumber
      : gameState?.playerTwo?.Hero?.cardNumber) ||
    null;

  if (!showModal) return null;

  let content;

  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (error) {
    content = <div>{JSON.stringify(error)}</div>;
  } else if (showFullLog) {
    if (isPatron) {
      content = data?.fullLog ? (
        <div className={fullLogClasses}>
          {parseHtmlToReactElements(data.fullLog)}
        </div>
      ) : (
        <div>
          Full game log was not recorded for this game. This requires at least one player to be a supporter.
        </div>
      );
    } else {
      content = (
        <div>
          Support our{' '}
          <a href={TALISHAR_METAFY_URL} target="_blank" rel="noopener noreferrer">
            Metafy
          </a>{' '}
          to access this feature.
        </div>
      );
    }
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
    content = <EndGameStats ref={endGameStatsRef} {...endGameDataWithHeroes} />;
  }

  const switchPlayer = () => {
    playerID === 2 ? setPlayerID(1) : setPlayerID(2);
  };

  const toggleShowStats = () => {
    setShowStats(!showStats);
  };

  const toggleShowFullLog = () => {
    setShowFullLog(!showFullLog);
    setMoreOpen(false);
  };

  const handleSwapHeroesRematch = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.SWAP_HEROES_REMATCH } }));
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
    <div className={cardListBoxClasses}>
      {showStats && (
        <>
          <div className={styles.cardListTitleContainer}>
            <div className={styles.cardListTitle}>
              <h2 className={styles.title}>Game Summary</h2>
              <div className={styles.menuOptionsWrapper}>
                <EndGameMenuOptions onSwitchPlayer={switchPlayer} />
              </div>
              <div className={styles.buttonGroup}>
                <button
                  ref={moreBtnRef}
                  className={styles.buttonDiv}
                  onClick={handleOpenMore}
                  aria-label="More options"
                >
                  <FaEllipsisH aria-hidden="true" />&nbsp;More
                </button>
                {moreOpen && ReactDOM.createPortal(
                  <>
                    <div
                      className={styles.dropdownBackdrop}
                      onClick={() => setMoreOpen(false)}
                    />
                    <div className={styles.dropdownMenu} style={menuStyle}>
                      {!gameInfo.roguelikeGameID && (
                        <button className={styles.dropdownItem} onClick={handleSwapHeroesRematch}>
                          <FaExchangeAlt aria-hidden="true" className={styles.dropdownIcon} /> Swap &amp; rematch
                        </button>
                      )}
                      {!showFullLog && (
                        <>
                          <button className={styles.dropdownItem} onClick={handleExportStats}>
                            <PiCameraFill aria-hidden="true" className={styles.dropdownIcon} /> Export as Image
                          </button>
                          <button className={styles.dropdownItem} onClick={handleExportCSV}>
                            <PiFileCsvFill aria-hidden="true" className={styles.dropdownIcon} style={{ fontSize: '1.6em' }} /> Export as CSV
                          </button>
                        </>
                      )}
{/*                       <button className={styles.dropdownItem} onClick={toggleShowFullLog}>
                        <FaList aria-hidden="true" className={styles.dropdownIcon} /> {showFullLog ? 'Back to Stats' : 'Full Game Log'}
                      </button> */}
                    </div>
                  </>,
                  document.body
                )}
                <div className={styles.buttonDiv} onClick={toggleShowStats}>
                  <FaEye aria-hidden="true" fontSize={'1.5em'} />
                </div>
              </div>
            </div>
          </div>
          {!isSupporter && !isLoading && !error && (
            <a
              href={TALISHAR_METAFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.supportCta}
            >
              <img src={MetafyLogo} alt="Metafy" className={styles.supportCtaLogo} />
              <span className={styles.supportCtaText}>
                Enjoyed the game? Help Us Keep Talishar Free
              </span>
              <span className={styles.supportCtaAction}>Support us</span>
            </a>
          )}
          {content}
        </>
      )}
      {!showStats && (
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h2 className={styles.title}>Game Summary</h2>
            <div className={styles.buttonGroup}>
              <div className={styles.buttonDiv} onClick={toggleShowStats}>
                <FaEyeSlash aria-hidden="true" fontSize={'1.5em'} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndGameScreen;
