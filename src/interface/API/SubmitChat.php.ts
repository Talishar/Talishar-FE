export interface SubmitChatAPI {
  gameName: number;
  playerID: number;
  authKey: string;
  chatText?: string;
  quickChat?: string;
}
