export default interface GameStaticInfo {
  gameID: number;
  playerID: number;
  authKey: string;
  isPrivate: boolean;
  roguelikeGameID?: number;
  altArts?: any[]; // TODO: what is this
}
