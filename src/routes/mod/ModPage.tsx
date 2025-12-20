import React, { useState } from 'react';
import styles from './ModPage.module.css';
import { toast } from 'react-hot-toast';
import {
  useGetModPageDataQuery,
  useBanPlayerByIPMutation,
  useBanPlayerByNameMutation,
  useCloseGameMutation,
  useDeleteUsernameMutation
} from 'features/api/apiSlice';
import UsernameModeration from './UsernameModeration';
import DeleteUsernameAutocomplete from './DeleteUsernameAutocomplete';

const ModPage: React.FC = () => {
  const [ipToBan, setIpToBan] = useState('');
  const [playerNumberToBan, setPlayerNumberToBan] = useState('');
  const [gameToClose, setGameToClose] = useState('');
  const [playerToBan, setPlayerToBan] = useState('');
  const [usernameToDelete, setUsernameToDelete] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use RTK Query hooks
  const {
    data: modPageData,
    isLoading,
    error: fetchError,
    refetch
  } = useGetModPageDataQuery(undefined);

  const [banByIP, { isLoading: isBanningByIP }] = useBanPlayerByIPMutation();
  const [banByName, { isLoading: isBanningByName }] = useBanPlayerByNameMutation();
  const [closeGameMutation, { isLoading: isClosingGame }] = useCloseGameMutation();
  const [deleteUsername, { isLoading: isDeletingUsername }] = useDeleteUsernameMutation();

  const handleBanByIP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      await banByIP({ ipToBan, playerNumberToBan }).unwrap();
      setSuccessMessage('Player banned by IP successfully');
      setIpToBan('');
      setPlayerNumberToBan('');
      // Refresh data after successful ban
      await refetch();
    } catch (err: any) {
      console.error('Failed to ban player:', err);
      // Error will be shown via toast from RTK Query error handler
    }
  };

  const handleCloseGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      await closeGameMutation({ gameToClose }).unwrap();
      setSuccessMessage('Game closed successfully');
      setGameToClose('');
    } catch (err: any) {
      console.error('Failed to close game:', err);
      // Error will be shown via toast from RTK Query error handler
    }
  };

  const handleBanPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      await banByName({ playerToBan }).unwrap();
      setSuccessMessage('Player banned successfully');
      setPlayerToBan('');
      // Refresh data after successful ban
      await refetch();
    } catch (err: any) {
      console.error('Failed to ban player:', err);
      // Error will be shown via toast from RTK Query error handler
    }
  };

  const handleDeleteUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!usernameToDelete.trim()) {
      toast.error('Please enter a username to delete', {
        position: 'top-center'
      });
      return;
    }

    try {
      console.log('[ModPage Delete Username] Starting deletion for:', usernameToDelete);
      const response = await deleteUsername({ usernameToDelete }).unwrap();
      console.log('[ModPage Delete Username] Success response:', response);
      
      // Show success toast
      toast.success(response.message || 'Username deleted successfully from database', {
        style: {
          minWidth: '300px'
        },
        position: 'top-center'
      });
      
      setSuccessMessage(response.message || 'Username deleted successfully from database');
      setUsernameToDelete('');
      setSelectedUserEmail(null);
    } catch (err: any) {
      console.error('[ModPage Delete Username] Error response:', {
        errorObject: err,
        message: err?.message,
        error: err?.error,
        status: err?.status,
        data: err?.data,
        toString: err?.toString()
      });
      
      const errorMessage = err?.data?.message || err?.message || err?.error || err?.toString() || 'Unknown error';
      
      // Show error toast
      toast.error(`Error deleting username: ${errorMessage}`, {
        style: {
          minWidth: '300px'
        },
        position: 'top-center'
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.modPagePanel}>
        <h1 className={styles.title}>Moderator Panel</h1>

        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

        <div className={styles.contentWrapper}>
          <div className={styles.leftColumn}>
            <form onSubmit={handleBanByIP} className={styles.form}>
              <h2>IP Ban from Game</h2>
              <label htmlFor="ipToBan">Game to IP ban from:</label>
              <input
                type="text"
                id="ipToBan"
                value={ipToBan}
                onChange={(e) => setIpToBan(e.target.value)}
                required
              />
              <label htmlFor="playerNumberToBan">Player to ban? (1 or 2):</label>
              <input
                type="text"
                id="playerNumberToBan"
                value={playerNumberToBan}
                onChange={(e) => setPlayerNumberToBan(e.target.value)}
                required
              />
              <button type="submit">Ban</button>
            </form>

            <form onSubmit={handleCloseGame} className={styles.form}>
              <h2>Close Game</h2>
              <label htmlFor="gameToClose">Game to close:</label>
              <input
                type="text"
                id="gameToClose"
                value={gameToClose}
                onChange={(e) => setGameToClose(e.target.value)}
                required
              />
              <button type="submit">Close Game</button>
            </form>

            <form onSubmit={handleBanPlayer} className={styles.form}>
              <h2>Ban Player by Username</h2>
              <label htmlFor="playerToBan">Player to ban:</label>
              <input
                type="text"
                id="playerToBan"
                value={playerToBan}
                onChange={(e) => setPlayerToBan(e.target.value)}
                required
              />
              <button type="submit">Ban</button>
            </form>

            <form onSubmit={handleDeleteUsername} className={styles.form}>
              <h2>Delete Username from Database</h2>
              <label htmlFor="usernameToDelete">Username to delete:</label>
              <DeleteUsernameAutocomplete
                value={usernameToDelete}
                onChange={(newValue) => setUsernameToDelete(newValue)}
                onSelect={(username, email) => {
                  setUsernameToDelete(username);
                  setSelectedUserEmail(email);
                }}
              />
              <button type="submit" disabled={isDeletingUsername || !usernameToDelete.trim()}>
                {isDeletingUsername ? 'Deleting...' : 'Delete Username'}
              </button>
            </form>
          </div>

          <div className={styles.middleColumn}>
            <div className={styles.dataSection}>
              <h2>Most Recently Created Accounts</h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : modPageData?.recentAccounts && modPageData.recentAccounts.length > 0 ? (
                <ul className={styles.dataList}>
                  {modPageData.recentAccounts.map((account, index) => (
                    <li key={index}>{account}</li>
                  ))}
                </ul>
              ) : (
                <p>No recent accounts</p>
              )}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.dataSection}>
              <h2>Banned Players</h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : modPageData?.bannedPlayers && modPageData.bannedPlayers.length > 0 ? (
                <ul className={styles.dataList}>
                  {modPageData.bannedPlayers.map((player, index) => (
                    <li key={index}>{player}</li>
                  ))}
                </ul>
              ) : (
                <p>No banned players</p>
              )}
            </div>

            <div className={styles.dataSection}>
              <h2>Banned IPs</h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : modPageData?.bannedIPs && modPageData.bannedIPs.length > 0 ? (
                <ul className={styles.dataList}>
                  {modPageData.bannedIPs.map((ip, index) => (
                    <li key={index}>{ip}</li>
                  ))}
                </ul>
              ) : (
                <p>No banned IPs</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Username Moderation Section */}
      <UsernameModeration />
    </div>
  );
};

export default ModPage;
