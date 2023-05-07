import React, { useId, useState } from 'react';

import styles from './devTool.module.css';

const DevTool = () => {
  return (
    <article className={styles.devTool}>
      <h2>Dev Tool (Not visible in prod)</h2>
      <div>No tools right now</div>
    </article>
  );
};

const DebugGame = () => {
  const gameIDInput = useId();
  const [gameID, setGameID] = useState<string | undefined>(undefined);

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    window.open(
      `${window.location.origin}/game/play/${gameID}/?playerID=1`,
      '_blank'
    );
    window.open(
      `${window.location.origin}/game/play/${gameID}/?playerID=2`,
      '_blank'
    );
  };

  return (
    <div>
      <label htmlFor={gameIDInput}>Game ID to debug:</label>
      <input
        id={gameIDInput}
        onChange={(e) => setGameID(e.target.value)}
      ></input>
      <button onClick={handleButtonClick}>Launch game</button>
      <div>{gameID}</div>
    </div>
  );
};

export default DevTool;
