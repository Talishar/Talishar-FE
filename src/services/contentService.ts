/**
 * Service to fetch automated content from Discord
 */
import { BACKEND_URL } from 'appConstants';

export interface DiscordReaction {
  count: number;
  me: boolean;
  emoji: {
    id: string | null; // null for standard unicode emoji
    name: string;
  };
}

export interface DiscordMessage {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  embeds: any[];
  attachments: any[];
  reactions: DiscordReaction[];
}

export interface ContentVideo {
  videoId: string;
  type: 'youtube' | 'twitch' | 'fabinsights' | 'metafy';
  title: string;
  author: string;
  authorAvatar?: string;
  description?: string;
  thumbnail?: string;
  timestamp: string;
  messageUrl: string;
  url?: string;
}

const CONTENT_TTL_MS = 30 * 60 * 1000;

interface CachedContent {
  data: unknown;
  fetchedAt: number;
}

const contentCache = new Map<string, CachedContent>();
const contentRequests = new Map<string, Promise<unknown>>();

const peekContent = <T>(url: string): T | undefined =>
  contentCache.get(url)?.data as T | undefined;

const loadCachedContent = async <T>(
  url: string,
  load: (url: string) => Promise<T | null>,
  fallback: T
): Promise<T> => {
  const cached = contentCache.get(url);
  if (cached && Date.now() - cached.fetchedAt < CONTENT_TTL_MS) {
    return cached.data as T;
  }
  let request = contentRequests.get(url) as Promise<T | null> | undefined;
  if (!request) {
    request = load(url)
      .then((data) => {
        if (data !== null) {
          contentCache.set(url, { data, fetchedAt: Date.now() });
        }
        return data;
      })
      .finally(() => contentRequests.delete(url));
    contentRequests.set(url, request);
  }
  const data = await request;
  if (data !== null) return data;
  return cached ? (cached.data as T) : fallback;
};

const releaseNotesUrl = (maxMessages: number) =>
  `${BACKEND_URL}GetDiscordReleaseNotes.php?maxMessages=${maxMessages}`;

const loadReleaseNotes = async (
  url: string
): Promise<DiscordMessage[] | null> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(
        'Discord fetch failed:',
        response.statusText,
        response.status
      );
      return null;
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    return null;
  }
};

export const peekDiscordReleaseNotes = (maxMessages = 5) =>
  peekContent<DiscordMessage[]>(releaseNotesUrl(maxMessages));

// Discord API - Fetches latest messages from #release-notes channel
export const fetchDiscordReleaseNotes = (
  maxMessages = 5
): Promise<DiscordMessage[]> =>
  loadCachedContent(releaseNotesUrl(maxMessages), loadReleaseNotes, []);

// Combined content feed
export const fetchCommunityContent = async () => {
  try {
    const [discordMessages] = await Promise.all([fetchDiscordReleaseNotes(5)]);

    return {
      discordMessages,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.warn('Error fetching community content:', error);
    return {
      videos: [],
      discordMessages: [],
      lastUpdated: null
    };
  }
};

// Discord Content Carousel - Fetches YouTube videos from #talishar-content channel
export interface ContentCarouselResponse {
  success: boolean;
  count: number;
  videos: ContentVideo[];
}

const contentCarouselUrl = (maxMessages: number) =>
  `${BACKEND_URL}GetDiscordContentCarousel.php?maxMessages=${maxMessages}`;

const loadContentCarousel = async (
  url: string
): Promise<ContentVideo[] | null> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('Content carousel fetch failed:', response.statusText);
      return null;
    }

    const data: ContentCarouselResponse = await response.json();
    return data.videos || [];
  } catch (error) {
    console.warn('Error fetching Discord content carousel:', error);
    return null;
  }
};

export const peekDiscordContentCarousel = (maxMessages = 20) =>
  peekContent<ContentVideo[]>(contentCarouselUrl(maxMessages));

export const fetchDiscordContentCarousel = (
  maxMessages = 20
): Promise<ContentVideo[]> =>
  loadCachedContent(contentCarouselUrl(maxMessages), loadContentCarousel, []);
