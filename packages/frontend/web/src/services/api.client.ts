/**
 * API Client for ANTA Admin Dashboard
 * HTTP client with automatic token management
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - Clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const data = error.response.data as { error?: { message?: string } };
      return new Error(data.error?.message || error.message);
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message);
    }
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data;
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data;
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data;
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data;
  }

  // Get response with pagination
  async getPaginated<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<{ data: T; pagination: Record<string, unknown> }> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return {
      data: response.data.data,
      pagination: response.data.pagination || {},
    };
  }
}

export default new ApiClient();
