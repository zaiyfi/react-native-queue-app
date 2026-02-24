import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For USB debugging: Run `adb reverse tcp:5000 tcp:5000` on your computer
// For WiFi debugging: Use your computer's IP address (e.g., 'http://192.168.1.x:5000')
const BASE_URL = 'http://10.0.2.2:5000';
const API_URL = `${BASE_URL}/api/auth`;

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    _id: string;
    email: string;
    role?: string;
  };
  message?: string;
}

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });

    if (response.data.token) {
      // Store token and user info
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
      };
    }

    return { success: false, message: 'Login failed' };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
    };
  }
};

export const signup = async (
  email: string,
  password: string,
  role: string = 'user',
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      email,
      password,
      role,
    });

    if (response.data._id) {
      return { success: true, message: 'User created successfully' };
    }

    return { success: false, message: 'Signup failed' };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Signup failed',
    };
  }
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const getStoredAuth = async (): Promise<{
  token: string | null;
  user: any;
}> => {
  const token = await AsyncStorage.getItem('token');
  const userStr = await AsyncStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

// Seed admin user (for development)
export const seedAdmin = async (): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/seed-admin`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to seed admin',
    };
  }
};
