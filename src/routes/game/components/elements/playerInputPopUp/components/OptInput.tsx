import Button from 'features/Button';
import { Card } from 'features/Card';
import CardDisplay from '../../cardDisplay/CardDisplay';
import { FormProps } from '../playerInputPopupTypes';
import styles from '../PlayerInputPopUp.module.css';
import classNames from 'classnames';

interface CardWithButtons extends Card {
  buttons: Button[];
  key: number;
}

type OptOptionBoxProps = {
  card: CardWithButtons;
  onClickButton: (b: Button) => void;
};

const OptOptionBox = ({ card, onClickButton }: OptOptionBoxProps) => {
  return (
    <div className={styles.cardDiv} key={card.key.toString()}>
      <CardDisplay card={card} />
      <div className={styles.buttonRow}>
        {card?.buttons.map((button: Button, bid) => (
          <div
            className={styles.buttonDiv}
            onClick={(e) => {
              e.preventDefault();
              onClickButton(button);
            }}
            key={bid.toString()}
          >
            {button.caption}
          </div>
        ))}
      </div>
    </div>
  );
};

export const OptInput = (props: FormProps) => {
  const { cards, buttons, onClickButton } = props;

  const maxButtonsPerIndex = 2;
  const chooseButton = buttons.find((b) => b.caption === 'Choose');
  const effectiveMaxButtonsPerIndex = chooseButton ? 1 : maxButtonsPerIndex;
  const claimedButtons = new Set<number>();
  const cardWithButtons = cards.map((card, index) => {
    const cardButtons: Button[] = [];
    buttons.forEach((button, buttonIndex) => {
      if (
        cardButtons.length >= effectiveMaxButtonsPerIndex ||
        claimedButtons.has(buttonIndex) ||
        button.buttonInput !== card.cardNumber ||
        cardButtons.some((claimed) => claimed.caption === button.caption)
      ) {
        return;
      }
      claimedButtons.add(buttonIndex);
      cardButtons.push(button);
    });
    return {
      ...card,
      key: index,
      buttons: cardButtons
    };
  });

  return (
    <form className={classNames(styles.form, styles.optForm)}>
      {cardWithButtons.map((card, id) => (
        <OptOptionBox card={card} onClickButton={onClickButton} key={id} />
      ))}
    </form>
  );
};
