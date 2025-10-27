export interface BlockedUser {
  blockedUserId: number;
  username: string;
}

export interface BlockedUserResponse {
  usersId: number;
  username: string;
}

export interface BlockedUsersAPIResponse {
  success?: boolean;
  error?: string;
  message?: string;
  blockedUsers?: BlockedUser[];
  blockedUser?: BlockedUserResponse;
}
