import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';
import { RootState } from 'app/Store';
import {
  API_URL_BETA,
  API_URL_DEV,
  API_URL_LIVE,
  GAME_LIMIT_BETA,
  GAME_LIMIT_LIVE,
  URL_END_POINT
} from 'appConstants';
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
import { GameListResponse } from 'routes/index/components/gameList/GameList';
import { GetCosmeticsResponse } from 'interface/API/GetCosmeticsResponse.php';
import {
  DeleteDeckAPIRequest,
  DeleteDeckAPIResponse
} from 'interface/API/DeleteDeckAPI.php';

// catch warnings and show a toast if we get one.
export const rtkQueryErrorToaster: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      console.warn('Rejected action:', action);
      const errorMessage = action.error?.message ?? 'an error happened';
      const errorStatus = action.payload?.status ?? 0;
      toast.error(
        `A network error happened, please try again. Error:\n${errorStatus}\n${errorMessage}`
      );
    }
    return next(action);
  };

export const parseResponse = async (response: any) => {
  const data = await response.text();
  let stringData = data.toString().trim();
  const indexOfBraces = stringData.indexOf('{');
  if (indexOfBraces !== 0) {
    console.warn(
      `Backend PHP Warning:`,
      stringData.substring(0, indexOfBraces)
    );
    toast.error(`Backend Warning:\n${stringData.substring(0, indexOfBraces)}`);
    stringData = stringData.substring(indexOfBraces);
  }
  return JSON.parse(stringData);
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
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: 'include'
  });
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
          url: URL_END_POINT.GET_POPUP,
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
          body: { ...body, submit: true },
          responseHandler: parseResponse
        };
      }
    }),
    loginWithCookie: builder.query({
      query: (body) => {
        return {
          url: URL_END_POINT.LOGIN_WITH_COOKIE,
          method: 'POST',
          body: {},
          responseHandler: parseResponse
        };
      }
    }),
    logOut: builder.mutation({
      query: (body) => {
        return {
          url: URL_END_POINT.LOGOUT,
          method: 'POST',
          body: {},
          responseHandler: parseResponse
        };
      }
    }),
    signUp: builder.mutation({
      query: (body) => {
        return {
          url: URL_END_POINT.SIGNUP,
          method: 'POST',
          body: { ...body, submit: true },
          responseHandler: parseResponse
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
    resetPassword: builder.mutation({
      query: (body) => {
        return {
          url: URL_END_POINT.RESET_PASSWORD,
          method: 'POST',
          body: { ...body },
          responseHandler: parseResponse
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
          },
          responseHandler: parseResponse
        };
      }
    }),
    processInputAPI: builder.mutation({
      query: ({ ...body }) => {
        return {
          url: URL_END_POINT.PROCESS_INPUT_POST,
          method: 'POST',
          body: body,
          responseHandler: parseResponse
        };
      }
    }),
    getGameList: builder.query<GameListResponse, undefined>({
      query: () => {
        return {
          url: URL_END_POINT.GET_GAME_LIST,
          method: 'GET',
          responseHandler: parseResponse
        };
      }
    }),
    getCosmetics: builder.query<GetCosmeticsResponse, undefined>({
      query: () => {
        return {
          url: URL_END_POINT.GET_COSMETICS,
          responseHandler: parseResponse
        };
      }
    }),
    getFavoriteDecks: builder.query<GetFavoriteDecksResponse, undefined>({
      query: () => {
        return {
          url: URL_END_POINT.GET_FAVORITE_DECKS,
          responseHandler: parseResponse
        };
      },
      transformResponse: (response: GetFavoriteDecksResponse, metra, arg) => {
        return response;
      }
    }),
    deleteDeck: builder.mutation<DeleteDeckAPIResponse, DeleteDeckAPIRequest>({
      query: (body: DeleteDeckAPIRequest) => {
        return {
          url: URL_END_POINT.DELETE_DECK,
          method: 'post',
          body: body,
          responseHandler: parseResponse
        };
      }
    }),
    createGame: builder.mutation<CreateGameResponse, CreateGameAPI>({
      query: (body: CreateGameAPI) => {
        return {
          url: URL_END_POINT.CREATE_GAME,
          method: 'POST',
          body: body,
          responseHandler: parseResponse
        };
      },
      // Pick out errors and prevent nested properties in a hook or selector
      transformErrorResponse: (response: { status: string | number }) =>
        response.status
    }),
    joinGame: builder.mutation<JoinGameResponse, JoinGameAPI>({
      query: (body: JoinGameAPI) => {
        return {
          url: URL_END_POINT.JOIN_GAME,
          method: 'POST',
          body: body,
          responseHandler: parseResponse
        };
      },
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
          body: body,
          responseHandler: parseResponse
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
          body: body,
          responseHandler: parseResponse
        };
      }
    }),
    submitSideboard: builder.mutation({
      query: ({ ...body }: SubmitSideboardAPI) => {
        return {
          url: URL_END_POINT.SUBMIT_SIDEBOARD,
          method: 'POST',
          body: body,
          responseHandler: parseResponse
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
  useGetCosmeticsQuery,
  useGetFavoriteDecksQuery,
  useDeleteDeckMutation,
  useLoginMutation,
  useLoginWithCookieQuery,
  useLogOutMutation,
  useSignUpMutation,
  useForgottenPasswordMutation,
  useResetPasswordMutation,
  useCreateGameMutation,
  useJoinGameMutation,
  useGetLobbyInfoQuery,
  useProcessInputAPIMutation,
  useChooseFirstPlayerMutation,
  useSubmitSideboardMutation
} = apiSlice;
