export interface GetFavoriteDecksResponse {
  favoriteDecks: FavoriteDeck[];
  lastUsedDeckIndex?: number;
}

export interface FavoriteDeck {
  index: number;
  key: string;
  name: string;
}
