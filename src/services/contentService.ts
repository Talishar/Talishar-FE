/**
 * Service to fetch automated content from Discord
 */

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
    // Call backend endpoint through Vite proxy (configured for /api path)
    const url = `/api/GetDiscordReleaseNotes.php?maxMessages=${maxMessages}`;
    console.log('Fetching Discord notes from:', url);
    
    const response = await fetch(url);
    const text = await response.text();
    
    if (!response.ok) {
      console.warn('Discord fetch failed:', response.statusText, response.status);
      console.warn('Response text:', text);
      return [];
    }
    
    try {
      const data = JSON.parse(text);
      console.log('Discord response:', data);
      return data.messages || [];
    } catch (parseError) {
      console.error('Failed to parse Discord response. Raw text:', text);
      return [];
    }
  } catch (error) {
    console.error('Error fetching Discord messages:', error);
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
    const url = `/api/GetDiscordContentCarousel.php?maxMessages=${maxMessages}`;
    const response = await fetch(url);
    const text = await response.text();
    
    if (!response.ok) {
      console.warn('Content carousel fetch failed:', response.statusText);
      console.warn('Response text:', text);
      return [];
    }
    
    try {
      const data: ContentCarouselResponse = JSON.parse(text);
      return data.videos || [];
    } catch (parseError) {
      console.error('Failed to parse carousel response. Raw text:', text);
      return [];
    }
  } catch (error) {
    console.warn('Error fetching Discord content carousel:', error);
    return [];
  }
};
