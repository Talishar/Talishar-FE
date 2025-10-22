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
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

// List of mod usernames - should match backend list
const MOD_USERNAMES = [
  'OotTheMonk',
  'Launch',
  'LaustinSpayce',
  'Star_Seraph',
  'bavverst',
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
  const { isLoading, error, data } = useLoginWithCookieQuery({});
  const dispatch = useAppDispatch();

  const setLoggedIn = (
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
      const userIsMod = MOD_USERNAMES.includes(data.loggedInUserName);
      setLoggedIn(
        data.loggedInUserID,
        data.loggedInUserName,
        '',
        data.isPatron,
        userIsMod
      );
      // refetch();
    }
  }, [isLoading]);

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
