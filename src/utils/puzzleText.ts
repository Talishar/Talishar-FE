import { TFunction } from 'i18next';
import { PuzzleStep, PuzzleStepCard } from 'interface/API/ModPageAPI';

const CARD_TOKEN_RE = /{{.*?\|(.+?)(?:\|.*?)?}}/g;

export const puzzleCardNames = (cards: PuzzleStepCard[] = []) =>
  cards.map((card) => card.name).join(', ');

// "{{id|Name|pitch}}" card tokens as plain names, for text that cannot render card links.
export const stripCardTokens = (text: string) =>
  text.replace(CARD_TOKEN_RE, '$1');

export const describePuzzleStep = (step: PuzzleStep, t: TFunction): string => {
  const cards = puzzleCardNames(step.cards);
  switch (step.kind) {
    case 'PLAY':
      return step.from
        ? t('PUZZLE.STEP.PLAY_FROM', {
            cards,
            zone: t(`PUZZLE.ZONE.${step.from}`)
          })
        : t('PUZZLE.STEP.PLAY', { cards });
    case 'BLOCK':
      return step.target
        ? t('PUZZLE.STEP.BLOCK_TARGET', { cards, target: step.target.name })
        : t('PUZZLE.STEP.BLOCK', { cards });
    case 'CHOOSE':
      return t('PUZZLE.STEP.CHOOSE', {
        choice: step.cards ? cards : step.text ?? ''
      });
    case 'OPT':
      return t('PUZZLE.STEP.OPT', {
        top: puzzleCardNames(step.top) || t('PUZZLE.NONE'),
        bottom: puzzleCardNames(step.bottom) || t('PUZZLE.NONE')
      });
    default:
      return t(`PUZZLE.STEP.${step.kind}`, { cards });
  }
};
