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

function subtypeContains(subtype: string | undefined, find: string): boolean {
  if (!subtype) return false;
  const subtypes = subtype.split(',').map((s) => s.trim());
  return subtypes.includes(find);
}

function talentContains(talent: string | undefined, find: string): boolean {
  if (!talent) return false;
  const talents = talent.split(',').map((t) => t.trim());
  return talents.includes(find);
}

function classContains(class_: string | undefined, find: string): boolean {
  if (!class_) return false;
  const classes = class_.split(',').map((c) => c.trim());
  return classes.includes(find);
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
    let numItems = 0;
    let numAllies = 0;
    let numStealth = 0;
    let numBloodDebt = 0;
    let numBoost = 0;
    let numDraconic = 0;
    let numIce = 0;
    let numEarth = 0;
    let numLightning = 0;
    let numDecompose = 0;

    // Get hero class from cardDictionary
    const heroId = data?.deck?.hero;
    let heroClass = '';
    let heroTalent = '';
    let iceHero = false;
    let earthHero = false;
    let lightningHero = false;
    
    // Try to find hero in cardDictionary first
    if (heroId && data?.deck?.cardDictionary) {
      const heroCard = data.deck.cardDictionary.find((c: CardData) => c.id === heroId);
      if (heroCard?.class) {
        heroClass = (heroCard.class).trim();
      }
      if (heroCard?.talent) {
        heroTalent = (heroCard.talent).trim();
      }
      if (heroCard?.hasEssenceOfIce) {
        iceHero = true;
      }
      if (heroCard?.hasEssenceOfEarth) {
        earthHero = true;
      }
      if (heroCard?.hasEssenceOfLightning) {
        lightningHero = true;
      }
    }

    values.deck.forEach((cardId: string) => {
      const cleanCardId = cardId.split('-')[0];
      const card = data?.deck.cardDictionary?.find(
        (c: CardData) => c.id === cleanCardId
      );

      if (card) {
        if (card.pitch === 1) ++numRed;
        else if (card.pitch === 2) ++numYellow;
        else if (card.pitch === 3) ++numBlue;
        else if (card.pitch === 0) ++numColorless;

        if (classContains(heroClass, 'RUNEBLADE')) {
          if (card.type === 'AA') ++numRunebladeAA;
          else if (card.type === 'A') ++numRunebladeA;
        }

        if ((classContains(heroClass, 'BRUTE') || classContains(heroClass, 'GUARDIAN')) && card.power !== undefined && card.power >= 6) {
          ++numPower6Plus;
        }

        if (classContains(heroClass, 'MECHANOLOGIST') && card.subtype && subtypeContains(card.subtype, 'Item')) {
          ++numItems;
        }

        if ((classContains(heroClass, 'NECROMANCER') || classContains(heroClass, 'ILLUSIONIST')) && subtypeContains(card.subtype, 'Ally')) {
          ++numAllies;
        }

        if (classContains(heroClass, 'ASSASSIN') && card.hasStealth) {
          ++numStealth;
        }

        if (talentContains(heroTalent, 'SHADOW') && card.hasBloodDebt) {
          ++numBloodDebt;
        }

        if (classContains(heroClass, 'MECHANOLOGIST') && card.hasBoost) {
          ++numBoost;
        }

        if (talentContains(heroTalent, 'DRACONIC') && talentContains(card.talent, 'DRACONIC')) {
          ++numDraconic;
        }

        if (talentContains(card.talent, 'ICE') && iceHero) {
          ++numIce;
        }

        if (talentContains(card.talent, 'EARTH') && earthHero) {
          ++numEarth;
        }

        if (earthHero && card.hasDecompose) {
          ++numDecompose;
        }

        if (talentContains(card.talent, 'LIGHTNING') && lightningHero) {
          ++numLightning;
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
      mechanologistItem: numItems,
      necromancerAlly: numAllies,
      assassinStealth: numStealth,
      shadowBloodDebt: numBloodDebt,
      mechanologistBoost: numBoost,
      draconic: numDraconic,
      ice: numIce,
      earth: numEarth,
      lightning: numLightning,
      decompose: numDecompose
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
              {cardCounts.ice > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.ice}`}>
                    <span className={styles.classIndicator}></span>
                    Ice ({cardCounts.ice})
                  </td>
                  {createProbabilityRows(cardCounts.ice)}
                </tr>
              )}
              {cardCounts.earth > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.earth}`}>
                    <span className={styles.classIndicator}></span>
                    Earth ({cardCounts.earth})
                  </td>
                  {createProbabilityRows(cardCounts.earth)}
                </tr>
              )}
              {cardCounts.lightning > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.lightning}`}>
                    <span className={styles.classIndicator}></span>
                    Lightning ({cardCounts.lightning})
                  </td>
                  {createProbabilityRows(cardCounts.lightning)}
                </tr>
              )}
              {cardCounts.decompose > 0 && (
                <tr className={styles.classSpecificRow}>
                  <td className={`${styles.labelCell} ${styles.decompose}`}>
                    <span className={styles.classIndicator}></span>
                    Decompose ({cardCounts.decompose})
                  </td>
                  {createProbabilityRows(cardCounts.decompose)}
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