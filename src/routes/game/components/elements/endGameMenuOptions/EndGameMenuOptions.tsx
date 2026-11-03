import React, { useState } from 'react';
import { useAppDispatch } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import styles from './EndGameMenuOptions.module.css';
import { PROCESS_INPUT } from 'appConstants';
import { useNavigate } from 'react-router-dom';
import { apiSlice } from 'features/api/apiSlice';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  FaHome,
  FaExchangeAlt,
  FaPaperPlane,
  FaSave
} from 'react-icons/fa';

interface EndGameMenuOptionsProps {
  onSwitchPlayer?: () => void;
}

const EndGameMenuOptions = ({ onSwitchPlayer }: EndGameMenuOptionsProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSavingReplay, setIsSavingReplay] = useState(false);
  const [isReplaySaved, setIsReplaySaved] = useState(false);
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

  const handleSaveReplay = async () => {
    setIsSavingReplay(true);
    try {
      const body = await dispatch(
        submitButton({ button: { mode: PROCESS_INPUT.CREATE_REPLAY } })
      ).unwrap();
      const result = JSON.parse(body || '{}') as {
        success?: boolean;
        replayNumber?: number;
        message?: string;
      };
      if (!result.success) {
        throw new Error(result.message || t('END_GAME.SAVE_REPLAY_ERROR'));
      }

      setIsReplaySaved(true);
      dispatch(apiSlice.util.invalidateTags(['SavedReplays']));
      toast.success(
        result.message ||
          t('END_GAME.REPLAY_SAVED_NUMBER', {
            number: result.replayNumber
          })
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('END_GAME.SAVE_REPLAY_ERROR')
      );
    } finally {
      setIsSavingReplay(false);
    }
  };

  return (
    <div className={styles.buttons}>
      <button className={styles.buttonDiv} onClick={handleMainMenu}>
        <FaHome aria-hidden="true" className={styles.icon} />{' '}
        {t('END_GAME.MAIN_MENU')}
      </button>
      <button className={styles.buttonDiv} onClick={handleFullRematch}>
        <FaPaperPlane aria-hidden="true" className={styles.icon} />{' '}
        {t('END_GAME.SEND_REMATCH')}
      </button>
      <button
        type="button"
        className={styles.buttonDiv}
        onClick={handleSaveReplay}
        disabled={isSavingReplay || isReplaySaved}
        aria-busy={isSavingReplay}
      >
        <FaSave aria-hidden="true" className={styles.icon} />{' '}
        {isSavingReplay
          ? t('END_GAME.SAVING_REPLAY')
          : isReplaySaved
          ? t('END_GAME.REPLAY_SAVED')
          : t('END_GAME.SAVE_REPLAY')}
      </button>
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
