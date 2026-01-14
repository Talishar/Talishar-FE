export interface Friend {
  friendUserId: number;
  username: string;
  nickname?: string;
  isPatron?: boolean;
  isPvtVoidPatron?: boolean;
  isContributor?: boolean;
  metafyTiers?: string[];
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
  isPatron?: boolean;
  isPvtVoidPatron?: boolean;
  isContributor?: boolean;
  metafyTiers?: string[];
}

export interface SentFriendRequest {
  friendshipId: number;
  recipientUserId: number;
  recipientUsername: string;
  createdAt: string;
  isPatron?: boolean;
  isPvtVoidPatron?: boolean;
  isContributor?: boolean;
  metafyTiers?: string[];
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

