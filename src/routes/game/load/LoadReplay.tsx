import React, { useId, useState } from 'react';
import { useAppDispatch } from 'app/Hooks';
import { useLoadReplayMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import classNames from 'classnames';
import { LoadReplayAPI } from 'interface/API/LoadReplayAPI.php';
import { setReplayStart } from 'features/game/GameSlice';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import styles from './LoadReplay.module.css';
import { GameLocationState } from 'interface/GameLocationState';

const LoadReplay = () => {
  return (
    <article>
      <h2>Replay Tool</h2>
      <ReplayGame />
    </article>
  );
};

const ReplayGame = () => {
  const [replayNumber, setReplayNumber] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadReplay, loadReplayResult] = useLoadReplayMutation();

  const {
    formState: { isSubmitting, errors },
    setError,
    handleSubmit,
  } = useForm<LoadReplayAPI>({
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<LoadReplayAPI> = async (
    values: LoadReplayAPI
  ) => {
    try {
      const response = await loadReplay(values).unwrap();
      if (response.error) {
        throw response.error;
      } else {
        if (!response.playerID || !response.gameName || !response.authKey) {
          throw new Error('A required param is missing');
        }
        dispatch(
          setReplayStart({
            playerID: response.playerID ?? 0,
            gameID: response.gameName ?? 0,
            authKey: response.authKey ?? '',
          })
        );
        navigate(`/game/play/${response.gameName}`, {
          state: { playerID: response.playerID ?? 0 } as GameLocationState
        });
      }
    } catch (error) {
      console.warn(error);
      toast.error(String(error), { position: 'top-center' });
      setError('root.serverError', {
        type: 'custom',
        message: `There has been an error while creating your game. Error: ${JSON.stringify(
          error
        )} Please try again.`
      });
    }
  };

  const buttonClass = classNames(styles.button, 'primary');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <div>
        <label htmlFor={replayNumber}>Replay game number:</label>
        <input
            id={replayNumber}
            onChange={(e) => setReplayNumber(e.target.value)}
        ></input>
        <button
            type="submit"
            className={buttonClass}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            >
            Replay Game
            </button>
        </div>
    </form>
  );
}


export default LoadReplay;
