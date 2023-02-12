import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  useLoginWithCookieMutation,
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
  const [logOutAPI, logOutData] = useLogOutMutation();
  const [autoLogIn, autoLogInData] = useLoginWithCookieMutation();
  const dispatch = useAppDispatch();
  const isLoggedIn = currentUserId !== null;

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

  useEffect(() => {
    const auto = async () => {
      try {
        const response = await autoLogIn({}).unwrap();
        if (response.isUserLoggedIn) {
          setLoggedIn(
            response.loggedInUserID ?? '0',
            response.loggedInUserName ?? '',
            ''
          );
        } else {
          dispatch(logOutReducer());
        }
      } catch (err) {
        console.warn(err);
      }
    };

    auto();
  }, []);

  return {
    isLoggedIn,
    currentUserId,
    currentUserName,
    setLoggedIn,
    logOut
  };
}
