import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useMediaQuery } from 'hooks/useMediaQuery';

export type PlayerPromptOwner = 'activeLayers' | 'combatChain' | 'board';

interface PlayerPromptContext {
  showModals: boolean;
  activeLayersOpen: boolean;
  combatChainOpen: boolean;
  isPortrait: boolean;
  helpText?: string;
  hasPromptButtons: boolean;
}

const REDUNDANT_CLOSED_CHAIN_PROMPTS = new Set([
  'choose an action',
  'choose a card from the pitch zone'
]);

export const isRedundantClosedChainPrompt = (helpText?: string): boolean =>
  REDUNDANT_CLOSED_CHAIN_PROMPTS.has(
    (helpText ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
  );

export const resolvePlayerPromptOwner = ({
  showModals,
  activeLayersOpen,
  combatChainOpen,
  isPortrait,
  helpText,
  hasPromptButtons
}: PlayerPromptContext): PlayerPromptOwner | null => {
  if (!showModals) return null;
  if (activeLayersOpen) return 'activeLayers';
  if (combatChainOpen && !isPortrait) return 'combatChain';
  if (
    !combatChainOpen &&
    !hasPromptButtons &&
    isRedundantClosedChainPrompt(helpText)
  ) {
    return null;
  }
  return 'board';
};

/**
 * Gives the shared player prompt to exactly one visible surface.
 * Portrait keeps its dedicated board slot even while the combat chain is open.
 */
export default function usePlayerPromptOwner(): PlayerPromptOwner | null {
  const showModals = useAppSelector(
    (state: RootState) => state.game.showModals === true
  );
  const activeLayersOpen = useAppSelector(
    (state: RootState) => state.game.activeLayers?.active === true
  );
  const combatChainOpen = useAppSelector((state: RootState) => {
    const oldCombatChain = state.game.oldCombatChain ?? [];
    const attackingCard = state.game.activeChainLink?.attackingCard;

    return (
      oldCombatChain.length > 0 ||
      (!!attackingCard && attackingCard.cardNumber !== 'blank')
    );
  });
  const helpText = useAppSelector(
    (state: RootState) => state.game.playerPrompt?.helpText
  );
  const hasPromptButtons = useAppSelector(
    (state: RootState) => (state.game.playerPrompt?.buttons?.length ?? 0) > 0
  );
  const isPortrait = useMediaQuery('(orientation: portrait)');

  return resolvePlayerPromptOwner({
    showModals,
    activeLayersOpen,
    combatChainOpen,
    isPortrait,
    helpText,
    hasPromptButtons
  });
}
