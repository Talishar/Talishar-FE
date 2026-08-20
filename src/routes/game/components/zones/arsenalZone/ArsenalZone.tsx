import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import styles from './ArsenalZone.module.css';
import { useTranslation } from 'react-i18next';

export default function ArsenalZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const { t } = useTranslation();

  const arsenalCards = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Arsenal
      : state.game.playerTwo.Arsenal;
  });

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const otherPlayerID = useAppSelector((state: RootState) =>
    state.game.gameInfo.playerID === 1 ? 2 : 1
  );
  const arsenalFlipP1Card = useAppSelector(
    (state: RootState) => state.game.arsenalFlipP1Card
  );
  const arsenalFlipP2Card = useAppSelector(
    (state: RootState) => state.game.arsenalFlipP2Card
  );
  const arsenalFlipTrigger = useAppSelector(
    (state: RootState) => state.game.arsenalFlipTrigger
  );
  const arsenalDestroyP1Card = useAppSelector(
    (state: RootState) => state.game.arsenalDestroyP1Card
  );
  const arsenalDestroyP2Card = useAppSelector(
    (state: RootState) => state.game.arsenalDestroyP2Card
  );
  const arsenalDestroyTrigger = useAppSelector(
    (state: RootState) => state.game.arsenalDestroyTrigger
  );

  const currentPlayerID = isPlayer ? playerID : otherPlayerID;
  const flipCard =
    currentPlayerID === 1 ? arsenalFlipP1Card : arsenalFlipP2Card;
  const showFlip = !!flipCard;
  const destroyCard =
    currentPlayerID === 1 ? arsenalDestroyP1Card : arsenalDestroyP2Card;

  if (
    arsenalCards === undefined ||
    arsenalCards.length === 0 ||
    arsenalCards[0].cardNumber === ''
  ) {
    return (
      <div className={styles.arsenalContainer}>
        <div className={styles.arsenalZone}>
          {t('ZONES.ARSENAL')}
          {destroyCard && (
            <div
              key={`arsenalDestroyAnim-${arsenalDestroyTrigger}`}
              className={styles.arsenalDestroyContainer}
            >
              <div className={styles.arsenalDestroyTopPiece}>
                <CardDisplay
                  card={{ cardNumber: destroyCard }}
                  isPlayer={isPlayer}
                />
              </div>
              <div className={styles.arsenalDestroyBottomPiece}>
                <CardDisplay
                  card={{ cardNumber: destroyCard }}
                  isPlayer={isPlayer}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.arsenalContainer}>
      <div className={styles.arsenalZone}>
        {arsenalCards.map((card: Card, index: number) => {
          // Check if this card is currently animating
          const isAnimatingThisCard = showFlip && card.cardNumber === flipCard;

          return (
            <div key={index} className={styles.cardWrapper}>
              {/* Hide the actual card while animation is playing */}
              {!isAnimatingThisCard && (
                <CardDisplay card={card} isPlayer={isPlayer} />
              )}
              {/* Show animation overlay while animating */}
              {isAnimatingThisCard && (
                <div
                  key={`arsenalFlipAnimation-${arsenalFlipTrigger}`}
                  className={styles.arsenalFlipCard}
                >
                  <CardDisplay
                    card={{ cardNumber: flipCard }}
                    isPlayer={isPlayer}
                  />
                </div>
              )}
            </div>
          );
        })}
        {destroyCard && (
          <div
            key={`arsenalDestroyAnim-${arsenalDestroyTrigger}`}
            className={styles.arsenalDestroyContainer}
          >
            <div className={styles.arsenalDestroyTopPiece}>
              <CardDisplay
                card={{ cardNumber: destroyCard }}
                isPlayer={isPlayer}
              />
            </div>
            <div className={styles.arsenalDestroyBottomPiece}>
              <CardDisplay
                card={{ cardNumber: destroyCard }}
                isPlayer={isPlayer}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
