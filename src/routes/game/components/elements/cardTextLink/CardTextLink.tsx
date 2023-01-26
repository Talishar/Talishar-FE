import styles from './CardTextLink.module.css';
import CardPopUp from '../cardPopUp/CardPopUp';

export interface CardTextLinkProp {
  cardNumber: string;
  cardName: string;
}

export const CardTextLink = ({ cardNumber, cardName }: CardTextLinkProp) => {
  return (
    <CardPopUp
      cardNumber={cardNumber}
      containerClass={styles.cardText}
    >
      <span>{cardName}</span>
    </CardPopUp>
  );
};

export default CardTextLink;
