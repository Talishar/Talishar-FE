import { isFunctionDeclaration } from 'typescript';
import Card from '../features/Card';
import CombatChainLink from '../features/CombatChainLink';
import GameState from '../features/GameState';
import CardDisplay from '../game/elements/CardDisplay';

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

function ParseCard(input: any) {
  const card: Card = { cardNumber: 'blank' };
  card.cardNumber = input.cardNumber ? input.cardNumber : 'blank';
  card.action = card.action ? Number(card.action) : undefined;
  card.overlay = input.overlay == 1 ? 'disabled' : 'none';
  card.borderColor = input.borderColor ? String(input.borderColor) : undefined;
  card.actionDataOverride = input.actionDataOverride
    ? String(input.actionDataOverride)
    : undefined;
  card.counters = input.counters ? Number(input.counters) : 0;
  card.lifeCounters = input.lifeCounters ? Number(input.lifeCounters) : 0;
  card.defCounters = input.defCounters ? Number(input.defCounters) : 0;
  card.atkCounters = input.atkCounters ? Number(input.atkCounters) : 0;
  card.controller = input.controller ? Number(input.controller) : 0;
  card.type = input.type ? String(input.type) : undefined;
  card.sType = input.sType ? String(input.type) : undefined;
  card.restriction = input.restriction ? String(input.restriction) : undefined;
  card.isBroken = input.isBroken ? Boolean(input.isBroken) : false;
  card.onChain = input.onChain ? Boolean(input.onChain) : false;
  card.isFrozen = input.isFrozen ? Boolean(input.isFrozen) : false;
  card.gem = input.gem ? (input.gem == 2 ? 'active' : 'inactive') : 'none';

  return card;
}

export default function ParseGameState(input: any) {
  const result: GameState = {
    gameInfo: { gameID: 0, playerID: 0, authKey: '' },
    playerOne: {},
    playerTwo: {}
  };
  result.activeCombatChain = {};

  // combat Chain
  if (input.combatChain.length > 0) {
    result.activeCombatChain.attackingCard = ParseCard(input.combatChain[0]);
    if (input.combatChain.length > 1) {
      result.activeCombatChain.reactionCards = [];
      for (let i = 1; i < input.combatChain.length; i++) {
        result.activeCombatChain.reactionCards?.push(
          ParseCard(input.combatChain[i])
        );
      }
    }
  }
  result.activeCombatChain.totalAttack = input.totalAttack;
  result.activeCombatChain.totalDefence = input.totalDefence;

  // layers
  result.activeLayers = {};
  if (input.layerContents.length > 0) {
    result.activeLayers.active = true;
    result.activeLayers.cardList = [];
    for (const cardObj of input.layerContents) {
      result.activeLayers.cardList.push(ParseCard(cardObj));
    }
  } else {
    result.activeLayers.active = false;
  }

  // opponent hand
  result.playerTwo.Hand = [];
  for (const cardObj of input.opponentHand) {
    result.playerTwo.Hand.push(ParseCard(cardObj));
  }

  result.playerTwo.Health = input.opponentHealth;

  result.playerTwo.GraveyardCount = input.opponentDiscardCount;
  result.playerTwo.Graveyard = [];
  result.playerTwo.Graveyard.push(ParseCard(input.opponentDiscardCard));

  result.playerTwo.PitchRemaining = input.opponentPitchCount;
  result.playerTwo.Pitch = [];
  result.playerTwo.Pitch.push(ParseCard(input.opponentPitchCard));

  result.playerTwo.DeckSize = input.opponentDeckCount;
  result.playerTwo.DeckBack = ParseCard(input.opponentDeckCard);

  result.playerTwo.BanishCount = input.opponentBanishCount;
  result.playerTwo.Banish = [];
  result.playerTwo.Banish.push(ParseCard(input.opponentBanishCard));

  return result;
}
