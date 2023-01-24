import React from 'react';
import { store } from 'app/Store';
import EndGameStats, { EndGameData } from './EndGameStats';
import { renderWithProviders } from 'utils/TestUtils';
import { setGameStart, showChainLinkSummary } from 'features/game/GameSlice';

const stats: EndGameData = {
  gameId: '501628',
  deckId: '',
  turns: 4,
  result: 0,
  firstPlayer: 1,
  cardResults: [
    {
      cardId: 'ELE146',
      played: 0,
      blocked: 0,
      pitched: 0,
      cardName: 'test card name one ',
      pitchValue: 1
    },
    {
      cardId: 'ELE123',
      played: 0,
      blocked: 0,
      pitched: 0,
      cardName: 'test card name two',
      pitchValue: 3
    }
  ],
  turnResults: {
    //@ts-ignore
    '0': {
      cardsUsed: 2,
      cardsBlocked: 3,
      cardsPitched: 2,
      resourcesUsed: 6,
      cardsLeft: 1,
      damageDealt: 4,
      damageTaken: 6
    },
    '12': {
      cardsUsed: 1,
      cardsBlocked: '2',
      cardsPitched: '0',
      resourcesUsed: '0',
      cardsLeft: '0',
      damageDealt: '0',
      damageTaken: '7'
    }
  }
};

it('renders without crashing', () => {
  const div = renderWithProviders(<EndGameStats {...(stats as EndGameData)} />);
});

it('passes a snapshot test', () => {
  const div = renderWithProviders(<EndGameStats {...(stats as EndGameData)} />);
  expect(div.getByRole('div')).toMatchSnapshot();
});
