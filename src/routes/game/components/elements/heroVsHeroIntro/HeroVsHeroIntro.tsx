import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { markHeroIntroAsShown } from 'features/game/GameSlice';
import { getSettingsEntity } from 'features/options/optionsSlice';
import styles from './HeroVsHeroIntro.module.css';

const HeroVsHeroIntro = () => {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state: any) => state.game, shallowEqual);
  const settingsData = useAppSelector(getSettingsEntity);
  const [isVisible, setIsVisible] = useState(true);
  
  const gameID = gameState?.gameInfo?.gameID;
  const playerID = gameState?.gameInfo?.playerID;
  
  // Get hero names from Redux gameInfo (dispatched from Lobby)
  const yourHeroName = gameState?.gameInfo?.heroName;
  const opponentHeroName = gameState?.gameInfo?.opponentHeroName;
  
  // Get hero card numbers from game state
  const yourHeroCardNumber = gameState?.gameInfo?.yourHeroCardNumber;
  const opponentHeroCardNumber = gameState?.gameInfo?.opponentHeroCardNumber;

  // Fallback to parsing from players if not available in gameInfo
  const playerOneHero = gameState?.playerOne?.Hero?.cardNumber;
  const playerTwoHero = gameState?.playerTwo?.Hero?.cardNumber;
  
  const yourHero = yourHeroCardNumber || (playerID === 1 ? playerOneHero : playerTwoHero);
  const opponentHero = opponentHeroCardNumber || (playerID === 1 ? playerTwoHero : playerOneHero);

  // Helper to format card ID to readable name (e.g., "gravy_bones_shipwrecked_looter" -> "Gravy Bones Shipwrecked Looter")
  const formatHeroName = (cardId: string): string => {
    if (!cardId) return '';
    return cardId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Display names with fallbacks: use Redux name first, then format the card ID if available
  const displayYourHeroName = formatHeroName(yourHero) || 'Your Hero';
  const displayOpponentHeroName = formatHeroName(opponentHero) || 'Opponent';

  // Check localStorage to see if intro was already shown in this game session
  useEffect(() => {
    if (gameID) {
      const localStorageKey = `heroIntroShown_${gameID}`;
      const wasShownBefore = localStorage.getItem(localStorageKey) === 'true';
      if (wasShownBefore) {
        setIsVisible(false);
        dispatch(markHeroIntroAsShown());
      }
    }
  }, [gameID, dispatch]);
  
  // Auto-dismiss after 2 seconds
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      dispatch(markHeroIntroAsShown());
      if (gameID) {
        localStorage.setItem(`heroIntroShown_${gameID}`, 'true');
      }
    }, 2000);

    return () => clearTimeout(timer);

  }, [isVisible, dispatch, gameID]);
  
  // Get patron status
  const yourPatronStatus = playerID === 1 
    ? gameState?.playerOne?.isPatron || gameState?.playerOne?.isPvtVoidPatron || gameState?.playerOne?.isContributor
    : gameState?.playerTwo?.isPatron || gameState?.playerTwo?.isPvtVoidPatron || gameState?.playerTwo?.isContributor;

  const opponentPatronStatus = playerID === 1 
    ? gameState?.playerTwo?.isPatron || gameState?.playerTwo?.isPvtVoidPatron || gameState?.playerTwo?.isContributor
    : gameState?.playerOne?.isPatron || gameState?.playerOne?.isPvtVoidPatron || gameState?.playerOne?.isContributor;

  // Check if hero intro is disabled
  const disableHeroIntro = settingsData['DisableHeroIntro']?.value === '1';

  // Don't render if not visible or if missing hero data or if disabled
  if (!isVisible || !yourHero || !opponentHero || disableHeroIntro) {
    return null;
  }

  const yourHeroImage = generateCroppedImageUrl(yourHero);
  const opponentHeroImage = generateCroppedImageUrl(opponentHero);

  return (
    <div className={styles.introContainer}>
      <div className={styles.introContent}>
        {/* Left Hero */}
        <div className={styles.heroSection}>
          <div
            className={`${styles.heroImageWrapper} ${yourPatronStatus ? styles.patron : ''}`}
            style={{
              backgroundImage: `url(${yourHeroImage})`
            }}
          />
          <div className={styles.heroLabel}>{displayYourHeroName}</div>
        </div>

        {/* VS Indicator */}
        <div className={styles.vsContainer}>
          <div className={styles.vsText}>VS</div>
          <div className={styles.vsPulse}></div>
        </div>

        {/* Right Hero */}
        <div className={styles.heroSection}>
          <div
            className={`${styles.heroImageWrapper} ${opponentPatronStatus ? styles.patron : ''}`}
            style={{
              backgroundImage: `url(${opponentHeroImage})`
            }}
          />
          <div className={styles.heroLabel}>{displayOpponentHeroName}</div>
        </div>
      </div>
      {/* Close Button (accessibility) */}
      <button
        className={styles.closeButton}
        onClick={() => {
          setIsVisible(false);
          dispatch(markHeroIntroAsShown());
          if (gameID) {
            localStorage.setItem(`heroIntroShown_${gameID}`, 'true');
          }
        }}
        aria-label="Close hero intro"
      >
        ✕
      </button>
    </div>
  );
};

export default HeroVsHeroIntro;
