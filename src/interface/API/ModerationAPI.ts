export const MODERATION_REASONS = [
  'rude',
  'insulting',
  'unsporting',
  'other'
] as const;

export type ModerationReason = (typeof MODERATION_REASONS)[number];

export const MODERATION_REASON_LABEL_KEYS: Record<ModerationReason, string> = {
  rude: 'MODERATION_NOTE.REASON_RUDE',
  insulting: 'MODERATION_NOTE.REASON_INSULTING',
  unsporting: 'MODERATION_NOTE.REASON_UNSPORTING',
  other: 'MODERATION_NOTE.REASON_OTHER'
};

export const PLAYER_REPORT_NOTE_MAX_LENGTH = 500;

export interface SubmitPlayerReportRequest {
  gameName: number | string;
  playerID: number;
  authKey: string;
  reason: ModerationReason | null;
  note: string;
}

export interface PlayerReport {
  reportId: number;
  gameName: string;
  reporterName: string | null;
  reportedName: string;
  reportedHasAccount: boolean;
  reportedIsBanned: boolean;
  reason: ModerationReason | null;
  note: string | null;
  createdAt: string;
  reportCount: number;
}

export interface PlayerReportsResponse {
  status: string;
  days: number;
  reports: PlayerReport[];
}
