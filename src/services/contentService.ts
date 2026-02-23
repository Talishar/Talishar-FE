/**
 * Service to fetch automated content from Discord
 */
import { BACKEND_URL } from 'appConstants';

export interface DiscordMessage {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  embeds: any[];
  attachments: any[];
  reactions: any[];
}

export interface ContentVideo {
  videoId: string;
  type: 'youtube' | 'twitch' | 'fabinsights';
  title: string;
  author: string;
  authorAvatar?: string;
  description?: string;
  thumbnail?: string;
  timestamp: string;
  messageUrl: string;
}

// Discord API - Fetches latest messages from #release-notes channel
export const fetchDiscordReleaseNotes = async (maxMessages: number = 5): Promise<DiscordMessage[]> => {
  try {
    const url = `${BACKEND_URL}GetDiscordReleaseNotes.php?maxMessages=${maxMessages}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Discord fetch failed:', response.statusText, response.status);
      return [];
    }
    
    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    return [];
  }
};

// Combined content feed
export const fetchCommunityContent = async () => {
  try {
    const [discordMessages] = await Promise.all([
      fetchDiscordReleaseNotes(5)
    ]);

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

export const fetchDiscordContentCarousel = async (maxMessages: number = 20): Promise<ContentVideo[]> => {
  try {
    const url = `${BACKEND_URL}GetDiscordContentCarousel.php?maxMessages=${maxMessages}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Content carousel fetch failed:', response.statusText);
      return [];
    }
    
    const data: ContentCarouselResponse = await response.json();
    return data.videos || [];
  } catch (error) {
    console.warn('Error fetching Discord content carousel:', error);
    return [];
  }
};
