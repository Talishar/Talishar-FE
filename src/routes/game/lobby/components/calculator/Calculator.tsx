import { Field, useFormikContext } from 'formik';
import React, { useMemo } from 'react';
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

// Helper function to check if subtype contains a value
function subtypeContains(subtype: string | undefined, find: string): boolean {
  if (!subtype) return false;
  const subtypes = subtype.split(',').map((s) => s.trim());
  return subtypes.includes(find);
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

  // Helper function to create probability rows
  const createProbabilityRows = (count: number) => {
    const rows: any = [];
    for (let i = 0; i <= 4; i++) {
      rows.push(
        <td key={i}>{formatProbability(hgeo(values.deck.length, count, 4, i))}</td>
      );
    }
    return rows;
  };

  // Calculate card type counts from deck
  const cardCounts = useMemo(() => {
    let numColorless = 0;
    let numRed = 0;
    let numYellow = 0;
    let numBlue = 0;
    let numRunebladeAA = 0;
    let numRunebladeA = 0;
    let numPower6Plus = 0;
    let numMechanologistItem = 0;
    let numAllies = 0;
    let numStealth = 0;
    let numBloodDebt = 0;
    let numBoost = 0;
    let numDraconic = 0;

    // Get hero class from cardDictionary
    const heroId = data?.deck?.hero;
    let heroClass = '';
    let heroTalent = '';
    
    // Try to find hero in cardDictionary first
    if (heroId && data?.deck?.cardDictionary) {
      const heroCard = data.deck.cardDictionary.find((c: CardData) => c.id === heroId);
      if (heroCard?.class) {
        heroClass = (heroCard.class).trim();
      }
      if (heroCard?.talent) {
        heroTalent = (heroCard.talent).trim();
      }
    }

    values.deck.forEach((cardId: string) => {
      const cleanCardId = cardId.split('-')[0];
      const card = data?.deck.cardDictionary?.find(
        (c: CardData) => c.id === cleanCardId
      );

      if (card) {
        // Pitch counts
        if (card.pitch === 1) ++numRed;
        else if (card.pitch === 2) ++numYellow;
        else if (card.pitch === 3) ++numBlue;
        else if (card.pitch === 0) ++numColorless;

        // Runeblade Attack/Non-Attack Actions - only if hero is Runeblade
        if (heroClass?.toLowerCase().includes('runeblade')) {
          if (card.type === 'AA') ++numRunebladeAA;
          else if (card.type === 'A') ++numRunebladeA;
        }

        // Brute/Guardian Power >= 6 - only if hero is Brute or Guardian
        if ((heroClass?.toLowerCase().includes('brute') || heroClass?.toLowerCase().includes('guardian')) && card.power !== undefined && card.power >= 6) {
          ++numPower6Plus;
        }

        // Mechanologist Items - only if hero is Mechanologist
        if (heroClass?.toLowerCase().includes('mechanologist') && card.subtype && subtypeContains(card.subtype, 'Item')) {
          ++numMechanologistItem;
        }

        // Necromancer Allies - only if hero is Necromancer
        if (heroClass?.toLowerCase().includes('necromancer') || heroClass?.toLowerCase().includes('illusionist') && subtypeContains(card.subtype, 'Ally')) {
          ++numAllies;
        }

        // Assassin Stealth cards - only if hero is Assassin
        if (heroClass?.toLowerCase().includes('assassin') && card.hasStealth) {
          ++numStealth;
        }

        // Shadow Blood Debt cards - only if hero has Shadow talent
        if (heroTalent?.toLowerCase() === 'shadow' && card.hasBloodDebt) {
          ++numBloodDebt;
        }

        // Mechanologist Boost cards - only if hero is Mechanologist
        if (heroClass?.toLowerCase().includes('mechanologist') && card.hasBoost) {
          ++numBoost;
        }
        if (heroTalent?.toLowerCase().includes('draconic') && card.talent?.toLowerCase().includes('draconic')) {
          ++numDraconic;
        }
      }
    });

    return {
      colorless: numColorless,
      red: numRed,
      yellow: numYellow,
      blue: numBlue,
      runebladeAA: numRunebladeAA,
      runebladeA: numRunebladeA,
      bruteGuardianPower6Plus: numPower6Plus,
      mechanologistItem: numMechanologistItem,
      necromancerAlly: numAllies,
      assassinStealth: numStealth,
      shadowBloodDebt: numBloodDebt,
      mechanologistBoost: numBoost,
      draconic: numDraconic
    };
  }, [values.deck, data?.deck.cardDictionary, data?.deck?.hero]);

  return (
    <div className={styles.container}>
      <div className={styles.calculatorCard}>
        <div className={styles.header}>
          <h3>Hand Draw Probabilities</h3>
          <p>Probability of drawing cards in your opening hand</p>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.probabilityTable}>
            <thead>
              <tr>
                <th className={styles.labelHeader}></th>
                <th>0</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
              </tr>
            </thead>
            <tbody>
              {/* Pitch-based rows */}
              {cardCounts.colorless > 0 && (
                <tr>
                  <td className={`${styles.labelCell} ${styles.colorless}`}>
                    <span className={styles.colorIndicator}></span>
                    Colorless ({cardCounts.colorless})
                  </td>
                  {createProbabilityRows(cardCounts.colorless)}
                </tr>
              )}
              <tr>
                <td className={`${styles.labelCell} ${styles.red}`}>
                  <span className={styles.colorIndicator}></span>
                  Red ({cardCounts.red})
                </td>
                {createProbabilityRows(cardCounts.red)}
              </tr>
              <tr>
                <td className={`${styles.labelCell} ${styles.yellow}`}>
                  <span className={styles.colorIndicator}></span>
                  Yellow ({cardCounts.yellow})
                </td>
                {createProbabilityRows(cardCounts.yellow)}
              </tr>
              <tr>
                <td className={`${styles.labelCell} ${styles.blue}`}>
                  <span className={styles.colorIndicator}></span>
                  Blue ({cardCounts.blue})
                </td>
                {createProbabilityRows(cardCounts.blue)}
              </tr>

              {/* Class/Talent-specific rows */}
              {cardCounts.runebladeAA > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.runebladeAA}`}>
                    <span className={styles.classIndicator}></span>
                    Attack Action ({cardCounts.runebladeAA})
                  </td>
                  {createProbabilityRows(cardCounts.runebladeAA)}
                </tr>
              )}
              {cardCounts.runebladeA > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.runebladeA}`}>
                    <span className={styles.classIndicator}></span>
                    Non-Attack Action ({cardCounts.runebladeA})
                  </td>
                  {createProbabilityRows(cardCounts.runebladeA)}
                </tr>
              )}
              {cardCounts.bruteGuardianPower6Plus > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.bruteGuardian}`}>
                    <span className={styles.classIndicator}></span>
                    Power ≥ 6 ({cardCounts.bruteGuardianPower6Plus})
                  </td>
                  {createProbabilityRows(cardCounts.bruteGuardianPower6Plus)}
                </tr>
              )}
              {cardCounts.mechanologistItem > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.mechanologist}`}>
                    <span className={styles.classIndicator}></span>
                    Items ({cardCounts.mechanologistItem})
                  </td>
                  {createProbabilityRows(cardCounts.mechanologistItem)}
                </tr>
              )}
              {cardCounts.mechanologistBoost > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.mechanologist}`}>
                    <span className={styles.classIndicator}></span>
                    Boost ({cardCounts.mechanologistBoost})
                  </td>
                  {createProbabilityRows(cardCounts.mechanologistBoost)}
                </tr>
              )}
              {cardCounts.necromancerAlly > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.necromancer}`}>
                    <span className={styles.classIndicator}></span>
                    Allies ({cardCounts.necromancerAlly})
                  </td>
                  {createProbabilityRows(cardCounts.necromancerAlly)}
                </tr>
              )}
              {cardCounts.assassinStealth > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.assassin}`}>
                    <span className={styles.classIndicator}></span>
                    Stealth ({cardCounts.assassinStealth})
                  </td>
                  {createProbabilityRows(cardCounts.assassinStealth)}
                </tr>
              )}
              {cardCounts.shadowBloodDebt > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.shadow}`}>
                    <span className={styles.classIndicator}></span>
                    Blood Debt ({cardCounts.shadowBloodDebt})
                  </td>
                  {createProbabilityRows(cardCounts.shadowBloodDebt)}
                </tr>
              )}
              {cardCounts.draconic > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.draconic}`}>
                    <span className={styles.classIndicator}></span>
                    Draconic ({cardCounts.draconic})
                  </td>
                  {createProbabilityRows(cardCounts.draconic)}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calculator;