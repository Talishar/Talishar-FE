import Card from '../features/Card';
import CombatChainLink from '../features/CombatChainLink';
import GameState from '../features/GameState';

export function returnCardString(input: string, ix: number) {
  const array = [];
  array.push(input);
  const card = returnCard(array, 0);
  card.cardIndex = ix;
  return card;
}

export function returnCard(array: string[], ix: number) {
  if (array === undefined) {
    return { cardNumber: '' };
  }
  const cardArr: string[] = array[ix].split(' ');
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
    cardIndex: ix,
    gem:
      cardArr[16] === '0' ? 'none' : cardArr[15] === '1' ? 'inactive' : 'active'
  };
  return card;
}

function parseHand(input: string) {
  const eqArray: string[] = input.split('|');
  const resultArray: Card[] = [];
  eqArray.map((string, ix) => resultArray.push(returnCardString(string, ix)));
  return resultArray;
}

function parseEQArray(input: string) {
  const eqArray: string[] = input.split('|');
  if (eqArray.length === 6) {
    return {
      HeadEq: returnCard(eqArray, 2),
      ChestEq: returnCard(eqArray, 3),
      GlovesEq: returnCard(eqArray, 4),
      FeetEq: returnCard(eqArray, 5),
      WeaponLEq: returnCard(eqArray, 1),
      Hero: returnCard(eqArray, 0),
      WeaponREq: { cardNumber: '' },
      Health: 0,
      ActionPoints: 0,
      PitchRemaining: 0
    };
  }
  return {
    HeadEq: returnCard(eqArray, 3),
    ChestEq: returnCard(eqArray, 4),
    GlovesEq: returnCard(eqArray, 5),
    FeetEq: returnCard(eqArray, 6),
    WeaponLEq: returnCard(eqArray, 1),
    Hero: returnCard(eqArray, 0),
    WeaponREq: returnCard(eqArray, 2),
    Health: 20,
    ActionPoints: 0,
    PitchRemaining: 0
  };
}

export default function ParseGameState(input: string) {
  // inconsistent BR and br cases so replace all with lowercase
  let newInput = input.replace(/<BR>/g, '<br>');
  newInput = newInput.replace(/<\/div>/g, '<br>');
  newInput = newInput.replace(/<div id='theirChar'>/g, '');
  const stringArray: string[] = newInput.split('<br>');
  // index 0 is something
  const result: GameState = {
    gameInfo: { gameID: 0, playerID: 0, authKey: '' },
    playerOne: {},
    playerTwo: {}
  };
  // index 7 is player2 char and equip
  result.playerTwo = parseEQArray(stringArray[7]);

  // index 1 is combat Chain
  result.activeCombatChain = parseCombatChain(stringArray[1]);
  // index 2 in layers
  result.activeLayers = parseLayers(stringArray[2]);
  // index 3 is player2 hand
  result.playerTwo.Hand = parseHand(stringArray[3]);

  // index 4 is player2 health
  result.playerTwo.Health = parseInt(stringArray[4]);
  // index 5 is player2 soul
  result.playerTwo.SoulCount = parseInt(stringArray[5]);

  // index 6 is player2 count their discard pitch deck and banish (fetch when we want to look)
  // discard amount cardID| pitchAmount cardId| deckAmt cardId| banish cardID
  const zonesArrayPTwo = stringArray[6].split('|');
  // graveyard
  result.playerTwo.GraveyardCount = parseInt(zonesArrayPTwo[0].split(' ')[0]);
  result.playerTwo.Graveyard =
    zonesArrayPTwo[0].split(' ')[1] === 'blankZone'
      ? undefined
      : [{ cardNumber: zonesArrayPTwo[0].split(' ')[1] }];
  // pitch
  result.playerTwo.PitchRemaining = parseInt(zonesArrayPTwo[1].split(' ')[0]);
  result.playerTwo.Pitch =
    zonesArrayPTwo[1].split(' ')[1] === 'blankZone'
      ? undefined
      : [{ cardNumber: zonesArrayPTwo[1].split(' ')[1] }];
  // deck
  result.playerTwo.DeckSize = parseInt(zonesArrayPTwo[2].split(' ')[0]);
  result.playerTwo.DeckBack =
    zonesArrayPTwo[2].split(' ')[1] === 'blankZone'
      ? undefined
      : { cardNumber: zonesArrayPTwo[2].split(' ')[1] };
  // banish
  result.playerTwo.BanishCount = parseInt(zonesArrayPTwo[3].split(' ')[0]);
  result.playerTwo.Banish =
    zonesArrayPTwo[3].split(' ')[1] === 'blankZone'
      ? undefined
      : [{ cardNumber: zonesArrayPTwo[3].split(' ')[1] }];

  // index 12 - PlayerOneEQ Array - must parse this before other playerOne individual values set
  result.playerOne = parseEQArray(stringArray[12]);

  // index 9 - player One health
  result.playerOne.Health = parseInt(stringArray[9]);

  // index 11 is player1 count their discard pitch deck and banish (fetch when we want to look)
  // discard amount cardID| pitchAmount cardId| deckAmt cardId| banish cardID
  const zonesArrayPOne = stringArray[11].split('|');
  // graveyard
  result.playerOne.GraveyardCount = parseInt(zonesArrayPOne[0].split(' ')[0]);
  result.playerOne.Graveyard =
    zonesArrayPOne[0].split(' ')[1] === 'blankZone'
      ? undefined
      : [{ cardNumber: zonesArrayPOne[0].split(' ')[1] }];
  // pitch
  result.playerOne.PitchRemaining = parseInt(zonesArrayPOne[1].split(' ')[0]);
  result.playerOne.Pitch =
    zonesArrayPOne[1].split(' ')[1] === 'blankZone'
      ? undefined
      : [{ cardNumber: zonesArrayPOne[1].split(' ')[1] }];
  // deck
  result.playerOne.DeckSize = parseInt(zonesArrayPOne[2].split(' ')[0]);
  result.playerOne.DeckBack =
    zonesArrayPOne[2].split(' ')[1] === 'blankZone'
      ? undefined
      : { cardNumber: zonesArrayPOne[2].split(' ')[1] };
  // banish
  result.playerOne.BanishCount = parseInt(zonesArrayPOne[3].split(' ')[0]);
  result.playerOne.Banish =
    zonesArrayPOne[3].split(' ')[1] === 'blankZone'
      ? undefined
      : [{ cardNumber: zonesArrayPOne[3].split(' ')[1] }];

  return result;
}

function parseCombatChain(input: string) {
  const inputArray: string[] = input.split('|');
  const combatChain: CombatChainLink = {
    attackingCard: returnCard(inputArray, 0),
    reactionCards: []
  };
  inputArray.shift();
  combatChain.reactionCards = inputArray.map((card, ix) => {
    return returnCard(inputArray, ix);
  });
  return combatChain;
}

function parseLayers(input: string) {
  if (input === '') {
    return { active: false };
  }
  const inputArray: string[] = input.split('|');
  const cardList = inputArray.map((card, ix) => {
    return returnCard(inputArray, ix);
  });
  const layers = { active: true, cardList: cardList };
  return layers;
}
