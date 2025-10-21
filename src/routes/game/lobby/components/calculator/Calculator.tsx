import { Field, useFormikContext } from 'formik';
import React from 'react';
import { DeckResponse, CardData } from 'interface/API/GetLobbyInfo.php';
import styles from './Calculator.module.css';
import { useAppSelector } from 'app/Hooks';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import { useGetLobbyInfoQuery } from 'features/api/apiSlice';

function hgeo(
  totalPopulation: number,
  successPopulation: number,
  sampleSize: number,
  successesInSample: number
) {
  if (successesInSample > successPopulation) return 0;
  if (totalPopulation == successPopulation && successesInSample < sampleSize)
    return 0;
  function factorial(n: number) {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  function combination(n: number, r: number) {
    return factorial(n) / (factorial(r) * factorial(n - r));
  }

  let successes = combination(successPopulation, successesInSample);
  let failures = combination(
    totalPopulation - successPopulation,
    sampleSize - successesInSample
  );
  let totalOutcomes = combination(totalPopulation, sampleSize);

  return (successes * failures) / totalOutcomes;
}

function formatProbability(probability: number) {
  return (Math.round(probability * 1000) / 10).toString() + '%';
}

const Calculator = () => {
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const { values } = useFormikContext<DeckResponse>();

  let { data, isLoading, refetch } = useGetLobbyInfoQuery({
    gameName: gameID,
    playerID: playerID,
    authKey: authKey
  });

  let numColorless = 0;
  let numRed = 0;
  let numYellow = 0;
  let numBlue = 0;

  values.deck.forEach((cardId: string) => {
    cardId = cardId.split('-')[0];
    data?.deck.cardDictionary?.forEach((card: CardData) => {
      if (card.id == cardId) {
        if (card.pitch == 1) ++numRed;
        else if (card.pitch == 2) ++numYellow;
        else if (card.pitch == 3) ++numBlue;
        else if (card.pitch == 0) ++numColorless;
      }
    });
  });

  const redRows: any = [];
  for (let i = 0; i <= 4; i++) {
    redRows.push(
      <td>{formatProbability(hgeo(values.deck.length, numRed, 4, i))}</td>
    );
  }

  const yellowRows: any = [];
  for (let i = 0; i <= 4; i++) {
    yellowRows.push(
      <td>{formatProbability(hgeo(values.deck.length, numYellow, 4, i))}</td>
    );
  }

  const blueRows: any = [];
  for (let i = 0; i <= 4; i++) {
    blueRows.push(
      <td>{formatProbability(hgeo(values.deck.length, numBlue, 4, i))}</td>
    );
  }

  const colorlessRows: any = [];
  for (let i = 0; i <= 4; i++) {
    colorlessRows.push(
      <td>{formatProbability(hgeo(values.deck.length, numColorless, 4, i))}</td>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.calculatorCard}>
        <div className={styles.header}>
          <h3>Hand Draw Probabilities</h3>
          <p>Probability of drawing cards by pitch value in opening hand</p>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.probabilityTable}>
            <thead>
              <tr>
                <th className={styles.labelHeader}>Card Type</th>
                <th>0</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
              </tr>
            </thead>
            <tbody>
              {numColorless > 0 && (
                <tr>
                  <td className={`${styles.labelCell} ${styles.colorless}`}>
                    <span className={styles.colorIndicator}></span>
                    Colorless ( {numColorless} )
                  </td>
                  {colorlessRows.map((cell: any, index: number) => (
                    <td key={index} className={styles.probabilityCell}>{cell.props.children}</td>
                  ))}
                </tr>
              )}
              <tr>
                <td className={`${styles.labelCell} ${styles.red}`}>
                  <span className={styles.colorIndicator}></span>
                  Red ( {numRed} )
                </td>
                {redRows.map((cell: any, index: number) => (
                  <td key={index} className={styles.probabilityCell}>{cell.props.children}</td>
                ))}
              </tr>
              <tr>
                <td className={`${styles.labelCell} ${styles.yellow}`}>
                  <span className={styles.colorIndicator}></span>
                  Yellow ( {numYellow}  )
                </td>
                {yellowRows.map((cell: any, index: number) => (
                  <td key={index} className={styles.probabilityCell}>{cell.props.children}</td>
                ))}
              </tr>
              <tr>
                <td className={`${styles.labelCell} ${styles.blue}`}>
                  <span className={styles.colorIndicator}></span>
                  Blue ( {numBlue} )
                </td>
                {blueRows.map((cell: any, index: number) => (
                  <td key={index} className={styles.probabilityCell}>{cell.props.children}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
