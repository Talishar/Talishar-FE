import reducer, {
  gameLobby,
  playCard,
  receiveGameState,
  removeCardFromHand,
  setGameStart,
  submitButton
} from 'features/game/GameSlice';
import GameStaticInfo from 'features/GameStaticInfo';
import { Card } from 'features/Card';
import GameState from 'features/GameState';
import InitialGameState from 'features/game/InitialGameState';

const game = (
  gameID: number,
  playerID: number,
  authKey: string
): GameStaticInfo => ({
  gameID,
  playerID,
  authKey,
  isPrivateLobby: false
});

describe('lobby refresh isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('clears lobby-specific state when switching games', () => {
    let state = reducer(
      undefined,
      setGameStart({
        gameID: 101,
        playerID: 2,
        authKey: 'old-key'
      })
    );
    state = reducer(
      state,
      gameLobby.fulfilled({ lastUpdate: 7, wasKicked: true }, 'old-request', {
        game: game(101, 2, 'old-key'),
        signal: undefined,
        lastUpdate: 0
      })
    );

    state = reducer(
      state,
      setGameStart({
        gameID: 202,
        playerID: 1,
        authKey: 'new-key'
      })
    );

    expect(state.gameLobby).toBeUndefined();
    expect(state.gameInfo.gameID).toBe(202);
    expect(state.gameInfo.playerID).toBe(1);
  });

  it('ignores a kicked response that completes after switching games', () => {
    let state = reducer(
      undefined,
      setGameStart({
        gameID: 101,
        playerID: 2,
        authKey: 'old-key'
      })
    );
    state = reducer(
      state,
      setGameStart({
        gameID: 202,
        playerID: 1,
        authKey: 'new-key'
      })
    );

    state = reducer(
      state,
      gameLobby.fulfilled(
        { lastUpdate: 8, wasKicked: true },
        'late-old-request',
        {
          game: game(101, 2, 'old-key'),
          signal: undefined,
          lastUpdate: 7
        }
      )
    );

    expect(state.gameInfo.gameID).toBe(202);
    expect(state.gameLobby).toBeUndefined();
    expect(state.gameDynamicInfo.lastUpdate).toBe(0);
  });
});

describe('lobby refresh request handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('treats spectator authentication failures as terminal', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'Authentication required to spectate.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await gameLobby({
      game: game(101, 3, ''),
      signal: undefined,
      lastUpdate: 0
    })(vi.fn(), vi.fn(), undefined);

    expect(gameLobby.rejected.match(result)).toBe(true);
    expect(result.payload).toEqual({
      status: 401,
      message: 'Authentication required to spectate.',
      terminal: true,
      retryAfterMs: undefined
    });
  });

  it('honors Retry-After for rate limited polls', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Retry-After': '10' }
      })
    );

    const result = await gameLobby({
      game: game(101, 1, 'key'),
      signal: undefined,
      lastUpdate: 5
    })(vi.fn(), vi.fn(), undefined);

    expect(gameLobby.rejected.match(result)).toBe(true);
    expect(result.payload).toEqual({
      status: 429,
      message: 'Too many requests',
      terminal: false,
      retryAfterMs: 10000
    });
  });

  it('sends lobby refreshes as JSON POST requests', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ lastUpdate: 6 }), { status: 200 })
      );

    const result = await gameLobby({
      game: game(101, 1, 'key'),
      signal: undefined,
      lastUpdate: 5
    })(vi.fn(), vi.fn(), undefined);

    expect(gameLobby.fulfilled.match(result)).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
    );
  });
});

describe('player input guard', () => {
  const button = { button: { mode: 1 } };

  it('marks input in progress and records the requestId', () => {
    const state = reducer(undefined, submitButton.pending('req-1', button));

    expect(state.isPlayerInputInProgress).toBe(true);
    expect(state.playerInputRequestId).toBe('req-1');
  });

  it('releases the guard once the request settles', () => {
    let state = reducer(undefined, submitButton.pending('req-1', button));
    expect(state.isPlayerInputInProgress).toBe(true);

    state = reducer(state, submitButton.fulfilled(undefined, 'req-1', button));

    // Without this the guard would depend solely on an SSE push arriving.
    expect(state.isPlayerInputInProgress).toBe(false);
  });

  it('releases the guard when the request is rejected', () => {
    let state = reducer(undefined, submitButton.pending('req-1', button));

    state = reducer(
      state,
      submitButton.rejected(new Error('network'), 'req-1', button)
    );

    expect(state.isPlayerInputInProgress).toBe(false);
  });

  it('records a fresh requestId for each submission', () => {
    let state = reducer(undefined, submitButton.pending('req-1', button));
    state = reducer(state, submitButton.pending('req-2', button));

    expect(state.playerInputRequestId).toBe('req-2');
  });
});

describe('optimistic hand removal', () => {
  const withHand = (hand: Card[]): GameState =>
    reducer(
      undefined,
      receiveGameState({
        ...InitialGameState,
        playerOne: { ...InitialGameState.playerOne, Hand: hand }
      })
    );

  const arsA: Card = {
    cardNumber: 'WTR098',
    action: 4,
    actionDataOverride: 'WTR098'
  };
  const arsB: Card = { ...arsA };
  const other: Card = {
    cardNumber: 'WTR100',
    action: 4,
    actionDataOverride: 'WTR100'
  };

  it('removes only one of two copies sharing a slug actionDataOverride', () => {
    let state = withHand([arsA, other, arsB]);
    state = reducer(state, removeCardFromHand({ card: arsB }));

    expect(state.playerOne.Hand?.map((card) => card.cardNumber)).toEqual([
      'WTR100',
      'WTR098'
    ]);
    expect(state.pendingHandRemoval?.index).toBe(0);
  });

  it('removes the card whose uniqueId matches', () => {
    const first: Card = {
      cardNumber: 'WTR101',
      actionDataOverride: '0',
      uniqueId: 'h1'
    };
    const second: Card = {
      cardNumber: 'WTR101',
      actionDataOverride: '1',
      uniqueId: 'h2'
    };
    let state = withHand([first, second]);
    state = reducer(
      state,
      removeCardFromHand({ card: { ...second, actionDataOverride: '0' } })
    );

    expect(state.playerOne.Hand?.map((card) => card.uniqueId)).toEqual(['h1']);
    expect(state.pendingHandRemoval).toEqual({ card: second, index: 1 });
  });

  it('restores the removed card at its original index when the play is rejected', () => {
    const params = { cardParams: other };
    let state = withHand([arsA, other, arsB]);
    state = reducer(state, removeCardFromHand({ card: other }));
    state = reducer(state, playCard.pending('req-1', params));
    state = reducer(
      state,
      playCard.rejected(new Error('Invalid'), 'req-1', params)
    );

    expect(state.playerOne.Hand?.map((card) => card.cardNumber)).toEqual([
      'WTR098',
      'WTR100',
      'WTR098'
    ]);
    expect(state.pendingHandRemoval).toBeUndefined();
  });

  it('clears the pending removal when the play succeeds', () => {
    const params = { cardParams: other };
    let state = withHand([arsA, other]);
    state = reducer(state, removeCardFromHand({ card: other }));
    state = reducer(state, playCard.fulfilled(undefined, 'req-1', params));

    expect(state.pendingHandRemoval).toBeUndefined();
  });

  it('does not restore after a received game state clears the pending removal', () => {
    const params = { cardParams: other };
    let state = withHand([arsA, other]);
    state = reducer(state, removeCardFromHand({ card: other }));
    state = reducer(
      state,
      receiveGameState({
        ...InitialGameState,
        playerOne: { ...InitialGameState.playerOne, Hand: [arsA] }
      })
    );
    expect(state.pendingHandRemoval).toBeUndefined();

    state = reducer(
      state,
      playCard.rejected(new Error('Invalid'), 'req-1', params)
    );

    expect(state.playerOne.Hand?.map((card) => card.cardNumber)).toEqual([
      'WTR098'
    ]);
  });
});
