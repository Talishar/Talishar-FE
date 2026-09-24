import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'app/Hooks';
import { useJoinSnapshotGameMutation } from 'features/api/apiSlice';
import { setGameStart, setRecoveredAuthKey } from 'features/game/GameSlice';
import { usePageTitle } from 'hooks/usePageTitle';
import { saveSnapshotInviteSeat } from 'utils/snapshotInviteSeat';

export default function JoinSnapshot() {
  const { t } = useTranslation();
  usePageTitle(t('SNAPSHOT_JOIN.TITLE'));
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [joinSnapshotGame] = useJoinSnapshotGameMutation();
  const [error, setError] = useState<string | null>(null);
  const game = params.get('game');
  const token = params.get('token');

  useEffect(() => {
    if (
      !game ||
      !/^[1-9]\d*$/.test(game) ||
      !token ||
      !/^[0-9a-f]{64}$/.test(token)
    ) {
      setError(t('SNAPSHOT_JOIN.INVALID_LINK'));
      return;
    }
    let active = true;
    joinSnapshotGame({ gameName: Number(game), inviteToken: token })
      .unwrap()
      .then((result) => {
        if (!active) return;
        if (!result.success || !result.authKey || !result.playerID) {
          throw new Error(result.error || t('SNAPSHOT_JOIN.JOIN_ERROR'));
        }
        if (result.playerID !== 1 && result.playerID !== 2) {
          throw new Error(t('SNAPSHOT_JOIN.JOIN_ERROR'));
        }
        saveSnapshotInviteSeat(result.gameName, {
          playerID: result.playerID,
          authKey: result.authKey
        });
        dispatch(
          setGameStart({
            playerID: result.playerID,
            gameID: result.gameName,
            authKey: result.authKey
          })
        );
        // A second tab may already know this game as the owner's seat.
        dispatch(
          setRecoveredAuthKey({
            playerID: result.playerID,
            authKey: result.authKey
          })
        );
        navigate(`/game/play/${result.gameName}`, {
          replace: true,
          state: { playerID: result.playerID, authKey: result.authKey }
        });
      })
      .catch((err: any) => {
        if (active)
          setError(
            err?.data?.error || err?.message || t('SNAPSHOT_JOIN.JOIN_ERROR')
          );
      });
    return () => {
      active = false;
    };
  }, [game, token, joinSnapshotGame, dispatch, navigate, t]);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>{t('SNAPSHOT_JOIN.TITLE')}</h2>
      <p>{error || t('SNAPSHOT_JOIN.LOADING')}</p>
      {error && (
        <button onClick={() => navigate('/')}>
          {t('SNAPSHOT_JOIN.RETURN_MAIN_MENU')}
        </button>
      )}
    </main>
  );
}
