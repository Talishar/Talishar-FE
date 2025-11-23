/**
 * AuthKeyMonitoring.ts
 * 
 * Utility for monitoring and logging auth key loss incidents.
 * Helps diagnose authKey loss issues by tracking when and where keys are lost.
 */

interface AuthKeyLossEvent {
  timestamp: number;
  gameId: number;
  playerID: number;
  lastKnownAuthKey?: string;
  source: string; // Where the loss was detected
  stackTrace?: string;
}

const STORAGE_KEY = 'talishar_authkey_loss_log';
const MAX_LOG_ENTRIES = 50;

/**
 * Log an authKey loss event for debugging
 */
export const logAuthKeyLoss = (
  gameId: number,
  playerID: number,
  source: string,
  lastKnownAuthKey?: string
): void => {
  try {
    const event: AuthKeyLossEvent = {
      timestamp: Date.now(),
      gameId,
      playerID,
      lastKnownAuthKey: lastKnownAuthKey ? '***' : undefined, // Don't store actual keys
      source,
      stackTrace: new Error().stack
    };

    // Get existing log
    const logString = localStorage.getItem(STORAGE_KEY);
    let log: AuthKeyLossEvent[] = [];
    if (logString) {
      try {
        log = JSON.parse(logString);
      } catch (e) {
        console.warn('Failed to parse authKey loss log');
      }
    }

    // Add new event
    log.push(event);

    // Keep only recent entries
    if (log.length > MAX_LOG_ENTRIES) {
      log = log.slice(-MAX_LOG_ENTRIES);
    }

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));

    // Also log to console with context
    console.error(`AuthKey Loss Event:`, {
      gameId,
      playerID,
      source,
      time: new Date(event.timestamp).toISOString()
    });
  } catch (error) {
    console.error('Failed to log authKey loss:', error);
  }
};

/**
 * Get the authKey loss log for debugging
 */
export const getAuthKeyLossLog = (): AuthKeyLossEvent[] => {
  try {
    const logString = localStorage.getItem(STORAGE_KEY);
    if (logString) {
      return JSON.parse(logString);
    }
  } catch (error) {
    console.error('Failed to retrieve authKey loss log:', error);
  }
  return [];
};

/**
 * Clear the authKey loss log
 */
export const clearAuthKeyLossLog = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('AuthKey loss log cleared');
  } catch (error) {
    console.error('Failed to clear authKey loss log:', error);
  }
};

/**
 * Get summary statistics of authKey losses
 */
export const getAuthKeyLossStatistics = () => {
  const log = getAuthKeyLossLog();
  
  const stats = {
    totalEvents: log.length,
    eventsByGame: {} as Record<number, number>,
    eventsBySource: {} as Record<string, number>,
    recentEvents: log.slice(-10)
  };

  log.forEach(event => {
    // Count by game
    stats.eventsByGame[event.gameId] = (stats.eventsByGame[event.gameId] || 0) + 1;
    
    // Count by source
    stats.eventsBySource[event.source] = (stats.eventsBySource[event.source] || 0) + 1;
  });

  return stats;
};

/**
 * Check if we should warn about authKey loss
 */
export const shouldWarnAboutAuthKeyLoss = (): boolean => {
  const log = getAuthKeyLossLog();
  if (log.length === 0) return false;

  // Warn if more than 5 losses in the last hour
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const recentLosses = log.filter(event => event.timestamp > oneHourAgo);
  
  return recentLosses.length > 5;
};

export default {
  logAuthKeyLoss,
  getAuthKeyLossLog,
  clearAuthKeyLossLog,
  getAuthKeyLossStatistics,
  shouldWarnAboutAuthKeyLoss
};
