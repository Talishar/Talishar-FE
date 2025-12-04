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
import { detectVpnBlock, logVpnBlock } from 'utils/VpnDetection';
import {
  CreateGameAPI,
  CreateGameResponse
} from 'interface/API/CreateGame.php';
import {
  LoadReplayAPI,
  LoadReplayResponse
} from 'interface/API/LoadReplayAPI.php';
import { toast } from 'react-hot-toast';
import { cleanErrorText } from 'utils/cleanErrorText';
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
import {
  DeleteAccountAPIRequest,
  DeleteAccountAPIResponse
} from 'interface/API/DeleteAccountAPI.php';
import {
  AddFavoriteDeckRequest,
  AddFavoriteDeckResponse
} from 'interface/API/AddFavoriteDeck.php';
import {
  UpdateFavoriteDeckRequest,
  UpdateFavoriteDeckResponse
} from 'interface/API/UpdateFavoriteDeck.php';
import { PatreonLoginResponse } from 'routes/user/profile/linkpatreon/linkPatreon';
import { UserProfileAPIResponse } from 'interface/API/UserProfileAPI.php';
import { MetafyLoginResponse } from 'interface/API/MetafyAPI.php';
import { SubmitChatAPI } from 'interface/API/SubmitChat.php';
import {
  ModPageDataResponse,
  BanPlayerByIPRequest,
  BanPlayerByNameRequest,
  CloseGameRequest,
  DeleteUsernameRequest,
  SearchUsernamesRequest,
  SearchUsernamesResponse
} from 'interface/API/ModPageAPI';
import { FriendListAPIResponse } from 'interface/API/FriendListAPI.php';
import {
  UsernamesModerationResponse,
  BanOffensiveUsernameRequest
} from 'interface/API/UsernameModerationAPI';
import { BlockedUsersAPIResponse } from 'interface/API/BlockedUsersAPI.php';
import { PrivateMessagingAPIResponse } from 'interface/API/PrivateMessagingAPI.php';
import { getGameInfo } from '../game/GameSlice';
import { RootState } from '../../app/Store';

export interface GetLastActiveGameResponse {
  gameExists: boolean;
  gameInProgress: boolean;
  gameName?: number;
  playerID?: number;
  authKey?: string;
  opponentName?: string;
  opponentDisconnected?: boolean;
  authKeyMismatch?: boolean;
}

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
      
      // Suppress 401 Unauthorized errors - these are often benign (e.g., logging out/in quickly)
      // and not user-facing errors that need a toast notification
      if (errorStatus !== 401) {
        toast.error(
          `A network error happened, please try again. Error:\n${errorStatus}\n${errorMessage}`
        );
      }
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
    const cleanedError = cleanErrorText(errorString);
    console.warn(`BE Response:`, cleanedError);
    toast.error(`BE Response:\n${cleanedError}`);
    stringData = stringData.substring(indexOfBraces);
  }
  
  // Only try to parse if we have valid JSON-like content
  if (stringData.length === 0 || stringData === '{}' || !stringData.startsWith('{')) {
    return {};
  }
  
  try {
    return JSON.parse(stringData);
  } catch (e) {
    console.error('JSON Parse Error:', e, 'Input:', stringData);
    toast.error('Failed to parse server response. Please try again.');
    return {};
  }
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
  
  const result = await rawBaseQuery(args, webApi, extraOptions);
  
  // Check for VPN provider blocks in response headers
  if (result.meta?.response?.headers) {
    const vpnBlock = detectVpnBlock(result.meta.response.headers);
    if (vpnBlock) {
      logVpnBlock(vpnBlock);
      
      // For BlockedUsersAPI specifically, gracefully degrade instead of erroring
      if (typeof args === 'object' && (args as any).url?.includes('BlockedUsersAPI')) {
        return { data: { blockedUsers: [] } };
      }
    }
  }
  
  return result;
};

// Define our single API slice object
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['ModPageData'],
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
    getGameInfo: builder.query<{ format?: string; error?: string }, string>({
      query: (gameName) => {
        return {
          url: URL_END_POINT.GET_GAME_INFO,
          method: 'POST',
          body: { gameName },
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
          method: 'POST',
          body: body,
          responseHandler: parseResponse
        };
      }
    }),
    addFavoriteDeck: builder.mutation<AddFavoriteDeckResponse, AddFavoriteDeckRequest>({
      query: (body: AddFavoriteDeckRequest) => {
        return {
          url: URL_END_POINT.ADD_FAVORITE_DECK,
          method: 'POST',
          body: body,
          responseHandler: parseResponse
        };
      }
    }),
    updateFavoriteDeck: builder.mutation<UpdateFavoriteDeckResponse, UpdateFavoriteDeckRequest>({
      query: (body: UpdateFavoriteDeckRequest) => {
        return {
          url: URL_END_POINT.UPDATE_FAVORITE_DECK,
          method: 'POST',
          body: body,
          responseHandler: parseResponse
        };
      }
    }),
    deleteAccount: builder.mutation<DeleteAccountAPIResponse, DeleteAccountAPIRequest>({
      query: (body: DeleteAccountAPIRequest) => {
        return {
          url: URL_END_POINT.DELETE_ACCOUNT,
          method: 'POST',
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
      },
      providesTags: [{ type: 'UserProfile', id: 'LIST' }]
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
          responseHandler: async (response: any) => {
            // Check for non-2xx status codes
            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || `HTTP ${response.status}`);
            }
            return parseResponse(response);
          }
        };
      }
    }),
    loadReplay: builder.mutation<LoadReplayResponse, LoadReplayAPI>({
      query: ({ ...body }: LoadReplayAPI) => {
        return {
          url: URL_END_POINT.REPLAYS,
          method: 'POST',
          body: body,
          responseHandler: parseResponse
        };
      },
      // Pick out errors and prevent nested properties in a hook or selector
      transformErrorResponse: (response: { status: string | number }) =>
        response.status
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
    submitMetafyLogin: builder.mutation<
      MetafyLoginResponse,
      {
        code: string;
        redirect_uri: string;
      }
    >({
      query: ({ code, redirect_uri }) => {
        return {
          url: URL_END_POINT.METAFY_LOGIN,
          method: 'GET',
          params: {
            code: code,
            redirect_uri: redirect_uri
          },
          responseHandler: parseResponse
        };
      },
      invalidatesTags: [{ type: 'UserProfile', id: 'LIST' }]
    }),
    getModPageData: builder.query<ModPageDataResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.GET_MOD_PAGE_DATA,
          method: 'GET',
          responseHandler: parseResponse
        };
      },
      providesTags: [{ type: 'ModPageData', id: 'LIST' }]
    }),
    banPlayerByIP: builder.mutation<any, BanPlayerByIPRequest>({
      query: ({ ipToBan, playerNumberToBan }) => {
        return {
          url: URL_END_POINT.BAN_PLAYER,
          method: 'POST',
          body: {
            ipToBan: ipToBan,
            playerNumberToBan: playerNumberToBan
          },
          responseHandler: parseResponse
        };
      },
      invalidatesTags: [{ type: 'ModPageData', id: 'LIST' }]
    }),
    banPlayerByName: builder.mutation<any, BanPlayerByNameRequest>({
      query: ({ playerToBan }) => {
        return {
          url: URL_END_POINT.BAN_PLAYER,
          method: 'POST',
          body: {
            playerToBan: playerToBan
          },
          responseHandler: parseResponse
        };
      },
      invalidatesTags: [{ type: 'ModPageData', id: 'LIST' }]
    }),
    deleteUsername: builder.mutation<any, DeleteUsernameRequest>({
      query: ({ usernameToDelete }) => {
        return {
          url: URL_END_POINT.BAN_PLAYER,
          method: 'POST',
          body: {
            usernameToDelete: usernameToDelete
          },
          responseHandler: parseResponse
        };
      }
    }),
    closeGame: builder.mutation<any, CloseGameRequest>({
      query: ({ gameToClose }) => {
        return {
          url: URL_END_POINT.CLOSE_GAME,
          method: 'POST',
          body: {
            gameToClose: gameToClose
          },
          responseHandler: parseResponse
        };
      }
    }),
    searchUsernames: builder.query<SearchUsernamesResponse, string>({
      query: (searchQuery) => {
        return {
          url: `${URL_END_POINT.SEARCH_USERNAMES}?q=${encodeURIComponent(searchQuery)}`,
          method: 'GET',
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
    }),
    updateFriendNickname: builder.mutation<FriendListAPIResponse, { friendUserId: number; nickname: string }>({
      query: ({ friendUserId, nickname }) => {
        return {
          url: URL_END_POINT.FRIEND_LIST,
          method: 'POST',
          body: { action: 'updateNickname', friendUserId: friendUserId, nickname: nickname },
          responseHandler: parseResponse
        };
      }
    }),

    // Blocked Users endpoints
    getBlockedUsers: builder.query<BlockedUsersAPIResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.BLOCKED_USERS,
          method: 'POST',
          body: { action: 'getBlockedUsers' },
          responseHandler: parseResponse
        };
      },
      // Handle errors gracefully - don't crash if BlockedUsersAPI is unavailable
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery({
            url: URL_END_POINT.BLOCKED_USERS,
            method: 'POST',
            body: { action: 'getBlockedUsers' },
            responseHandler: parseResponse
          });
          
          // If we get a 405 or other error, return empty blocked users list instead of error
          if (!result.data) {
            console.warn('BlockedUsersAPI unavailable, continuing without blocked users');
            return { data: { blockedUsers: [] } as BlockedUsersAPIResponse };
          }
          
          return result;
        } catch (error) {
          console.warn('Failed to fetch blocked users:', error);
          // Return empty list instead of error to not crash the game
          return { data: { blockedUsers: [] } as BlockedUsersAPIResponse };
        }
      }
    }),

    blockUser: builder.mutation<BlockedUsersAPIResponse, { blockedUsername: string }>({
      query: ({ blockedUsername }) => {
        return {
          url: URL_END_POINT.BLOCKED_USERS,
          method: 'POST',
          body: { action: 'blockUser', blockedUsername: blockedUsername },
          responseHandler: parseResponse
        };
      },
      // Handle errors gracefully - don't crash if BlockedUsersAPI is unavailable
      async onQueryStarted({ blockedUsername }, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          if (error.error?.status === 405 || error.error?.status === 401) {
            // If API is unavailable, just log a warning and continue
            console.warn(`Could not block user ${blockedUsername}:`, error.error?.data?.error || 'API unavailable');
          }
        }
      }
    }),

    unblockUser: builder.mutation<BlockedUsersAPIResponse, { blockedUserId: number }>({
      query: ({ blockedUserId }) => {
        return {
          url: URL_END_POINT.BLOCKED_USERS,
          method: 'POST',
          body: { action: 'unblockUser', blockedUserId: blockedUserId },
          responseHandler: parseResponse
        };
      },
      // Handle errors gracefully - don't crash if BlockedUsersAPI is unavailable
      async onQueryStarted({ blockedUserId }, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          if (error.error?.status === 405 || error.error?.status === 401) {
            // If API is unavailable, just log a warning and continue
            console.warn(`Could not unblock user ${blockedUserId}:`, error.error?.data?.error || 'API unavailable');
          }
        }
      }
    }),

    // Username Moderation endpoints
    getOffensiveUsernames: builder.query<UsernamesModerationResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.USERNAME_MODERATION,
          method: 'POST',
          body: { action: 'getOffensiveUsernames' },
          responseHandler: parseResponse
        };
      }
    }),

    banOffensiveUsername: builder.mutation<any, BanOffensiveUsernameRequest>({
      query: ({ username }) => {
        return {
          url: URL_END_POINT.USERNAME_MODERATION,
          method: 'POST',
          body: { action: 'banOffensiveUsername', username: username },
          responseHandler: parseResponse
        };
      }
    }),

    whitelistOffensiveUsername: builder.mutation<any, { username: string }>({
      query: ({ username }) => {
        return {
          url: URL_END_POINT.USERNAME_MODERATION,
          method: 'POST',
          body: { action: 'whitelistOffensiveUsername', username: username },
          responseHandler: parseResponse
        };
      }
    }),

    // Private Messaging endpoints
    sendPrivateMessage: builder.mutation<PrivateMessagingAPIResponse, { toUserId: number; message: string; gameLink?: string }>({
      query: ({ toUserId, message, gameLink }) => {
        return {
          url: URL_END_POINT.PRIVATE_MESSAGING,
          method: 'POST',
          body: { action: 'sendMessage', toUserId, message, gameLink },
          responseHandler: parseResponse
        };
      }
    }),
    getPrivateMessages: builder.query<PrivateMessagingAPIResponse, { friendUserId: number; limit?: number }>({
      query: ({ friendUserId, limit = 50 }) => {
        return {
          url: URL_END_POINT.PRIVATE_MESSAGING,
          method: 'POST',
          body: { action: 'getMessages', friendUserId, limit },
          responseHandler: parseResponse
        };
      }
    }),
    markMessagesAsRead: builder.mutation<PrivateMessagingAPIResponse, { messageIds: number[] }>({
      query: ({ messageIds }) => {
        return {
          url: URL_END_POINT.PRIVATE_MESSAGING,
          method: 'POST',
          body: { action: 'markAsRead', messageIds },
          responseHandler: parseResponse
        };
      }
    }),
    getOnlineFriends: builder.query<PrivateMessagingAPIResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.PRIVATE_MESSAGING,
          method: 'POST',
          body: { action: 'getOnlineFriends' },
          responseHandler: parseResponse
        };
      }
    }),
    getUnreadMessageCount: builder.query<PrivateMessagingAPIResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.PRIVATE_MESSAGING,
          method: 'POST',
          body: { action: 'getUnreadCount' },
          responseHandler: parseResponse
        };
      }
    }),
    getUnreadMessageCountByFriend: builder.query<PrivateMessagingAPIResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.PRIVATE_MESSAGING,
          method: 'POST',
          body: { action: 'getUnreadCountByFriend' },
          responseHandler: parseResponse
        };
      }
    }),
    createQuickGame: builder.mutation<CreateGameResponse, { format: string; visibility: string }>({
      query: (prefs) => {
        return {
          url: URL_END_POINT.CREATE_GAME,
          method: 'POST',
          body: {
            format: prefs.format,
            visibility: prefs.visibility,
            deckTestMode: false,
            deck: '',
            fabdb: '',
            decksToTry: '1',
            favoriteDeck: false,
            favoriteDecks: '',
            gameDescription: 'Invite from Friends'
          },
          responseHandler: parseResponse
        };
      }
    }),
    getLastActiveGame: builder.query<GetLastActiveGameResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.GET_LAST_ACTIVE_GAME,
          method: 'POST',
          body: {},
          responseHandler: parseResponse
        };
      }
    }),
    reportTyping: builder.mutation<any, { gameID: number; playerID: number }>({
      query: ({ gameID = 0, playerID = 0 }) => {
        return {
          url: 'APIs/ChatTyping.php',
          method: 'GET',
          params: {
            gameName: gameID,
            playerID: playerID
          },
          responseHandler: parseResponse
        };
      }
    }),
    checkOpponentTyping: builder.query<{ opponentIsTyping: boolean }, { gameID: number; playerID: number }>({
      query: ({ gameID = 0, playerID = 0 }) => {
        return {
          url: 'APIs/CheckOpponentTyping.php',
          method: 'GET',
          params: {
            gameName: gameID,
            playerID: playerID
          },
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
  useGetGameInfoQuery,
  useGetCosmeticsQuery,
  useGetFavoriteDecksQuery,
  useDeleteDeckMutation,
  useAddFavoriteDeckMutation,
  useUpdateFavoriteDeckMutation,
  useDeleteAccountMutation,
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
  useSubmitMetafyLoginMutation,
  useLoadDebugGameMutation,
  useGetUserProfileQuery,
  useLoadReplayMutation,
  useSubmitLobbyInputMutation,
  useGetModPageDataQuery,
  useBanPlayerByIPMutation,
  useBanPlayerByNameMutation,
  useDeleteUsernameMutation,
  useCloseGameMutation,
  useSearchUsernamesQuery,
  useGetFriendsListQuery,
  useAddFriendMutation,
  useRemoveFriendMutation,
  useSearchUsersQuery,
  useGetPendingRequestsQuery,
  useAcceptRequestMutation,
  useRejectRequestMutation,
  useGetSentRequestsQuery,
  useCancelRequestMutation,
  useUpdateFriendNicknameMutation,
  useGetBlockedUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetOffensiveUsernamesQuery,
  useBanOffensiveUsernameMutation,
  useWhitelistOffensiveUsernameMutation,
  useSendPrivateMessageMutation,
  useGetPrivateMessagesQuery,
  useMarkMessagesAsReadMutation,
  useGetOnlineFriendsQuery,
  useGetUnreadMessageCountQuery,
  useGetUnreadMessageCountByFriendQuery,
  useCreateQuickGameMutation,
  useGetLastActiveGameQuery,
  useReportTypingMutation,
  useCheckOpponentTypingQuery
} = apiSlice;
