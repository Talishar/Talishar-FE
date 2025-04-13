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
  clock?: number;
  popup?: {
    popupOn?: boolean;
    popupCard?: Card;
    xCoord?: number;
    yCoord?: number;
  };
  playCardMessage?: {
    popUpOn?: boolean;
    message?: string;
  };
  cardListFocus?: {
    cardList?: Card[];
    name?: string;
    active?: boolean;
    apiCall?: boolean;
    apiQuery?: string;
    popupType?: string;
  };
  activeLayers?: {
    active?: boolean;
    cardList?: Card[];
    target?: string;
    isReorderable?: boolean;
  };
  chatLog?: string[];
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
    defenceReactionsSkip: boolean;
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
  isFullRematch?: boolean;
  preventPassPrompt?: string;
  chatEnabled: boolean;
}
