import { useFormikContext } from 'formik';
import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { DeckResponse } from 'interface/API/GetLobbyInfo.php';
import styles from './StickyFooter.module.css';

export type DeckSize = {
  deckSize: number;
};

const StickyFooter = ({ deckSize }: DeckSize) => {
  const { errors, values, isValid } = useFormikContext<DeckResponse>();
  let errorArray = [] as string[];
  for (const [key, value] of Object.entries(errors)) {
    errorArray.push(String(value));
  }

  return (
    <div className={styles.stickyFooter}>
      <div className={styles.footerContent}>
        <div>
          Deck {values.deck.length}/{deckSize}
        </div>
        {!isValid && (
          <div className={styles.alarm}>
            <FaExclamationCircle /> {errorArray[0]}
          </div>
        )}
      </div>
      <div className={styles.buttonHolder}>
        <button disabled={!errors} className={styles.buttonClass} type="submit">
          Submit deck
        </button>
      </div>
    </div>
  );
};

export default StickyFooter;
