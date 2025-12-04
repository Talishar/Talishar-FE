import { MetafyCommunity } from './MetafyAPI.php';

export interface UserProfileAPIResponse {
  userName: string;
  patreonInfo: string;
  isPatreonLinked: boolean;
  metafyInfo?: string;
  isMetafyLinked?: boolean;
  metafyCommunities?: MetafyCommunity[];
}

