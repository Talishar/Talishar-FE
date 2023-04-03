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
            <h2>Apologies for the recent downtime</h2>
          </hgroup>
            <p>we will investigate what caused it</p>
            <p>
              If there are any
              issues please report them at the socials linked below:
            </p>
            <p>Talishar ks looking for contributors!
              If you would like to comtribute to the open source
              flesh and blood community, drop us a message on discord, or on our github.</p>
          <p>Please join our community:</p>
          <ul>
            <li>
              <a href="https://discord.gg/JykuRkdd5S" target="_blank">
                Discord
              </a>
            </li>
            <li>
              <a href="https://twitter.com/talishar_online" target="_blank">
                Twitter
              </a>
            </li>
          </ul>
        </article>
      </div>
    </main>
  );
};

export default Index;
