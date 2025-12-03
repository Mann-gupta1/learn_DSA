import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';

export function useAuthInit() {
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      // Try to fetch user data
      apiService
        .getMe()
        .then((response) => {
          setUser(response.user as any);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        });
    }
  }, [setUser, setToken]);
}

