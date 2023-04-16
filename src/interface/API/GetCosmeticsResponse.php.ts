export interface GetCosmeticsResponse {
  cardBacks: CardBack[];
  playmats: CardBack[];
}

export interface CardBack {
  name: string;
  id: string;
}
