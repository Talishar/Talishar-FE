export interface UpdateFavoriteDeckRequest {
  decklink: string;
  heroID: string;
}

export interface UpdateFavoriteDeckResponse {
  success: boolean;
  message: string;
}
