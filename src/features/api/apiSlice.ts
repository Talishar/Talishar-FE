import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';
import { RootState } from 'app/Store';
import {
  API_URL_BETA,
  API_URL_DEV,
  API_URL_LIVE,
  GAME_LIMIT_BETA,
  GAME_LIMIT_LIVE,
  URL_END_POINT
} from 'constants';

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
  if (gameId === 0) {
    baseUrl = import.meta.env.DEV ? API_URL_DEV : API_URL_LIVE;
  }
  const rawBaseQuery = fetchBaseQuery({ baseUrl, credentials: 'include' });
  return rawBaseQuery(args, webApi, extraOptions);
};

// Define our single API slice object
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getPopUpContent: builder.query({
      query: ({
        playerID = 0,
        gameID = 0,
        popupType = '',
        authKey = '',
        index = 0
      }) => {
        return {
          url: 'GetPopupAPI.php',
          method: 'GET',
          params: {
            gameName: gameID,
            playerID: playerID,
            authKey: authKey,
            popupType: popupType,
            index: index
          }
        };
      }
    }),
    submitChat: builder.mutation({
      query: ({
        gameID = 0,
        playerID = 0,
        chatText = '',
        authKey = '',
        ...rest
      }) => {
        return {
          url: 'SubmitChat.php',
          method: 'GET',
          params: {
            gameName: gameID,
            playerID: playerID,
            authKey: authKey,
            chatText: chatText
          }
        };
      }
    }),
    getGameList: builder.query({
      query: () => {
        return {
          url: import.meta.env.DEV
            ? `http://127.0.0.1:5173/api/live/${URL_END_POINT.GET_GAME_LIST}`
            : API_URL_LIVE + URL_END_POINT.GET_GAME_LIST,
          method: 'GET',
          credentials: 'omit',
          params: {}
        };
      }
    }),
    createGame: builder.mutation({
      query: ({ ...body }) => {
        return {
          url: 'API.php',
          method: 'POST',
          body: body
        };
      }
    })
  })
});

// Export the auto-generated hook for the `getPosts` query endpoint
export const {
  useGetPopUpContentQuery,
  useSubmitChatMutation,
  useGetGameListQuery
} = apiSlice;
