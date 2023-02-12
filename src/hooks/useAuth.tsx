import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  selectCurrentUser,
  selectCurrentUserName,
  setCredentialsReducer,
  logOutReducer
} from 'features/auth/authSlice';

export default function useAuth() {
  const currentUserId = useAppSelector(selectCurrentUser);
  const currentUserName = useAppSelector(selectCurrentUserName);
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

  const logOut = () => {
    dispatch(logOutReducer());
  };

  return {
    isLoggedIn,
    currentUserId,
    currentUserName,
    setLoggedIn,
    logOut
  };
}
