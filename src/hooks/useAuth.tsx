import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  useGetFavoriteDecksQuery,
  useLoginWithCookieQuery,
  useLogOutMutation
} from 'features/api/apiSlice';
import {
  selectCurrentUser,
  selectCurrentUserName,
  selectIsPatron,
  selectIsMod,
  setCredentialsReducer,
  logOutReducer
} from 'features/auth/authSlice';
import { useEffect, useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

// List of mod usernames - should match backend list
const MOD_USERNAMES = [
  'OotTheMonk',
  'LaustinSpayce',
  'Tower',
  'PvtVoid',
  'Aegisworn'
];

export default function useAuth() {
  const currentUserId = useAppSelector(selectCurrentUser);
  const currentUserName = useAppSelector(selectCurrentUserName);
  const isPatron = useAppSelector(selectIsPatron);
  const isMod = useAppSelector(selectIsMod);
  // const { refetch } = useGetFavoriteDecksQuery(undefined);
  const [logOutAPI, logOutData] = useLogOutMutation();
  const { isLoading: isQueryLoading, isFetching, error, data } = useLoginWithCookieQuery({});
  const [authCheckTimedOut, setAuthCheckTimedOut] = useState(false);
  const dispatch = useAppDispatch();

  const setLoggedIn = useCallback(
    (
      user: string,
      userName: string,
      token: string,
      patron: string,
      isMod?: boolean
    ) => {
      dispatch(
        setCredentialsReducer({
          user: user,
          userName: userName,
          accessToken: token,
          isPatron: patron,
          isMod: isMod || false
        })
      );
    },
    [dispatch]
  );

  const logOut = async () => {
    try {
      await logOutAPI({}).unwrap();
      dispatch(logOutReducer());
      toast.success('Logged Out', { position: 'top-center' });
      // Force a reload to clear all app state and prevent auto-login
      setTimeout(() => {
        window.location.href = '/';
      }, 50);
    } catch (err) {
      console.warn(err);
      toast.error('Error Logging Out', { position: 'top-center' });
      // Still redirect on error to clear state
      setTimeout(() => {
        window.location.href = '/';
      }, 50);
    }
  };
  
  // Auth check is complete when we have data (even if user is not logged in) or there's an error
  // OR if the auth check has timed out (to prevent infinite loading state)
  const isLoading = !authCheckTimedOut && data === undefined && error === undefined;
  
  // isLoggedIn should be based on the query result if available, otherwise use Redux
  // This ensures we show logged-in state as soon as the query returns, before Redux is updated
  const isLoggedIn = data?.isUserLoggedIn ?? !!currentUserId;

  // Add a timeout for auth check - if it doesn't complete within 5 seconds, assume user isn't logged in
  // This prevents infinite loading state when cookies are rejected due to SameSite policy
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (data === undefined && error === undefined) {
        setAuthCheckTimedOut(true);
        console.warn('Auth check timed out after 5s - proceeding without authentication');
      }
    }, 5000);

    // Clear timeout if query completes before timeout
    if (data !== undefined || error !== undefined) {
      clearTimeout(timeoutId);
      setAuthCheckTimedOut(false);
    }

    return () => clearTimeout(timeoutId);
  }, [data, error]);

  useEffect(() => {
    // Only run when query has completed (data exists or error exists)
    if (data !== undefined) {
      if (data?.isUserLoggedIn) {
        const userIsMod = MOD_USERNAMES.includes(data.loggedInUserName);
        setLoggedIn(
          data.loggedInUserID,
          data.loggedInUserName,
          '',
          data.isPatron,
          userIsMod
        );
      } else {
        // User is not logged in, clear any stale auth state
        dispatch(logOutReducer());
      }
    }
  }, [data, setLoggedIn, dispatch]);

  return {
    isLoggedIn,
    currentUserId,
    currentUserName,
    isLoading,
    error,
    isPatron,
    isMod,
    setLoggedIn,
    logOut
  };
}
