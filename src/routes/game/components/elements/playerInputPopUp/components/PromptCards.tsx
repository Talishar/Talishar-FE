import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const deckTopLabel = t(
    deckTopIsOpponent
      ? 'PLAYER_INPUT.TOP_OF_THEIR_DECK'
      : 'PLAYER_INPUT.TOP_OF_DECK'
  );
  const cards = useMemo(
    (): Card[] =>
      cardIDsInText(title)
        .filter((cardNumber) => cardNumber !== sourceCard)
        .slice(0, MAX_PROMPT_CARDS)
        .map((cardNumber) =>
          cardNumber === deckTopCard
            ? { cardNumber, label: deckTopLabel }
            : { cardNumber }
        ),
    [title, sourceCard, deckTopCard, deckTopLabel]
  );

  if (cards.length === 0) return null;

  return (
    <div className={styles.promptCards}>
      {cards.map((card) => (
        <div key={card.cardNumber} className={styles.promptCard}>
          <CardDisplay card={card} preventUseOnClick />
        </div>
      ))}
    </div>
  );
};
