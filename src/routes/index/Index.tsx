import { useAppDispatch } from 'app/Hooks';
import { clearGameInfo } from 'features/game/GameSlice';
import { useEffect } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import CreateGame from '../game/create/CreateGame';
import GameList from './components/gameList';
import styles from './Index.module.css';
import TalisharLogo from '../../img/TalisharLogo.webp';
import News from 'routes/news';
import DevTool from './components/devTool';
import AboutSection from './components/AboutSection';
import CommunityContent from './components/CommunityContent';
import { QuickJoinProvider } from './components/quickJoin/QuickJoinContext';
import QuickJoinPanel from './components/quickJoin/QuickJoinPanel';

const Index = () => {
  usePageTitle('Home');
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
      <CommunityContent />
      <QuickJoinProvider>
        <div className={styles.grid}>
          {import.meta.env.DEV && <DevTool />}
          <div className={styles.gameListContainer}>
            <GameList />
          </div>
          <div className={styles.createGameContainer}>
            <QuickJoinPanel />
            <CreateGame />
          </div>
          <article className={styles.newsContainer}>
            <img src={TalisharLogo} className={styles.logo} />
            <News />
          </article>
        </div>
      </QuickJoinProvider>
      <AboutSection />
    </main>
  );
};

export default Index;
