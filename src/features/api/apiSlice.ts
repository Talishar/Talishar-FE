import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL_DEV, API_URL_LIVE } from '../../constants';

// Define our single API slice object
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.DEV ? API_URL_DEV : API_URL_LIVE
  }),
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
