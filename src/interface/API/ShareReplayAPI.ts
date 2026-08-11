export interface ShareReplayAPI {
  replayNumber: number;
}

export interface ShareReplayResponse {
  success?: boolean;
  token?: string;
  error?: string;
}

export interface LoadSharedReplayAPI {
  shareToken: string;
}

export interface LoadSharedReplayResponse {
  success?: boolean;
  gameName?: number;
  playerID?: number;
  authKey?: string;
  message?: string;
  error?: string;
}
