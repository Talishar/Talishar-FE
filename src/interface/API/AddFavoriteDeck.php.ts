export interface AddFavoriteDeckRequest {
  fabdb: string;
}

export interface AddFavoriteDeckResponse {
  success: boolean;
  message: string;
  apiLink?: string;
}
