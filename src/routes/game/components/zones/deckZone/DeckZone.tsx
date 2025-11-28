import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './DeckZone.module.css';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import * as optConst from 'features/options/constants';

export const DeckZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const settingsData = useAppSelector((state: RootState) => state.settings.entities);
  const alwaysShowCounters = String(settingsData?.[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1';

  const showCount = true;

  const deckCards = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckSize : state.game.playerTwo.DeckSize
  );
  const deckBack = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckBack : state.game.playerTwo.DeckBack
  );

  const deckZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Deck : state.game.playerTwo.Deck
  );

  const cardListFocus = useAppSelector((state: RootState) => state.game.cardListFocus);

  const shufflingPlayerId = useAppSelector((state: RootState) => state.game.shufflingPlayerId);
  const isShuffling = useAppSelector((state: RootState) => state.game.isShuffling);
  const addBotDeckPlayerId = useAppSelector((state: RootState) => state.game.addBotDeckPlayerId);
  const addBotDeckCard = useAppSelector((state: RootState) => state.game.addBotDeckCard);
  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);
  const otherPlayerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID === 1 ? 2 : 1);

  const shouldAnimateShuffling = isShuffling && (
    (isPlayer && shufflingPlayerId === playerID) ||
    (!isPlayer && shufflingPlayerId === otherPlayerID)
  );

  const shouldAnimateAddBotDeck = addBotDeckPlayerId !== null && (
    (isPlayer && addBotDeckPlayerId === playerID) ||
    (!isPlayer && addBotDeckPlayerId === otherPlayerID)
  );

  if (deckCards === undefined || deckCards === 0) {
    return <div className={styles.deckZone}>Deck</div>;
  }

  const deckZoneDisplay = () => {
    if (deckZone?.length === 0) return;
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    const zoneTitle = `${isPlayerPronoun} Deck`;

    // Check if this zone is already open
    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      // Close it
      dispatch(clearCardListFocus());
    } else {
      // Open it
      dispatch(
        setCardListFocus({
          cardList: deckZone,
          name: zoneTitle
        })
      );
    }
  };
  // Calculate number of visible layers based on deck size
  const isMobileOrTablet = window.innerWidth <= 1024;
  const visibleLayers = deckCards;
  const layerOffsetY = 0.25; // pixels per layer (down)
  const layerOffsetX = -0.25; // pixels per layer (left)
  const baseOffsetY = visibleLayers * 0.24 * -1; // pixels (up, based on card count)
  const baseOffsetX = visibleLayers * 0.24; // pixels (right, based on card count)

  // Determine how many layers to animate during shuffle (3-10 layers plus the top card)
  const shuffleLayerCount = Math.min(3, Math.max(5, visibleLayers - 1));

  return (
    <div className={styles.deckZone} onClick={deckZoneDisplay}>
      <div className={styles.zoneStack}>
        {/* Render background layers for 3D effect - only on desktop */}
        {!isMobileOrTablet && Array.from({ length: visibleLayers - 1 }).map((_, index) => {
          // Apply shuffling animation to the top shuffleLayerCount layers
          const shouldAnimateLayer = shouldAnimateShuffling && index < shuffleLayerCount;
          // Generate random delay (0ms to 400ms) for this layer
          const animationDelay = shouldAnimateLayer ? `${Math.random() * 400}ms` : '0ms';
          
          return (
            <div
              key={`layer-${index}`}
              className={shouldAnimateLayer ? styles.zoneLayerShuffling : styles.zoneLayer}
              style={{
                transform: `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px) translateY(${(index + 1) * layerOffsetY}px) translateX(${(index + 1) * layerOffsetX}px)`,
                zIndex: visibleLayers - index - 1,
                animationDelay: animationDelay
              }}
            />
          );
        })}
        {/* Main card on top */}
        <div className={styles.cardWrapper} style={!isMobileOrTablet ? { transform: `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px)` } : {}}>
          <CardDisplay
            card={deckBack}
            num={showCount ? deckCards : undefined}
            isShuffling={shouldAnimateShuffling}
            showCountersOnHover={!alwaysShowCounters}
          />
        </div>
        {/* Add card animation */}
        {shouldAnimateAddBotDeck && (
          <div className={styles.addBotDeckAnimationCard}>
            <CardDisplay
              card={deckBack}
              showCountersOnHover={!alwaysShowCounters}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default DeckZone;
