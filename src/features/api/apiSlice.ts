import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';
import { isRejected, isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';
import { RootState } from 'app/Store';
import {
  API_URL_BETA,
  API_URL_DEV,
  API_URL_LIVE,
  GAME_LIMIT_BETA,
  GAME_LIMIT_LIVE,
  URL_END_POINT
} from 'constants';
import {
  CreateGameAPI,
  CreateGameResponse
} from 'interface/API/CreateGame.php';
import { toast } from 'react-hot-toast';
import { JoinGameAPI, JoinGameResponse } from 'interface/API/JoinGame.php';
import {
  GetLobbyInfo,
  GetLobbyInfoResponse
} from 'interface/API/GetLobbyInfo.php';
import { ChooseFirstPlayer } from 'interface/API/ChooseFirstPlayer.php';
import { SubmitSideboardAPI } from 'interface/API/SubmitSideboard.php';
import { GetFavoriteDecksResponse } from 'interface/API/GetFavoriteDecks.php';

// catch warnings and show a toast if we get one.
export const rtkQueryErrorToaster: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      console.warn('Rejected action:', action);
      toast.error(
        `Error: ${action.payload} - ${
          action.error?.message ?? 'an error happened'
        }`
      );
    }
    return next(action);
  };

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
    login: builder.mutation({
      query: (body) => {
        return {
          url: URL_END_POINT.LOGIN,
          method: 'POST',
          body: { ...body, submit: true }
        };
      }
    }),
    loginWithCookie: builder.query({
      query: (body) => {
        return {
          url: URL_END_POINT.LOGIN_WITH_COOKIE,
          method: 'POST',
          body: {}
        };
      }
    }),
    logOut: builder.mutation({
      query: (body) => {
        return {
          url: URL_END_POINT.LOGOUT,
          method: 'POST',
          body: {}
        };
      }
    }),
    signUp: builder.mutation({
      query: (body) => {
        return {
          url: URL_END_POINT.SIGNUP,
          method: 'POST',
          body: { ...body, submit: true }
        };
      }
    }),
    forgottenPassword: builder.mutation({
      query: (body) => {
        return {
          url: URL_END_POINT.FORGOT_PASSWORD,
          method: 'POST',
          body: { ...body }
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
    getFavoriteDecks: builder.query({
      query: () => {
        return {
          url: URL_END_POINT.GET_FAVORITE_DECKS
        };
      },
      transformResponse: (response: GetFavoriteDecksResponse, metra, arg) => {
        return response;
      }
    }),
    createGame: builder.mutation({
      query: ({ ...body }: CreateGameAPI) => {
        return {
          url: URL_END_POINT.CREATE_GAME,
          method: 'POST',
          body: body
        };
      },
      // Pick out data and prevent nested properties in a hook or selector
      transformResponse: (response: CreateGameResponse, meta, arg) => {
        return response;
      },
      // Pick out errors and prevent nested properties in a hook or selector
      transformErrorResponse: (
        response: { status: string | number },
        meta,
        arg
      ) => response.status
    }),
    joinGame: builder.mutation({
      query: ({ ...body }: JoinGameAPI) => {
        return {
          url: URL_END_POINT.JOIN_GAME,
          method: 'POST',
          body: body
        };
      },
      // Pick out data and prevent nested properties in a hook or selector
      transformResponse: (response: JoinGameResponse, meta, arg) => {
        return response;
      },
      // Pick out errors and prevent nested properties in a hook or selector
      transformErrorResponse: (
        response: { status: string | number },
        meta,
        arg
      ) => response.status
    }),
    getLobbyInfo: builder.query({
      query: ({ ...body }: GetLobbyInfo) => {
        return {
          url: URL_END_POINT.GET_LOBBY_INFO,
          method: 'POST',
          body: body
        };
      },
      transformResponse: (response: GetLobbyInfoResponse, meta, arg) => {
        return response;
      }
    }),
    chooseFirstPlayer: builder.mutation({
      query: ({ ...body }: ChooseFirstPlayer) => {
        return {
          url: URL_END_POINT.CHOOSE_FIRST_PLAYER,
          method: 'POST',
          body: body
        };
      }
    }),
    getAllCards: builder.query({
      query: ({}) => {
        return {
          url: "http://localhost:5173/json/card.json",
          method: 'GET'
        };
      }
    }),
    submitSideboard: builder.mutation({
      query: ({ ...body }: SubmitSideboardAPI) => {
        return {
          url: URL_END_POINT.SUBMIT_SIDEBOARD,
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
  useGetGameListQuery,
  useGetFavoriteDecksQuery,
  useLoginMutation,
  useLoginWithCookieQuery,
  useLogOutMutation,
  useSignUpMutation,
  useForgottenPasswordMutation,
  useCreateGameMutation,
  useJoinGameMutation,
  useGetLobbyInfoQuery,
  useGetAllCardsQuery,
  useChooseFirstPlayerMutation,
  useSubmitSideboardMutation
} = apiSlice;
