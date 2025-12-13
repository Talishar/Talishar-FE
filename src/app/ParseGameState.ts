/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZONE } from 'appConstants';
import { PLAYMATS } from 'features/options/cardBacks';
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
  card.sType = input.sType ? String(input.sType) : undefined;
  card.restriction = input.restriction ? String(input.restriction) : undefined;
  card.isBroken = input.isBroken ? Boolean(input.isBroken) : false;
  card.onChain = input.onChain ? Boolean(input.onChain) : false;
  card.isFrozen = input.isFrozen ? Boolean(input.isFrozen) : false;
  card.gem = input.gem ? (input.gem == 1 ? 'active' : 'inactive') : 'none';
  card.countersMap = input.countersMap ? input.countersMap : undefined;
  card.label = input.label ? String(input.label) : undefined;
  card.zone = input.zone;
  card.facing = input.facing;
  card.numUses = input.numUses;
  card.subcards = input.subcards;
  card.marked = input.marked ? Boolean(input.marked) : false;
  card.tapped = input.tapped ? Boolean(input.tapped) : false;
  card.uniqueId = input.uniqueID ? String(input.uniqueID) : "-";
  return card;
}

// Important to use this before setting anything else to a player!
function ParseEquipment(input: any) {
  const result: Player = {
    HeadEq: undefined,
    ChestEq: undefined,
    ArmsEq: undefined,
    LegsEq: undefined,
    WeaponLEq: undefined,
    Hero: undefined,
    WeaponREq: undefined,
    Health: undefined,
    ActionPoints: undefined,
    Hand: undefined,
    Arsenal: undefined,
    Banish: undefined,
    BanishCount: undefined,
    Graveyard: undefined,
    GraveyardCount: undefined,
    Pitch: undefined,
    PitchRemaining: undefined,
    DeckSize: undefined,
    DeckBack: undefined,
    Deck: undefined,
    Name: undefined,
    IsVerified: undefined,
    Effects: undefined,
    Permanents: undefined,
    Soul: undefined,
    SoulCount: undefined,
    Playmat: undefined,
    isPatron: undefined,
    isContributor: undefined,
    bloodDebtCount: undefined,
    bloodDebtImmune: undefined,
    CardBack: undefined,
    earthCount: undefined,
    blessingsCount: undefined
  };

  if (input === undefined || input.length == 0) {
    return result;
  }
  for (const cardObj of input) {
    if (cardObj.cardNumber == 'frostbite') {
      switch (cardObj.sType) {
        case 'Head':
          result.HeadEq = ParseCard(cardObj);
          break;
        case 'Chest':
          result.ChestEq = ParseCard(cardObj);
          break;
        case 'Arms':
          result.ArmsEq = ParseCard(cardObj);
          break;
        case 'Legs':
          result.LegsEq = ParseCard(cardObj);
          break;
        default:
          console.log("Frostbite processed without assignment", cardObj);
          break;
      }
    } else {
      switch (cardObj.type) {
        case 'C': // hero
          result.Hero = ParseCard({ ...cardObj, zone: ZONE.HERO });
          break;
        case 'W':
        case 'W,T': // token weapon (i.e. Graphene Chelicera)
        case 'W,T,E': // weapon token equipment (none as of 1/13/25 but futureproofing)
        case 'W,E': // weapon equipment (Parry Blade, Nitro Mechanoid, etc.)
          if (result.WeaponLEq == undefined) {
            result.WeaponLEq = ParseCard(cardObj);
          } else {
            result.WeaponREq = ParseCard(cardObj);
          }
          break;
        case 'E':
          switch (cardObj.sType) {
            case 'Head':
              result.HeadEq = ParseCard(cardObj);
              break;
            case 'Chest':
              result.ChestEq = ParseCard(cardObj);
              break;
            case 'Arms':
              result.ArmsEq = ParseCard(cardObj);
              break;
            case 'Legs':
              result.LegsEq = ParseCard(cardObj);
              break;
            case 'Off-Hand': // make assumption we won't have two weapons AND an off-hand
            case 'Quiver': // make assumption that you can only have a 2H weapon AND a quiver
              result.WeaponREq = ParseCard(cardObj);
              break;
            default:
              break;
          }
          break;
        case 'Companion':
          if (cardObj.sType == 'Off-Hand') {
            result.WeaponREq = ParseCard(cardObj);
            break;
          }
          console.log("Companion processed without assignment", cardObj);
          break;
        default:
          break;
      }
    }
  }

  return result;
}

export default function ParseGameState(input: any) {
  const result: GameState = {
    gameInfo: { gameID: 0, gameGUID: '', playerID: 0, authKey: '', isPrivateLobby: false, isPrivate: false },
    gameDynamicInfo: {},
    playerOne: {},
    playerTwo: {},
    chatEnabled: false,
    shufflingPlayerId: null,
    isShuffling: false,
    addBotDeckPlayerId: null,
    addBotDeckCard: ''
  };

  if (input.errorMessage) {
    if (input.errorMessage === '1234REMATCH') {
      return { ...result, isFullRematch: true };
    }
  }

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
    result.activeChainLink.totalPower = input.activeChainLink.totalPower;
    result.activeChainLink.totalDefense = input.activeChainLink.totalDefense;
    result.activeChainLink.goAgain = input.activeChainLink.goAgain;
    result.activeChainLink.dominate = input.activeChainLink.dominate;
    result.activeChainLink.overpower = input.activeChainLink.overpower;
    result.activeChainLink.confidence = input.activeChainLink.confidence;
    result.activeChainLink.activeOnHits = input.activeChainLink.activeOnHits;
    result.activeChainLink.wager = input.activeChainLink.wager;
    result.activeChainLink.phantasm = input.activeChainLink.phantasm;
    result.activeChainLink.fusion = input.activeChainLink.fusion;
    result.activeChainLink.piercing = input.activeChainLink.piercing;
    result.activeChainLink.tower = input.activeChainLink.tower;
    result.activeChainLink.combo = input.activeChainLink.combo;
    result.activeChainLink.highTide = input.activeChainLink.highTide;
    result.activeChainLink.damagePrevention = Number(
      input.activeChainLink.damagePrevention
    );
    result.activeChainLink.attackTarget = input.activeChainLink.attackTarget;
    result.activeChainLink.numRequiredEquipBlock =
      input.activeChainLink.numRequiredEquipBlock;
  }

  // previous combat chain links
  result.oldCombatChain = [];
  let ix = 0;
  if (input.combatChainLinks && Array.isArray(input.combatChainLinks)) {
    for (const chainLinkObj of input.combatChainLinks) {
      const chainLink: CombatChainLink = {
        didItHit: chainLinkObj.result === 'hit' ? true : false,
        isDraconic: chainLinkObj.isDraconic,
        index: ix
      };
      ix++;
      result.oldCombatChain.push(chainLink);
    }
  }

  // layers
  result.activeLayers = {};
  if (
    input.layerDisplay !== undefined &&
    input.layerDisplay.layerContents.length > 0
  ) {
    result.activeLayers.active = true;
    result.activeLayers.cardList = [];
    result.activeLayers.isReorderable = false;
    for (const layer of input.layerDisplay.reorderableLayers) {
      result.activeLayers.cardList.push({
        ...ParseCard(layer.card),
        layer: layer.layerID,
        reorderable: layer.isReorderable
      });
      if (layer.isReorderable) {
        result.activeLayers.isReorderable = true;
      }
    }
    result.activeLayers.target = input.layerDisplay.target;
  } else {
    result.activeLayers.active = false;
  }

  // Player Two, the opponent.
  // do equipment first as it's more complicated
  result.playerTwo = ParseEquipment(input.opponentEquipment);

  result.playerTwo.Hand = [];
  if (input.opponentHand && Array.isArray(input.opponentHand)) {
    for (const cardObj of input.opponentHand) {
      result.playerTwo.Hand.push(ParseCard(cardObj));
    }
  }

  result.playerTwo.SoulCount = input.opponentSoulCount;
  result.playerTwo.bloodDebtCount = input.opponentBloodDebtCount;
  result.playerTwo.bloodDebtImmune = input.isOpponentBloodDebtImmune;
  result.playerTwo.earthCount = input.opponentEarthCount;
  result.playerTwo.blessingsCount = input.opponentBlessingsCount;
  result.playerTwo.Health = input.opponentHealth;

  result.playerTwo.Graveyard = [];
  if (input.opponentDiscard && Array.isArray(input.opponentDiscard)) {
    for (const cardObj of input.opponentDiscard.reverse()) {
      result.playerTwo.Graveyard.push(ParseCard(cardObj));
    }
  }

  result.playerTwo.PitchRemaining = input.opponentPitchCount;
  result.playerTwo.Pitch = [];
  if (input.opponentPitch && Array.isArray(input.opponentPitch)) {
    for (const cardObj of input.opponentPitch.reverse()) {
      result.playerTwo.Pitch.push(ParseCard(cardObj));
    }
  }

  result.playerTwo.DeckSize = input.opponentDeckCount;
  result.playerTwo.DeckBack = ParseCard(input.opponentDeckCard);
  result.playerTwo.Deck = [];
  if (input.opponentDeck && Array.isArray(input.opponentDeck)) {
    for (const cardObj of input.opponentDeck.reverse()) {
      result.playerTwo.Deck.push(ParseCard(cardObj));
    }
  }
  result.playerTwo.CardBack = input.opponentCardBack;

  result.playerTwo.Banish = [];
  if (input.opponentBanish && Array.isArray(input.opponentBanish)) {
    for (const cardObj of input.opponentBanish.reverse()) {
      result.playerTwo.Banish.push(ParseCard(cardObj));
    }
  }

  if (input.landmarks?.length > 0) {
    result.landmark = ParseCard(input.landmarks[0]);
  }

  result.playerTwo.Arsenal = [];
  if (input.opponentArse && Array.isArray(input.opponentArse)) {
    for (const cardObj of input.opponentArse) {
      result.playerTwo.Arsenal.push(ParseCard(cardObj));
    }
  }

  // Stick all permanents in the same pile.
  result.playerTwo.Permanents = [];
  if (input.opponentAllies && Array.isArray(input.opponentAllies)) {
    for (const cardObj of input.opponentAllies) {
      result.playerTwo.Permanents.push(ParseCard(cardObj));
    }
  }
  if (input.opponentAuras && Array.isArray(input.opponentAuras)) {
    for (const cardObj of input.opponentAuras) {
      result.playerTwo.Permanents.push(
        ParseCard({ ...cardObj, zone: ZONE.AURAS })
      );
    }
  }
  if (input.opponentItems && Array.isArray(input.opponentItems)) {
    for (const cardObj of input.opponentItems) {
      result.playerTwo.Permanents.push(
        ParseCard({ ...cardObj, zone: ZONE.ITEMS })
      );
    }
  }
  if (input.opponentPermanents && Array.isArray(input.opponentPermanents)) {
    for (const cardObj of input.opponentPermanents) {
      result.playerTwo.Permanents.push(ParseCard(cardObj));
    }
  }

  result.playerTwo.Effects = [];
  if (input.opponentEffects && Array.isArray(input.opponentEffects)) {
    for (const cardObj of input.opponentEffects) {
      result.playerTwo.Effects.push(ParseCard(cardObj));
    }
  }

  result.playerTwo.ActionPoints = input.opponentAP;

  // Player One the one who's playing.
  // Equipment first again.
  result.playerOne = ParseEquipment(input.playerEquipment);

  result.playerOne.Hand = [];
  if (input.playerHand && Array.isArray(input.playerHand)) {
    for (const cardObj of input.playerHand) {
      result.playerOne.Hand.push(ParseCard(cardObj));
    }
  }

  result.playerOne.bloodDebtCount = input.myBloodDebtCount;
  result.playerOne.bloodDebtImmune = input.amIBloodDebtImmune;
  result.playerOne.earthCount = input.myEarthCount;
  result.playerOne.blessingsCount = input.myBlessingsCount;
  result.playerOne.SoulCount = input.playerSoulCount;
  result.playerOne.Health = input.playerHealth;

  result.playerOne.Graveyard = [];
  if (input.playerDiscard && Array.isArray(input.playerDiscard)) {
    for (const cardObj of input.playerDiscard.reverse()) {
      result.playerOne.Graveyard.push(ParseCard(cardObj));
    }
  }

  result.playerOne.PitchRemaining = input.playerPitchCount;
  result.playerOne.Pitch = [];
  if (input.playerPitch && Array.isArray(input.playerPitch)) {
    for (const cardObj of input.playerPitch.reverse()) {
      result.playerOne.Pitch.push(ParseCard(cardObj));
    }
  }

  result.playerOne.DeckSize = input.playerDeckCount;
  result.playerOne.DeckBack = ParseCard(input.playerDeckCard);
  result.playerOne.Deck = [];
  if (input.playerDeck && Array.isArray(input.playerDeck)) {
    for (const cardObj of input.playerDeck.reverse()) {
      result.playerOne.Deck.push(ParseCard(cardObj));
    }
  }
  result.playerOne.CardBack = input.playerCardBack;

  result.playerOne.Banish = [];
  if (input.playerBanish && Array.isArray(input.playerBanish)) {
    for (const cardObj of input.playerBanish.reverse()) {
      result.playerOne.Banish.push(ParseCard(cardObj));
    }
  }

  result.playerOne.Arsenal = [];
  if (input.playerArse && Array.isArray(input.playerArse)) {
    for (const cardObj of input.playerArse) {
      result.playerOne.Arsenal.push(ParseCard(cardObj));
    }
  }

  // Stick all permanents in the same pile.
  result.playerOne.Permanents = [];
  if (input.playerAllies && Array.isArray(input.playerAllies)) {
    for (const cardObj of input.playerAllies) {
      result.playerOne.Permanents.push(ParseCard(cardObj));
    }
  }
  if (input.playerAuras && Array.isArray(input.playerAuras)) {
    for (const cardObj of input.playerAuras) {
      result.playerOne.Permanents.push(
        ParseCard({ ...cardObj, zone: ZONE.AURAS })
      );
    }
  }
  if (input.playerItems && Array.isArray(input.playerItems)) {
    for (const cardObj of input.playerItems) {
      result.playerOne.Permanents.push(
        ParseCard({ ...cardObj, zone: ZONE.ITEMS })
      );
    }
  }
  if (input.playerPermanents && Array.isArray(input.playerPermanents)) {
    for (const cardObj of input.playerPermanents) {
      result.playerOne.Permanents.push(ParseCard(cardObj));
    }
  }

  result.playerOne.Effects = [];
  if (input.playerEffects && Array.isArray(input.playerEffects)) {
    for (const cardObj of input.playerEffects) {
      result.playerOne.Effects.push(ParseCard(cardObj));
    }
  }

  result.playerOne.ActionPoints = input.playerAP;

  // Chat log.
  const chatArray = input.chatLog ? input.chatLog.split('<br>') : [];
  const re = /.\/Images\//gm;

  result.chatLog = chatArray.map((message: string) => {
    return message.replace(re, '/images/');
  });

  // activeplayer
  result.amIActivePlayer = input.amIActivePlayer as boolean;

  // turn player
  result.turnPlayer = Number(input.turnPlayer);

  // other player (opponent's player ID)
  result.otherPlayer = Number(input.otherPlayer);

  // last update frame
  result.gameDynamicInfo.lastUpdate = input.lastUpdate;

  // last played card
  result.gameDynamicInfo.lastPlayed = ParseCard(input.lastPlayedCard);

  // turn number
  result.gameDynamicInfo.turnNo = input.turnNo;

  //clock
  result.gameDynamicInfo.clock = input.clock;

  // spectator count
  result.gameDynamicInfo.spectatorCount = input.spectatorCount ?? 0;

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
    result.playerOne.isPvtVoidPatron = input.initialLoad.playerIsPvtVoidPatron;
    result.playerTwo.Name = input.initialLoad.opponentName;
    result.playerTwo.isPatron = input.initialLoad.opponentIsPatron;
    result.playerTwo.isContributor = input.initialLoad.opponentIsContributor;
    result.playerTwo.isPvtVoidPatron = input.initialLoad.opponentIsPvtVoidPatron;
    result.gameInfo.roguelikeGameID = input.initialLoad.roguelikeGameID;
    result.gameInfo.gameGUID = input.initialLoad.gameGUID;
    result.gameInfo.altArts = input.initialLoad.altArts;
    result.gameInfo.opponentAltArts = input.initialLoad.opponentAltArts;
  }

  result.playerPrompt = input.playerPrompt;

  result.canPassPhase = input.canPassPhase;

  result.events = input.newEvents?.eventArray;

  result.hasPriority = !!input.havePriority;

  // Determine which player has priority (1 or 2)
  // If playerID is 1, priorityPlayer is 1 when havePriority is true, 2 when false
  // If playerID is 2, priorityPlayer is 2 when havePriority is true, 1 when false
  // For spectators (playerID 3), backend now sends havePriority as if they were player 1
  if (input.playerID === 1) {
    result.priorityPlayer = input.havePriority ? 1 : 2;
  } else if (input.playerID === 2) {
    result.priorityPlayer = input.havePriority ? 2 : 1;
  } else if (input.playerID === 3) {
    // For spectators, backend sends havePriority as if spectator were player 1
    // So we can use the same logic as player 1
    result.priorityPlayer = input.havePriority ? 1 : 2;
  }

  result.preventPassPrompt = input.preventPassPrompt;

  // playmat
  result.playerOne.Playmat = PLAYMATS[input.MyPlaymat];
  result.playerTwo.Playmat = PLAYMATS[input.TheirPlaymat];

  result.chatEnabled = input.chatEnabled ?? false;

  // opponent typing indicator
  result.opponentIsTyping = input.opponentIsTyping ?? false;

  // game visibility (private or public)
  result.gameInfo.isPrivate = input.isPrivate ?? false;

  // replay status
  result.gameInfo.isReplay = input.isReplay ?? false;

  // opponent AI status (from initialLoad)
  result.gameInfo.isOpponentAI = input.initialLoad?.isOpponentAI ?? false;

  return result;
}
