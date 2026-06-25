import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './DeckZone.module.css';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import useWindowDimensions from 'hooks/useWindowDimensions';
import * as optConst from 'features/options/constants';

export const DeckZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const [windowWidth] = useWindowDimensions();
  const settingsData = useAppSelector(
    (state: RootState) => state.settings.entities
  );
  const alwaysShowCounters =
    String(settingsData?.[optConst.ALWAYS_SHOW_COUNTERS]?.value) === '1';

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

  // useMemo MUST be before the early return — hooks called after an early return
  // cause "rendered more hooks than previous render" when the deck goes from
  // empty (early-return path, useMemo skipped) to populated (full path, useMemo runs).
  const shuffleLayerCount = Math.min(3, Math.max(5, (deckCards ?? 0) - 1));
  const shuffleLayerDelays = useMemo(
    () =>
      shouldAnimateShuffling
        ? Array.from({ length: shuffleLayerCount }, () => `${Math.random() * 400}ms`)
        : null,
    [shouldAnimateShuffling]
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

  const isMobileOrTablet = windowWidth <= 1024;
  const visibleLayers = deckCards;
  const layerOffsetY = 0.25;
  const layerOffsetX = -0.25;
  const baseOffsetY = visibleLayers * 0.24 * -1;
  const baseOffsetX = visibleLayers * 0.24;

  return (
    <div className={styles.deckZone} onClick={deckZoneDisplay}>
      <div className={styles.zoneStack}>
        {/* Render background layers for 3D effect - only on desktop */}
        {!isMobileOrTablet &&
          Array.from({ length: visibleLayers - 1 }).map((_, index) => {
            const shouldAnimateLayer =
              shouldAnimateShuffling && index < shuffleLayerCount;
            const animationDelay = shouldAnimateLayer
              ? (shuffleLayerDelays?.[index] ?? '0ms')
              : '0ms';

            return (
              <div
                key={`layer-${index}`}
                className={
                  shouldAnimateLayer
                    ? styles.zoneLayerShuffling
                    : styles.zoneLayer
                }
                style={{
                  transform: `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px) translateY(${
                    (index + 1) * layerOffsetY
                  }px) translateX(${(index + 1) * layerOffsetX}px)`,
                  zIndex: visibleLayers - index - 1,
                  animationDelay
                }}
              />
            );
          })}
        {/* Main card on top */}
        <div
          className={styles.cardWrapper}
          style={
            !isMobileOrTablet
              ? { transform: `translateY(${baseOffsetY}px) translateX(${baseOffsetX}px)` }
              : undefined
          }
        >
          <CardDisplay
            card={deckBack}
            num={showCount ? deckCards : undefined}
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
