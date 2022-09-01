import { Card } from '../features/cardSlice';
import { GameState } from '../features/game/gameSlice';

export function ParseGameState(input: string) {
  const newInput = input.replace(/<BR>/g, '<br>');
  const stringArray: string[] = newInput.split('<br>');
  console.log(stringArray);
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

export function returnCard(input: string) {
  const cardArr: string[] = input.split(' ');
  return cardArr[0];
}

function parseHand(input: string) {
  const eqArray: string[] = input.split('|');
  const resultArray: Card[] = [];
  eqArray.map((string, _) =>
    resultArray.push({
      cardNumber: returnCard(string)
    })
  );
  return resultArray;
}

function parseEQArray(input: string) {
  const eqArray: string[] = input.split('|');
  if (eqArray.length == 6) {
    return {
      HeadEq: { cardNumber: returnCard(eqArray[2]) },
      ChestEq: { cardNumber: returnCard(eqArray[3]) },
      GlovesEq: { cardNumber: returnCard(eqArray[4]) },
      FeetEq: { cardNumber: returnCard(eqArray[5]) },
      WeaponLEq: { cardNumber: returnCard(eqArray[1]) },
      Hero: { cardNumber: returnCard(eqArray[0]) },
      WeaponREq: { cardNumber: '' },
      Health: 20,
      ActionPoints: 0,
      PitchRemaining: 0
    };
  } else {
    return {
      HeadEq: { cardNumber: returnCard(eqArray[3]) },
      ChestEq: { cardNumber: returnCard(eqArray[4]) },
      GlovesEq: { cardNumber: returnCard(eqArray[5]) },
      FeetEq: { cardNumber: returnCard(eqArray[6]) },
      WeaponLEq: { cardNumber: returnCard(eqArray[1]) },
      Hero: { cardNumber: returnCard(eqArray[0]) },
      WeaponREq: { cardNumber: returnCard(eqArray[2]) },
      Health: 20,
      ActionPoints: 0,
      PitchRemaining: 0
    };
  }
}
