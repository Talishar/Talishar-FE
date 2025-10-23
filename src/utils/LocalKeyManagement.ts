/**
 * Simple XOR-based encryption using a seed derived from game ID.
 * This provides basic obfuscation while remaining synchronous.
 * For production, consider upgrading to async crypto.subtle encryption.
 */
const xorEncrypt = (text: string, seed: number): string => {
  const encoded = new TextEncoder().encode(text);
  const encrypted = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    encrypted[i] = encoded[i] ^ ((seed >> (i % 4) * 8) & 0xff);
  }
  return btoa(String.fromCharCode(...encrypted));
};

/**
 * Decrypt XOR-encrypted data using game ID seed.
 */
const xorDecrypt = (encoded: string, seed: number): string => {
  try {
    const encrypted = new Uint8Array(
      atob(encoded)
        .split('')
        .map((c) => c.charCodeAt(0))
    );
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ ((seed >> (i % 4) * 8) & 0xff);
    }
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Failed to decrypt auth key:', error);
    return '';
  }
};

export const saveGameAuthKey = (gameId: number, authKey: string): void => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot save authKey for game:', gameId);
    return;
  }
  
  // Encrypt the auth key before storing (XOR + base64 encoding)
  const encryptedAuthKey = xorEncrypt(authKey, gameId);
  sessionStorage.setItem(String(gameId), encryptedAuthKey);
};

export const loadGameAuthKey = (gameId: number): string => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot load authKey for game:', gameId);
    return '';
  }

  const encryptedValue = sessionStorage.getItem(String(gameId));
  if (!encryptedValue) {
    console.error(
      'Attempted to access an authKey of a game that does not exist, game:' +
        gameId
    );
    return '';
  }
  
  // Decrypt the stored auth key
  return xorDecrypt(encryptedValue, gameId);
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
