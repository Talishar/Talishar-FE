import { GiThumbDown, GiThumbUp } from 'react-icons/gi';
import { useAppDispatch } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import screenfull from 'screenfull';
import styles from './EndGameMenuOptions.module.css';
import { useState } from 'react';
import { PROCESS_INPUT } from 'appConstants';

const EndGameMenuOptions = () => {
  const dispatch = useAppDispatch();
  const [hasRated, setHasRated] = useState(false);

  // TODO: Need constants for the button modes.
  const handleMainMenu = async () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.MAIN_MENU } }));
    await screenfull.exit();
    // TODO: handle this link better
    window.location.href = `https://talishar.net/game/MainMenu.php`;
  };

  const handleQuickRematch = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.QUICK_REMATCH } }));
  };

  const handleFullRematch = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.FULL_REMATCH } }));
    // TODO: Redirect to sideboard screen.
  };

  // only allow to rate once so we block it from the FE:
  const handleThumbUp = () => {
    if (hasRated) {
      return;
    }
    dispatch(
      submitButton({ button: { mode: PROCESS_INPUT.RATING_THUMBS_UP } })
    );
    setHasRated(true);
  };

  const handleThumbDown = () => {
    if (hasRated) {
      return;
    }
    dispatch(
      submitButton({ button: { mode: PROCESS_INPUT.RATING_THUMBS_DOWN } })
    );
    setHasRated(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <div className={styles.buttonDiv} onClick={handleMainMenu}>
          Main Menu
        </div>
        <div className={styles.buttonDiv} onClick={handleQuickRematch}>
          Quick Rematch (no sideboarding)
        </div>
        <div className={styles.buttonDiv} onClick={handleFullRematch}>
          Full Rematch (new sideboard)
        </div>
      </div>
    </div>
  );
};

export default EndGameMenuOptions;
