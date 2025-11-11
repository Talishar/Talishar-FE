import React, { useState, useEffect, useRef } from 'react';
import styles from './DeleteUsernameAutocomplete.module.css';
import { useSearchUsernamesQuery } from 'features/api/apiSlice';

interface DeleteUsernameAutocompleteProps {
  value: string;
  onChange: (username: string, email?: string) => void;
  onSelect: (username: string, email: string) => void;
}

const DeleteUsernameAutocomplete: React.FC<DeleteUsernameAutocompleteProps> = ({
  value,
  onChange,
  onSelect
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(value);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Only query if we have at least 2 characters
  const shouldQuery = searchTerm.length >= 2;
  const { data: searchResults } = useSearchUsernamesQuery(searchTerm, {
    skip: !shouldQuery
  });

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setShowSuggestions(true);
    setSelectedEmail(null); // Clear email when typing
  };

  const handleSuggestionClick = (username: string, email: string) => {
    setSearchTerm(username);
    onChange(username);
    setShowSuggestions(false);
    setSelectedEmail(email);
    onSelect(username, email);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = searchResults?.users || [];
  const showDropdown = showSuggestions && searchTerm.length >= 2 && suggestions.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper} ref={suggestionsRef}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type username to search..."
          className={styles.input}
          required
        />
        
        {showDropdown && (
          <div className={styles.suggestionsDropdown}>
            {suggestions.map((user) => (
              <div
                key={user.username}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(user.username, user.email)}
              >
                <div className={styles.suggestionUsername}>{user.username}</div>
                <div className={styles.suggestionEmail}>{user.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEmail && (
        <div className={styles.selectedInfo}>
          <label className={styles.emailLabel}>
            <strong>Associated Email:</strong> {selectedEmail}
          </label>
        </div>
      )}
    </div>
  );
};

export default DeleteUsernameAutocomplete;
