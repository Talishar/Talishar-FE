import { GetLobbyRefreshResponse } from 'interface/API/GetLobbyRefresh.php';
import Button from './Button';
import { Card } from './Card';
import CombatChainLink from './CombatChainLink';
import { GameDynamicInfo } from './GameDynamicInfo';
import GameStaticInfo from './GameStaticInfo';
import Player from './Player';

export default interface GameState {
  gameInfo: GameStaticInfo;
  gameDynamicInfo: GameDynamicInfo;
  playerOne: Player;
  playerTwo: Player;
  activeChainLink?: CombatChainLink;
  oldCombatChain?: CombatChainLink[];
  amIActivePlayer?: boolean;
  turnPlayer?: number;
  otherPlayer?: number;
  clock?: number;
  popup?: {
    popupOn?: boolean;
    popupCard?: Card;
    xCoord?: number;
    yCoord?: number;
    isOpponent?: boolean;
  };
  playCardMessage?: {
    popUpOn?: boolean;
    message?: string;
  };
  cardListFocus?: {
    cardList?: Card[];
    originalCardList?: Card[];
    name?: string;
    active?: boolean;
    apiCall?: boolean;
    apiQuery?: string;
    popupType?: string;
    isSorted?: boolean;
  };
  activeLayers?: {
    active?: boolean;
    cardList?: Card[];
    target?: string;
    isReorderable?: boolean;
  };
  chatLog?: string[];
  opponentIsTyping?: boolean;
  isUpdateInProgress?: boolean;
  isPlayerInputInProgress?: boolean;
  turnPhase?: {
    turnPhase?: string;
    caption?: string;
  };
  optionsMenu?: {
    active?: boolean;
  };
  playerInputPopUp?: {
    active?: boolean;
    buttons?: Button[];
    popup?: {
      active?: boolean;
      size?: number;
      big?: boolean;
      overCombatChain?: boolean;
      id?: string;
      title?: string;
      canClose?: number;
      additionalComments?: string;
      cards?: Card[];
      topCards?: Card[];
      bottomCards?: Card[];
      customInput?: string;
    };
    multiChooseText?: {
      submitLink?: string;
      input?: number;
      value?: string;
      check?: string;
      label?: string;
    }[];
    choiceOptions?: string;
    formOptions?: {
      playerID: number;
      caption: string;
      mode: number;
      maxNo: number;
    };
  };
  playerPreferences?: {
    manualModeEnabled: boolean;
    accessibleModeEnabled: boolean;
    soundEnabled: boolean;
    chatEnabled: boolean;
    statsEnabled: boolean;
    casterModeEnabled: boolean;
    attackReactionsSkip: boolean;
    defenseReactionsSkip: boolean;
    manualTargetingEnabled: boolean;
    holdPrioritySetting: number;
  };
  playerPrompt?: {
    helpText?: string;
    buttons?: Button[];
  };
  chainLinkSummary?: {
    show?: boolean;
    index?: number;
  };
  canPassPhase?: boolean;
  events?: {
    eventType: string;
    eventValue?: string;
  }[];
  gameLobby?: GetLobbyRefreshResponse;
  showModals?: boolean;
  showChatModal?: boolean;
  landmark?: Card;
  hasPriority?: boolean;
  priorityPlayer?: number;
  isFullRematch?: boolean;
  preventPassPrompt?: string;
  chatEnabled: boolean;
  shufflingPlayerId: number | null;
  isShuffling: boolean;
  addBotDeckPlayerId: number | null;
  addBotDeckCard: string;
  clashRevealP1Card: string;
  clashRevealP2Card: string;
  clashRevealTrigger: number;
  arsenalFlipP1Card: string;
  arsenalFlipP2Card: string;
  arsenalFlipTrigger: number;
  inactivityWarning?: {
    lastActionTime: number;
    firstWarningShown: boolean;
    secondWarningShown: boolean;
    secondWarningStartTime?: number; // Timestamp when second warning triggered
  };
  damagePopups?: {
    playerOne: Array<{ id: string; amount: number }>;
    playerTwo: Array<{ id: string; amount: number }>;
  };
  healingPopups?: {
    playerOne: Array<{ id: string; amount: number }>;
    playerTwo: Array<{ id: string; amount: number }>;
  };
  actionPointPopups?: {
    playerOne: Array<{ id: string; amount: number }>;
    playerTwo: Array<{ id: string; amount: number }>;
  };
  aiHasInfiniteHP?: boolean;
  spectatorCameraView?: number; // 1 for player 1 view, 2 for player 2 view
  opponentActivity?: number; // 0 = active, 2 = inactive
}
