export interface GetLobbyInfo {
  gameName?: number;
  playerID?: number;
  authKey?: string;
}

export interface Deck {
  heroName: string;
  hero: string;
  weapons: Weapon[];
  head: string[];
  chest: string[];
  arms: string[];
  legs: string[];
  offhand: Weapon[];
  cards: string[];
  headSB: string[];
  chestSB: string[];
  armsSB: string[];
  legsSB: string[];
  offhandSB: Weapon[];
  weaponSB: Weapon[];
  cardsSB: string[];
}

export interface Weapon {
  id: string;
  is1H: boolean;
  img?: string;
}

export interface GetLobbyInfoResponse {
  badges: string[];
  amIActive: boolean;
  nameColor: string;
  displayName: string;
  overlayURL: string;
  deck: Deck;
}

export interface DeckResponse {
  deck: string[];
  weapons: Weapon[];
  head: string;
  chest: string;
  arms: string;
  legs: string;
}
