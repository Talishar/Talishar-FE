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
            onClick={() => {
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

  const cardWithButtons = cards.map((card, index) => {
    return {
      ...card,
      key: index,
      buttons: buttons.filter(
        (button) => button.buttonInput === card.cardNumber
      )
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
