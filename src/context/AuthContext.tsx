import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  profileImage?: string;
  isBlocked?: boolean;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  updateProfile: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch profile if we have a JWT token (user was previously logged in)
    const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('jwt='));
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setUser(data.user);
    } catch (err: any) {
      console.log('AuthContext: Profile fetch failed (user not logged in or token expired)', err);
      // Clear invalid token and user data
      if (err.response?.status === 401) {
        // Clear the invalid JWT cookie
        document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // Clear user state
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/login', credentials);
      setUser(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData: any) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/register', userData);
      if (data.isActive === false) {
        throw new Error(data.message);
      }
      setUser(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
      throw err;
    }
  };

  const updateProfile = async (userData: any) => {
    try {
      setError(null);
      const { data } = await api.put('/profile', userData);
      setUser(data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Profile update failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
