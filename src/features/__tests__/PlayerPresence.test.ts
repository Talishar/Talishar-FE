import { describe, expect, it } from 'vitest';
import {
  decorateWaitingPrompt,
  getPresenceMessage,
  presenceFromCardListName
} from '../PlayerPresence';

describe('player presence', () => {
  it('maps local and opponent card-list titles without card information', () => {
    expect(presenceFromCardListName('Your Deck')).toEqual({
      type: 'zone',
      zone: 'deck',
      owner: 'self'
    });
    expect(presenceFromCardListName("Opponent's Banish Zone")).toEqual({
      type: 'zone',
      zone: 'banish',
      owner: 'opponent'
    });
  });

  it('ignores card lists that are not supported zones', () => {
    expect(presenceFromCardListName('Search results')).toBeNull();
    expect(presenceFromCardListName('Your Inventory')).toBeNull();
  });

  it('describes ownership from the receiving player perspective', () => {
    expect(
      getPresenceMessage({ type: 'zone', zone: 'graveyard', owner: 'self' })
    ).toBe('Opponent is checking their graveyard');
    expect(
      getPresenceMessage({ type: 'zone', zone: 'deck', owner: 'opponent' })
    ).toBe('Opponent is checking your deck');
  });

  it('decorates waiting prompts but leaves active prompts untouched', () => {
    expect(
      decorateWaitingPrompt(
        'Waiting for other player to choose a card to block',
        'Opponent is checking their deck'
      )
    ).toContain('Waiting for them to choose a card to block');
    expect(
      decorateWaitingPrompt(
        'Choose a card to block',
        'Opponent is checking their deck'
      )
    ).toBe('Choose a card to block');
  });
});
