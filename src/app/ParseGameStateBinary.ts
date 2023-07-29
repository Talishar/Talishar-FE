import { isFunctionDeclaration } from 'typescript';
import { Card } from '../features/Card';
import CombatChainLink from '../features/CombatChainLink';
import GameState from '../features/GameState';

const weaponArray = [
  'Pistol',
  'Sword',
  'Bow',
  'Staff',
  'Claw',
  'Hammer',
  'Dagger',
  'Gun',
  'Scepter',
  'Orb',
  'Axe',
  'Flail',
  'Scythe',
  'Club'
];

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
  const card = parseCard(array[ix]);
  card.cardIndex = ix;
  return card;
}

function parseCard(cardStr: string) {
  const cardArr: string[] = cardStr.split(' ');
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
    cardIndex: 0,
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

function returnEquipment(array: string[], eq: string) {
  const foundCard = array.find((card) => {
    const parsedCard = parseCard(card);
    if (parsedCard.sType === eq || parsedCard.type === eq) {
      return parsedCard;
    }
    if (eq === 'Weapon') {
      for (const weaponType of weaponArray) {
        if (weaponType === parsedCard.sType) {
          return parsedCard;
        }
      }
    }
  });
  if (foundCard === undefined) {
    return;
  }
  return parseCard(foundCard);
}

function parseEQArray(input: string) {
  const eqArray: string[] = input.split('|');
  return {
    HeadEq: returnEquipment(eqArray, 'Head'),
    ChestEq: returnEquipment(eqArray, 'Chest'),
    GlovesEq: returnEquipment(eqArray, 'Arms'),
    FeetEq: returnEquipment(eqArray, 'Legs'),
    WeaponLEq: returnEquipment(eqArray, 'Weapon'),
    Hero: returnEquipment(eqArray, 'C'),
    WeaponREq: returnEquipment(eqArray, 'Off-Hand'),
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
  if (stringArray.length <= 1) {
    throw 'error response from API invalid';
  }

  // index 0 is something
  const result: GameState = {
    gameInfo: { gameID: 0, playerID: 0, authKey: '', isPrivate: false },
    gameDynamicInfo: {},
    playerOne: {},
    playerTwo: {},
    chatEnabled: false
  };

  // index 7 is player2 char and equip
  result.playerTwo = parseEQArray(stringArray[7]);

  // index 1 is combat Chain
  result.activeChainLink = parseCombatChain(stringArray[1]);
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

  // index 8 - PlayerOne Hand
  result.playerOne.Hand = parseHand(stringArray[8]);

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

  // index 12 is combat chain total attack

  result.activeChainLink.totalAttack = isNaN(parseInt(stringArray[13]))
    ? undefined
    : parseInt(stringArray[13]);
  result.activeChainLink.totalDefence = isNaN(parseInt(stringArray[14]))
    ? undefined
    : parseInt(stringArray[14]);

  // index 15 is their arsenal.
  result.playerTwo.Arsenal = parseHand(stringArray[15]);

  // index 16 is our arsenal
  result.playerOne.Arsenal = parseHand(stringArray[16]);

  // index 17 is the chain link summary
  result.oldCombatChain = parseChainLinks(stringArray[17]);

  // index 18 their allies
  // const theirAllies = parseHand(stringArray[18]);
  const theirAllies: Card[] = [];

  // index 19 their aura
  const theirAuras = parseHand(stringArray[19]);

  // index 20 their items
  const theirItems = parseHand(stringArray[20]);

  // index 21 their permanents (other permanents)
  const theirPerms = parseHand(stringArray[21]);

  result.playerTwo.Permanents = theirAllies.concat(
    theirAuras,
    theirItems,
    theirPerms
  );

  // index 22 our allies
  const ourAllies = parseHand(stringArray[22]);

  // index 23 our auras
  const ourAuras = parseHand(stringArray[23]);

  // index 24 our items
  const ourItems = parseHand(stringArray[24]);

  // index 25 our permanents
  const ourPerms = parseHand(stringArray[25]);

  result.playerOne.Permanents = ourAllies.concat(ourAuras, ourItems, ourPerms);
  // index 26 onwards is the log

  const chatLog: string[] = [];

  if (stringArray.length > 26) {
    for (let i = 26; i < stringArray.length - 1; i++) {
      chatLog.push(stringArray[i]);
    }
  }
  result.chatLog = chatLog;

  return result;
}

function parseChainLinks(input: string) {
  const inputArray: string[] = input.split('|');
  return inputArray.map((link, ix) => {
    return { didItHit: link === 'hit' ? true : false, index: ix };
  });
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
