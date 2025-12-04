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
import {
  ForgottenPasswordForm,
  LoginForm,
  LoginPage,
  ResetPasswordForm
} from 'routes/user/login';
import { DecksPage, ProfilePage } from 'routes/user';
import SettingsPage from 'routes/user/settings';
import JoinGame from 'routes/game/join/Join';
import Lobby from 'routes/game/lobby/Lobby';
import { SignUpForm } from 'routes/user/login/components/SignUpForm';
import useAuth from 'hooks/useAuth';
import Header from 'components/header/Header';
import Privacy from 'routes/privacy';
import CreateGame from 'routes/game/create/CreateGame';
import LoadReplay from 'routes/game/load/LoadReplay';
import LinkPatreon from 'routes/user/profile/linkpatreon';
import LinkMetafy from 'routes/user/profile/linkmetafy/linkMetafy';
import ModPage from 'routes/mod/ModPage';
import PrivacyPolicy from 'routes/legal/PrivacyPolicy';
import TermsOfService from 'routes/legal/TermsOfService';

const PlayGuard = ({ children }: { children: JSX.Element }) => {
  const [searchParams] = useKnownSearchParams();

  if (searchParams.gameName == null || searchParams.playerID == null) {
    return (
      <Navigate
        to={{
          pathname: '/',
          search: createSearchParams(searchParams).toString()
        }}
        replace={true}
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
        replace={true}
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
  const { isLoggedIn, isLoading } = useAuth();

  // Don't redirect while loading auth status on page refresh
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Loading authentication...
      </div>
    );
  }

  if (isLoggedIn === !shouldBeLoggedIn) {
    return (
      <Navigate
        to={{
          pathname: '/'
        }}
        replace={true}
      />
    );
  }

  return children;
};

const ModGuard = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, isMod, isLoading } = useAuth();

  // Don't redirect while loading auth status on page refresh
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Loading authentication...
      </div>
    );
  }

  if (!isLoggedIn || !isMod) {
    return (
      <Navigate
        to={{
          pathname: '/'
        }}
        replace={true}
      />
    );
  }

  return children;
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorPage />}>
      <Route
        element={
          <Outlet />
        }
      >
        <Route
          path="game/play/:gameID"
          element={
            // disabled playguard as we need to redo this logic a bit
            // <PlayGuard>
            <Play isRoguelike={false} />
            // </PlayGuard>
          }
        />
      <Route
        path="roguelike/play/"
        element={
          // disabled playguard as we need to redo this logic a bit
          // <PlayGuard>
          <Play isRoguelike={true} />
          // </PlayGuard>
        }
      />
      <Route path="game/play" element={<Play isRoguelike={false} />} />
      <Route path="game/lobby/:gameID" element={<Lobby />} />
      <Route
        path="game/MainMenu.php"
        element={<Navigate to="/" replace={true} />}
      />
      <Route element={<Header />}>
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
        </Route>
        <Route path="game/join/:gameID" element={<JoinGame />} />
        <Route path="game/create" element={<CreateGame />} />
        <Route path="game/load" element={<LoadReplay />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route path="mod" element={<ModGuard><ModPage /></ModGuard>} />
        <Route path="user">
          <Route index element={<Navigate to={'./profile'} />} />
          <Route path="profile/linkpatreon" element={<LinkPatreon />} />
          <Route path="profile/linkmetafy" element={<LinkMetafy />} />
          <Route
            path="profile"
            element={
              <LoggedInGuard shouldBeLoggedIn={true}>
                <ProfilePage />
              </LoggedInGuard>
            }
          />
          <Route
            path="settings"
            element={
              <LoggedInGuard shouldBeLoggedIn={true}>
                <SettingsPage />
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
            <Route
              path="password-recovery"
              element={<ForgottenPasswordForm />}
            />
            <Route path="reset-password" element={<ResetPasswordForm />} />
            <Route path="signup" element={<SignUpForm />} />
          </Route>
        </Route>
      </Route>
      </Route>
    </Route>
  )
);
