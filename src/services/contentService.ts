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
    // Determine API URL - try to get backend URL from window location or use environment variable
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/GetDiscordReleaseNotes.php?maxMessages=${maxMessages}`;
    console.log('Fetching Discord notes from:', url);
    
    const response = await fetch(url);
    const text = await response.text();
    
    if (!response.ok) {
      console.warn('Discord fetch failed:', response.statusText, response.status);
      console.warn('Response text:', text.substring(0, 200));
      return [];
    }
    
    try {
      const data = JSON.parse(text);
      console.log('Discord response:', data);
      return data.messages || [];
    } catch (parseError) {
      console.error('Failed to parse Discord response. Raw text:', text.substring(0, 200));
      return [];
    }
  } catch (error) {
    console.error('Error fetching Discord messages:', error);
    return [];
  }
};

// Helper function to determine backend URL
function getBackendUrl(): string {
  // On production: use same domain with /game/ path
  // On dev: use localhost:8080
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Get the current domain and use /game/ as the backend
    const currentUrl = new URL(window.location.href);
    return `${currentUrl.protocol}//${currentUrl.host}/game`;
  } else {
    // Development: use Vite proxy /api/ path
    return '/api';
  }
}

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
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/GetDiscordContentCarousel.php?maxMessages=${maxMessages}`;
    const response = await fetch(url);
    const text = await response.text();
    
    if (!response.ok) {
      console.warn('Content carousel fetch failed:', response.statusText);
      console.warn('Response text:', text.substring(0, 200));
      return [];
    }
    
    try {
      const data: ContentCarouselResponse = JSON.parse(text);
      return data.videos || [];
    } catch (parseError) {
      console.error('Failed to parse carousel response. Raw text:', text.substring(0, 200));
      return [];
    }
  } catch (error) {
    console.warn('Error fetching Discord content carousel:', error);
    return [];
  }
};
