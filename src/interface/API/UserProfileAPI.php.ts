import { MetafyCommunity } from './MetafyAPI.php';

export interface UserProfileAPIResponse {
  userName: string;
  displayName?: string;
  hasCustomDisplayName?: boolean;
  canChangeDisplayName?: boolean;
  nextChangeAllowed?: string | null;
  patreonInfo: string;
  isPatreonLinked: boolean;
  isPatreonSupporter?: boolean;
  isContributor?: boolean;
  isPvtVoidPatron?: boolean;
  rustCounters?: number;
  metafyInfo?: string;
  isMetafyLinked?: boolean;
  isMetafySupporter?: boolean;
  /** True when the stored Metafy token cannot read subscriptions and the user must re-link. */
  metafyNeedsReauth?: boolean;
  metafyCommunities?: MetafyCommunity[];
}

export interface ChangeDisplayNameRequest {
  displayName: string;
}

export interface ChangeDisplayNameResponse {
  status: 'success' | 'error';
  message?: string;
  displayName?: string;
  nextChangeAllowed?: string | null;
}
