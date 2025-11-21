import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  login as apiLogin, 
  register as apiRegister, 
  getProfile as apiGetProfile 
} from '../services/api';

/**
 * Contexto de Autenticación para ImpreIdeas
 * Maneja el estado global de autenticación en toda la aplicación
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Verificar que el token siga siendo válido
          try {
            const profileData = await apiGetProfile(savedToken);
            setUser(profileData.user);
          } catch (err) {
            // Token inválido o expirado, limpiar datos
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error al cargar usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Iniciar sesión
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiLogin(email, password);
      
      // FastAPI devuelve { access_token, token_type }
      const accessToken = response.access_token || response.token?.access_token;
      
      if (!accessToken) {
        throw new Error('No se recibió el token de acceso');
      }

      // Guardar token temporalmente
      setToken(accessToken);
      localStorage.setItem('token', accessToken);

      // Obtener datos del usuario con el token
      const profileData = await apiGetProfile(accessToken);
      const userData = profileData.user || profileData;

      // Guardar usuario en estado y localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar nuevo usuario
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Registrar usuario (FastAPI no devuelve token en registro)
      const response = await apiRegister(userData);
      const newUser = response.user || response;

      // Hacer login automático después del registro
      const loginResponse = await apiLogin(userData.email, userData.password);
      const accessToken = loginResponse.access_token;

      if (accessToken) {
        // Obtener perfil completo
        const profileData = await apiGetProfile(accessToken);
        const fullUserData = profileData.user || profileData;

        // Guardar en estado
        setUser(fullUserData);
        setToken(accessToken);

        // Guardar en localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(fullUserData));

        return { success: true, user: fullUserData };
      }

      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.message || 'Error al registrar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    // Limpiar estado
    setUser(null);
    setToken(null);
    setError(null);

    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
  };

  /**
   * Actualizar datos del usuario
   */
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  /**
   * Verificar si el usuario está autenticado
   */
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;