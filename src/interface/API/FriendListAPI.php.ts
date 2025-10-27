export interface Friend {
  friendUserId: number;
  username: string;
}

export interface User {
  usersId: number;
  username: string;
}

export interface FriendRequest {
  friendshipId: number;
  requesterUserId: number;
  requesterUsername: string;
  createdAt: string;
}

export interface SentFriendRequest {
  friendshipId: number;
  recipientUserId: number;
  recipientUsername: string;
  createdAt: string;
}

export interface FriendListAPIResponse {
  success?: boolean;
  error?: string;
  message?: string;
  friends?: Friend[];
  friend?: User;
  users?: User[];
  requests?: FriendRequest[];
  sentRequests?: SentFriendRequest[];
}
