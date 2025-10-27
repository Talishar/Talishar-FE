export interface OffensiveUser {
  usersId: number;
  username: string;
  matchedPattern: string;
}

export interface UsernamesModerationResponse {
  status: string;
  offensiveUsers: OffensiveUser[];
  totalFound: number;
}

export interface BanOffensiveUsernameRequest {
  username: string;
}
