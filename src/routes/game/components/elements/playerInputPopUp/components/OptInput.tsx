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
  const { cards, buttons, onClickButton, id } = props;

  const maxButtonsPerIndex = 2;
  const buttonsCountPerIndex = new Map();
  const cardWithButtons = cards.map((card, index) => {
    buttonsCountPerIndex.set(index, 0);
    const chooseButton = buttons.find((b) => b.caption === "Choose");
    const effectiveMaxButtonsPerIndex = chooseButton ? 1 : maxButtonsPerIndex;
    return {
      ...card,
      key: index,
      buttons: buttons.filter((button) => {
        const buttonsAdded = buttonsCountPerIndex.get(index);
        if (
          buttonsAdded < effectiveMaxButtonsPerIndex &&
          button.buttonInput === card.cardNumber
        ) {
          buttonsCountPerIndex.set(index, buttonsAdded + 1);
          return true;
        }
        return false;
      })
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
