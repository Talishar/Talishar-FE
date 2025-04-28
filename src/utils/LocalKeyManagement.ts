export const saveGameAuthKey = (gameId: number, authKey: string): void => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot save authKey for game:', gameId);
    return;
  }
  sessionStorage.setItem(String(gameId), authKey);
};

export const loadGameAuthKey = (gameId: number): string => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot load authKey for game:', gameId);
    return '';
  }

  const localValue = sessionStorage.getItem(String(gameId));
  if (!localValue) {
    console.error(
      'Attempted to access an authKey of a game that does not exist, game:' +
        gameId
    );
  }
  return localValue || '';
};

export const deleteGameAuthKey = (gameId: number): void => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot delete authKey for game:', gameId);
    return;
  }

  const valueExists = sessionStorage.getItem(String(gameId));
  if (!valueExists) {
    console.error(
      'Attempted to delete a authKey of a game that does not exist, game',
      gameId
    );
    return;
  }
  sessionStorage.removeItem(String(gameId));
};
