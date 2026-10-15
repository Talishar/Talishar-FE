import reducer, {
  clearCardListFocus,
  gameLobby,
  setCardListFocus,
  setGameStart,
  submitButton,
  toggleCardListSort
} from 'features/game/GameSlice';
import GameStaticInfo from 'features/GameStaticInfo';

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

describe('graveyard and banish sorting', () => {
  const cards = [
    { cardNumber: 'WTR001' },
    { cardNumber: 'WTR003' },
    { cardNumber: 'WTR002' }
  ];

  it.each([
    'Your Graveyard',
    "Opponent's Graveyard",
    'Your Banish Zone',
    "Opponent's Banish Zone"
  ])('keeps %s sorted until its button is clicked again', (name) => {
    let state = reducer(undefined, setCardListFocus({ name, cardList: cards }));
    state = reducer(state, toggleCardListSort());
    expect(state.cardListFocus?.isSorted).toBe(true);
    expect(
      state.cardListFocus?.cardList?.map((card) => card.cardNumber)
    ).toEqual(['WTR003', 'WTR002', 'WTR001']);

    state = reducer(state, clearCardListFocus());
    state = reducer(state, setCardListFocus({ name, cardList: cards }));
    expect(state.cardListFocus?.isSorted).toBe(true);
    expect(
      state.cardListFocus?.cardList?.map((card) => card.cardNumber)
    ).toEqual(['WTR003', 'WTR002', 'WTR001']);

    state = reducer(state, toggleCardListSort());
    expect(state.cardListFocus?.isSorted).toBe(false);
    expect(state.cardListFocus?.cardList).toEqual(cards);

    state = reducer(state, clearCardListFocus());
    state = reducer(state, setCardListFocus({ name, cardList: cards }));
    expect(state.cardListFocus?.isSorted).toBe(false);
  });

  it('resets zone sort choices when a new game starts', () => {
    let state = reducer(
      undefined,
      setCardListFocus({ name: 'Your Graveyard', cardList: cards })
    );
    state = reducer(state, toggleCardListSort());
    state = reducer(
      state,
      setGameStart({ gameID: 101, playerID: 1, authKey: 'key' })
    );
    state = reducer(
      state,
      setCardListFocus({ name: 'Your Graveyard', cardList: cards })
    );
    expect(state.cardListFocus?.isSorted).toBe(false);
  });
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
