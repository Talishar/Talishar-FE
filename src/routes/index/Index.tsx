import { useAppDispatch } from 'app/Hooks';
import { setGameStart } from 'features/game/GameSlice';
import React, { useEffect } from 'react';
import {
  createSearchParams,
  redirect,
  useNavigate,
  useSearchParams
} from 'react-router-dom';
import CreateGame from './components/createGame/CreateGame';
import GameList from './components/gameList/GameList';
import styles from './Index.module.css';

const Index = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!!params.get('gameName')) {
      navigate({
        pathname: '/game/play',
        search: `?${createSearchParams({
          gameName: params.get('gameName') ?? '',
          playerID: params.get('playerID') ?? '3'
        })}`
      });
    }
    dispatch(setGameStart({ playerID: 0, gameID: 0, authKey: '' }));
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
        <div>
          <h1>News</h1>
          <h1>BETA CLIENT BETA CLIENT BETA CLIENT BETA CLIENT</h1>
          <h1>
            THE FORMS AND SITE DO NOT WORK{' '}
            <a href="https://talishar.net/">GO TO THE REGULAR SITE</a> IF YOU
            WANT TO ACTUALLY PLAY
          </h1>
          <h3>Big changes to matchmaking!</h3>
          <h4>Login is now required for matchmaking</h4>
          <p>
            If logged out, you can still make private games to play with
            friends, against yourself in multiple tabs, or against the bot!
            We've also added Clash as a supported format.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Index;
