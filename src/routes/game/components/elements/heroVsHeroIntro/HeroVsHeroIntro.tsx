import React, { useEffect, useState } from 'react';
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
  
  const playerID = gameState?.gameInfo?.playerID;
  const gameID = gameState?.gameInfo?.gameID;
  const gameGUID = gameState?.gameInfo?.gameGUID;
  const heroIntroShown = gameState?.gameInfo?.heroIntroShown;
  
  // Initialize isVisible from localStorage if available, otherwise true
  const getLocalStorageKey = (): string => {
    return gameGUID || `heroIntro_${gameID}`;
  };
  
  const [isVisible, setIsVisible] = useState(true);

  // Sync isVisible with localStorage whenever gameID or gameGUID changes
  useEffect(() => {
    if (!gameID) return;
    
    const key = getLocalStorageKey();
    const stored = localStorage.getItem(key);
    if (stored === 'false') {
      setIsVisible(false);
    }
  }, [gameID, gameGUID]);
  
  // Get hero card numbers directly from Redux state
  const playerOneHero = gameState?.playerOne?.Hero?.cardNumber;
  const playerTwoHero = gameState?.playerTwo?.Hero?.cardNumber;
  
  const yourHero = playerID === 1 ? playerOneHero : playerTwoHero;
  const opponentHero = playerID === 1 ? playerTwoHero : playerOneHero;

  // Helper to format card ID to readable name (e.g., "gravy_bones_shipwrecked_looter" -> "Gravy Bones Shipwrecked Looter")
  const formatHeroName = (cardId: string): string => {
    if (!cardId) return '';
    return cardId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Display names with fallbacks: format the card ID if available
  const displayYourHeroName = formatHeroName(yourHero) || 'Your Hero';
  const displayOpponentHeroName = formatHeroName(opponentHero) || 'Opponent';

  // Auto-dismiss after 2.5 seconds
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      dispatch(markHeroIntroAsShown());
      const key = getLocalStorageKey();
      localStorage.setItem(key, 'false');
    }, 2500);

    return () => clearTimeout(timer);

  }, [isVisible, dispatch, gameID, gameGUID]);
  
  // Get patron status
  const yourPatronStatus = playerID === 1 
    ? (gameState?.playerOne?.metafyTiers?.length ?? 0) > 0 || gameState?.playerOne?.isPatron || gameState?.playerOne?.isPvtVoidPatron || gameState?.playerOne?.isContributor
    : (gameState?.playerTwo?.metafyTiers?.length ?? 0) > 0 || gameState?.playerTwo?.isPatron || gameState?.playerTwo?.isPvtVoidPatron || gameState?.playerTwo?.isContributor;

  const opponentPatronStatus = playerID === 1 
    ? (gameState?.playerTwo?.metafyTiers?.length ?? 0) > 0 || gameState?.playerTwo?.isPatron || gameState?.playerTwo?.isPvtVoidPatron || gameState?.playerTwo?.isContributor
    : (gameState?.playerOne?.metafyTiers?.length ?? 0) > 0 || gameState?.playerOne?.isPatron || gameState?.playerOne?.isPvtVoidPatron || gameState?.playerOne?.isContributor;

  // Check if hero intro is disabled
  const disableHeroIntro = settingsData['DisableHeroIntro']?.value === '1';

  // Don't render if player is spectating
  if (playerID === 3) {
    return null;
  }

  // Don't render if not visible or if missing hero data or if disabled
  if (!isVisible || !yourHero || !opponentHero || yourHero === opponentHero || disableHeroIntro) {
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
          const key = getLocalStorageKey();
          localStorage.setItem(key, 'false');
        }}
        aria-label="Close hero intro"
      >
        ✕
      </button>
    </div>
  );
};

export default HeroVsHeroIntro;
