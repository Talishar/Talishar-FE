import { useAppDispatch } from 'app/Hooks';
import { clearGameInfo } from 'features/game/GameSlice';
import { useEffect } from 'react';
import CreateGame from '../game/create/CreateGame';
import LoadReplay from '../game/load/LoadReplay';
import GameList from './components/gameList';
import styles from './Index.module.css';
import TalisharLogo from '../../img/TalisharLogo.webp';
import News from 'routes/news';
import DevTool from './components/devTool';

const Index = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearGameInfo());

    let link = document.getElementById('favicon') as HTMLLinkElement;
    if (link) {
      link.href = '/favicon.ico';
    }
  }, []);

  return (
    <main>
      <div className={styles.grid}>
        {import.meta.env.DEV && <DevTool />}
        <div className={styles.gameListContainer}>
          <GameList />
        </div>
        <div className={styles.createGameContainer}>
          <CreateGame />
        </div>
        <div className={styles.createGameContainer}>
          <LoadReplay />
        </div>
        {/* <article className={styles.newsContainer}>
          <img src={TalisharLogo} className={styles.logo} />
          <News />
        </article> */}
      </div>
    </main>
  );
};

export default Index;
