import React, { createContext, ReactNode, useContext, useReducer } from 'react';

// Auth State Interface
interface AuthState {
  user: { 
    id: string; 
    name: string; 
    email: string; 
    phone?: string;
    dateOfBirth?: string;
  } | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Location State Interface
interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

// Combined App State
interface AppState {
  auth: AuthState;
  location: LocationState;
}

// Action Types
type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthState['user']; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

type LocationAction = 
  | { type: 'SET_LOCATION'; payload: { latitude: number; longitude: number; address?: string } }
  | { type: 'CLEAR_LOCATION' };

type AppAction = AuthAction | LocationAction;

// Initial State
const initialState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null,
  },
  location: {
    latitude: null,
    longitude: null,
    address: null,
  },
};

// Reducers
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
  switch (action.type) {
    case 'SET_LOCATION':
      return {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        address: action.payload.address || null,
      };
    case 'CLEAR_LOCATION':
      return {
        latitude: null,
        longitude: null,
        address: null,
      };
    default:
      return state;
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  return {
    auth: authReducer(state.auth, action as AuthAction),
    location: locationReducer(state.location, action as LocationAction),
  };
};

// Context
interface AuthContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLocation: (latitude: number, longitude: number, address?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // This will be replaced with actual AuthService call
      // For now, we'll simulate the login logic
      // For demo: accept username 'Juan Manalo' or 'juan@example.com' AND password 'password'
      if ((email === 'Juan Manalo' || email === 'juan@example.com') && password === 'password') {
        const mockUser = {
          id: 'u123',
          name: 'Juan Manalo',
          email: 'juan@example.com',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
        };
        const mockToken = 'mock-jwt-token-123';
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user: mockUser, token: mockToken } 
        });
      } else {
        throw new Error('Invalid credentials. Try again.');
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setLocation = (latitude: number, longitude: number, address?: string) => {
    dispatch({ 
      type: 'SET_LOCATION', 
      payload: { latitude, longitude, address } 
    });
  };

  const value: AuthContextType = {
    state,
    dispatch,
    login,
    logout,
    clearError,
    setLocation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

