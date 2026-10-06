import { vi } from 'vitest';
import reducer, {
  canQueueHandPlay,
  expireAwaitingPlayState,
  flushHandPlayQueue,
  gameLobby,
  isHandPlayBusy,
  playCard,
  queueHandPlay,
  receiveGameState,
  removeCardFromHand,
  sendQueuedHandPlay,
  setGameStart,
  submitButton,
  submitMultiButton
} from 'features/game/GameSlice';
import GameStaticInfo from 'features/GameStaticInfo';
import { Card } from 'features/Card';
import GameState from 'features/GameState';
import InitialGameState from 'features/game/InitialGameState';
import { RootState, setupStore } from 'app/Store';

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

describe('hand play queue', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const handCard = (uniqueId: string, actionDataOverride: string): Card => ({
    cardNumber: `WTR10${uniqueId}`,
    action: 27,
    actionDataOverride,
    uniqueId
  });
  const a = handCard('a', '0');
  const b = handCard('b', '1');
  const c = handCard('c', '2');
  const d = handCard('d', '3');

  const gameWith = (hand: Card[], turnPhase = 'B'): GameState => ({
    ...InitialGameState,
    playerOne: { ...InitialGameState.playerOne, Hand: hand },
    turnPhase: { turnPhase }
  });
  const receive = (
    state: GameState | undefined,
    hand: Card[],
    turnPhase = 'B'
  ): GameState => reducer(state, receiveGameState(gameWith(hand, turnPhase)));
  const handIds = (state: GameState) =>
    state.playerOne.Hand?.map((card) => card.uniqueId);

  it('removes a queued card by uniqueId and records its index and mode', () => {
    let state = receive(undefined, [a, b, c]);
    state = reducer(
      state,
      queueHandPlay({ card: { ...b, actionDataOverride: '9' } })
    );
    state = reducer(state, queueHandPlay({ card: c }));

    expect(handIds(state)).toEqual(['a']);
    expect(state.queuedHandPlays).toEqual([
      { card: b, index: 1, mode: 27 },
      { card: c, index: 2, mode: 27 }
    ]);
  });

  it('keeps a queued card out of a received hand and refreshes it from the server', () => {
    let state = receive(undefined, [a, b, c]);
    state = reducer(state, queueHandPlay({ card: c }));
    state = receive(state, [
      { ...b, actionDataOverride: '0' },
      { ...c, actionDataOverride: '1' }
    ]);

    expect(handIds(state)).toEqual(['b']);
    expect(state.queuedHandPlays?.[0].card.actionDataOverride).toBe('1');
    expect(state.queuedHandPlays?.[0].index).toBe(1);
    expect(state.queuedHandPlays?.[0].missing).toBe(false);
  });

  describe('awaiting the play state', () => {
    const params = { cardParams: a };

    it('waits for a state after a response that came first', () => {
      let state = receive(undefined, [a, b]);
      state = reducer(state, playCard.pending('req-1', params));
      state = reducer(state, playCard.fulfilled(undefined, 'req-1', params));
      expect(state.isAwaitingPlayState).toBe(true);

      state = receive(state, [b]);
      expect(state.isAwaitingPlayState).toBe(false);
    });

    it('does not wait when the play state arrived before the response', () => {
      let state = receive(undefined, [a, b]);
      state = reducer(state, playCard.pending('req-1', params));
      state = receive(state, [b]);
      state = reducer(state, playCard.fulfilled(undefined, 'req-1', params));

      expect(state.isAwaitingPlayState).toBe(false);
    });

    it('still waits after an unrelated state that kept the played card', () => {
      let state = receive(undefined, [a, b]);
      state = reducer(state, playCard.pending('req-1', params));
      state = receive(state, [a, b]);
      state = reducer(state, playCard.fulfilled(undefined, 'req-1', params));

      expect(state.isAwaitingPlayState).toBe(true);
    });
  });

  describe('in-flight play', () => {
    const params = { cardParams: a };

    it('stays busy through a received state until its own response', () => {
      let state = receive(undefined, [a, b, c]);
      state = reducer(state, removeCardFromHand({ card: a }));
      state = reducer(state, playCard.pending('req-1', params));
      state = reducer(state, queueHandPlay({ card: b }));
      state = receive(state, [b, c]);

      expect(state.inFlightPlay?.requestId).toBe('req-1');
      expect(isHandPlayBusy(state)).toBe(true);

      const dispatch = vi.fn();
      flushHandPlayQueue()(
        dispatch,
        () => ({ game: state } as unknown as RootState),
        undefined
      );
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('ignores settled actions of another request', () => {
      let state = receive(undefined, [a, b, c]);
      state = reducer(state, playCard.pending('req-1', params));
      state = reducer(state, queueHandPlay({ card: b }));
      state = reducer(state, playCard.fulfilled(undefined, 'req-0', params));
      state = reducer(
        state,
        playCard.rejected(new Error('Invalid'), 'req-0', params)
      );

      expect(state.inFlightPlay?.requestId).toBe('req-1');
      expect(state.isAwaitingPlayState).toBeFalsy();
      expect(state.queuedHandPlays?.map((entry) => entry.card)).toEqual([b]);
    });
  });

  it('returns queued cards when the matching wait expires', () => {
    const params = { cardParams: a };
    let state = receive(undefined, [a, b, c]);
    state = reducer(state, removeCardFromHand({ card: a }));
    state = reducer(state, playCard.pending('req-1', params));
    state = reducer(state, queueHandPlay({ card: c }));
    state = reducer(state, playCard.fulfilled(undefined, 'req-1', params));

    state = reducer(state, expireAwaitingPlayState('req-0'));
    expect(state.isAwaitingPlayState).toBe(true);
    expect(state.queuedHandPlays).toHaveLength(1);

    state = reducer(state, expireAwaitingPlayState('req-1'));
    expect(state.isAwaitingPlayState).toBe(false);
    expect(state.queuedHandPlays).toEqual([]);
    expect(handIds(state)).toEqual(['b', 'c']);
  });

  it('returns the in-flight card and every queued card when the play is rejected', () => {
    const params = { cardParams: b };
    let state = receive(undefined, [a, b, c, d]);
    state = reducer(state, removeCardFromHand({ card: b }));
    state = reducer(state, playCard.pending('req-1', params));
    state = reducer(state, queueHandPlay({ card: d }));
    state = reducer(state, queueHandPlay({ card: a }));
    expect(handIds(state)).toEqual(['c']);

    state = reducer(
      state,
      playCard.rejected(new Error('Invalid'), 'req-1', params)
    );

    expect(handIds(state)).toEqual(['a', 'b', 'c', 'd']);
    expect(state.queuedHandPlays).toEqual([]);
    expect(state.pendingHandRemoval).toBeUndefined();
    expect(state.inFlightPlay).toBeUndefined();
  });

  describe('flushHandPlayQueue', () => {
    const storeWithQueuedB = () => {
      const store = setupStore();
      store.dispatch(receiveGameState(gameWith([a, b, c])));
      store.dispatch(queueHandPlay({ card: b }));
      return store;
    };
    const stubFetch = () =>
      vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response('', { status: 200 }));
    const gameHandIds = (store: ReturnType<typeof setupStore>) =>
      handIds(store.getState().game);

    it('sends the head with its fresh index', async () => {
      const fetchMock = stubFetch();
      const store = storeWithQueuedB();
      store.dispatch(
        receiveGameState(
          gameWith([
            { ...b, actionDataOverride: '0' },
            { ...c, actionDataOverride: '1' }
          ])
        )
      );

      store.dispatch(flushHandPlayQueue());

      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      const url = String(fetchMock.mock.calls[0][0]);
      expect(url).toContain('mode=27');
      expect(url).toContain('cardID=0');
      expect(store.getState().game.queuedHandPlays).toEqual([]);
      expect(store.getState().game.pendingHandRemoval?.card.uniqueId).toBe('b');
      expect(gameHandIds(store)).toEqual(['c']);
    });

    it('drops the head back into the hand once the step is over', () => {
      const fetchMock = stubFetch();
      const store = storeWithQueuedB();
      store.dispatch(receiveGameState(gameWith([a, b, c], 'M')));
      expect(gameHandIds(store)).toEqual(['a', 'c']);

      store.dispatch(flushHandPlayQueue());

      expect(fetchMock).not.toHaveBeenCalled();
      expect(store.getState().game.queuedHandPlays).toEqual([]);
      expect(gameHandIds(store)).toEqual(['a', 'b', 'c']);
    });

    it('drops a card that left the hand without reinserting it', () => {
      const fetchMock = stubFetch();
      const store = storeWithQueuedB();
      store.dispatch(receiveGameState(gameWith([a, c])));

      store.dispatch(flushHandPlayQueue());

      expect(fetchMock).not.toHaveBeenCalled();
      expect(store.getState().game.queuedHandPlays).toEqual([]);
      expect(gameHandIds(store)).toEqual(['a', 'c']);
    });

    it('does nothing while a play is in flight', () => {
      const fetchMock = stubFetch();
      const store = storeWithQueuedB();
      store.dispatch(playCard.pending('req-1', { cardParams: a }));

      store.dispatch(flushHandPlayQueue());

      expect(fetchMock).not.toHaveBeenCalled();
      expect(store.getState().game.queuedHandPlays).toHaveLength(1);
    });
  });

  it('reports busy and queue eligibility', () => {
    const idle = gameWith([a]);
    expect(isHandPlayBusy(idle)).toBe(false);
    expect(isHandPlayBusy({ ...idle, isPlayerInputInProgress: true })).toBe(
      true
    );
    expect(
      isHandPlayBusy({
        ...idle,
        inFlightPlay: { requestId: 'req-1', stateSeen: true }
      })
    ).toBe(true);
    expect(isHandPlayBusy({ ...idle, isAwaitingPlayState: true })).toBe(true);
    expect(
      isHandPlayBusy({
        ...idle,
        queuedHandPlays: [{ card: b, index: 1, mode: 27 }]
      })
    ).toBe(true);

    const inFlight: GameState = {
      ...idle,
      isPlayerInputInProgress: true,
      inFlightPlay: { requestId: 'req-1', stateSeen: false }
    };
    expect(canQueueHandPlay(inFlight, a)).toBe(true);
    expect(canQueueHandPlay({ ...idle, isAwaitingPlayState: true }, a)).toBe(
      true
    );
    expect(
      canQueueHandPlay(
        { ...idle, queuedHandPlays: [{ card: b, index: 1, mode: 27 }] },
        a
      )
    ).toBe(true);
    expect(canQueueHandPlay(idle, a)).toBe(false);
    expect(
      canQueueHandPlay({ ...idle, isPlayerInputInProgress: true }, a)
    ).toBe(false);
    expect(
      canQueueHandPlay({ ...inFlight, turnPhase: { turnPhase: 'M' } }, a)
    ).toBe(false);
    expect(canQueueHandPlay(inFlight, { ...a, uniqueId: '-' })).toBe(false);
    expect(canQueueHandPlay(inFlight, { ...a, uniqueId: undefined })).toBe(
      false
    );
    expect(canQueueHandPlay(inFlight, { ...a, action: 0 })).toBe(false);
  });

  it('returns queued cards when a button input is sent', () => {
    const params = { cardParams: a };
    let state = receive(undefined, [a, b, c]);
    state = reducer(state, removeCardFromHand({ card: a }));
    state = reducer(state, playCard.pending('req-1', params));
    state = reducer(state, queueHandPlay({ card: c }));
    state = receive(state, [b, c]);
    expect(handIds(state)).toEqual(['b']);

    state = reducer(
      state,
      submitButton.pending('req-2', { button: { mode: 99 } })
    );

    expect(handIds(state)).toEqual(['b', 'c']);
    expect(state.queuedHandPlays).toEqual([]);
  });

  it('returns queued cards when a multi-button input is sent', () => {
    let state = receive(undefined, [a, b, c]);
    state = reducer(state, playCard.pending('req-1', { cardParams: a }));
    state = reducer(state, queueHandPlay({ card: b }));
    expect(handIds(state)).toEqual(['a', 'c']);

    state = reducer(
      state,
      submitMultiButton.pending('req-2', { mode: 99, extraParams: '' })
    );

    expect(handIds(state)).toEqual(['a', 'b', 'c']);
    expect(state.queuedHandPlays).toEqual([]);
  });

  describe('after a button input', () => {
    const button = { button: { mode: 99 } };
    const flushDispatches = (state: GameState) => {
      const dispatch = vi.fn();
      flushHandPlayQueue()(
        dispatch,
        () => ({ game: state } as unknown as RootState),
        undefined
      );
      return dispatch.mock.calls.map(([action]) => action.type);
    };

    it('does not queue a hand click while the button is in flight', () => {
      let state = receive(undefined, [a, b, c]);
      state = reducer(state, removeCardFromHand({ card: a }));
      state = reducer(state, playCard.pending('req-1', { cardParams: a }));
      expect(canQueueHandPlay(state, b)).toBe(true);

      state = reducer(state, submitButton.pending('req-2', button));
      expect(canQueueHandPlay(state, b)).toBe(false);

      state = receive(state, [b, c]);
      expect(state.buttonInput).toBe('inflight');
      expect(canQueueHandPlay(state, b)).toBe(false);
    });

    it('waits for a state received after the button response', () => {
      let state = receive(undefined, [a, b, c]);
      state = reducer(state, submitButton.pending('req-2', button));
      state = reducer(
        state,
        submitButton.fulfilled(undefined, 'req-2', button)
      );
      state = reducer(state, queueHandPlay({ card: b }));

      expect(state.buttonInput).toBe('awaiting');
      expect(canQueueHandPlay(state, c)).toBe(false);
      expect(flushDispatches(state)).toEqual([]);

      state = receive(state, [a, b, c]);

      expect(state.buttonInput).toBeUndefined();
      expect(canQueueHandPlay(state, c)).toBe(true);
      expect(flushDispatches(state)[0]).toBe(sendQueuedHandPlay().type);
    });

    it('clears the button wait when the button is rejected', () => {
      let state = receive(undefined, [a, b, c]);
      state = reducer(state, playCard.pending('req-1', { cardParams: a }));
      state = reducer(state, submitButton.pending('req-2', button));
      state = reducer(
        state,
        submitButton.rejected(new Error('network'), 'req-2', button)
      );

      expect(state.buttonInput).toBeUndefined();
      expect(canQueueHandPlay(state, b)).toBe(true);
    });
  });

  it('keeps tracking the first play when another play starts while it is in flight', () => {
    const handParams = { cardParams: a };
    const equipmentParams = {
      cardParams: { cardNumber: 'WTR150', action: 3, actionDataOverride: '0' }
    };
    let state = receive(undefined, [a, b, c]);
    state = reducer(state, removeCardFromHand({ card: a }));
    state = reducer(state, playCard.pending('req-1', handParams));
    state = reducer(state, queueHandPlay({ card: b }));
    state = reducer(state, playCard.pending('req-2', equipmentParams));

    expect(state.inFlightPlay?.requestId).toBe('req-1');
    expect(state.inFlightPlay?.uniqueId).toBe('a');

    state = reducer(
      state,
      playCard.rejected(new Error('Invalid'), 'req-1', handParams)
    );

    expect(handIds(state)).toEqual(['a', 'b', 'c']);
    expect(state.queuedHandPlays).toEqual([]);
    expect(state.inFlightPlay).toBeUndefined();
  });
});
