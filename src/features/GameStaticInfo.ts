export default interface GameStaticInfo {
  gameID: number;
  playerID: number;
  authKey: string;
  isPrivate: boolean;
  roguelikeGameID?: number;
  altArts?: AltArt[];
  isRoguelike?: boolean;
}

export interface AltArt {
  name: string;
  cardId: string;
  altPath: string;
}
