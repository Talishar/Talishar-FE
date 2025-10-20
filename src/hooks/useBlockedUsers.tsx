import { useState, useEffect } from 'react';

export const useBlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('includes/GetBlockedUsers.php');
      const data = await response.json();
      setBlockedUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
      setError('Failed to fetch blocked users');
      setBlockedUsers([]);
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