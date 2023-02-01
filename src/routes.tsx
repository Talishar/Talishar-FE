import { createBrowserRouter, createRoutesFromElements, createSearchParams, Navigate, Route } from 'react-router-dom';
import Index from './routes/index/Index';
import { ErrorPage } from 'errorPage';
import Play from 'routes/game/play/Play';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';

const PlayGuard = ({ children }: { children: JSX.Element }) => {
  const [searchParams] = useKnownSearchParams();

  if (searchParams.gameName == null || searchParams.playerID == null) {
    return <Navigate to={{
      pathname: "/",
      search: createSearchParams(searchParams).toString()
    }}
      state={{ from: location }}
    />;
  }

  return children;
}

const IndexGuard = ({ children }: { children: JSX.Element }) => {
  const [searchParams] = useKnownSearchParams();

  if (searchParams.gameName != null && searchParams.playerID != null) {
    return <Navigate to={{
      pathname: "/game/play",
      search: createSearchParams(searchParams).toString()
    }}
      state={{ from: location }}
    />;
  }

  return children;
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/'>
      <Route path='/' element={
        <IndexGuard>
          <Index />
        </IndexGuard>
      }
        errorElement={<ErrorPage />}
      />
      <Route path='game/play' element={
        <PlayGuard>
          <Play />
        </PlayGuard>
      }
      />
    </Route>
  ));