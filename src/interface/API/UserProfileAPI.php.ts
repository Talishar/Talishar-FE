import { MetafyCommunity } from './MetafyAPI.php';

export interface UserProfileAPIResponse {
  userName: string;
  patreonInfo: string;
  isPatreonLinked: boolean;
  isPatreonSupporter?: boolean;
  isContributor?: boolean;
  isPvtVoidPatron?: boolean;
  rustCounters?: number;
  metafyInfo?: string;
  isMetafyLinked?: boolean;
  isMetafySupporter?: boolean;
  metafyCommunities?: MetafyCommunity[];
}
