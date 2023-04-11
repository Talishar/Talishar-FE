export interface GetFavoriteDecksResponse {
  favoriteDecks: FavoriteDeck[];
  lastUsedDeckIndex?: number;
  lastFormat?: number;
  lastVisibility?: number;
}

export interface FavoriteDeck {
  index: number;
  key: string;
  name: string;
  hero: string;
  format: string;
  cardBack: string;
  playmat: string;
  link: string;
}
