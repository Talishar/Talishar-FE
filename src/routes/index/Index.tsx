import { useAppDispatch } from 'app/Hooks';
import { clearGameInfo } from 'features/game/GameSlice';
import { useEffect } from 'react';
import CreateGame from '../game/create/CreateGame';
import GameList from './components/gameList';
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
            <h2>THIS IS A BETA AND THINGS ARE (even more) UNRELIABLE</h2>
            <h3>Outsiders!</h3>
          </hgroup>
          <p>
            All spoiled cards implemented except: <br />
            Amnesia
            <br /> Burden of the Past
          </p>
        </article>
      </div>
    </main>
  );
};

export default Index;
