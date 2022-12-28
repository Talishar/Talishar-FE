import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/Store';
import {
  API_URL_BETA,
  API_URL_DEV,
  API_URL_LIVE,
  GAME_LIMIT_BETA,
  GAME_LIMIT_LIVE
} from '../../constants';

// Different request URLs depending on the gameID number, beta, live or dev.
const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, webApi, extraOptions) => {
  let baseUrl = API_URL_DEV;
  const gameId = (webApi.getState() as RootState).game.gameInfo.gameID;
  if (gameId > GAME_LIMIT_BETA) {
    baseUrl = API_URL_BETA;
  }
  if (gameId > GAME_LIMIT_LIVE) {
    baseUrl = API_URL_LIVE;
  }
  const rawBaseQuery = fetchBaseQuery({ baseUrl });
  return rawBaseQuery(args, webApi, extraOptions);
};

// Define our single API slice object
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getPopUpContent: builder.query({
      query: ({ playerNo = 0, gameName = 0, popupType = '', authKey = '' }) => {
        return {
          url: 'GetPopupAPI.php',
          method: 'GET',
          params: {
            gameName: gameName,
            playerID: playerNo,
            authKey: authKey,
            popupType: popupType
          }
        };
      }
    })
  })
});

// Export the auto-generated hook for the `getPosts` query endpoint
export const { useGetPopUpContentQuery } = apiSlice;
