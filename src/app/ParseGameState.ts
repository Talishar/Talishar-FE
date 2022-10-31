/* eslint-disable @typescript-eslint/no-explicit-any */
import Card from '../features/Card';
import CombatChainLink from '../features/CombatChainLink';
import GameState from '../features/GameState';
import Player from '../features/Player';

function ParseCard(input: any) {
  const card: Card = { cardNumber: 'blank' };
  if (input === undefined) {
    return card;
  }
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

// Important to use this before setting anything else to a player!
function ParseEquipment(input: any) {
  const result: Player = {};

  if (input === undefined || input.length == 0) {
    return result;
  }
  for (const cardObj of input) {
    switch (cardObj.type) {
      case 'C': // hero
        result.Hero = ParseCard(cardObj);
        break;
      case 'W': // weapon, possibly have two
        if (result.WeaponLEq === undefined) {
          result.WeaponLEq = ParseCard(cardObj);
        } else {
          result.WeaponREq = ParseCard(cardObj);
        }
        break;
      default: // if not hero or weapon it's equipment
        switch (cardObj.sType) {
          case 'Head':
            result.HeadEq = ParseCard(cardObj);
            break;
          case 'Chest':
            result.ChestEq = ParseCard(cardObj);
            break;
          case 'Arms':
            result.GlovesEq = ParseCard(cardObj);
            break;
          case 'Legs':
            result.FeetEq = ParseCard(cardObj);
            break;
          case 'Off-Hand': // make assumption we won't have two weapons AND an off-hand
            result.WeaponREq = ParseCard(cardObj);
            break;
          default:
            break;
        }
        break;
    }
  }

  return result;
}

export default function ParseGameState(input: any) {
  const result: GameState = {
    gameInfo: { gameID: 0, playerID: 0, authKey: '' },
    playerOne: {},
    playerTwo: {}
  };

  // active chain link
  result.activeCombatChain = {};
  if (input.activeChainLink !== undefined && input.activeChainLink.length > 0) {
    result.activeCombatChain.attackingCard = ParseCard(
      input.activeChainLink[0]
    );
    if (input.activeChainLink.length > 1) {
      result.activeCombatChain.reactionCards = [];
      for (let i = 1; i < input.activeChainLink.length; i++) {
        result.activeCombatChain.reactionCards?.push(
          ParseCard(input.activeChainLink[i])
        );
      }
    }
  }
  result.activeCombatChain.totalAttack = input.totalAttack;
  result.activeCombatChain.totalDefence = input.totalDefence;

  // previous combat chain links
  result.oldCombatChain = [];
  let ix = 0;
  for (const chainLinkObj of input.combatChainLinks) {
    const chainLink: CombatChainLink = {
      didItHit: chainLinkObj === 'hit' ? true : false,
      index: ix
    };
    ix++;
    result.oldCombatChain.push(chainLink);
  }

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

  // Player Two, the opponent.
  // do equipment first as it's more complicated
  result.playerTwo = ParseEquipment(input.opponentEquipment);
  result.playerTwo.Name = input.opponentName;

  result.playerTwo.Hand = [];
  for (const cardObj of input.opponentHand) {
    result.playerTwo.Hand.push(ParseCard(cardObj));
  }

  result.playerTwo.SoulCount = input.opponentSoulCount;
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

  result.playerTwo.Arsenal = [];
  for (const cardObj of input.opponentArse) {
    result.playerTwo.Arsenal.push(ParseCard(cardObj));
  }

  // Stick all permanents in the same pile.
  result.playerTwo.Permanents = [];
  for (const cardObj of input.opponentAllies) {
    result.playerTwo.Permanents.push(ParseCard(cardObj));
  }
  for (const cardObj of input.opponentAuras) {
    result.playerTwo.Permanents.push(ParseCard(cardObj));
  }
  for (const cardObj of input.opponentItems) {
    result.playerTwo.Permanents.push(ParseCard(cardObj));
  }
  for (const cardObj of input.opponentPermanents) {
    result.playerTwo.Permanents.push(ParseCard(cardObj));
  }

  result.playerTwo.Effects = [];
  for (const cardObj of input.opponentEffects) {
    result.playerTwo.Effects.push(ParseCard(cardObj));
  }

  // Player One the one who's playing.
  // Equipment first again.
  result.playerOne = ParseEquipment(input.playerEquipment);
  result.playerOne.Name = input.playerName;

  result.playerOne.Hand = [];
  for (const cardObj of input.playerHand) {
    result.playerOne.Hand.push(ParseCard(cardObj));
  }

  result.playerOne.SoulCount = input.playerSoulCount;
  result.playerOne.Health = input.playerHealth;

  result.playerOne.GraveyardCount = input.playerDiscardCount;
  result.playerOne.Graveyard = [];
  result.playerOne.Graveyard.push(ParseCard(input.playerDiscardCard));

  result.playerOne.PitchRemaining = input.playerPitchCount;
  result.playerOne.Pitch = [];
  result.playerOne.Pitch.push(ParseCard(input.playerPitchCard));

  result.playerOne.DeckSize = input.playerDeckCount;
  result.playerOne.DeckBack = ParseCard(input.playerDeckCard);

  result.playerOne.BanishCount = input.playerBanishCount;
  result.playerOne.Banish = [];
  result.playerOne.Banish.push(ParseCard(input.playerBanishCard));

  result.playerOne.Arsenal = [];
  for (const cardObj of input.playerArse) {
    result.playerOne.Arsenal.push(ParseCard(cardObj));
  }

  // Stick all permanents in the same pile.
  result.playerOne.Permanents = [];
  for (const cardObj of input.playerAllies) {
    result.playerOne.Permanents.push(ParseCard(cardObj));
  }
  for (const cardObj of input.playerAuras) {
    result.playerOne.Permanents.push(ParseCard(cardObj));
  }
  for (const cardObj of input.playerItems) {
    result.playerOne.Permanents.push(ParseCard(cardObj));
  }
  for (const cardObj of input.playerPermanents) {
    result.playerOne.Permanents.push(ParseCard(cardObj));
  }

  result.playerOne.Effects = [];
  for (const cardObj of input.playerEffects) {
    result.playerOne.Effects.push(ParseCard(cardObj));
  }

  // Chat log.
  result.chatLog = [];
  result.chatLog.push(input.chatLog);

  // last update frame
  result.gameInfo.lastUpdate = input.lastUpdate;

  // last played card
  result.gameInfo.lastPlayed = ParseCard(input.lastPlayedCard);
  return result;
}
