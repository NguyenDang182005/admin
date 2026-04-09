import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: '/api/admin',
  timeout: 10000,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userInfo = localStorage.getItem('admin_user');
    
    if (token && userInfo) {
      try {
        setUser(JSON.parse(userInfo));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, email: userEmail, role, fullName, userId } = response.data;
    
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify({ email: userEmail, role, fullName, userId }));
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ email: userEmail, role, fullName, userId });
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}