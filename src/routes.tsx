import {
  createBrowserRouter,
  createRoutesFromElements,
  createSearchParams,
  Navigate,
  Outlet,
  Route
} from 'react-router-dom';
import Index from './routes/index/Index';
import { ErrorPage } from 'errorPage';
import Play from 'routes/game/play/Play';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { ForgottenPasswordForm, LoginForm, LoginPage } from 'routes/user/login';
import { DecksPage, ProfilePage } from 'routes/user';
import JoinGame from 'routes/game/join/Join';
import Lobby from 'routes/game/lobby/Lobby';

const PlayGuard = ({ children }: { children: JSX.Element }) => {
  const [searchParams] = useKnownSearchParams();

  if (searchParams.gameName == null || searchParams.playerID == null) {
    return (
      <Navigate
        to={{
          pathname: '/',
          search: createSearchParams(searchParams).toString()
        }}
        state={{ from: location }}
      />
    );
  }

  return children;
};

const IndexGuard = ({ children }: { children: JSX.Element }) => {
  const [searchParams] = useKnownSearchParams();

  if (searchParams.gameName != null && searchParams.playerID != null) {
    return (
      <Navigate
        to={{
          pathname: '/game/play',
          search: createSearchParams(searchParams).toString()
        }}
        state={{ from: location }}
      />
    );
  }

  return children;
};

const LoggedInGuard = ({
  children,
  shouldBeLoggedIn
}: {
  children: JSX.Element;
  shouldBeLoggedIn: boolean;
}) => {
  // Todo: check for login status
  const isLoggedIn = true;

  if (isLoggedIn === !shouldBeLoggedIn) {
    return (
      <Navigate
        to={{
          pathname: '/'
        }}
        state={{ from: location }}
      />
    );
  }

  return children;
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route
        index
        element={
          <IndexGuard>
            <Index />
          </IndexGuard>
        }
        errorElement={<ErrorPage />}
      />
      <Route
        path="game/play/:gameName"
        element={
          <PlayGuard>
            <Play />
          </PlayGuard>
        }
      />
      <Route path="game/join/:gameName" element={<JoinGame />} />
      <Route path="game/lobby/:gameName" element={<Lobby />} />
      <Route path="user">
        <Route index element={<Navigate to={'./profile'} />} />
        <Route
          path="profile"
          element={
            <LoggedInGuard shouldBeLoggedIn={true}>
              <ProfilePage />
            </LoggedInGuard>
          }
        />
        <Route
          path="decks"
          element={
            <LoggedInGuard shouldBeLoggedIn={true}>
              <DecksPage />
            </LoggedInGuard>
          }
        />
        <Route
          path="login"
          element={
            <LoggedInGuard shouldBeLoggedIn={false}>
              <LoginPage />
            </LoggedInGuard>
          }
        >
          <Route index element={<LoginForm />} />
          <Route path="password-recovery" element={<ForgottenPasswordForm />} />
        </Route>
      </Route>
    </Route>
  )
);
