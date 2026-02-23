/**
 * Service to fetch guides from Metafy API
 */
import { BACKEND_URL } from 'appConstants';

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
    const url = `${BACKEND_URL}GetMetafyGuides.php?page=${page}&per_page=${perPage}`;
    console.log('[Metafy Service] Fetching from:', url);
    
    const response = await fetch(url);
    console.log('[Metafy Service] Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: MetafyGuidesResponse = await response.json();
    console.log('[Metafy Service] Full Response data:', JSON.stringify(data, null, 2));
    console.log('[Metafy Service] Debug info:', (data as any)._debug);
    console.log('[Metafy Service] Guides count:', data.guides?.length ?? 0);
    console.log('[Metafy Service] Total pages:', data.meta?.pagination?.total_pages ?? 'unknown');
    if (data.guides && data.guides.length > 0) {
      console.log('[Metafy Service] First guide:', data.guides[0]);
    }
    
    return data;
  } catch (error) {
    console.error('[Metafy Service] Error fetching guides:', error);
    throw error;
  }
};
