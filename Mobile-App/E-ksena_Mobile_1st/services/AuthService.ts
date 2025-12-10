// Mock AuthService for E-KSENA Emergency Response App
// This file contains placeholder functions that simulate backend API calls

const API_BASE_URL = 'https://api.eksena.com/v1'; // Placeholder URL

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
}

// Mock login function
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  // [Backend Space]: Implement actual API POST call to ${API_BASE_URL}/auth/login
  console.log(`[BACKEND MOCK] Logging in user: ${email}`);
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock authentication logic - accept "Juan Manalo" as specified in requirements
  if (email === 'Juan Manalo' || email === 'juan@example.com') {
    return {
      success: true,
      user: {
        id: 'u123',
        name: 'Juan Manalo',
        email: 'juan@example.com',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
      },
      token: 'mock-jwt-token-123',
    };
  } else {
    throw new Error('Invalid credentials. Please use "Juan Manalo" as username.');
  }
};

// Mock registration function
export const register = async (
  name: string, 
  email: string, 
  password: string, 
  phone: string, 
  dateOfBirth: string
): Promise<RegisterResponse> => {
  // [Backend Space]: Implement actual API POST call to ${API_BASE_URL}/auth/register
  console.log(`[BACKEND MOCK] Registering user: ${email}`);
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock registration - always return success for demo purposes
  return {
    success: true,
    message: 'Registration successful. Verification code sent to your email.',
  };
};

// Mock verification function
export const verifyAccount = async (email: string, code: string): Promise<VerifyResponse> => {
  // [Backend Space]: Implement actual API POST call to ${API_BASE_URL}/auth/verify
  console.log(`[BACKEND MOCK] Verifying code ${code} for ${email}`);
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock verification - accept "123456" as specified in requirements
  if (code === '123456') {
    return {
      success: true,
      message: 'Account verified successfully.',
    };
  } else {
    throw new Error('Invalid verification code. Please use "123456" for testing.');
  }
};

// Mock logout function
export const logout = async (): Promise<void> => {
  // [Backend Space]: Implement actual API POST call to ${API_BASE_URL}/auth/logout
  console.log('[BACKEND MOCK] Logging out user');
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock logout - always successful
  return;
};

// Mock update profile function
export const updateProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  // [Backend Space]: Implement actual API PUT call to ${API_BASE_URL}/users/${userId}
  console.log(`[BACKEND MOCK] Updating profile for user: ${userId}`);
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock profile update
  return {
    id: userId,
    name: updates.name || 'Juan Manalo',
    email: updates.email || 'juan@example.com',
    phone: updates.phone || '+1234567890',
    dateOfBirth: updates.dateOfBirth || '1990-01-01',
  };
};

