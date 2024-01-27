import { Field, useFormikContext } from 'formik';
import React from 'react';
import { DeckResponse } from 'interface/API/GetLobbyInfo.php';
import styles from './Calculator.module.css';

//values.deck.length = amount of currently selected cards

const Calculator = () => {
  const { values } = useFormikContext<DeckResponse>();

  return (
    <div className={styles.container}>
      {values.deck.length}
    </div>
  );
};

export default Calculator;
