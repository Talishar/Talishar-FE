export interface GetLobbyInfo {
  gameName?: number;
  playerID?: number;
  authKey?: string;
}

export interface Deck {
  heroName: string;
  hero: string;
  weapons?: Weapon[];
  head: string[];
  chest: string[];
  arms: string[];
  legs: string[];
  offhand?: Weapon[];
  cards: string[];
  hands: Weapon[];
  headSB: string[];
  chestSB: string[];
  armsSB: string[];
  legsSB: string[];
  offhandSB?: Weapon[];
  weaponSB?: Weapon[];
  cardsSB: string[];
  quiver?: Weapon[];
  quiverSB?: Weapon[];
  handsSB: Weapon[];
  demiHero?: string[];
  modular?: string[];
  cardDictionary?: CardData[];
}

export interface Weapon {
  id: string;
  is1H: boolean;
  img?: string;
  numHands?: number;
  isQuiver?: boolean;
}

export interface CardData {
  id:string;
  pitch:number;
}

export interface GetLobbyInfoResponse {
  badges: string[];
  amIActive: boolean;
  nameColor: string;
  displayName: string;
  overlayURL: string;
  deck: Deck;
  format: string;
}

export interface DeckResponse {
  deck: string[];
  weapons: Weapon[];
  head: string;
  chest: string;
  arms: string;
  legs: string;
  inventory?: string[];
}
