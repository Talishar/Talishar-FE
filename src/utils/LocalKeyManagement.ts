/**
 * Structure to store game session data persistently
 */
interface GameSessionData {
  gameId: number;
  playerID: number;
  authKey: string;
  timestamp: number;
  username?: string; // Added for recovery validation
  recoveryAttempts?: number; // Track recovery attempts to prevent infinite loops
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
const INDEXEDDB_NAME = 'TalisharGameSessions';
const INDEXEDDB_STORE = 'authKeys';
const RECOVERY_ATTEMPTS_LIMIT = 3;

/**
 * Initialize IndexedDB for fallback storage
 */
const initIndexedDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported');
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(INDEXEDDB_NAME, 1);
      
      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        resolve(null);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(INDEXEDDB_STORE)) {
          const store = db.createObjectStore(INDEXEDDB_STORE, { keyPath: 'gameId' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    } catch (error) {
      console.error('IndexedDB initialization error:', error);
      resolve(null);
    }
  });
};

/**
 * Save to IndexedDB as fallback
 */
const saveToIndexedDB = async (sessionData: GameSessionData): Promise<void> => {
  try {
    const db = await initIndexedDB();
    if (!db) return;

    const transaction = db.transaction([INDEXEDDB_STORE], 'readwrite');
    const store = transaction.objectStore(INDEXEDDB_STORE);
    
    store.put(sessionData);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('Failed to save to IndexedDB:', error);
  }
};

/**
 * Load from IndexedDB as fallback
 */
const loadFromIndexedDB = async (gameId: number): Promise<GameSessionData | null> => {
  try {
    const db = await initIndexedDB();
    if (!db) return null;

    const transaction = db.transaction([INDEXEDDB_STORE], 'readonly');
    const store = transaction.objectStore(INDEXEDDB_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(gameId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Failed to load from IndexedDB:', error);
    return null;
  }
};

/**
 * Get the current username from various sources (Redux, localStorage, session storage)
 * Useful for getting username when Redux hasn't loaded yet
 */
export const getCurrentUsername = (reduxUsername?: string | null): string | undefined => {
  // First try Redux username if provided
  if (reduxUsername) {
    return reduxUsername;
  }

  // Try to get from localStorage (may be cached from previous session)
  try {
    const lastUsername = localStorage.getItem('talishar_lastUsername');
    if (lastUsername) {
      return lastUsername;
    }
  } catch (e) {
    // localStorage might not be available
  }

  // Try to get from sessionStorage
  try {
    const sessionUsername = sessionStorage.getItem('talishar_currentUsername');
    if (sessionUsername) {
      return sessionUsername;
    }
  } catch (e) {
    // sessionStorage might not be available
  }

  return undefined;
};

/**
 * Save the current username for later retrieval
 */
export const cacheCurrentUsername = (username: string): void => {
  try {
    localStorage.setItem('talishar_lastUsername', username);
    sessionStorage.setItem('talishar_currentUsername', username);
  } catch (e) {
    console.warn('Failed to cache username:', e);
  }
};

/**
 * Save both game auth key and player ID to localStorage (persists across page refreshes)
 * Also keep a copy in sessionStorage for faster access and IndexedDB for backup
 */
export const saveGameAuthKey = (gameId: number, authKey: string, playerID?: number, username?: string): void => {
  if (gameId <= 0) {
    console.error('Invalid game ID, cannot save authKey for game:', gameId);
    return;
  }
  
  // Spectators (playerID 3) must never save auth keys
  if (playerID === 3) {
    return;
  }
  
  if (!authKey || authKey.trim() === '') {
    console.error('Invalid authKey, cannot save empty key for game:', gameId);
    return;
  }
  
  // Get username from various sources if not provided
  const usernameToSave = username || getCurrentUsername();
  
  // Cache the username for future use
  if (usernameToSave) {
    cacheCurrentUsername(usernameToSave);
  }
  
  // Encrypt the auth key before storing (XOR + base64 encoding)
  const encryptedAuthKey = xorEncrypt(authKey, gameId);
  const storageKey = STORAGE_KEY_PREFIX + gameId;
  
  // Create session data object
  const sessionData: GameSessionData = {
    gameId,
    playerID: playerID || 1, // Default to player 1 if not provided
    authKey: encryptedAuthKey,
    timestamp: Date.now(),
    username: usernameToSave,
    recoveryAttempts: 0
  };
  
  // Save to both sessionStorage (for current session) and localStorage (for persistence across refreshes)
  const sessionDataJson = JSON.stringify(sessionData);
  sessionStorage.setItem(storageKey, sessionDataJson);
  localStorage.setItem(storageKey, sessionDataJson);
  
  // Also save to IndexedDB for additional fallback
  saveToIndexedDB(sessionData).catch(err => console.warn('IndexedDB save failed:', err));
  
  // Save as current game for quick recovery
  localStorage.setItem(CURRENT_GAME_KEY, String(gameId));
};

/**
 * Load game auth key and player ID from storage
 * Tries sessionStorage first (fastest), then localStorage, then IndexedDB (survives data clearing)
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
 * Load game auth key from IndexedDB as fallback (async)
 * Use this when primary storage fails
 */
export const loadGameAuthKeyFromIndexedDB = async (gameId: number): Promise<string> => {
  if (gameId <= 0) return '';
  
  try {
    const sessionData = await loadFromIndexedDB(gameId);
    if (sessionData && sessionData.gameId === gameId) {
      const authKey = xorDecrypt(sessionData.authKey, gameId);
      if (authKey) {
        console.log(`Recovered authKey from IndexedDB for game ${gameId}`);
        // Restore to primary storage
        const storageKey = STORAGE_KEY_PREFIX + gameId;
        sessionStorage.setItem(storageKey, JSON.stringify(sessionData));
        localStorage.setItem(storageKey, JSON.stringify(sessionData));
        return authKey;
      }
    }
  } catch (error) {
    console.warn('Failed to load from IndexedDB:', error);
  }
  return '';
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
 * Load stored username for a given game
 */
export const loadGameUsername = (gameId: number): string | null => {
  if (gameId <= 0) {
    return null;
  }

  const storageKey = STORAGE_KEY_PREFIX + gameId;
  
  // Try sessionStorage first
  let sessionDataJson = sessionStorage.getItem(storageKey);
  
  // If not in sessionStorage, try localStorage
  if (!sessionDataJson) {
    sessionDataJson = localStorage.getItem(storageKey);
  }
  
  if (!sessionDataJson) {
    return null;
  }
  
  try {
    const sessionData: GameSessionData = JSON.parse(sessionDataJson);
    if (sessionData.gameId === gameId && sessionData.username) {
      return sessionData.username;
    }
  } catch (error) {
    console.error('Failed to parse stored game session for username:', error);
  }
  
  return null;
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
};
