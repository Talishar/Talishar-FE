import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './DeckZone.module.css';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import useWindowDimensions from 'hooks/useWindowDimensions';
import * as optConst from 'features/options/constants';

const MAX_STACK_LAYERS = 12;

export const DeckZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const [windowWidth] = useWindowDimensions();
  const alwaysShowCounters = useAppSelector(
    (state: RootState) =>
      String(state.settings.entities?.[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1'
  );

  const deckCards = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckSize : state.game.playerTwo.DeckSize
  );
  const deckBack = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckBack : state.game.playerTwo.DeckBack
  );

  const deckZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Deck : state.game.playerTwo.Deck
  );

  const cardListFocus = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );

  const shufflingPlayerId = useAppSelector(
    (state: RootState) => state.game.shufflingPlayerId
  );
  const isShuffling = useAppSelector(
    (state: RootState) => state.game.isShuffling
  );
  const addBotDeckPlayerId = useAppSelector(
    (state: RootState) => state.game.addBotDeckPlayerId
  );
  const addBotDeckCard = useAppSelector(
    (state: RootState) => state.game.addBotDeckCard
  );
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const otherPlayerID = useAppSelector((state: RootState) =>
    state.game.gameInfo.playerID === 1 ? 2 : 1
  );
  const clashRevealP1Card = useAppSelector(
    (state: RootState) => state.game.clashRevealP1Card
  );
  const clashRevealP2Card = useAppSelector(
    (state: RootState) => state.game.clashRevealP2Card
  );
  const clashRevealTrigger = useAppSelector(
    (state: RootState) => state.game.clashRevealTrigger
  );

  const shouldAnimateShuffling =
    isShuffling &&
    ((isPlayer && shufflingPlayerId === playerID) ||
      (!isPlayer && shufflingPlayerId === otherPlayerID));

  const shouldAnimateAddBotDeck =
    addBotDeckPlayerId !== null &&
    ((isPlayer && addBotDeckPlayerId === playerID) ||
      (!isPlayer && addBotDeckPlayerId === otherPlayerID));

  const currentDeckPlayerID = isPlayer ? playerID : otherPlayerID;
  const clashCard =
    currentDeckPlayerID === 1 ? clashRevealP1Card : clashRevealP2Card;
  const showClash = !!clashCard;

  const isMobileOrTablet = windowWidth <= 1024;
  const safeCount = deckCards ?? 0;
  const baseOffsetY = safeCount * -0.24;
  const baseOffsetX = safeCount * 0.24;
  const shuffleLayerCount = Math.min(5, Math.max(3, safeCount - 1));

  const baseLayerStyles = useMemo(() => {
    if (safeCount <= 1) return [];
    const layerCount = Math.min(MAX_STACK_LAYERS, safeCount - 1);
    return Array.from({ length: layerCount }, (_, index) => {
      const sourceIndex =
        layerCount === 1
          ? 0
          : Math.round((index * (safeCount - 2)) / (layerCount - 1));

      return {
        transform:
          `translateY(${safeCount * -0.24}px) translateX(${safeCount * 0.24}px) ` +
          `translateY(${(sourceIndex + 1) * 0.25}px) translateX(${(sourceIndex + 1) * -0.25}px)`,
        zIndex: safeCount - sourceIndex - 1
      };
    });
  }, [safeCount]);

  const cardWrapperStyle = useMemo(
    () =>
      !isMobileOrTablet
        ? {
            transform: `translate3d(${Math.round(baseOffsetX)}px, ${Math.round(baseOffsetY)}px, 0)`
          }
        : undefined,
    [isMobileOrTablet, baseOffsetY, baseOffsetX]
  );

  const shuffleLayerDelays = useMemo(
    () =>
      shouldAnimateShuffling
        ? Array.from({ length: shuffleLayerCount }, () => `${Math.random() * 400}ms`)
        : null,
    [shouldAnimateShuffling, shuffleLayerCount]
  );

  if (deckCards === undefined || deckCards === 0) {
    return <div className={styles.deckZone}>Deck</div>;
  }

  const deckZoneDisplay = () => {
    if (deckZone?.length === 0) return;
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    const zoneTitle = `${isPlayerPronoun} Deck`;

    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      dispatch(clearCardListFocus());
    } else {
      dispatch(setCardListFocus({ cardList: deckZone, name: zoneTitle }));
    }
  };

  return (
    <div className={styles.deckZone} onClick={deckZoneDisplay}>
      <div className={styles.zoneStack}>
        {/* Render background layers for 3D effect - only on desktop */}
        {!isMobileOrTablet &&
          baseLayerStyles.map((style, index) => {
            const shouldAnimateLayer = shouldAnimateShuffling && index < shuffleLayerCount;
            // During steady-state, pass the memoized style object directly (no allocation).
            // Only spread a new object when an animationDelay is needed during a shuffle.
            const finalStyle = shouldAnimateLayer
              ? { ...style, animationDelay: shuffleLayerDelays?.[index] ?? '0ms' }
              : style;
            return (
              <div
                key={`layer-${index}`}
                className={shouldAnimateLayer ? styles.zoneLayerShuffling : styles.zoneLayer}
                style={finalStyle}
              />
            );
          })}
        {/* Main card on top */}
        <div
          className={styles.cardWrapper}
          style={cardWrapperStyle}
        >
          <CardDisplay
            card={deckBack}
            num={deckCards}
            isShuffling={shouldAnimateShuffling}
            showCountersOnHover={!alwaysShowCounters}
            disableTilt
          />
        </div>
        {/* Add card animation */}
        {shouldAnimateAddBotDeck && (
          <div
            key="addBotDeckAnimation"
            className={styles.addBotDeckAnimationCard}
          >
            <CardDisplay
              card={deckBack}
              showCountersOnHover={!alwaysShowCounters}
              disableTilt
            />
          </div>
        )}
        {showClash && (
          <div
            key={`clashAnimation-${clashRevealTrigger}`}
            className={styles.clashRevealCard}
            style={
              !isMobileOrTablet
                ? ({
                    '--deckOffsetY': `${baseOffsetY}px`,
                    '--deckOffsetX': `${baseOffsetX}px`
                  } as React.CSSProperties)
                : undefined
            }
          >
            <CardDisplay
              card={{ cardNumber: clashCard }}
              showCountersOnHover={!alwaysShowCounters}
              isPlayer={isPlayer}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default DeckZone;
