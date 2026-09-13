import { createContext, useContext, useState, useEffect } from 'react';
import { loginRequest, signupRequest, logoutRequest, getMeRequest } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await getMeRequest();
        if (res.success) {
          setUser(res.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    const res = await loginRequest(credentials);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  const signup = async (userData) => {
    const res = await signupRequest(userData);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);