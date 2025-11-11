import { useAppDispatch } from 'app/Hooks';
import { clearGameInfo } from 'features/game/GameSlice';
import { useEffect } from 'react';
import CreateGame from '../game/create/CreateGame';
import GameList from './components/gameList';
import styles from './Index.module.css';
import TalisharLogo from '../../img/TalisharLogo.webp';
import News from 'routes/news';
import DevTool from './components/devTool';
import AboutSection from './components/AboutSection';
import CommunityContent from './components/CommunityContent';

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
        <article className={styles.newsContainer}>
          <img src={TalisharLogo} className={styles.logo} alt="Talishar Logo" />
          <News />
        </article>
      </div>
      <CommunityContent />
      <AboutSection />
    </main>
  );
};

export default Index;
