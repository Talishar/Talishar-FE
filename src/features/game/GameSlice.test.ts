import reducer, { gameLobby, setGameStart } from 'features/game/GameSlice';
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
