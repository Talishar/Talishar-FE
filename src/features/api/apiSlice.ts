import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';
import { BACKEND_URL, ROGUELIKE_URL, URL_END_POINT } from 'appConstants';
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
import { SubmitLobbyInput } from 'interface/API/SubmitLobbyInput.php';
import { ChooseFirstPlayer } from 'interface/API/ChooseFirstPlayer.php';
import { SubmitSideboardAPI } from 'interface/API/SubmitSideboard.php';
import { GetFavoriteDecksResponse } from 'interface/API/GetFavoriteDecks.php';
import { GameListResponse } from 'routes/index/components/gameList/GameList';
import { GetCosmeticsResponse } from 'interface/API/GetCosmeticsResponse.php';
import {
  DeleteDeckAPIRequest,
  DeleteDeckAPIResponse
} from 'interface/API/DeleteDeckAPI.php';
import { PatreonLoginResponse } from 'routes/user/profile/linkpatreon/linkPatreon';
import { UserProfileAPIResponse } from 'interface/API/UserProfileAPI.php';
import { SubmitChatAPI } from 'interface/API/SubmitChat.php';
import {
  ModPageDataResponse,
  BanPlayerByIPRequest,
  BanPlayerByNameRequest,
  CloseGameRequest
} from 'interface/API/ModPageAPI';
import { FriendListAPIResponse } from 'interface/API/FriendListAPI.php';
import { getGameInfo } from '../game/GameSlice';
import { RootState } from '../../app/Store';

// catch warnings and show a toast if we get one.
export const rtkQueryErrorToaster: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      //console.warn('Rejected action:', action);
      const errorMessage = action.error?.message ?? 'an error happened';
      const errorStatus = (action.payload as any)?.status ?? 0;
      //console.log('errorStatus:', errorStatus);
      //console.log('errorMessage:', errorMessage);
      //console.log('action.payload:', action.payload);
      //console.log('action.error:', action.error);
      toast.error(
        `A network error happened, please try again. Error:\n${errorStatus}\n${errorMessage}`
      );
    }
    return next(action);
  };

export const parseResponse = async (response: any) => {
  const data = await response.text();
  let stringData = data.toString().trim() as string;
  if (stringData.length === 0) {
    return {};
  }
  const indexOfBraces = stringData.indexOf('{');
  if (indexOfBraces !== 0 && stringData.length > 0) {
    let errorString;
    if (indexOfBraces === -1) {
      errorString = data;
    } else {
      errorString = stringData.substring(0, indexOfBraces);
    }
    console.warn(`BE Response:`, errorString);
    toast.error(`BE Response:\n${errorString}`);
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
  const { isRoguelike } = getGameInfo(webApi.getState() as RootState);
  const baseUrl = isRoguelike ? ROGUELIKE_URL : BACKEND_URL;
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
    submitChat: builder.mutation<SubmitChatAPI, any>({
      query: ({
        gameID = 0,
        playerID = 0,
        chatText = '',
        authKey = '',
        quickChat,
        ...rest
      }) => {
        return {
          url: 'SubmitChat.php',
          method: 'GET',
          params: {
            gameName: gameID,
            playerID: playerID,
            authKey: authKey,
            chatText: chatText,
            quickChat: quickChat
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
    getUserProfile: builder.query<UserProfileAPIResponse, undefined>({
      query: () => {
        return {
          url: URL_END_POINT.USER_PROFILE,
          method: 'GET',
          responseHandler: parseResponse
        };
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
    submitLobbyInput: builder.mutation({
      query: ({ ...body }: SubmitLobbyInput) => {
        return {
          url: URL_END_POINT.SUBMIT_LOBBY_INPUT,
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
    }),
    loadDebugGame: builder.mutation({
      query: ({ ...body }: any) => {
        return {
          url: URL_END_POINT.LOAD_BUG_REPORT,
          method: 'POST',
          body: body,
          responseHandler: parseResponse
        };
      }
    }),
    submitPatreonLogin: builder.mutation<
      PatreonLoginResponse,
      {
        code: string;
        redirect_uri: string;
      }
    >({
      query: ({ code, redirect_uri }) => {
        return {
          url: URL_END_POINT.PATREON_LOGIN,
          method: 'GET',
          params: {
            code: code,
            redirect_uri: redirect_uri
          },
          responseHandler: parseResponse
        };
      }
    }),
    getModPageData: builder.query<ModPageDataResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.GET_MOD_PAGE_DATA,
          method: 'GET',
          responseHandler: parseResponse
        };
      }
    }),
    banPlayerByIP: builder.mutation<any, BanPlayerByIPRequest>({
      query: ({ ipToBan, playerNumberToBan }) => {
        return {
          url: URL_END_POINT.BAN_PLAYER,
          method: 'GET',
          params: {
            ipToBan: ipToBan,
            playerNumberToBan: playerNumberToBan
          },
          responseHandler: parseResponse
        };
      }
    }),
    banPlayerByName: builder.mutation<any, BanPlayerByNameRequest>({
      query: ({ playerToBan }) => {
        return {
          url: URL_END_POINT.BAN_PLAYER,
          method: 'GET',
          params: {
            playerToBan: playerToBan
          },
          responseHandler: parseResponse
        };
      }
    }),
    closeGame: builder.mutation<any, CloseGameRequest>({
      query: ({ gameToClose }) => {
        return {
          url: URL_END_POINT.CLOSE_GAME,
          method: 'GET',
          params: {
            gameToClose: gameToClose
          },
          responseHandler: parseResponse
        };
      }
    }),
    getFriendsList: builder.query<FriendListAPIResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'getFriends' },
          responseHandler: parseResponse
        };
      }
    }),
    addFriend: builder.mutation<FriendListAPIResponse, { friendUsername: string }>({
      query: ({ friendUsername }) => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'addFriend', friendUsername: friendUsername },
          responseHandler: parseResponse
        };
      }
    }),
    removeFriend: builder.mutation<FriendListAPIResponse, { friendUserId: number }>({
      query: ({ friendUserId }) => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'removeFriend', friendUserId: friendUserId },
          responseHandler: parseResponse
        };
      }
    }),
    searchUsers: builder.query<FriendListAPIResponse, { searchTerm: string; limit?: number }>({
      query: ({ searchTerm, limit = 10 }) => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'searchUsers', searchTerm: searchTerm, limit: limit },
          responseHandler: parseResponse
        };
      }
    }),
    getPendingRequests: builder.query<FriendListAPIResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'getPendingRequests' },
          responseHandler: parseResponse
        };
      }
    }),
    acceptRequest: builder.mutation<FriendListAPIResponse, { requesterUserId: number }>({
      query: ({ requesterUserId }) => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'acceptRequest', requesterUserId: requesterUserId },
          responseHandler: parseResponse
        };
      }
    }),
    rejectRequest: builder.mutation<FriendListAPIResponse, { requesterUserId: number }>({
      query: ({ requesterUserId }) => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'rejectRequest', requesterUserId: requesterUserId },
          responseHandler: parseResponse
        };
      }
    }),
    getSentRequests: builder.query<FriendListAPIResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'getSentRequests' },
          responseHandler: parseResponse
        };
      }
    }),
    cancelRequest: builder.mutation<FriendListAPIResponse, { recipientUserId: number }>({
      query: ({ recipientUserId }) => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'cancelRequest', recipientUserId: recipientUserId },
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
  useSubmitSideboardMutation,
  useSubmitPatreonLoginMutation,
  useLoadDebugGameMutation,
  useGetUserProfileQuery,
  useSubmitLobbyInputMutation,
  useGetModPageDataQuery,
  useBanPlayerByIPMutation,
  useBanPlayerByNameMutation,
  useCloseGameMutation,
  useGetFriendsListQuery,
  useAddFriendMutation,
  useRemoveFriendMutation,
  useSearchUsersQuery,
  useGetPendingRequestsQuery,
  useAcceptRequestMutation,
  useRejectRequestMutation,
  useGetSentRequestsQuery,
  useCancelRequestMutation
} = apiSlice;
