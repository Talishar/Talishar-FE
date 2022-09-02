import Card from '../features/Card';
import GameState from '../features/GameState';

export function returnCard(input: string) {
  const cardArr: string[] = input.split(' ');
  const card: Card = {
    cardNumber: cardArr[0],
    action: parseInt(cardArr[1]),
    overlay: cardArr[2] === '0' ? 'none' : 'disabled',
    borderColor: cardArr[3],
    counters: parseInt(cardArr[4]),
    actionDataOverride: cardArr[5],
    lifeCounters: parseInt(cardArr[6]),
    defCounters: parseInt(cardArr[7]),
    atkCounters: parseInt(cardArr[8]),
    controller: parseInt(cardArr[9]),
    type: cardArr[10],
    sType: cardArr[11],
    restriction: cardArr[12],
    isBroken: cardArr[13] === '1',
    onChain: cardArr[14] === '1',
    isFrozen: cardArr[15] === '1',
    gem:
      cardArr[15] === '0' ? 'none' : cardArr[15] === '1' ? 'inactive' : 'active'
  };
  return card;
}

function parseHand(input: string) {
  const eqArray: string[] = input.split('|');
  const resultArray: Card[] = [];
  eqArray.map((string) => resultArray.push(returnCard(string)));
  return resultArray;
}

function parseEQArray(input: string) {
  const eqArray: string[] = input.split('|');
  if (eqArray.length === 6) {
    return {
      HeadEq: returnCard(eqArray[2]),
      ChestEq: returnCard(eqArray[3]),
      GlovesEq: returnCard(eqArray[4]),
      FeetEq: returnCard(eqArray[5]),
      WeaponLEq: returnCard(eqArray[1]),
      Hero: returnCard(eqArray[0]),
      WeaponREq: { cardNumber: '' },
      Health: 20,
      ActionPoints: 0,
      PitchRemaining: 0
    };
  }
  return {
    HeadEq: returnCard(eqArray[3]),
    ChestEq: returnCard(eqArray[4]),
    GlovesEq: returnCard(eqArray[5]),
    FeetEq: returnCard(eqArray[6]),
    WeaponLEq: returnCard(eqArray[1]),
    Hero: returnCard(eqArray[0]),
    WeaponREq: returnCard(eqArray[2]),
    Health: 20,
    ActionPoints: 0,
    PitchRemaining: 0
  };
}

export default function ParseGameState(input: string) {
  // inconsistent BR and br cases so replace all with lowercase
  const newInput = input.replace(/<BR>/g, '<br>');
  const stringArray: string[] = newInput.split('<br>');
  const result: GameState = {
    gameInfo: {
      gameID: 0,
      playerID: 0,
      authKey: ''
    },
    playerOne: parseEQArray(stringArray[3]),
    playerTwo: {
      // AI or opposing player
      HeadEq: { cardNumber: 'CRU006' },
      ChestEq: { cardNumber: 'WTR005' },
      GlovesEq: { cardNumber: 'WTR153' },
      FeetEq: { cardNumber: 'WTR004' },
      WeaponLEq: { cardNumber: '' },
      Hero: { cardNumber: 'WTR002' },
      WeaponREq: { cardNumber: 'WTR003' },
      Health: 20,
      ActionPoints: 0,
      PitchRemaining: 0
    }
  };

  result.playerOne.Hand = parseHand(stringArray[2]);
  result.playerTwo.Hand = parseHand(stringArray[1]);
  return result;
}
