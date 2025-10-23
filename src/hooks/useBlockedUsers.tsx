import { useState, useEffect } from 'react';

export const useBlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('includes/GetBlockedUsers.php');
      
      // Handle 404 and other error statuses silently
      if (!response.ok) {
        setBlockedUsers([]);
        setError(null);
        return;
      }
      
      const text = await response.text();
      
      // Check if response is empty
      if (!text || text.trim() === '') {
        setBlockedUsers([]);
        setError(null);
        return;
      }
      
      // Check if response is HTML (error/redirect page)
      if (text.trim().startsWith('<') || text.trim().startsWith('<!DOCTYPE')) {
        setBlockedUsers([]);
        setError(null);
        return;
      }
      
      try {
        const data = JSON.parse(text);
        setBlockedUsers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (parseErr) {
        setBlockedUsers([]);
        setError(null);
      }
    } catch (err) {
      setBlockedUsers([]);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  return {
    blockedUsers,
    isLoading,
    error,
    refetch: fetchBlockedUsers
  };
};