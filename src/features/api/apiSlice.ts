import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { MiddlewareAPI, Middleware } from '@reduxjs/toolkit';
import {
  BACKEND_URL,
  FAB_BAZAAR_DECKS_API_URL,
  URL_END_POINT
} from 'appConstants';
import { detectVpnBlock, logVpnBlock } from 'utils/VpnDetection';
import {
  CreateGameAPI,
  CreateGameResponse
} from 'interface/API/CreateGame.php';
import {
  LoadReplayAPI,
  LoadReplayResponse
} from 'interface/API/LoadReplayAPI.php';
import {
  ShareReplayAPI,
  ShareReplayResponse,
  LoadSharedReplayAPI,
  LoadSharedReplayResponse
} from 'interface/API/ShareReplayAPI';
import { toast } from 'react-hot-toast';
import { parseResponse } from 'utils/parseBackendResponse';
import { PlayerPresence } from 'features/PlayerPresence';
import { JoinGameAPI, JoinGameResponse } from 'interface/API/JoinGame.php';
import { GetLobbyInfo } from 'interface/API/GetLobbyInfo.php';
import { SubmitLobbyInput } from 'interface/API/SubmitLobbyInput.php';
import { ChooseFirstPlayer } from 'interface/API/ChooseFirstPlayer.php';
import { SubmitSideboardAPI } from 'interface/API/SubmitSideboard.php';
import { GetFavoriteDecksResponse } from 'interface/API/GetFavoriteDecks.php';
import {
  BazaarDecksResponse,
  GetBazaarDecksRequest
} from 'interface/API/GetBazaarDecks';
import {
  UpdateBazaarMatchupRequest,
  UpdateBazaarMatchupResponse
} from 'interface/API/UpdateBazaarMatchup';
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
import {
  GetDeckCardsRequest,
  GetDeckCardsResponse
} from 'interface/API/GetDeckCards.php';
import {
  SaveDeckCosmeticsRequest,
  SaveDeckCosmeticsResponse
} from 'interface/API/SaveDeckCosmetics.php';
import { PatreonLoginResponse } from 'routes/user/profile/linkpatreon/linkPatreon';
import {
  ChangeDisplayNameRequest,
  ChangeDisplayNameResponse,
  UserProfileAPIResponse
} from 'interface/API/UserProfileAPI.php';
import { ClearRustCountersAPIResponse } from 'interface/API/ClearRustCountersAPI.php';
import {
  MetafyLoginResponse,
  MetafySignupResponse,
  RefreshMetafyCommunitiesResponse
} from 'interface/API/MetafyAPI.php';
import { SubmitChatAPI } from 'interface/API/SubmitChat.php';
import {
  ModPageDataResponse,
  BanPlayerByIPRequest,
  BanIPDirectRequest,
  BanPlayerByNameRequest,
  CloseGameRequest,
  DeleteUsernameRequest,
  ResetAllRustCountersResponse,
  SearchUsernamesResponse,
  PromptStatsRange,
  PromptStatsResponse
} from 'interface/API/ModPageAPI';
import { FriendListAPIResponse } from 'interface/API/FriendListAPI.php';
import {
  UsernamesModerationResponse,
  BanOffensiveUsernameRequest
} from 'interface/API/UsernameModerationAPI';
import { BlockedUsersAPIResponse } from 'interface/API/BlockedUsersAPI.php';
import {
  GetSavedReplaysResponse,
  SetReplayFavoriteRequest,
  DeleteReplayRequest,
  DeleteReplayResponse
} from 'interface/API/GetSavedReplays.php';
import {
  HeroMasteryResponse,
  SaveHeroMasteryFrameRequest,
  SaveHeroMasteryFrameResponse
} from 'interface/API/HeroMastery';

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
  (_api: MiddlewareAPI) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      const payload = action.payload as
        | { status?: number | string; message?: string; aborted?: boolean }
        | undefined;
      const errorStatus = payload?.status ?? 0;
      const errorMessage =
        payload?.message ?? action.error?.message ?? 'an error happened';

      if (payload?.aborted) return next(action);

      // Suppress 401 Unauthorized errors - these are often benign (e.g., logging out/in quickly)
      // and not user-facing errors that need a toast notification
      // Also 403 Forbidden errors which can happen when trying to access a resource the user doesn't have permissions for, and are not actionable by the user
      if (errorStatus !== 401 && errorStatus !== 403) {
        toast.error(
          `A network error happened, please try again. Error:\n${errorStatus}\n${errorMessage}`
        );
      }
    }
    return next(action);
  };

// Different request URLs depending on the gameID number, beta, live or dev.
const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, webApi, extraOptions) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: BACKEND_URL,
    credentials: 'include'
  });

  const result = await rawBaseQuery(args, webApi, extraOptions);

  // Check for VPN provider blocks in response headers
  if (result.meta?.response?.headers) {
    const vpnBlock = detectVpnBlock(result.meta.response.headers);
    if (vpnBlock) {
      logVpnBlock(vpnBlock);

      // For BlockedUsersAPI specifically, gracefully degrade instead of erroring
      if (
        typeof args === 'object' &&
        (args as any).url?.includes('BlockedUsersAPI')
      ) {
        return { data: { blockedUsers: [] } };
      }
    }
  }

  return result;
};

// Define our single API slice object
const postJson = (url: string, body: unknown = {}): FetchArgs => ({
  url,
  method: 'POST',
  body,
  responseHandler: parseResponse
});

const friendAction =
  <TArg extends Record<string, unknown> | void>(action: string) =>
  (arg: TArg): FetchArgs =>
    postJson(URL_END_POINT.FRIEND_LIST, { action, ...(arg ?? {}) });

interface BazaarAuthParams {
  metafyId: string | number | null;
  metafyHash: string | number | null;
  metafyTimestamp: string | number | null;
}

const bazaarUrl = (
  base: string,
  { metafyId, metafyHash, metafyTimestamp }: BazaarAuthParams
): string => {
  const url = new URL(base);
  url.searchParams.set('metafyId', String(metafyId));
  url.searchParams.set('metafyHash', String(metafyHash));
  url.searchParams.set('timestamp', String(metafyTimestamp));
  return url.toString();
};

const bazaarFetch = async <T>(url: string, init?: RequestInit) => {
  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: { status: response.status, data: errorData } };
    }
    const data: T = await response.json();
    return { data };
  } catch (error) {
    return {
      error: { status: 'FETCH_ERROR' as const, error: String(error) }
    };
  }
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: dynamicBaseQuery,
  tagTypes: [
    'ModPageData',
    'UserProfile',
    'Auth',
    'SystemMessage',
    'SavedReplays',
    'HeroMastery'
  ],
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    getHeroMastery: builder.query<
      HeroMasteryResponse,
      | string
      | {
          gameKey?: string;
          gameName?: number;
          scope?: 'account' | 'game' | 'award';
        }
      | void
    >({
      query: (request) => ({
        url: URL_END_POINT.GET_HERO_MASTERY,
        method: 'GET',
        params:
          typeof request === 'string'
            ? { gameKey: request }
            : request || undefined,
        responseHandler: parseResponse
      }),
      providesTags: ['HeroMastery']
    }),
    saveHeroMasteryFrame: builder.mutation<
      SaveHeroMasteryFrameResponse,
      SaveHeroMasteryFrameRequest
    >({
      query: (body: SaveHeroMasteryFrameRequest) =>
        postJson(URL_END_POINT.SAVE_HERO_MASTERY_FRAME, body),
      invalidatesTags: ['HeroMastery']
    }),
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
      query: (body) => postJson(URL_END_POINT.LOGIN, { ...body, submit: true }),
      invalidatesTags: ['Auth']
    }),
    loginWithCookie: builder.query({
      query: () => postJson(URL_END_POINT.LOGIN_WITH_COOKIE),
      providesTags: ['Auth']
    }),
    logOut: builder.mutation({
      query: () => postJson(URL_END_POINT.LOGOUT),
      invalidatesTags: ['Auth']
    }),
    signUp: builder.mutation({
      query: (body) =>
        postJson(URL_END_POINT.SIGNUP, { ...body, submit: true }),
      invalidatesTags: ['Auth']
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
      query: (body) => postJson(URL_END_POINT.RESET_PASSWORD, { ...body })
    }),
    submitChat: builder.mutation<SubmitChatAPI, any>({
      query: ({
        gameID = 0,
        playerID = 0,
        chatText = '',
        authKey = '',
        quickChat
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
      query: (body) => postJson(URL_END_POINT.PROCESS_INPUT_POST, body)
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
      query: (gameName) => postJson(URL_END_POINT.GET_GAME_INFO, { gameName })
    }),
    getCosmetics: builder.query<GetCosmeticsResponse, undefined>({
      query: () => {
        return {
          url: URL_END_POINT.GET_COSMETICS,
          responseHandler: parseResponse
        };
      }
    }),
    getBazaarDecks: builder.query<BazaarDecksResponse, GetBazaarDecksRequest>({
      queryFn: async (auth) =>
        bazaarFetch<BazaarDecksResponse>(
          bazaarUrl(FAB_BAZAAR_DECKS_API_URL, auth)
        )
    }),
    updateBazaarMatchup: builder.mutation<
      UpdateBazaarMatchupResponse,
      UpdateBazaarMatchupRequest
    >({
      queryFn: async ({ deckId, heroId, sideboard, ...auth }) =>
        bazaarFetch<UpdateBazaarMatchupResponse>(
          bazaarUrl(
            `https://fabbazaar.app/api/decks/${encodeURIComponent(
              deckId
            )}/matchups/${encodeURIComponent(heroId)}`,
            auth
          ),
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sideboard })
          }
        )
    }),
    getFavoriteDecks: builder.query<GetFavoriteDecksResponse, undefined>({
      query: () => {
        return {
          url: URL_END_POINT.GET_FAVORITE_DECKS,
          responseHandler: parseResponse
        };
      }
    }),
    deleteDeck: builder.mutation<DeleteDeckAPIResponse, DeleteDeckAPIRequest>({
      query: (body: DeleteDeckAPIRequest) =>
        postJson(URL_END_POINT.DELETE_DECK, body)
    }),
    addFavoriteDeck: builder.mutation<
      AddFavoriteDeckResponse,
      AddFavoriteDeckRequest
    >({
      query: (body: AddFavoriteDeckRequest) =>
        postJson(URL_END_POINT.ADD_FAVORITE_DECK, body)
    }),
    updateFavoriteDeck: builder.mutation<
      UpdateFavoriteDeckResponse,
      UpdateFavoriteDeckRequest
    >({
      query: (body: UpdateFavoriteDeckRequest) =>
        postJson(URL_END_POINT.UPDATE_FAVORITE_DECK, body)
    }),
    getDeckCards: builder.query<GetDeckCardsResponse, GetDeckCardsRequest>({
      query: ({ decklink }: GetDeckCardsRequest) => {
        return {
          url: URL_END_POINT.GET_DECK_CARDS,
          method: 'GET',
          params: { decklink },
          responseHandler: parseResponse
        };
      }
    }),
    saveDeckCosmetics: builder.mutation<
      SaveDeckCosmeticsResponse,
      SaveDeckCosmeticsRequest
    >({
      query: (body: SaveDeckCosmeticsRequest) =>
        postJson(URL_END_POINT.SAVE_DECK_COSMETICS, body)
    }),
    deleteAccount: builder.mutation<
      DeleteAccountAPIResponse,
      DeleteAccountAPIRequest
    >({
      query: (body: DeleteAccountAPIRequest) =>
        postJson(URL_END_POINT.DELETE_ACCOUNT, body)
    }),
    createGame: builder.mutation<CreateGameResponse, CreateGameAPI>({
      query: (body: CreateGameAPI) => postJson(URL_END_POINT.CREATE_GAME, body),
      // Pick out errors and prevent nested properties in a hook or selector
      transformErrorResponse: (response: { status: string | number }) =>
        response.status
    }),
    joinGame: builder.mutation<JoinGameResponse, JoinGameAPI>({
      query: (body: JoinGameAPI) => postJson(URL_END_POINT.JOIN_GAME, body),
      transformErrorResponse: (response: { status: string | number }) =>
        response.status
    }),
    getLobbyInfo: builder.query({
      query: ({ ...body }: GetLobbyInfo) =>
        postJson(URL_END_POINT.GET_LOBBY_INFO, body)
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
    changeDisplayName: builder.mutation<
      ChangeDisplayNameResponse,
      ChangeDisplayNameRequest
    >({
      query: (body: ChangeDisplayNameRequest) =>
        postJson(URL_END_POINT.CHANGE_DISPLAY_NAME, body),
      invalidatesTags: [{ type: 'UserProfile', id: 'LIST' }]
    }),
    clearRustCounters: builder.mutation<ClearRustCountersAPIResponse, void>({
      query: () => {
        return {
          url: URL_END_POINT.CLEAR_RUST_COUNTERS,
          method: 'POST',
          responseHandler: parseResponse
        };
      },
      invalidatesTags: [{ type: 'UserProfile', id: 'LIST' }]
    }),
    chooseFirstPlayer: builder.mutation({
      query: ({ ...body }: ChooseFirstPlayer) =>
        postJson(URL_END_POINT.CHOOSE_FIRST_PLAYER, body)
    }),
    submitLobbyInput: builder.mutation({
      query: ({ ...body }: SubmitLobbyInput) =>
        postJson(URL_END_POINT.SUBMIT_LOBBY_INPUT, body)
    }),
    kickPlayer: builder.mutation<
      { success: boolean; error?: string },
      { gameName: number; playerID: number; authKey: string }
    >({
      query: (body) => postJson(URL_END_POINT.KICK_PLAYER, body)
    }),
    submitSideboard: builder.mutation({
      query: ({ ...body }: SubmitSideboardAPI) =>
        postJson(URL_END_POINT.SUBMIT_SIDEBOARD, body)
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
      query: ({ ...body }: LoadReplayAPI) =>
        postJson(URL_END_POINT.REPLAYS, body),
      // Pick out errors and prevent nested properties in a hook or selector
      transformErrorResponse: (response) => {
        const data = 'data' in response ? response.data : undefined;
        if (
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string'
        ) {
          return data.error;
        }
        return `Replay request failed (${response.status})`;
      }
    }),
    getSavedReplays: builder.query<GetSavedReplaysResponse, void>({
      query: () => ({
        url: URL_END_POINT.GET_SAVED_REPLAYS,
        method: 'GET'
      }),
      providesTags: ['SavedReplays']
    }),
    getReplayTurns: builder.query<
      { turns: Array<{ player: 1 | 2; number: number }> },
      number
    >({
      query: (gameName) => ({
        url: `${URL_END_POINT.GET_REPLAY_TURNS}?gameName=${gameName}`,
        method: 'GET'
      })
    }),
    setReplayFavorite: builder.mutation<
      { success: boolean; favorite: boolean },
      SetReplayFavoriteRequest
    >({
      query: (body) => ({
        url: URL_END_POINT.SET_REPLAY_FAVORITE,
        method: 'POST',
        body,
        responseHandler: parseResponse
      }),
      invalidatesTags: ['SavedReplays']
    }),
    deleteReplay: builder.mutation<DeleteReplayResponse, DeleteReplayRequest>({
      query: (body) => ({
        url: URL_END_POINT.DELETE_REPLAY,
        method: 'POST',
        body,
        responseHandler: parseResponse
      }),
      invalidatesTags: ['SavedReplays']
    }),
    shareReplay: builder.mutation<ShareReplayResponse, ShareReplayAPI>({
      query: (body) => ({
        url: URL_END_POINT.SHARE_REPLAY,
        method: 'POST',
        body,
        responseHandler: parseResponse
      })
    }),
    loadSharedReplay: builder.mutation<
      LoadSharedReplayResponse,
      LoadSharedReplayAPI
    >({
      query: (body) => ({
        url: URL_END_POINT.CREATE_SHARED_REPLAY_GAME,
        method: 'POST',
        body,
        responseHandler: parseResponse
      })
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
      },
      invalidatesTags: ['Auth']
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
      invalidatesTags: ['Auth', { type: 'UserProfile', id: 'LIST' }]
    }),
    submitMetafySignup: builder.mutation<
      MetafySignupResponse,
      {
        code: string;
        redirect_uri: string;
      }
    >({
      query: ({ code, redirect_uri }) => {
        return {
          url: URL_END_POINT.METAFY_SIGNUP,
          method: 'GET',
          params: {
            code: code,
            redirect_uri: redirect_uri
          },
          responseHandler: parseResponse
        };
      },
      invalidatesTags: ['Auth', { type: 'UserProfile', id: 'LIST' }]
    }),
    refreshMetafyCommunities: builder.mutation<
      RefreshMetafyCommunitiesResponse,
      void
    >({
      query: () => postJson(URL_END_POINT.METAFY_REFRESH_COMMUNITIES),
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
    getPromptStats: builder.query<PromptStatsResponse, PromptStatsRange>({
      query: (days) => ({
        url: URL_END_POINT.GET_PROMPT_STATS,
        method: 'GET',
        params: { days },
        responseHandler: parseResponse
      })
    }),
    resetAllRustCounters: builder.mutation<ResetAllRustCountersResponse, void>({
      query: () => ({
        url: URL_END_POINT.RESET_ALL_RUST_COUNTERS,
        method: 'POST',
        responseHandler: parseResponse
      }),
      invalidatesTags: [
        { type: 'ModPageData', id: 'LIST' },
        { type: 'UserProfile', id: 'LIST' }
      ]
    }),
    banPlayerByIP: builder.mutation<any, BanPlayerByIPRequest>({
      query: ({ ipToBan, playerNumberToBan }) =>
        postJson(URL_END_POINT.BAN_PLAYER, {
          ipToBan: ipToBan,
          playerNumberToBan: playerNumberToBan
        }),
      invalidatesTags: [{ type: 'ModPageData', id: 'LIST' }]
    }),
    banIPDirect: builder.mutation<any, BanIPDirectRequest>({
      query: ({ directIPToBan }) =>
        postJson(URL_END_POINT.BAN_PLAYER, { directIPToBan: directIPToBan }),
      invalidatesTags: [{ type: 'ModPageData', id: 'LIST' }]
    }),
    banPlayerByName: builder.mutation<any, BanPlayerByNameRequest>({
      query: ({ playerToBan }) =>
        postJson(URL_END_POINT.BAN_PLAYER, { playerToBan: playerToBan }),
      invalidatesTags: [{ type: 'ModPageData', id: 'LIST' }]
    }),
    deleteUsername: builder.mutation<
      DeleteAccountAPIResponse,
      DeleteUsernameRequest
    >({
      query: ({ usernameToDelete }) =>
        postJson(URL_END_POINT.DELETE_ACCOUNT, {
          confirmationUsername: usernameToDelete
        })
    }),
    closeGame: builder.mutation<any, CloseGameRequest>({
      query: ({ gameToClose }) =>
        postJson(URL_END_POINT.CLOSE_GAME, { gameToClose: gameToClose })
    }),
    searchUsernames: builder.query<SearchUsernamesResponse, string>({
      query: (searchQuery) => {
        return {
          url: `${URL_END_POINT.SEARCH_USERNAMES}?q=${encodeURIComponent(
            searchQuery
          )}`,
          method: 'GET',
          responseHandler: parseResponse
        };
      }
    }),
    getFriendsList: builder.query<FriendListAPIResponse, void>({
      query: friendAction<void>('getFriends')
    }),
    addFriend: builder.mutation<
      FriendListAPIResponse,
      { friendUsername: string }
    >({
      query: friendAction<{ friendUsername: string }>('addFriend')
    }),
    removeFriend: builder.mutation<
      FriendListAPIResponse,
      { friendUserId: number }
    >({
      query: friendAction<{ friendUserId: number }>('removeFriend')
    }),
    searchUsers: builder.query<
      FriendListAPIResponse,
      { searchTerm: string; limit?: number }
    >({
      query: ({ searchTerm, limit = 10 }) =>
        postJson(URL_END_POINT.FRIEND_LIST, {
          action: 'searchUsers',
          searchTerm: searchTerm,
          limit: limit
        })
    }),
    getPendingRequests: builder.query<FriendListAPIResponse, void>({
      query: friendAction<void>('getPendingRequests')
    }),
    acceptRequest: builder.mutation<
      FriendListAPIResponse,
      { requesterUserId: number }
    >({
      query: friendAction<{ requesterUserId: number }>('acceptRequest')
    }),
    rejectRequest: builder.mutation<
      FriendListAPIResponse,
      { requesterUserId: number }
    >({
      query: friendAction<{ requesterUserId: number }>('rejectRequest')
    }),
    getSentRequests: builder.query<FriendListAPIResponse, void>({
      query: friendAction<void>('getSentRequests')
    }),
    cancelRequest: builder.mutation<
      FriendListAPIResponse,
      { recipientUserId: number }
    >({
      query: friendAction<{ recipientUserId: number }>('cancelRequest')
    }),
    updateFriendNickname: builder.mutation<
      FriendListAPIResponse,
      { friendUserId: number; nickname: string }
    >({
      query: friendAction<{ friendUserId: number; nickname: string }>(
        'updateNickname'
      )
    }),

    // Blocked Users endpoints
    getBlockedUsers: builder.query<BlockedUsersAPIResponse, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        try {
          const result: any = await baseQuery({
            url: URL_END_POINT.BLOCKED_USERS,
            method: 'POST',
            body: { action: 'getBlockedUsers' },
            responseHandler: parseResponse
          });

          // If we get a 405 or other error, return empty blocked users list instead of error
          if (!result.data) {
            console.warn(
              'BlockedUsersAPI unavailable, continuing without blocked users'
            );
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

    blockUser: builder.mutation<
      BlockedUsersAPIResponse,
      { blockedUsername: string }
    >({
      query: ({ blockedUsername }) =>
        postJson(URL_END_POINT.BLOCKED_USERS, {
          action: 'blockUser',
          blockedUsername: blockedUsername
        }),
      // Handle errors gracefully - don't crash if BlockedUsersAPI is unavailable
      async onQueryStarted({ blockedUsername }, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          if (error.error?.status === 405 || error.error?.status === 401) {
            // If API is unavailable, just log a warning and continue
            console.warn(
              `Could not block user ${blockedUsername}:`,
              error.error?.data?.error || 'API unavailable'
            );
          }
        }
      }
    }),

    unblockUser: builder.mutation<
      BlockedUsersAPIResponse,
      { blockedUserId: number }
    >({
      query: ({ blockedUserId }) =>
        postJson(URL_END_POINT.BLOCKED_USERS, {
          action: 'unblockUser',
          blockedUserId: blockedUserId
        }),
      // Handle errors gracefully - don't crash if BlockedUsersAPI is unavailable
      async onQueryStarted({ blockedUserId }, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          if (error.error?.status === 405 || error.error?.status === 401) {
            // If API is unavailable, just log a warning and continue
            console.warn(
              `Could not unblock user ${blockedUserId}:`,
              error.error?.data?.error || 'API unavailable'
            );
          }
        }
      }
    }),

    // Username Moderation endpoints
    getOffensiveUsernames: builder.query<UsernamesModerationResponse, void>({
      query: () =>
        postJson(URL_END_POINT.USERNAME_MODERATION, {
          action: 'getOffensiveUsernames'
        })
    }),

    banOffensiveUsername: builder.mutation<any, BanOffensiveUsernameRequest>({
      query: ({ username }) =>
        postJson(URL_END_POINT.USERNAME_MODERATION, {
          action: 'banOffensiveUsername',
          username: username
        })
    }),

    whitelistOffensiveUsername: builder.mutation<any, { username: string }>({
      query: ({ username }) =>
        postJson(URL_END_POINT.USERNAME_MODERATION, {
          action: 'whitelistOffensiveUsername',
          username: username
        })
    }),

    // System Message endpoints
    getSystemMessage: builder.query<{ systemMessage: string | null }, void>({
      query: () => ({
        url: URL_END_POINT.GET_SYSTEM_MESSAGE,
        method: 'GET',
        responseHandler: parseResponse
      }),
      providesTags: [{ type: 'SystemMessage', id: 'MINE' }]
    }),
    sendSystemMessageToPlayer: builder.mutation<
      any,
      { username: string; message: string; expiresInHours?: number | null }
    >({
      query: ({ username, message, expiresInHours }) =>
        postJson(URL_END_POINT.SYSTEM_MESSAGE, {
          action: 'sendToPlayer',
          username,
          message,
          expiresInHours
        })
    }),
    sendSystemMessageToAll: builder.mutation<
      any,
      { message: string; expiresInHours?: number | null }
    >({
      query: ({ message, expiresInHours }) =>
        postJson(URL_END_POINT.SYSTEM_MESSAGE, {
          action: 'sendToAll',
          message,
          expiresInHours
        })
    }),
    syncMetafySubscribers: builder.mutation<
      any,
      { clearNoMetafyId?: boolean } | void
    >({
      query: (args) =>
        postJson(URL_END_POINT.SYNC_METAFY_SUBSCRIBERS, {
          clearNoMetafyId: args?.clearNoMetafyId ?? false
        })
    }),
    acknowledgeSystemMessage: builder.mutation<any, void>({
      query: () =>
        postJson(URL_END_POINT.SYSTEM_MESSAGE, { action: 'acknowledge' }),
      invalidatesTags: [{ type: 'SystemMessage', id: 'MINE' }]
    }),

    getLastActiveGame: builder.query<GetLastActiveGameResponse, void>({
      query: () => postJson(URL_END_POINT.GET_LAST_ACTIVE_GAME)
    }),
    reportTyping: builder.mutation<
      any,
      { gameID: number; playerID: number; typing?: boolean }
    >({
      query: ({ gameID = 0, playerID = 0, typing = true }) => {
        return {
          url: 'APIs/ChatTyping.php',
          method: 'GET',
          params: {
            gameName: gameID,
            playerID: playerID,
            typing: typing ? '1' : '0'
          },
          responseHandler: parseResponse
        };
      }
    }),
    reportPresence: builder.mutation<
      any,
      {
        gameID: number;
        playerID: number;
        presence: PlayerPresence | null;
      }
    >({
      query: ({ gameID = 0, playerID = 0, presence }) => {
        return {
          url: 'APIs/PlayerPresence.php',
          method: 'GET',
          params: {
            gameName: gameID,
            playerID,
            presence: presence ? JSON.stringify(presence) : ''
          },
          responseHandler: parseResponse
        };
      }
    }),
    // External app auth endpoints
    getAppInfo: builder.query<
      { app_id: string; name: string; description: string; error?: string },
      { app_id: string; redirect_uri: string }
    >({
      query: ({ app_id, redirect_uri }) => {
        return {
          url: URL_END_POINT.GET_APP_INFO,
          method: 'GET',
          params: { app_id, redirect_uri },
          responseHandler: parseResponse
        };
      }
    }),
    generateAuthToken: builder.mutation<
      { token: string; error?: string },
      { app_id: string; redirect_uri: string }
    >({
      query: ({ app_id, redirect_uri }) =>
        postJson(URL_END_POINT.GENERATE_AUTH_TOKEN, { app_id, redirect_uri })
    })
  })
});

// Export the auto-generated hook for the `getPosts` query endpoint
export const {
  useGetHeroMasteryQuery,
  useSaveHeroMasteryFrameMutation,
  useGetPopUpContentQuery,
  useSubmitChatMutation,
  useGetGameListQuery,
  useGetGameInfoQuery,
  useGetCosmeticsQuery,
  useGetFavoriteDecksQuery,
  useDeleteDeckMutation,
  useAddFavoriteDeckMutation,
  useUpdateFavoriteDeckMutation,
  useLazyGetDeckCardsQuery,
  useSaveDeckCosmeticsMutation,
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
  useSubmitMetafySignupMutation,
  useRefreshMetafyCommunitiesMutation,
  useLoadDebugGameMutation,
  useGetUserProfileQuery,
  useChangeDisplayNameMutation,
  useClearRustCountersMutation,
  useLoadReplayMutation,
  useGetSavedReplaysQuery,
  useGetReplayTurnsQuery,
  useSetReplayFavoriteMutation,
  useDeleteReplayMutation,
  useShareReplayMutation,
  useLoadSharedReplayMutation,
  useSubmitLobbyInputMutation,
  useKickPlayerMutation,
  useGetModPageDataQuery,
  useGetPromptStatsQuery,
  useResetAllRustCountersMutation,
  useBanPlayerByIPMutation,
  useBanIPDirectMutation,
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
  useGetSystemMessageQuery,
  useSendSystemMessageToPlayerMutation,
  useSendSystemMessageToAllMutation,
  useSyncMetafySubscribersMutation,
  useAcknowledgeSystemMessageMutation,
  useGetLastActiveGameQuery,
  useReportTypingMutation,
  useReportPresenceMutation,
  useGetAppInfoQuery,
  useGenerateAuthTokenMutation,
  useGetBazaarDecksQuery,
  useUpdateBazaarMatchupMutation
} = apiSlice;
