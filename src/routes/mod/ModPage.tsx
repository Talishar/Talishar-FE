import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import styles from './ModPage.module.css';
import {
  useGetModPageDataQuery,
  useBanPlayerByIPMutation,
  useBanPlayerByNameMutation,
  useCloseGameMutation
} from 'features/api/apiSlice';
import UsernameModeration from './UsernameModeration';

const ModPage: React.FC = () => {
  const { isLoggedIn, isMod } = useAuth();
  const navigate = useNavigate();

  const [ipToBan, setIpToBan] = useState('');
  const [playerNumberToBan, setPlayerNumberToBan] = useState('');
  const [gameToClose, setGameToClose] = useState('');
  const [playerToBan, setPlayerToBan] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use RTK Query hooks
  const {
    data: modPageData,
    isLoading,
    error: fetchError,
    refetch
  } = useGetModPageDataQuery(undefined, {
    skip: !isLoggedIn || !isMod
  });

  const [banByIP, { isLoading: isBanningByIP }] = useBanPlayerByIPMutation();
  const [banByName, { isLoading: isBanningByName }] = useBanPlayerByNameMutation();
  const [closeGameMutation, { isLoading: isClosingGame }] = useCloseGameMutation();

  useEffect(() => {
    if (!isLoggedIn || !isMod) {
      navigate('/');
    }
  }, [isLoggedIn, isMod, navigate]);

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

  if (!isLoggedIn || !isMod) {
    return null;
  }

  const errorMessage = fetchError ? 'NetworkError when attempting to fetch resource.' : null;

  return (
    <div className={styles.container}>
      <div className={styles.modPagePanel}>
        <h1 className={styles.title}>Moderator Panel</h1>

        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
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
