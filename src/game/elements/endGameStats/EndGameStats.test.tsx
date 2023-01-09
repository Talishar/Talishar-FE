import React from 'react';
import { store } from '../../../app/Store';
import EndGameStats, { EndGameData } from './EndGameStats';
import { renderWithProviders } from '../../../utils/TestUtils';
import {
  setGameStart,
  showChainLinkSummary
} from '../../../features/game/GameSlice';

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
      pitched: 0
    },
    {
      cardId: 'ELE147',
      played: 1,
      blocked: 0,
      pitched: 0
    },
    {
      cardId: 'ELE168',
      played: 0,
      blocked: 2,
      pitched: 0
    },
    {
      cardId: 'ELE171',
      played: 0,
      blocked: 0,
      pitched: 0
    },
    {
      cardId: 'ELE172',
      played: 1,
      blocked: 0,
      pitched: 0
    },
    {
      cardId: 'EVR127',
      played: 0,
      blocked: 0,
      pitched: 1
    },
    {
      cardId: 'MON246',
      played: 0,
      blocked: 1,
      pitched: 0
    },
    {
      cardId: 'UPR105',
      played: 0,
      blocked: 0,
      pitched: 0
    },
    {
      cardId: 'UPR109',
      played: 1,
      blocked: 1,
      pitched: 0
    },
    {
      cardId: 'UPR121',
      played: 0,
      blocked: 0,
      pitched: 1
    },
    {
      cardId: 'UPR129',
      played: 0,
      blocked: 2,
      pitched: 0
    },
    {
      cardId: 'UPR132',
      played: 0,
      blocked: 2,
      pitched: 0
    },
    {
      cardId: 'UPR133',
      played: 0,
      blocked: 0,
      pitched: 0
    },
    {
      cardId: 'UPR135',
      played: 0,
      blocked: 0,
      pitched: 0
    },
    {
      cardId: 'UPR140',
      played: 0,
      blocked: 0,
      pitched: 0
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
