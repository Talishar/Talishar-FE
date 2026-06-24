/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZONE } from 'appConstants';
import { PLAYMATS } from 'features/options/cardBacks';
import { Card } from '../features/Card';
import CombatChainLink from '../features/CombatChainLink';
import GameState from '../features/GameState';
import Player from '../features/Player';

// Hoisted out of ParseGameState: this used to be allocated fresh on every
// single poll/SSE push even though the pattern never changes.
const IMAGE_PATH_RE = /.\/Images\//gm;

function GetCardName(cardNumber: string): string {
  if (!cardNumber || cardNumber === 'blank') return '';
  let name = cardNumber.replace(/_red$|_yellow$|_blue$/, '');
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function ParseCard(input: any) {
  const card: Card = { cardNumber: 'blank' };
  if (input === undefined) {
    return card;
  }
  card.cardNumber = input.cardNumber ? input.cardNumber : 'blank';
  card.cardName = input.cardName
    ? input.cardName
    : GetCardName(card.cardNumber);
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
  card.uniqueId = input.uniqueID ? String(input.uniqueID) : '-';
  card.holoCounters = input.holoCounters ? Boolean(input.holoCounters) : false;
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
    isPvtVoidPatron: undefined,
    metafyTiers: undefined,
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
          console.log('Frostbite processed without assignment', cardObj);
          break;
      }
    } else {
      switch (cardObj.type) {
        case 'C': // hero
          result.Hero = ParseCard(cardObj);
          result.Hero.zone = ZONE.HERO;
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
          console.log('Companion processed without assignment', cardObj);
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
    gameInfo: {
      gameID: 0,
      gameGUID: '',
      playerID: 0,
      authKey: '',
      isPrivateLobby: false,
      isPrivate: false
    },
    gameDynamicInfo: {},
    playerOne: {},
    playerTwo: {},
    chatEnabled: false,
    shufflingPlayerId: null,
    isShuffling: false,
    addBotDeckPlayerId: null,
    addBotDeckCard: '',
    clashRevealP1Card: '',
    clashRevealP2Card: '',
    clashRevealTrigger: 0,
    arsenalFlipP1Card: '',
    arsenalFlipP2Card: '',
    arsenalFlipTrigger: 0
  };

  if (input.errorMessage) {
    if (input.errorMessage === '1234REMATCH') {
      return { ...result, isFullRematch: true };
    }
    // Handle game not found errors
    const errorMsg = input.errorMessage.toLowerCase();
    if (
      errorMsg.includes('game no longer exists') ||
      errorMsg.includes('does not exist')
    ) {
      throw new Error(`GAME_NOT_FOUND: ${input.errorMessage}`);
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
  result.playerTwo.Soul = [];
  if (input.opponentSoul && Array.isArray(input.opponentSoul)) {
    for (const cardObj of input.opponentSoul) {
      result.playerTwo.Soul.push(ParseCard(cardObj));
    }
  }
  result.playerTwo.bloodDebtCount = input.opponentBloodDebtCount;
  result.playerTwo.bloodDebtImmune = input.isOpponentBloodDebtImmune;
  result.playerTwo.earthCount = input.opponentEarthCount;
  result.playerTwo.blessingsCount = input.opponentBlessingsCount;
  result.playerTwo.Health = input.opponentHealth;

  result.playerTwo.Graveyard = [];
  if (input.opponentDiscard && Array.isArray(input.opponentDiscard)) {
    for (let j = input.opponentDiscard.length - 1; j >= 0; j--) {
      result.playerTwo.Graveyard.push(ParseCard(input.opponentDiscard[j]));
    }
  }

  result.playerTwo.PitchRemaining = input.opponentPitchCount;
  result.playerTwo.Pitch = [];
  if (input.opponentPitch && Array.isArray(input.opponentPitch)) {
    for (let j = input.opponentPitch.length - 1; j >= 0; j--) {
      result.playerTwo.Pitch.push(ParseCard(input.opponentPitch[j]));
    }
  }

  result.playerTwo.DeckSize = input.opponentDeckCount;
  result.playerTwo.DeckBack = ParseCard(input.opponentDeckCard);
  result.playerTwo.Deck = [];
  if (input.opponentDeck && Array.isArray(input.opponentDeck)) {
    for (let j = input.opponentDeck.length - 1; j >= 0; j--) {
      result.playerTwo.Deck.push(ParseCard(input.opponentDeck[j]));
    }
  }
  result.playerTwo.CardBack = input.opponentCardBack;

  result.playerTwo.Banish = [];
  if (input.opponentBanish && Array.isArray(input.opponentBanish)) {
    for (let j = input.opponentBanish.length - 1; j >= 0; j--) {
      result.playerTwo.Banish.push(ParseCard(input.opponentBanish[j]));
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
      const parsed = ParseCard(cardObj);
      parsed.zone = ZONE.AURAS;
      result.playerTwo.Permanents.push(parsed);
    }
  }
  if (input.opponentItems && Array.isArray(input.opponentItems)) {
    for (const cardObj of input.opponentItems) {
      const parsed = ParseCard(cardObj);
      parsed.zone = ZONE.ITEMS;
      result.playerTwo.Permanents.push(parsed);
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
  result.playerOne.Soul = [];
  if (input.playerSoul && Array.isArray(input.playerSoul)) {
    for (const cardObj of input.playerSoul) {
      result.playerOne.Soul.push(ParseCard(cardObj));
    }
  }
  result.playerOne.Health = input.playerHealth;

  result.playerOne.Graveyard = [];
  if (input.playerDiscard && Array.isArray(input.playerDiscard)) {
    for (let j = input.playerDiscard.length - 1; j >= 0; j--) {
      result.playerOne.Graveyard.push(ParseCard(input.playerDiscard[j]));
    }
  }

  result.playerOne.PitchRemaining = input.playerPitchCount;
  result.playerOne.Pitch = [];
  if (input.playerPitch && Array.isArray(input.playerPitch)) {
    for (let j = input.playerPitch.length - 1; j >= 0; j--) {
      result.playerOne.Pitch.push(ParseCard(input.playerPitch[j]));
    }
  }

  result.playerOne.DeckSize = input.playerDeckCount;
  result.playerOne.DeckBack = ParseCard(input.playerDeckCard);
  result.playerOne.Deck = [];
  if (input.playerDeck && Array.isArray(input.playerDeck)) {
    for (let j = input.playerDeck.length - 1; j >= 0; j--) {
      result.playerOne.Deck.push(ParseCard(input.playerDeck[j]));
    }
  }
  result.playerOne.CardBack = input.playerCardBack;

  result.playerOne.Banish = [];
  if (input.playerBanish && Array.isArray(input.playerBanish)) {
    for (let j = input.playerBanish.length - 1; j >= 0; j--) {
      result.playerOne.Banish.push(ParseCard(input.playerBanish[j]));
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
      const parsed = ParseCard(cardObj);
      parsed.zone = ZONE.AURAS;
      result.playerOne.Permanents.push(parsed);
    }
  }
  if (input.playerItems && Array.isArray(input.playerItems)) {
    for (const cardObj of input.playerItems) {
      const parsed = ParseCard(cardObj);
      parsed.zone = ZONE.ITEMS;
      result.playerOne.Permanents.push(parsed);
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

  result.chatLog = chatArray.map((message: string) => {
    return message.replace(IMAGE_PATH_RE, '/images/');
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
  result.gameDynamicInfo.spectatorNames = input.spectatorNames ?? [];
  // player inventory
  result.gameDynamicInfo.playerInventory = input.playerInventory
    ? input.playerInventory.map((card: any) => ParseCard(card))
    : [];
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
    result.playerOne.metafyTiers = input.initialLoad.playerMetafyTiers || [];
    result.playerTwo.Name = input.initialLoad.opponentName;
    result.playerTwo.isPatron = input.initialLoad.opponentIsPatron;
    result.playerTwo.isContributor = input.initialLoad.opponentIsContributor;
    result.playerTwo.isPvtVoidPatron =
      input.initialLoad.opponentIsPvtVoidPatron;
    result.playerTwo.metafyTiers = input.initialLoad.opponentMetafyTiers || [];
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

  // game format (from initialLoad)
  if (input.initialLoad?.gameFormat) {
    result.gameInfo.gameFormat = input.initialLoad.gameFormat;
  }

  // AI infinite HP status for manual mode
  result.aiHasInfiniteHP = input.aiHasInfiniteHP ?? false;

  // opponent inactivity status
  result.opponentInactive = input.inactive ?? false;

  // rematch acceptance status
  result.isFullRematch = input.fullRematchAccepted ?? false;

  return result;
}
