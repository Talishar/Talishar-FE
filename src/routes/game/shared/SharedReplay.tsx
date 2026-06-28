import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from 'app/Hooks';
import { setReplayStart } from 'features/game/GameSlice';
import { useLoadSharedReplayMutation } from 'features/api/apiSlice';
import { GameLocationState } from 'interface/GameLocationState';

export default function SharedReplay() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadSharedReplay] = useLoadSharedReplayMutation();
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No share token provided.');
      return;
    }

    if (!/^[0-9a-f]{64}$/.test(token)) {
      setError('Invalid share token.');
      return;
    }

    loadSharedReplay({ shareToken: token })
      .unwrap()
      .then((response) => {
        if (response.error) throw new Error(response.error);
        if (!response.gameName || !response.playerID || !response.authKey) {
          throw new Error('Incomplete response from server.');
        }
        dispatch(
          setReplayStart({
            playerID: response.playerID,
            gameID: response.gameName,
            authKey: response.authKey
          })
        );
        navigate(`/game/play/${response.gameName}`, {
          state: { playerID: response.playerID } as GameLocationState
        });
      })
      .catch((err: any) => {
        setError(err?.message || err?.data?.error || 'Failed to load shared replay.');
      });
  }, [token]);

  if (error) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Unable to load replay</h2>
        <p style={{ color: '#ff6b6b', marginTop: '1rem' }}>{error}</p>
        <button
          style={{ marginTop: '1.5rem' }}
          onClick={() => navigate('/')}
        >
          Return to main menu
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Loading shared replay...</p>
    </main>
  );
}
