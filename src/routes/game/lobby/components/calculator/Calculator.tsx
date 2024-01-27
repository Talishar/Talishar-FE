import { Field, useFormikContext } from 'formik';
import React from 'react';
import { DeckResponse, CardData } from 'interface/API/GetLobbyInfo.php';
import styles from './Calculator.module.css';
import { useAppSelector } from 'app/Hooks';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import { useGetLobbyInfoQuery } from 'features/api/apiSlice';

function hgeo(totalPopulation:number, successPopulation:number, sampleSize:number, successesInSample:number) {
  if(successesInSample > successPopulation) return 0;
  function factorial(n:number) {
      let result = 1;
      for(let i = 2; i <= n; i++)
          result *= i;
      return result;
  }

  function combination(n:number, r:number) {
      return factorial(n) / (factorial(r) * factorial(n - r));
  }

  let successes = combination(successPopulation, successesInSample);
  let failures = combination(totalPopulation - successPopulation, sampleSize - successesInSample);
  let totalOutcomes = combination(totalPopulation, sampleSize);

  return (successes * failures) / totalOutcomes;
}

function formatProbability(probability:number) {
  return (Math.round(probability * 1000)/10).toString() + "%";
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

  let numRed = 0;
  let numYellow = 0;
  let numBlue = 0;

  values.deck.forEach((cardId:string) => {
    cardId = cardId.split("-")[0];
    data?.deck.cardDictionary?.forEach((card: CardData) => {
      if(card.id == cardId) {
        if(card.pitch == 1) ++numRed;
        else if(card.pitch == 2) ++numYellow;
        else if(card.pitch == 3) ++numBlue;
      }
   });
  });

  const redRows : any = [];
  for (let i = 0; i <= 4; i++) {
    redRows.push(<td>{formatProbability(hgeo(values.deck.length, numRed, 4, i))}</td>);
  }
  
  const yellowRows : any = [];
  for (let i = 0; i <= 4; i++) {
    yellowRows.push(<td>{formatProbability(hgeo(values.deck.length, numYellow, 4, i))}</td>);
  }
  
  const blueRows : any = [];
  for (let i = 0; i <= 4; i++) {
    blueRows.push(<td>{formatProbability(hgeo(values.deck.length, numBlue, 4, i))}</td>);
  }

  return (
    <div className={styles.container}>
      <table>
        <tr><th>Count</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr>
        <tr><td className={styles.red}>Red ({numRed})</td>{redRows}</tr>
        <tr><td className={styles.yellow}>Yellow ({numYellow})</td>{yellowRows}</tr>
        <tr><td className={styles.blue}>Blue ({numBlue})</td>{blueRows}</tr>
      </table>
    </div>
  );
};

export default Calculator;
