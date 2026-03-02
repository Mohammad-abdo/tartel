import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { setAuthToken, removeAuthToken, setUser, getUser, getAuthToken } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const savedUser = getUser();
    
    if (token && savedUser) {
      setUserState(savedUser);
      setLoading(false);
      // Verify token is still valid in the background
      authAPI.getProfile()
        .then((response) => {
          const user = normalizeUser(response.data);
          setUserState(user);
          setUser(user);
        })
        .catch((error) => {
          // Only clear if it's a 401 (unauthorized), not other errors
          if (error.response?.status === 401) {
            removeAuthToken();
            setUserState(null);
          }
        });
    } else {
      setLoading(false);
    }
  }, []);

  const normalizeUser = (user) => {
    if (!user) return user;
    if (user.name) return user;
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return { ...user, name: name || user.email, permissions: user.permissions ?? [] };
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { accessToken, user: rawUser } = response.data ?? response ?? {};
      
      if (!accessToken || !rawUser) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
      
      const user = normalizeUser(rawUser);
      setAuthToken(accessToken);
      setUser(user);
      setUserState(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = () => {
    removeAuthToken();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

