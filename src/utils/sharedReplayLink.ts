import { BACKEND_URL } from 'appConstants';
import { ShareReplayResponse } from 'interface/API/ShareReplayAPI';

export const sharedReplayLink = (result: ShareReplayResponse): string =>
  result.url ??
  new URL(
    `${BACKEND_URL}APIs/SharedReplayPreview.php?token=${result.token}`,
    window.location.origin
  ).toString();
