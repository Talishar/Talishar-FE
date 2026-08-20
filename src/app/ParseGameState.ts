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

  let end = cardNumber.length;
  if (cardNumber.endsWith('_red')) end -= 4;
  else if (cardNumber.endsWith('_yellow')) end -= 7;
  else if (cardNumber.endsWith('_blue')) end -= 5;

  let result = '';
  let wordStart = 0;
  let wordCount = 0;

  for (let index = 0; index <= end; index += 1) {
    if (index !== end && cardNumber.charCodeAt(index) !== 95) continue;

    if (wordCount > 0) result += ' ';
    if (index > wordStart) {
      result += cardNumber.charAt(wordStart).toUpperCase();
      if (index > wordStart + 1) {
        result += cardNumber.slice(wordStart + 1, index).toLowerCase();
      }
    }

    wordStart = index + 1;
    wordCount += 1;
  }

  return result;
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
  card.slot = input.slot ? String(input.slot) : undefined;
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
    const card = ParseCard(cardObj);

    switch (card.slot) {
      case 'Hero':
        card.zone = ZONE.HERO;
        result.Hero = card;
        break;
      case 'LWep':
        result.WeaponLEq = card;
        break;
      case 'RWep':
      case 'Off-Hand':
        result.WeaponREq = card;
        break;
      case 'Head':
        result.HeadEq = card;
        break;
      case 'Chest':
        result.ChestEq = card;
        break;
      case 'Arms':
        result.ArmsEq = card;
        break;
      case 'Legs':
        result.LegsEq = card;
        break;
      default:
        break;
    }
  }

  return result;
}

function parseCards(input: any, reverse = false): Card[] {
  if (!Array.isArray(input)) return [];
  const result: Card[] = [];
  if (reverse) {
    for (let i = input.length - 1; i >= 0; i--)
      result.push(ParseCard(input[i]));
  } else {
    for (const cardObj of input) result.push(ParseCard(cardObj));
  }
  return result;
}

interface PlayerKeyMap {
  equipment: string;
  hand: string;
  soul: string;
  soulCount: string;
  bloodDebtCount: string;
  bloodDebtImmune: string;
  earthCount: string;
  blessingsCount: string;
  health: string;
  discard: string;
  pitch: string;
  pitchCount: string;
  deck: string;
  deckCount: string;
  deckCard: string;
  cardBack: string;
  banish: string;
  arsenal: string;
  allies: string;
  auras: string;
  items: string;
  permanents: string;
  effects: string;
  actionPoints: string;
}

const PLAYER_ONE_KEYS: PlayerKeyMap = {
  equipment: 'playerEquipment',
  hand: 'playerHand',
  soul: 'playerSoul',
  soulCount: 'playerSoulCount',
  bloodDebtCount: 'myBloodDebtCount',
  bloodDebtImmune: 'amIBloodDebtImmune',
  earthCount: 'myEarthCount',
  blessingsCount: 'myBlessingsCount',
  health: 'playerHealth',
  discard: 'playerDiscard',
  pitch: 'playerPitch',
  pitchCount: 'playerPitchCount',
  deck: 'playerDeck',
  deckCount: 'playerDeckCount',
  deckCard: 'playerDeckCard',
  cardBack: 'playerCardBack',
  banish: 'playerBanish',
  arsenal: 'playerArse',
  allies: 'playerAllies',
  auras: 'playerAuras',
  items: 'playerItems',
  permanents: 'playerPermanents',
  effects: 'playerEffects',
  actionPoints: 'playerAP'
};

const PLAYER_TWO_KEYS: PlayerKeyMap = {
  equipment: 'opponentEquipment',
  hand: 'opponentHand',
  soul: 'opponentSoul',
  soulCount: 'opponentSoulCount',
  bloodDebtCount: 'opponentBloodDebtCount',
  bloodDebtImmune: 'isOpponentBloodDebtImmune',
  earthCount: 'opponentEarthCount',
  blessingsCount: 'opponentBlessingsCount',
  health: 'opponentHealth',
  discard: 'opponentDiscard',
  pitch: 'opponentPitch',
  pitchCount: 'opponentPitchCount',
  deck: 'opponentDeck',
  deckCount: 'opponentDeckCount',
  deckCard: 'opponentDeckCard',
  cardBack: 'opponentCardBack',
  banish: 'opponentBanish',
  arsenal: 'opponentArse',
  allies: 'opponentAllies',
  auras: 'opponentAuras',
  items: 'opponentItems',
  permanents: 'opponentPermanents',
  effects: 'opponentEffects',
  actionPoints: 'opponentAP'
};

function ParsePlayer(input: any, keys: PlayerKeyMap): Player {
  // Equipment must be parsed first; it seeds every field on the Player.
  const player = ParseEquipment(input[keys.equipment]);

  player.Hand = parseCards(input[keys.hand]);
  player.Soul = parseCards(input[keys.soul]);
  player.SoulCount = input[keys.soulCount];
  player.bloodDebtCount = input[keys.bloodDebtCount];
  player.bloodDebtImmune = input[keys.bloodDebtImmune];
  player.earthCount = input[keys.earthCount];
  player.blessingsCount = input[keys.blessingsCount];
  player.Health = input[keys.health];

  // Piles the backend sends bottom-first are reversed so index 0 is the top.
  player.Graveyard = parseCards(input[keys.discard], true);
  player.Pitch = parseCards(input[keys.pitch], true);
  player.Deck = parseCards(input[keys.deck], true);
  player.Banish = parseCards(input[keys.banish], true);

  player.PitchRemaining = input[keys.pitchCount];
  player.DeckSize = input[keys.deckCount];
  player.DeckBack = ParseCard(input[keys.deckCard]);
  player.CardBack = input[keys.cardBack];
  player.Arsenal = parseCards(input[keys.arsenal]);

  // Allies, auras, items and permanents all share one pile on the frontend.
  player.Permanents = [
    ...parseCards(input[keys.allies]),
    ...parseCards(input[keys.auras]).map((card) => ({
      ...card,
      zone: ZONE.AURAS
    })),
    ...parseCards(input[keys.items]).map((card) => ({
      ...card,
      zone: ZONE.ITEMS
    })),
    ...parseCards(input[keys.permanents])
  ];

  player.Effects = parseCards(input[keys.effects]);
  player.ActionPoints = input[keys.actionPoints];

  return player;
}

export default function ParseGameState(input: any) {
  const result: GameState = {
    gameInfo: {
      gameID: 0,
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
    arsenalFlipTrigger: 0,
    arsenalDestroyP1Card: '',
    arsenalDestroyP2Card: '',
    arsenalDestroyTrigger: 0,
    heroTransformP1Card: '',
    heroTransformP2Card: '',
    heroTransformTrigger: 0
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

  result.playerTwo = ParsePlayer(input, PLAYER_TWO_KEYS);
  result.playerOne = ParsePlayer(input, PLAYER_ONE_KEYS);

  if (input.landmarks?.length > 0) {
    result.landmark = ParseCard(input.landmarks[0]);
  }

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
    result.gameInfo.deckLink = input.initialLoad.deckLink;
    result.gameInfo.canCustomizeDeck =
      input.initialLoad.canCustomizeDeck ?? false;
    result.gameInfo.deckCardBackId = input.initialLoad.deckCardBackId;
    result.gameInfo.deckPlaymatId = input.initialLoad.deckPlaymatId;
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

  // Ephemeral opponent activity, containing zone-level information only.
  result.opponentPresence = input.opponentPresence ?? null;

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
  result.practiceDummyWeaponPower = input.practiceDummyWeaponPower ?? 4;

  // opponent inactivity status
  result.opponentInactive = input.inactive ?? false;

  result.inactivityDeadline = input.inactivityDeadline ?? undefined;
  result.serverTimeOffset = input.serverTime
    ? input.serverTime - Date.now()
    : undefined;

  // rematch acceptance status
  result.isFullRematch = input.fullRematchAccepted ?? false;

  return result;
}
