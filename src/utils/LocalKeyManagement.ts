export const saveGameAuthKey = (gameId: number, authKey: string): void => {
  sessionStorage.setItem(`${gameId}-auth`, authKey);
};

export const loadGameAuthKey = (gameId: number): string => {
  const localValue = sessionStorage.getItem(`${gameId}-auth`);
  if (!localValue) {
    console.error(
      'Attempted to access an authKey of a game that does not exist, game:' +
        gameId
    );
  }
  return localValue || '';
};

export const deleteGameAuthKey = (gameId: number): void => {
  const valueExists = sessionStorage.getItem(`${gameId}-auth`);
  if (!valueExists) {
    console.error(
      'Attempted to delete a authKey of a game that does not exist, game',
      +gameId
    );
    return;
  }
  sessionStorage.removeItem(`${gameId}-auth`);
};

export const saveGamePlayerNo = (gameId: number, playerNo: number): void => {
  sessionStorage.setItem(`${gameId}-playerNo`, String(playerNo));
};

export const loadGamePlayerNo = (gameId: number): number => {
  const localValue = sessionStorage.getItem(`${gameId}-playerNo`);
  if (!localValue) {
    console.error(
      'Attempted to access playerNo of a game that does not exist, game:' +
        gameId
    );
  }
  return parseInt(localValue || '3');
};

export const deleteGamePlayerNo = (gameId: number): void => {
  const valueExists = sessionStorage.getItem(`${gameId}-playerNo`);
  if (!valueExists) {
    console.error(
      'Attempted to delete playerNo of a game that does not exist, game',
      +gameId
    );
    return;
  }
  sessionStorage.removeItem(`${gameId}-playerNo`);
};
