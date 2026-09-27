import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bt_user')) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bt_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('bt_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('bt_token');
        localStorage.removeItem('bt_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('bt_token', res.data.token);
    localStorage.setItem('bt_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  // Dedicated admin portal login (POST /api/admin/login). The server only
  // matches role:'admin' accounts, so other roles can never sign in here.
  const adminLogin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    localStorage.setItem('bt_token', res.data.token);
    localStorage.setItem('bt_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const loginWithGoogle = async (credential, loginType) => {
    const res = await api.post('/auth/google', { credential, loginType });
    localStorage.setItem('bt_token', res.data.token);
    localStorage.setItem('bt_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('bt_token', res.data.token);
    localStorage.setItem('bt_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('bt_token');
    localStorage.removeItem('bt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function useAuth() {
  return useContext(AuthContext);
}

export function dashboardPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'recruiter') return '/recruiter';
  return '/candidate';
}
