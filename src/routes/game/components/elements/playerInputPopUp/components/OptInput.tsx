import Button from 'features/Button';
import { Card } from 'features/Card';
import CardDisplay from '../../cardDisplay/CardDisplay';
import { FormProps } from '../playerInputPopupTypes';
import styles from '../PlayerInputPopUp.module.css';
import classNames from 'classnames';
import ReorderOpt from './ReorderOpt';

interface CardWithButtons extends Card {
  buttons: Button[];
  key: number;
}

export const OptInput = (props: FormProps) => {
  const { topCards, bottomCards } = props;

  return (
    <ReorderOpt topCards={topCards ?? []} bottomCards={bottomCards ?? []} />
  );
};
