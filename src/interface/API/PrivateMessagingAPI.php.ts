export interface PrivateMessage {
  messageId: number;
  fromUserId: number;
  fromUsername: string;
  toUserId: number;
  toUsername: string;
  message: string;
  gameLink?: string;
  createdAt: string;
  isRead: boolean;
}

export interface OnlineFriend {
  userId: number;
  username: string;
  nickname?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface PrivateMessagingAPIResponse {
  success?: boolean;
  error?: string;
  message?: string;
  messages?: PrivateMessage[];
  onlineFriends?: OnlineFriend[];
  unreadCount?: number;
  unreadByFriend?: { [friendUserId: number]: number };
}

export interface SendMessageRequest {
  action: 'sendMessage';
  toUserId: number;
  message: string;
  gameLink?: string;
}

export interface GetMessagesRequest {
  action: 'getMessages';
  friendUserId: number;
  limit?: number;
}

export interface MarkAsReadRequest {
  action: 'markAsRead';
  messageIds: number[];
}

export interface GetOnlineFriendsRequest {
  action: 'getOnlineFriends';
}
