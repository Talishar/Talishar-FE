/**
 * Structure to store game session data persistently
 */
interface GameSessionData {
  gameId: number;
  playerID: number;
  authKey: string;
  timestamp: number;
}

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

const STORAGE_KEY_PREFIX = 'talishar_game_';
const CURRENT_GAME_KEY = 'talishar_current_game';

/**
 * Save both game auth key and player ID to localStorage (persists across page refreshes)
 * Also keep a copy in sessionStorage for faster access
 */
export const saveGameAuthKey = (gameId: number, authKey: string, playerID?: number): void => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot save authKey for game:', gameId);
    return;
  }
  
  if (!authKey || authKey.trim() === '') {
    console.error('Invalid authKey, cannot save empty key for game:', gameId);
    return;
  }
  
  // Encrypt the auth key before storing (XOR + base64 encoding)
  const encryptedAuthKey = xorEncrypt(authKey, gameId);
  const storageKey = STORAGE_KEY_PREFIX + gameId;
  
  // Create session data object
  const sessionData: GameSessionData = {
    gameId,
    playerID: playerID || 1, // Default to player 1 if not provided
    authKey: encryptedAuthKey,
    timestamp: Date.now()
  };
  
  // Save to both sessionStorage (for current session) and localStorage (for persistence across refreshes)
  const sessionDataJson = JSON.stringify(sessionData);
  sessionStorage.setItem(storageKey, sessionDataJson);
  localStorage.setItem(storageKey, sessionDataJson);
  
  // Save as current game for quick recovery
  localStorage.setItem(CURRENT_GAME_KEY, String(gameId));
};

/**
 * Load game auth key and player ID from storage
 * Tries sessionStorage first (fastest), then falls back to localStorage (survives page refresh)
 */
export const loadGameAuthKey = (gameId: number): string => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot load authKey for game:', gameId);
    return '';
  }

  const storageKey = STORAGE_KEY_PREFIX + gameId;
  
  // Try sessionStorage first
  let sessionDataJson = sessionStorage.getItem(storageKey);
  
  // If not in sessionStorage, try localStorage (survives page refresh)
  if (!sessionDataJson) {
    sessionDataJson = localStorage.getItem(storageKey);
  }
  
  // MIGRATION: If not found with new format, try old format (pre-commit 3eff64f)
  // Old format was just the gameId as the key
  if (!sessionDataJson) {
    const oldFormatKey = String(gameId);
    const oldSessionData = sessionStorage.getItem(oldFormatKey);
    if (oldSessionData) {
      console.log(`Migrating auth key from old format for game ${gameId}`);
      // Old format was just an encrypted string, not a JSON object
      const migratedAuthKey = xorDecrypt(oldSessionData, gameId);
      if (migratedAuthKey) {
        // Save in new format to prevent repeated migration
        saveGameAuthKey(gameId, migratedAuthKey);
        // Clean up old format key
        sessionStorage.removeItem(oldFormatKey);
        return migratedAuthKey;
      }
    }
    
    // Also check localStorage for old format
    const oldLocalData = localStorage.getItem(oldFormatKey);
    if (oldLocalData) {
      console.log(`Migrating auth key from old localStorage format for game ${gameId}`);
      const migratedAuthKey = xorDecrypt(oldLocalData, gameId);
      if (migratedAuthKey) {
        // Save in new format
        saveGameAuthKey(gameId, migratedAuthKey);
        // Clean up old format key
        localStorage.removeItem(oldFormatKey);
        return migratedAuthKey;
      }
    }
    
    console.warn(`No auth key found for game ${gameId} in either storage`);
    return '';
  }
  
  try {
    const sessionData: GameSessionData = JSON.parse(sessionDataJson);
    // Verify the stored data is for the correct game (safety check)
    if (sessionData.gameId !== gameId) {
      console.warn(`Stored data mismatch: requested gameId ${gameId}, but data is for ${sessionData.gameId}`);
      return '';
    }
    // Restore to sessionStorage for faster future access
    sessionStorage.setItem(storageKey, sessionDataJson);
    
    // Decrypt the stored auth key
    return xorDecrypt(sessionData.authKey, gameId);
  } catch (error) {
    console.error('Failed to parse or decrypt stored game session:', error);
    return '';
  }
};

/**
 * Load player ID from storage for a given game
 */
export const loadGamePlayerID = (gameId: number): number => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot load playerID for game:', gameId);
    return 0;
  }

  const storageKey = STORAGE_KEY_PREFIX + gameId;
  
  // Try sessionStorage first
  let sessionDataJson = sessionStorage.getItem(storageKey);
  
  // If not in sessionStorage, try localStorage
  if (!sessionDataJson) {
    sessionDataJson = localStorage.getItem(storageKey);
  }
  
  if (!sessionDataJson) {
    console.warn(`No player ID found for game ${gameId}`);
    return 0;
  }
  
  try {
    const sessionData: GameSessionData = JSON.parse(sessionDataJson);
    // Verify the stored data is for the correct game (safety check)
    if (sessionData.gameId !== gameId) {
      console.warn(`Stored data mismatch: requested gameId ${gameId}, but data is for ${sessionData.gameId}`);
      return 0;
    }
    return sessionData.playerID || 0;
  } catch (error) {
    console.error('Failed to parse stored game session for playerID:', error);
    return 0;
  }
};

/**
 * Get the last active game ID from storage
 */
export const getLastActiveGameId = (): number => {
  const lastGameId = localStorage.getItem(CURRENT_GAME_KEY);
  if (!lastGameId) return 0;
  
  try {
    return parseInt(lastGameId, 10);
  } catch (error) {
    console.error('Failed to parse last game ID:', error);
    return 0;
  }
};

/**
 * Delete game session data (both auth key and player ID)
 */
export const deleteGameAuthKey = (gameId: number): void => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot delete authKey for game:', gameId);
    return;
  }

  const storageKey = STORAGE_KEY_PREFIX + gameId;
  
  // Remove from both storage locations
  const sessExists = sessionStorage.getItem(storageKey);
  const localExists = localStorage.getItem(storageKey);
  
  if (sessExists) {
    sessionStorage.removeItem(storageKey);
  }
  if (localExists) {
    localStorage.removeItem(storageKey);
  }
  
  // Clear current game if it matches
  if (getLastActiveGameId() === gameId) {
    localStorage.removeItem(CURRENT_GAME_KEY);
  }
  
  console.log(`Deleted game session for gameId ${gameId}`);
};
