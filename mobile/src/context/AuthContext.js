import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('blade_token');
        if (token) {
          const { data } = await client.get('/auth/me');
          setUser(data.user);
        }
      } catch (_) {
        await AsyncStorage.removeItem('blade_token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    await AsyncStorage.setItem('blade_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('blade_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
