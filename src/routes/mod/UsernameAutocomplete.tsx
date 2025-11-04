import React, { useState, useRef, useEffect } from 'react';
import { useSearchUsersQuery } from 'features/api/apiSlice';
import styles from './ModPage.module.css';

interface UsernameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (username: string) => void;
  placeholder?: string;
  inputId?: string;
  label?: string;
}

const UsernameAutocomplete: React.FC<UsernameAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search for a username...',
  inputId = 'username-input',
  label
}) => {
  const [showResults, setShowResults] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Search users with debouncing
  const shouldSearch = debouncedSearchTerm.length >= 2;
  const {
    data: searchResults,
    isLoading: searchLoading
  } = useSearchUsersQuery(
    { searchTerm: debouncedSearchTerm, limit: 10 },
    { skip: !shouldSearch }
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setShowResults(value.length >= 2);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (username: string) => {
    onChange(username);
    setShowResults(false);
    if (onSelect) {
      onSelect(username);
    }
  };

  return (
    <div className={styles.autocompleteContainer} ref={containerRef}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        type="text"
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.autocompleteInput}
        onFocus={() => value.length >= 2 && setShowResults(true)}
      />

      {/* Search Results Dropdown */}
      {showResults && (
        <div className={styles.autocompleteResults}>
          {searchLoading && <p className={styles.loadingText}>Searching...</p>}
          {!searchLoading && searchResults?.users && searchResults.users.length > 0 ? (
            <ul className={styles.resultsList}>
              {searchResults.users.map((user) => (
                <li key={user.usersId} className={styles.resultItem}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(user.username)}
                    className={styles.resultButton}
                  >
                    {user.username}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !searchLoading && debouncedSearchTerm.length >= 2 && (
              <p className={styles.noResults}>No users found</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default UsernameAutocomplete;
