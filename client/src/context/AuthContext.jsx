import { createContext, useContext, useEffect, useState } from 'react';
import { setAccessToken, registerAuthFailureHandler } from '../api/tokenStore';
import { loginUser, registerUser, logoutUser, refreshSession, getCurrentUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // On first load, try to silently restore a session using the httpOnly
  // refresh cookie (if the user was previously logged in and it's still valid).
  useEffect(() => {
    registerAuthFailureHandler(() => {
      setUser(null);
      setAccessToken(null);
    });

    async function restoreSession() {
      try {
        const { accessToken } = await refreshSession();
        setAccessToken(accessToken);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setInitializing(false);
      }
    }

    restoreSession();
  }, []);

  async function login(username, password) {
    const data = await loginUser(username, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function register(username, email, password) {
    const data = await registerUser(username, email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
