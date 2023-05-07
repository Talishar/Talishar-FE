import React, { useId, useState } from 'react';

import styles from './devTool.module.css';
import { useLoadDebugGameMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';

const DevTool = () => {
  return (
    <article className={styles.devTool}>
      <h2>Dev Tool (Not visible in prod)</h2>
      <DebugGame />
    </article>
  );
};

const DebugGame = () => {
  const gameIDInput = useId();
  const localIDInput = useId();
  const [gameID, setGameID] = useState<string | undefined>(undefined);
  const [localGame, setLocalGame] = useState<string | undefined>(undefined);
  const [debugGameMutation] = useLoadDebugGameMutation();

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    toast.promise(debugGameMutation({ source: gameID, target: localGame }), {
      loading: 'Submitting',
      success: 'Success, refresh your games in progress.',
      error: 'Some error, check the network'
    });
  };

  return (
    <div>
      <label htmlFor={gameIDInput}>Debug game ID:</label>
      <input
        id={gameIDInput}
        onChange={(e) => setGameID(e.target.value)}
      ></input>
      <label htmlFor={localIDInput}>Local game ID to overwrite:</label>
      <input
        id={localIDInput}
        onChange={(e) => setLocalGame(e.target.value)}
      ></input>
      <button onClick={handleButtonClick}>
        Replace local game with debug game
      </button>
    </div>
  );
};

export default DevTool;
