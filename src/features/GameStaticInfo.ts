export default interface GameStaticInfo {
  gameID: number;
  gameGUID?: string;
  playerID: number;
  authKey: string;
  isPrivateLobby: boolean;
  isPrivate?: boolean;
  roguelikeGameID?: number;
  altArts?: AltArt[];
  isRoguelike?: boolean;
  isOpponentAI?: boolean;
  heroName?: string;
  yourHeroCardNumber?: string;
  opponentHeroName?: string;
  opponentHeroCardNumber?: string;
  hasShownHeroIntro?: boolean;
}

export interface AltArt {
  name: string;
  cardId: string;
  altPath: string;
}
