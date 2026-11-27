export interface GameInvite {
  fromUserId: number;
  fromName: string;
  gameName: string;
  format: string;
  sentAt: number;
}

export interface GameInviteAPIResponse {
  success?: boolean;
  error?: string;
  invites?: GameInvite[];
}
