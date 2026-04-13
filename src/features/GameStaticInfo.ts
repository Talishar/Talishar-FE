export default interface GameStaticInfo {
  gameID: number;
  gameGUID?: string;
  playerID: number;
  authKey: string;
  isPrivateLobby: boolean;
  isPrivate?: boolean;
  isReplay?: boolean;
  roguelikeGameID?: number;
  altArts?: AltArt[];
  opponentAltArts?: AltArt[];
  isRoguelike?: boolean;
  isOpponentAI?: boolean;
  gameFormat?: string;
  heroName?: string;
  yourHeroCardNumber?: string;
  opponentHeroName?: string;
  opponentHeroCardNumber?: string;
  hasShownHeroIntro?: boolean;
  /** FaB Bazaar public deck ID when the player joined with a Bazaar deck */
  bazaarDeckId?: string;
}

export interface AltArt {
  name: string;
  cardId: string;
  altPath: string;
}
