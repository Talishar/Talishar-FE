import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  useGetFavoriteDecksQuery,
  useLoginWithCookieQuery,
  useLogOutMutation
} from 'features/api/apiSlice';
import {
  selectCurrentUser,
  selectCurrentUserName,
  setCredentialsReducer,
  logOutReducer
} from 'features/auth/authSlice';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function useAuth() {
  const currentUserId = useAppSelector(selectCurrentUser);
  const currentUserName = useAppSelector(selectCurrentUserName);
  const { refetch } = useGetFavoriteDecksQuery(undefined);
  const [logOutAPI, logOutData] = useLogOutMutation();
  const { isLoading, error, data } = useLoginWithCookieQuery({});
  const dispatch = useAppDispatch();

  const setLoggedIn = (user: string, userName: string, token: string) => {
    dispatch(
      setCredentialsReducer({
        user: user,
        userName: userName,
        accessToken: token
      })
    );
  };

  const logOut = async () => {
    try {
      await logOutAPI({}).unwrap();
      dispatch(logOutReducer());
      toast.success('logged out', { position: 'top-center' });
    } catch (err) {
      console.warn(err);
      toast.error('error logging out', { position: 'top-center' });
    }
  };
  const isLoggedIn = !!currentUserId;

  useEffect(() => {
    if (data?.isUserLoggedIn) {
      setLoggedIn(data.loggedInUserID, data.loggedInUserName, '');
      refetch();
    }
  }, [isLoading]);

  return {
    isLoggedIn,
    currentUserId,
    currentUserName,
    isLoading,
    error,
    setLoggedIn,
    logOut
  };
}
