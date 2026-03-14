import { useAppDispatch } from 'app/Hooks';
import { clearGameInfo } from 'features/game/GameSlice';
import { useEffect } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import GameList from './components/gameList';
import styles from './Index.module.css';
import TalisharLogo from '../../img/TalisharLogo.webp';
import News from 'routes/news';
import DevTool from './components/devTool';
import AboutSection from './components/AboutSection';
import CommunityContent from './components/CommunityContent';
import { QuickJoinProvider } from './components/quickJoin/QuickJoinContext';
import UnifiedGamePanel from './components/UnifiedGamePanel';
import { useGetSystemMessageQuery } from 'features/api/apiSlice';
import SystemMessageModal from 'components/SystemMessageModal/SystemMessageModal';
import useAuth from 'hooks/useAuth';

const Index = () => {
  usePageTitle('Home');
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAuth();
  const { data: systemMessageData } = useGetSystemMessageQuery(undefined, {
    skip: !isLoggedIn
  });

  useEffect(() => {
    dispatch(clearGameInfo());

    let link = document.getElementById('favicon') as HTMLLinkElement;
    if (link) {
      link.href = '/favicon.ico';
    }
  }, []);

  return (
    <main>
      <QuickJoinProvider>
        <div className={styles.grid}>
          {import.meta.env.DEV && <DevTool />}
          <div className={styles.gameListContainer}>
            <GameList />
          </div>
          <div className={styles.createGameContainer}>
            <UnifiedGamePanel />
          </div>
          <article className={styles.newsContainer}>
            <img src={TalisharLogo} className={styles.logo} />
            <News />
          </article>
        </div>
      </QuickJoinProvider>
      <CommunityContent />
      <AboutSection />
      {systemMessageData?.systemMessage && (
        <SystemMessageModal message={systemMessageData.systemMessage} />
      )}
    </main>
  );
};

export default Index;
