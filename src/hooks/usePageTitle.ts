import { useEffect } from 'react';

/**
 * Custom hook to update the page title for OBS scene switching
 * @param title - The page-specific title (e.g., "Lobby", "In Game", "Profile")
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `Talishar - ${title}`;
  }, [title]);
};
