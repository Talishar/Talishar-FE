import { useEffect, useMemo, useState } from 'react';
import { useSearchUsersQuery } from 'features/api/apiSlice';

const MINIMUM_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

export const useUserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearchTerm(searchTerm),
      SEARCH_DEBOUNCE_MS
    );

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const showSearchResults = debouncedSearchTerm.length >= MINIMUM_SEARCH_LENGTH;
  const { data, isLoading } = useSearchUsersQuery(
    { searchTerm: debouncedSearchTerm, limit: 10 },
    { skip: !showSearchResults }
  );

  const users = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLocaleLowerCase();

    return [...(data?.users ?? [])].sort((a, b) => {
      const aExact = a.username.toLocaleLowerCase() === normalizedSearchTerm;
      const bExact = b.username.toLocaleLowerCase() === normalizedSearchTerm;

      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;
      return 0;
    });
  }, [data?.users, searchTerm]);

  const resetSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    showSearchResults,
    users,
    isLoading,
    resetSearch
  };
};
