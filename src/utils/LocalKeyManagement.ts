export const saveGameAuthKey = (gameId: number, authKey: string): void => {
  sessionStorage.setItem(String(gameId), authKey);
};

export const loadGameAuthKey = (gameId: number): string => {
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
  const valueExists = sessionStorage.getItem(String(gameId));
  if (!valueExists) {
    console.error(
      'Attempted to delete a authKey of a game that does not exist, game',
      +gameId
    );
    return;
  }
  sessionStorage.removeItem(String(gameId));
};
