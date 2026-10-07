import { screen } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders } from 'utils/TestUtils';
import { globalInitialState } from 'app/Store';
import InitialGameState from 'features/game/InitialGameState';
import { Card } from 'features/Card';
import ActiveEffects from '../ActiveEffects';
import PlayerBoardGrid from '../../playerBoardGrid/PlayerBoardGrid';
import { PHONE_PORTRAIT_QUERY } from '../../elements/effects/Effects';

const media = vi.hoisted(() => ({ phonePortrait: false }));

vi.mock('hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) =>
    media.phonePortrait && query === PHONE_PORTRAIT_QUERY
}));

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    getLanguage: () => 'english'
  })
}));

const playerEffects: Card[] = [
  { cardNumber: 'WTR001', cardName: 'Player Effect One', uniqueId: 'p1-a' },
  { cardNumber: 'WTR002', cardName: 'Player Effect Two', uniqueId: 'p1-b' }
];

const opponentEffects: Card[] = [
  { cardNumber: 'WTR003', cardName: 'Opponent Effect', uniqueId: 'p2-a' }
];

const effectNames = /^(Player Effect One|Player Effect Two|Opponent Effect)$/;
const playerEffectNames = /^Player Effect (One|Two)$/;

const renderInGame = (ui: React.ReactElement) =>
  renderWithProviders(<CookiesProvider>{ui}</CookiesProvider>, {
    preloadedState: {
      ...globalInitialState,
      game: {
        ...InitialGameState,
        playerOne: { ...InitialGameState.playerOne, Effects: playerEffects },
        playerTwo: { ...InitialGameState.playerTwo, Effects: opponentEffects }
      }
    }
  });

describe('ActiveEffects on phone portrait', () => {
  beforeEach(() => {
    media.phonePortrait = false;
  });

  it('keeps both players effects in the left column when not phone portrait', () => {
    renderInGame(<ActiveEffects />);
    expect(screen.getAllByAltText(effectNames)).toHaveLength(3);
  });

  it('does not render my effects in the board when not phone portrait', () => {
    renderInGame(<PlayerBoardGrid />);
    expect(screen.queryAllByAltText(playerEffectNames)).toHaveLength(0);
  });

  it('renders only the opponent effects in the left column on phone portrait', () => {
    media.phonePortrait = true;
    renderInGame(<ActiveEffects />);
    const images = screen.getAllByAltText(effectNames);
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('alt', 'Opponent Effect');
  });

  it('renders my effects under the equipment on phone portrait', () => {
    media.phonePortrait = true;
    renderInGame(<PlayerBoardGrid />);
    expect(screen.getAllByAltText(playerEffectNames)).toHaveLength(2);
  });
});
