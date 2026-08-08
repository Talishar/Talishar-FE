import reducer, {
  gameLobby,
  setGameStart,
  submitButton
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
