import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import styles from './ModPage.module.css';
import { BACKEND_URL } from 'appConstants';

const ModPage: React.FC = () => {
  const { isLoggedIn, isMod } = useAuth();
  const navigate = useNavigate();

  const [ipToBan, setIpToBan] = useState('');
  const [playerNumberToBan, setPlayerNumberToBan] = useState('');
  const [gameToClose, setGameToClose] = useState('');
  const [playerToBan, setPlayerToBan] = useState('');

  const [bannedPlayers, setBannedPlayers] = useState<string[]>([]);
  const [bannedIPs, setBannedIPs] = useState<string[]>([]);
  const [recentAccounts, setRecentAccounts] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !isMod) {
      navigate('/');
    }
  }, [isLoggedIn, isMod, navigate]);

  useEffect(() => {
    if (isLoggedIn && isMod) {
      fetchModPageData();
    }
  }, [isLoggedIn, isMod]);

  const fetchModPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}APIs/GetModPageData.php`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch mod page data');
      }

      const data = await response.json();
      setBannedPlayers(data.bannedPlayers || []);
      setBannedIPs(data.bannedIPs || []);
      setRecentAccounts(data.recentAccounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBanByIP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}BanPlayer.php?ipToBan=${encodeURIComponent(ipToBan)}&playerNumberToBan=${encodeURIComponent(playerNumberToBan)}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to ban player by IP');
      }

      setSuccessMessage('Player banned by IP successfully');
      setIpToBan('');
      setPlayerNumberToBan('');
      fetchModPageData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban player');
    }
  };

  const handleCloseGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}CloseGame.php?gameToClose=${encodeURIComponent(gameToClose)}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to close game');
      }

      setSuccessMessage('Game closed successfully');
      setGameToClose('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close game');
    }
  };

  const handleBanPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}BanPlayer.php?playerToBan=${encodeURIComponent(playerToBan)}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to ban player');
      }

      setSuccessMessage('Player banned successfully');
      setPlayerToBan('');
      fetchModPageData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban player');
    }
  };

  if (!isLoggedIn || !isMod) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.modPagePanel}>
        <h1 className={styles.title}>Moderator Panel</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

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

        <div className={styles.dataSection}>
          <h2>Banned Players</h2>
          {loading ? (
            <p>Loading...</p>
          ) : bannedPlayers.length > 0 ? (
            <ul className={styles.dataList}>
              {bannedPlayers.map((player, index) => (
                <li key={index}>{player}</li>
              ))}
            </ul>
          ) : (
            <p>No banned players</p>
          )}
        </div>

        <div className={styles.dataSection}>
          <h2>Most Recently Created Accounts</h2>
          {loading ? (
            <p>Loading...</p>
          ) : recentAccounts.length > 0 ? (
            <ul className={styles.dataList}>
              {recentAccounts.map((account, index) => (
                <li key={index}>{account}</li>
              ))}
            </ul>
          ) : (
            <p>No recent accounts</p>
          )}
        </div>

        <div className={styles.dataSection}>
          <h2>Banned IPs</h2>
          {loading ? (
            <p>Loading...</p>
          ) : bannedIPs.length > 0 ? (
            <ul className={styles.dataList}>
              {bannedIPs.map((ip, index) => (
                <li key={index}>{ip}</li>
              ))}
            </ul>
          ) : (
            <p>No banned IPs</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModPage;
