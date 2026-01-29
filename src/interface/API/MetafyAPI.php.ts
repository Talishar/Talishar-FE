export interface MetafyCommunity {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  website?: string;
  [key: string]: any; // Allow additional properties from Metafy API
}

export interface MetafyUserData {
  id?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  communities?: MetafyCommunity[];
  [key: string]: any;
}

export interface UserProfileAPIResponse {
  userName: string;
  patreonInfo: string;
  isPatreonLinked: boolean;
  metafyInfo?: string;
  isMetafyLinked?: boolean;
  isMetafySupporter?: boolean;
  metafyCommunities?: MetafyCommunity[];
}

export interface MetafyLoginResponse {
  message?: string;
  error?: string;
  access_token?: string;
  refresh_token?: string;
  tokens?: any;
}

export interface MetafySignupResponse {
  message?: string;
  error?: string;
  error_description?: string;
  redirect?: string;
  isUserLoggedIn?: boolean;
  loggedInUserID?: string | number;
  loggedInUserName?: string;
  isPatron?: string;
}
