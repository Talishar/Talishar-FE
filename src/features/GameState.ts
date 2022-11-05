import Button from './Button';
import Card from './Card';
import CombatChainLink from './CombatChainLink';
import GameInfo from './GameInfo';
import Player from './Player';

export default interface GameState {
  gameInfo: GameInfo;
  playerOne: Player;
  playerTwo: Player;
  activeChainLink?: CombatChainLink;
  oldCombatChain?: CombatChainLink[];
  activePlayer?: number; // 1 is us 2 is them
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
  };
  activeLayers?: {
    active?: boolean;
    cardList?: Card[];
    target?: Card;
  };
  chatLog?: string[];
  isUpdateInProgress?: boolean;
  isPlayerInputInProgress?: boolean;
  turnPhase?: {
    turnPhase?: string;
    caption?: string;
  };
  optionsOverlay?: {
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
}
