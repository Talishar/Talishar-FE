import { useState, useEffect } from 'react';

export const useBlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('APIs/BlockedUsersAPI.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getBlockedUsers' })
      });
      
      // Handle error statuses silently
      if (!response.ok) {
        setBlockedUsers([]);
        setError(null);
        return;
      }
      
      const data = await response.json();
      
      if (data && data.blockedUsers && Array.isArray(data.blockedUsers)) {
        setBlockedUsers(data.blockedUsers.map((u: any) => u.username));
        setError(null);
      } else {
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