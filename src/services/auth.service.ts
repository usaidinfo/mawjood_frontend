/**
 * Auth Service
 * Handles all authentication-related API calls
 */

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { AxiosError } from 'axios';

// Types
export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: 'BUSINESS_OWNER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
    isNewUser?: boolean;
    needsPhoneUpdate?: boolean;
    provider?: SocialProvider;
  };
}

// RegisterData and LoginData removed - using unified OTP flow
export interface OTPRequestData {
  email?: string;
  phone?: string;
  firstName?: string; // Optional for new users
  lastName?: string; // Optional for new users
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data: {
    email?: string;
    phone?: string;
    isNewUser: boolean;
  };
}

export interface OTPVerifyData {
  email?: string;
  phone?: string;
  otp: string;
}

export type SocialProvider = 'google' | 'facebook';

export interface SocialLoginPayload {
  provider: SocialProvider;
  token: string;
  phone?: string; // Required for new users
}

// Error handler
const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

// Auth Service
export const authService = {
  /**
   * Social login/register (unified flow)
   */
  async socialLogin(data: SocialLoginPayload): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN_SOCIAL,
        data
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Send OTP to email (unified login/signup - auto-creates if doesn't exist)
   */
  async sendEmailOTP(data: OTPRequestData): Promise<OTPResponse> {
    try {
      const response = await axiosInstance.post<OTPResponse>(API_ENDPOINTS.AUTH.SEND_EMAIL_OTP, data);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Send OTP to phone (unified login/signup - auto-creates if doesn't exist, static OTP 12345)
   */
  async sendPhoneOTP(data: OTPRequestData): Promise<OTPResponse> {
    try {
      const response = await axiosInstance.post<OTPResponse>(API_ENDPOINTS.AUTH.SEND_PHONE_OTP, data);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Verify email OTP and login
   */
  async verifyEmailOTP(data: OTPVerifyData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN_OTP_EMAIL,
        data
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Verify phone OTP and login
   */
  async verifyPhoneOTP(data: OTPVerifyData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN_OTP_PHONE,
        data
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ success: boolean; message: string; data: User }> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};