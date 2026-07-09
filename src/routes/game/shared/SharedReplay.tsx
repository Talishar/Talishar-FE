import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'app/Hooks';
import { setReplayStart } from 'features/game/GameSlice';
import { useLoadSharedReplayMutation } from 'features/api/apiSlice';
import { GameLocationState } from 'interface/GameLocationState';
import { usePageTitle } from 'hooks/usePageTitle';

export default function SharedReplay() {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.SHARED_REPLAY'));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadSharedReplay] = useLoadSharedReplayMutation();
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError(t('SHARED_REPLAY_PAGE.ERROR_NO_TOKEN'));
      return;
    }

    if (!/^[0-9a-f]{64}$/.test(token)) {
      setError(t('SHARED_REPLAY_PAGE.ERROR_INVALID_TOKEN'));
      return;
    }

    loadSharedReplay({ shareToken: token })
      .unwrap()
      .then((response) => {
        if (response.error) throw new Error(response.error);
        if (!response.gameName || !response.playerID || !response.authKey) {
          throw new Error(t('SHARED_REPLAY_PAGE.ERROR_INCOMPLETE_RESPONSE'));
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
        setError(err?.message || err?.data?.error || t('SHARED_REPLAY_PAGE.ERROR_FAILED_LOAD'));
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
      <p>{t('SHARED_REPLAY_PAGE.LOADING')}</p>
    </main>
  );
}
