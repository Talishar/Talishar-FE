import { useAppDispatch } from 'app/Hooks';
import { clearGameInfo, setGameStart } from 'features/game/GameSlice';
import { useEffect } from 'react';
import CreateGame from '../game/create/CreateGame';
import GameList from './components/gameList/GameList';
import styles from './Index.module.css';
import TalisharLogo from '../../img/TalisharLogo.webp';

const Index = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearGameInfo());
  }, []);

  return (
    <main>
      <div className="grid">
        <div className={styles.firstCol}>
          <GameList />
        </div>
        <div>
          <CreateGame />
        </div>
        <article className={styles.news}>
          <img src={TalisharLogo} className={styles.logo} />
          <hgroup>
            <h1>News</h1>
            <h2>THIS IS A BETA AND THINGS ARE UNRELIABLE</h2>
            <h3>
              <a href="https://talishar.net/">GO TO THE REGULAR SITE</a> IF YOU
              WANT TO PLAY PROPERLY
            </h3>
            <h4>Big changes to matchmaking!</h4>
            <h5>Login is now required for matchmaking</h5>
          </hgroup>
          <p>
            If logged out, you can still make private games to play with
            friends, against yourself in multiple tabs, or against the bot!
            We've also added Clash as a supported format.
          </p>
        </article>
      </div>
    </main>
  );
};

export default Index;
