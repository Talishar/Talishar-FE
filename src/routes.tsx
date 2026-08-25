import {
  createBrowserRouter,
  createRoutesFromElements,
  createSearchParams,
  Navigate,
  Outlet,
  Route
} from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { ErrorPage } from 'errorPage';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { useTranslation } from 'react-i18next';
import useAuth from 'hooks/useAuth';
import LoadingScreen from 'components/LoadingScreen/LoadingScreen';

const Header = lazy(() => import('components/header/Header'));
const Index = lazy(() => import('./routes/index/Index'));
const Play = lazy(() => import('routes/game/play/Play'));
const JoinGame = lazy(() => import('routes/game/join/Join'));
const Lobby = lazy(() => import('routes/game/lobby/Lobby'));
const CreateGame = lazy(() => import('routes/game/create/CreateGame'));
const LoadReplay = lazy(() => import('routes/game/load/LoadReplay'));
const SharedReplay = lazy(() => import('routes/game/shared/SharedReplay'));
const SettingsPage = lazy(() => import('routes/user/settings'));
const Privacy = lazy(() => import('routes/privacy'));
const LinkPatreon = lazy(() => import('routes/user/profile/linkpatreon'));
const LinkMetafy = lazy(
  () => import('routes/user/profile/linkmetafy/linkMetafy')
);
const ModPage = lazy(() => import('routes/mod/ModPage'));
const PrivacyPolicy = lazy(() => import('routes/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('routes/legal/TermsOfService'));
const AuthVerify = lazy(() => import('routes/auth/verify'));
const MetafySignup = lazy(() => import('routes/auth/MetafySignup'));
const AdsTest = lazy(() => import('routes/ads/AdsTest'));
const Learn = lazy(() => import('routes/learn/Learn'));
const About = lazy(() => import('routes/about/About'));
const Premium = lazy(() => import('routes/premium/Premium'));
const Mastery = lazy(() => import('routes/mastery/Mastery'));
const LoginPage = lazy(() =>
  import('routes/user/login').then((module) => ({ default: module.LoginPage }))
);
const LoginForm = lazy(() =>
  import('routes/user/login').then((module) => ({ default: module.LoginForm }))
);
const ForgottenPasswordForm = lazy(() =>
  import('routes/user/login').then((module) => ({
    default: module.ForgottenPasswordForm
  }))
);
const ResetPasswordForm = lazy(() =>
  import('routes/user/login').then((module) => ({
    default: module.ResetPasswordForm
  }))
);
const SignUpForm = lazy(() =>
  import('routes/user/login/components/SignUpForm').then((module) => ({
    default: module.SignUpForm
  }))
);
const DecksPage = lazy(() =>
  import('routes/user').then((module) => ({ default: module.DecksPage }))
);
const ProfilePage = lazy(() =>
  import('routes/user').then((module) => ({ default: module.ProfilePage }))
);

const RouteFallback = () => {
  const { t } = useTranslation();

  return <LoadingScreen message={t('BASE.LOADING')} />;
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
  const { isLoggedIn, isLoading, error } = useAuth();
  const { t } = useTranslation();

  // Don't redirect while loading auth status on page refresh
  if (isLoading) {
    return (
      <LoadingScreen
        message={t('AUTH.LOADING')}
        detail={error ? t('AUTH.LOADING_ERROR') : undefined}
      />
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
  const { isLoggedIn, isMod, isLoading, error } = useAuth();
  const { t } = useTranslation();

  // Don't redirect while loading auth status on page refresh
  if (isLoading) {
    return (
      <LoadingScreen
        message={t('AUTH.LOADING')}
        detail={error ? t('AUTH.LOADING_ERROR') : undefined}
      />
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
    <Route
      errorElement={<ErrorPage />}
      element={
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      }
    >
      <Route element={<Outlet />}>
        <Route
          path="game/play/:gameID"
          element={<Play isRoguelike={false} />}
        />
        <Route path="roguelike/play/" element={<Play isRoguelike={true} />} />
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
          <Route path="learn" element={<Learn />} />
          <Route path="about" element={<About />} />
          <Route path="premium" element={<Premium />} />
          <Route
            path="mastery"
            element={
              <LoggedInGuard shouldBeLoggedIn={true}>
                <Mastery />
              </LoggedInGuard>
            }
          />
          <Route path="game/join/:gameID" element={<JoinGame />} />
          <Route path="game/create" element={<CreateGame />} />
          <Route path="game/load" element={<LoadReplay />} />
          <Route path="replay/shared" element={<SharedReplay />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="auth/verify" element={<AuthVerify />} />
          <Route path="auth/metafy-signup" element={<MetafySignup />} />
          <Route path="ads-test" element={<AdsTest />} />
          <Route
            path="mod"
            element={
              <ModGuard>
                <ModPage />
              </ModGuard>
            }
          />
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
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);
