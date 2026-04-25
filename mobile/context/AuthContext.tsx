import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthTokens } from '../types';
import { apiService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const hasToken = await apiService.hasValidToken();

      if (hasToken) {
        const response = await apiService.getMe();
        dispatch({ type: 'SET_USER', payload: response.user });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error: any) {
      // Token invalid or expired
      await apiService.clearTokens();
      dispatch({ type: 'SET_USER', payload: null });
    }
  }

  async function login(email: string, password: string) {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiService.login(email, password);
      await apiService.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }

  async function register(data: any) {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiService.register(data);
      await apiService.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }

  async function logout() {
    try {
      await apiService.logout();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }

  function clearError() {
    dispatch({ type: 'SET_ERROR', payload: null });
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
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
