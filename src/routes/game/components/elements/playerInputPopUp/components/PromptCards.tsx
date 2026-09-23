import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Card } from 'features/Card';
import { cardIDsInText } from 'utils/ParseEscapedString';
import CardDisplay from '../../cardDisplay/CardDisplay';
import styles from '../PlayerInputPopUp.module.css';

const MAX_PROMPT_CARDS = 3;

interface PromptCardsProps {
  title: string;
  sourceCard?: string;
  deckTopCard?: string;
  deckTopIsOpponent?: boolean;
}

export const PromptCards = ({
  title,
  sourceCard,
  deckTopCard,
  deckTopIsOpponent
}: PromptCardsProps) => {
  const { t } = useTranslation();
  const sourceLabel = t('PLAYER_INPUT.SOURCE');
  const deckTopLabel = t(
    deckTopIsOpponent
      ? 'PLAYER_INPUT.TOP_OF_THEIR_DECK'
      : 'PLAYER_INPUT.TOP_OF_DECK'
  );
  const { cards, source } = useMemo(() => {
    const subjectCards: Card[] = cardIDsInText(title)
      .filter((cardNumber) => cardNumber !== sourceCard)
      .slice(0, MAX_PROMPT_CARDS)
      .map((cardNumber) =>
        cardNumber === deckTopCard
          ? { cardNumber, label: deckTopLabel }
          : { cardNumber }
      );
    const sourceCardProp: Card | undefined = sourceCard
      ? { cardNumber: sourceCard, label: sourceLabel }
      : undefined;
    return { cards: subjectCards, source: sourceCardProp };
  }, [title, sourceCard, deckTopCard, sourceLabel, deckTopLabel]);

  if (cards.length === 0 && !source) return null;

  return (
    <div className={styles.promptCards}>
      {cards.map((card) => (
        <div key={card.cardNumber} className={styles.promptCard}>
          <CardDisplay card={card} preventUseOnClick />
        </div>
      ))}
      {source ? (
        <div
          className={classNames(styles.promptCard, {
            [styles.promptSourceCard]: cards.length > 0
          })}
        >
          <CardDisplay card={source} preventUseOnClick />
        </div>
      ) : null}
    </div>
  );
};
