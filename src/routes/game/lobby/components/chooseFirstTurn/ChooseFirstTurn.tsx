import React, { ReactEventHandler } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useChooseFirstPlayerMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import styles from './ChooseFirstTurn.module.css';
import { TbHexagonNumber1, TbHexagonNumber2 } from 'react-icons/tb';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';
import { useTranslation, Trans } from 'react-i18next';

const ChooseFirstTurn = () => {
  const [chooseFirstPlayer, chooseFirstPlayerData] =
	useChooseFirstPlayerMutation();
  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();
  const { gameID, playerID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const gameLobby = useAppSelector(
    (state: RootState) => state.game.gameLobby,
    shallowEqual
  );

  const chooseFirst = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await chooseFirstPlayer({
        gameName: gameID,
        playerID: playerID,
        authKey: authKey,
        action: 'Go First'
      });
    } catch (err) {
      console.warn(err);
      toast.error(t("BASE.ERROR_ALERT"));
    }
  };

  const chooseSecond = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await chooseFirstPlayer({
        gameName: gameID,
        playerID: playerID,
        authKey: authKey,
        action: 'Go Second'
      });
    } catch (err) {
      console.warn(err);
      toast.error(t("BASE.ERROR_ALERT"));
    }
  };

  return (
    <dialog open>
      <article className={styles.container}>
        <hgroup style={{ width: '100%' }}>
          <h3>{t("GAME_LOBBY.YOU_WON_DIE")}</h3>
          {/* <h5>Their hero is {gameLobby?.theirHeroName}</h5> */}
          <h5>{t("GAME_LOBBY.FIRST_OR_SECOND")}</h5>
        </hgroup>
        <div className={styles.buttons}>
          <button
            className={styles.firstButton}
            onClick={chooseFirst}
            type="button"
          >
            <div className={styles.icon}>
              <TbHexagonNumber1 />
            </div>
	    {t("GAME_LOBBY.FIRST")}
          </button>
          <button
            className={styles.secondButton}
            onClick={chooseSecond}
            type="button"
          >
            <div className={styles.icon}>
              <TbHexagonNumber2 />
            </div>
	    {t("GAME_LOBBY.SECOND")}
          </button>
        </div>
      </article>
    </dialog>
  );
};

export default ChooseFirstTurn;
