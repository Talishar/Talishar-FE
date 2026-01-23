/**
 * Service to fetch guides from Metafy API
 */

export interface MetafyPrice {
  value: number;
  value_in_cents: number;
  currency: string;
}

export interface MetafyGame {
  id: string;
  slug: string;
  title: string;
  poster_image_url?: string;
}

export interface MetafyGuide {
  product_id: string;
  name: string;
  description: string;
  slug: string;
  cover_url: string;
  price: MetafyPrice;
  subscriber_only: boolean;
  id: string;
  published_at: string;
  updated_at: string;
  game: MetafyGame;
  rating?: number;
}

export interface MetafyPagination {
  current_page: number;
  per_page: number;
  total_pages: number;
}

export interface MetafyMeta {
  pagination: MetafyPagination;
}

export interface MetafyGuidesResponse {
  guides: MetafyGuide[];
  meta: MetafyMeta;
}

/**
 * Fetch guides from Metafy API
 * Uses dedicated backend endpoint to handle OAuth
 */
export const fetchMetafyGuides = async (
  page: number = 1,
  perPage: number = 20
): Promise<MetafyGuidesResponse> => {
  try {
    const isProduction = window.location.hostname === 'talishar.net';
    const baseUrl = isProduction 
      ? 'https://legacy.talishar.net/game'
      : '/api';
    
    const url = `${baseUrl}/GetMetafyGuides.php?page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: MetafyGuidesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Metafy guides:', error);
    throw error;
  }
};
