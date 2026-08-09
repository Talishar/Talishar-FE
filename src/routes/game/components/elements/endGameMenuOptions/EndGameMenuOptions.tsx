import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import styles from './EndGameMenuOptions.module.css';
import { PROCESS_INPUT } from 'appConstants';
import { RootState } from 'app/Store';
import { useNavigate } from 'react-router-dom';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';
import { apiSlice } from 'features/api/apiSlice';
import { useTranslation } from 'react-i18next';
import {
  FaHome,
  FaExchangeAlt,
  FaPaperPlane,
  FaSave,
  FaMapMarkedAlt
} from 'react-icons/fa';

interface EndGameMenuOptionsProps {
  onSwitchPlayer?: () => void;
}

const EndGameMenuOptions = ({ onSwitchPlayer }: EndGameMenuOptionsProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { roguelikeGameID } = useAppSelector(getGameInfo, shallowEqual);
  //Always player 1 in roguelike, which is only place this matters
  const health = useAppSelector(
    (state: RootState) => state.game.playerOne.Health ?? 0
  );

  const handleMainMenu = async () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.MAIN_MENU } }));
    dispatch(
      apiSlice.util.invalidateTags([{ type: 'UserProfile', id: 'LIST' }])
    );
    navigate('/');
  };

  const handleFullRematch = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.FULL_REMATCH } }));
  };

  const handleContinueAdventure = () => {
    window.location.href = `https://beta.talishar.net/game/Roguelike/ContinueAdventure.php?gameName=${roguelikeGameID}&playerID=1&health=${health}`;
  };

  const handleSaveReplay = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.CREATE_REPLAY } }));
  };

  return (
    <div className={styles.buttons}>
      <button className={styles.buttonDiv} onClick={handleMainMenu}>
        <FaHome aria-hidden="true" className={styles.icon} />{' '}
        {t('END_GAME.MAIN_MENU')}
      </button>
      {roguelikeGameID && health > 0 && (
        <button className={styles.buttonDiv} onClick={handleContinueAdventure}>
          <FaMapMarkedAlt aria-hidden="true" className={styles.icon} />{' '}
          {t('END_GAME.CONTINUE_ADVENTURE')}
        </button>
      )}
      {!roguelikeGameID && (
        <button className={styles.buttonDiv} onClick={handleFullRematch}>
          <FaPaperPlane aria-hidden="true" className={styles.icon} />{' '}
          {t('END_GAME.SEND_REMATCH')}
        </button>
      )}
      {!roguelikeGameID && (
        <button className={styles.buttonDiv} onClick={handleSaveReplay}>
          <FaSave aria-hidden="true" className={styles.icon} />{' '}
          {t('END_GAME.SAVE_REPLAY')}
        </button>
      )}
      {onSwitchPlayer && (
        <button className={styles.buttonDiv} onClick={onSwitchPlayer}>
          <FaExchangeAlt aria-hidden="true" className={styles.icon} />{' '}
          {t('END_GAME.SWITCH_PLAYER_STATS')}
        </button>
      )}
    </div>
  );
};

export default EndGameMenuOptions;
