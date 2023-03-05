/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZONE } from 'appConstants';
import { Card } from '../features/Card';
import CombatChainLink from '../features/CombatChainLink';
import GameState from '../features/GameState';
import Player from '../features/Player';

function ParseCard(input: any) {
  const card: Card = { cardNumber: 'blank' };
  if (input === undefined) {
    return card;
  }
  card.cardNumber = input.cardNumber ? input.cardNumber : 'blank';
  card.action = input.action ? Number(input.action) : undefined;
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
  card.gem = input.gem ? (input.gem == 1 ? 'active' : 'inactive') : 'none';
  card.countersMap = input.countersMap ? input.countersMap : undefined;
  card.label = input.label ? String(input.label) : undefined;
  card.zone = input.zone;
  card.facing = input.facing;

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
        result.Hero = ParseCard({ ...cardObj, zone: ZONE.HERO });
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
  result.activeChainLink = {};
  if (input.activeChainLink !== undefined) {
    result.activeChainLink.attackingCard = ParseCard(
      input.activeChainLink.attackingCard
    );
    result.activeChainLink.reactionCards = [];
    for (const chainLinkObj of input.activeChainLink.reactions) {
      result.activeChainLink.reactionCards?.push(ParseCard(chainLinkObj));
    }
    result.activeChainLink.totalAttack = input.activeChainLink.totalAttack;
    result.activeChainLink.totalDefence = input.activeChainLink.totalDefence;
    result.activeChainLink.goAgain = input.activeChainLink.goAgain;
    result.activeChainLink.dominate = input.activeChainLink.dominate;
    result.activeChainLink.overpower = input.activeChainLink.overpower;
    result.activeChainLink.damagePrevention = Number(
      input.activeChainLink.damagePrevention
    );
  }

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
  if (
    input.layerDisplay !== undefined &&
    input.layerDisplay.layerContents.length > 0
  ) {
    result.activeLayers.active = true;
    result.activeLayers.cardList = [];
    for (const cardObj of input.layerDisplay.layerContents) {
      result.activeLayers.cardList.push(ParseCard(cardObj));
    }
    result.activeLayers.target = input.layerDisplay.target;
  } else {
    result.activeLayers.active = false;
  }

  // Player Two, the opponent.
  // do equipment first as it's more complicated
  result.playerTwo = ParseEquipment(input.opponentEquipment);

  result.playerTwo.Hand = [];
  for (const cardObj of input.opponentHand) {
    result.playerTwo.Hand.push(ParseCard(cardObj));
  }

  result.playerTwo.SoulCount = input.opponentSoulCount;
  result.playerTwo.bloodDebtCount = input.opponentBloodDebtCount;
  result.playerTwo.bloodDebtImmune = input.isOpponentBloodDebtImmune;
  result.playerTwo.Health = input.opponentHealth;

  result.playerTwo.Graveyard = [];
  for (const cardObj of input.opponentDiscard.reverse()) {
    result.playerTwo.Graveyard.push(ParseCard(cardObj));
  }

  result.playerTwo.PitchRemaining = input.opponentPitchCount;
  result.playerTwo.Pitch = [];
  for (const cardObj of input.opponentPitch.reverse()) {
    result.playerTwo.Pitch.push(ParseCard(cardObj));
  }

  result.playerTwo.DeckSize = input.opponentDeckCount;
  result.playerTwo.DeckBack = ParseCard(input.opponentDeckCard);

  result.playerTwo.Banish = [];
  for (const cardObj of input.opponentBanish.reverse()) {
    result.playerTwo.Banish.push(ParseCard(cardObj));
  }

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
    result.playerTwo.Permanents.push(
      ParseCard({ ...cardObj, zone: ZONE.AURAS })
    );
  }
  for (const cardObj of input.opponentItems) {
    result.playerTwo.Permanents.push(
      ParseCard({ ...cardObj, zone: ZONE.ITEMS })
    );
  }
  for (const cardObj of input.opponentPermanents) {
    result.playerTwo.Permanents.push(ParseCard(cardObj));
  }

  result.playerTwo.Effects = [];
  for (const cardObj of input.opponentEffects) {
    result.playerTwo.Effects.push(ParseCard(cardObj));
  }

  result.playerTwo.ActionPoints = input.opponentAP;

  // Player One the one who's playing.
  // Equipment first again.
  result.playerOne = ParseEquipment(input.playerEquipment);

  result.playerOne.Hand = [];
  for (const cardObj of input.playerHand) {
    result.playerOne.Hand.push(ParseCard(cardObj));
  }

  result.playerOne.bloodDebtCount = input.myBloodDebtCount;
  result.playerOne.bloodDebtImmune = input.amIBloodDebtImmune;
  result.playerOne.SoulCount = input.playerSoulCount;
  result.playerOne.Health = input.playerHealth;

  result.playerOne.Graveyard = [];
  for (const cardObj of input.playerDiscard.reverse()) {
    result.playerOne.Graveyard.push(ParseCard(cardObj));
  }

  result.playerOne.PitchRemaining = input.playerPitchCount;
  result.playerOne.Pitch = [];
  for (const cardObj of input.playerPitch.reverse()) {
    result.playerOne.Pitch.push(ParseCard(cardObj));
  }

  result.playerOne.DeckSize = input.playerDeckCount;
  result.playerOne.DeckBack = ParseCard(input.playerDeckCard);

  result.playerOne.Banish = [];
  for (const cardObj of input.playerBanish.reverse()) {
    result.playerOne.Banish.push(ParseCard(cardObj));
  }

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
    result.playerOne.Permanents.push(
      ParseCard({ ...cardObj, zone: ZONE.AURAS })
    );
  }
  for (const cardObj of input.playerItems) {
    result.playerOne.Permanents.push(
      ParseCard({ ...cardObj, zone: ZONE.ITEMS })
    );
  }
  for (const cardObj of input.playerPermanents) {
    result.playerOne.Permanents.push(ParseCard(cardObj));
  }

  result.playerOne.Effects = [];
  for (const cardObj of input.playerEffects) {
    result.playerOne.Effects.push(ParseCard(cardObj));
  }

  result.playerOne.ActionPoints = input.playerAP;

  // Chat log.
  result.chatLog = [];
  const re = /.\/Images\//gm;
  result.chatLog.push(input.chatLog.replace(re, '/images/'));

  // activeplayer
  result.activePlayer = input.amIActivePlayer ? 1 : 2;

  // last update frame
  result.gameInfo.lastUpdate = input.lastUpdate;

  // last played card
  result.gameInfo.lastPlayed = ParseCard(input.lastPlayedCard);

  // turn number
  result.gameInfo.turnNo = input.turnNo;

  // turn phase
  if (input.turnPhase !== undefined) {
    result.turnPhase = input.turnPhase;
  }

  result.playerInputPopUp = input.playerInputPopUp;

  // if it's the first turn of the game add these details:
  if (input.initialLoad) {
    result.playerOne.Name = input.initialLoad.playerName;
    result.playerOne.isPatron = input.initialLoad.playerIsPatron;
    result.playerOne.isContributor = input.initialLoad.playerIsContributor;
    result.playerTwo.Name = input.initialLoad.opponentName;
    result.playerTwo.isPatron = input.initialLoad.opponentIsPatron;
    result.playerTwo.isContributor = input.initialLoad.opponentIsContributor;
  }

  result.playerPrompt = input.playerPrompt;

  result.canPassPhase = input.canPassPhase;

  result.events = input.newEvents?.eventArray;

  return result;
}
