import { ModerationReason } from './ModerationAPI';

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

export const BLOCK_NOTE_MAX_LENGTH = 300;

export interface BlockReportNote {
  reason: ModerationReason | null;
  note: string | null;
  blockedBy: string;
  createdAt: string;
}

export interface BlockReportPlayer {
  usersId: number;
  username: string;
  displayName: string;
  isBanned: boolean;
  blockCount: number;
  reasonCounts: Record<ModerationReason, number>;
  lastBlockedAt: string;
  notes: BlockReportNote[];
}

export interface BlockReportsResponse {
  status: string;
  days: number;
  minBlocks: number;
  players: BlockReportPlayer[];
}
