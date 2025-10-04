/**
 * API Client for ANTA Mobile
 * HTTP client with automatic token refresh
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from './api.config';
import storageService from './storage.service';
import { ApiResponse, ApiError } from '../types/api.types';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for auth and error handling
   */
  private setupInterceptors() {
    // Request interceptor - Add token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await storageService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Add request to queue
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await storageService.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            // Call refresh endpoint
            const response = await axios.post(
              `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
              { refreshToken }
            );

            const { accessToken } = response.data.data;
            await storageService.setAccessToken(accessToken);

            // Process queue
            this.failedQueue.forEach((prom) => prom.resolve(accessToken));
            this.failedQueue = [];

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            this.failedQueue.forEach((prom) => prom.reject(refreshError));
            this.failedQueue = [];
            await storageService.clearAuth();
            throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error
      const data = error.response.data as any;
      return new ApiError(
        error.response.status,
        data.error?.code || 'API_ERROR',
        data.error?.message || error.message,
        data.error?.details
      );
    } else if (error.request) {
      // Request made but no response
      return new ApiError(0, 'NETWORK_ERROR', 'Network error. Please check your connection.');
    } else {
      // Something else happened
      return new ApiError(0, 'UNKNOWN_ERROR', error.message);
    }
  }

  /**
   * Make GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw new ApiError(
        500,
        response.data.error?.code || 'API_ERROR',
        response.data.error?.message || 'Request failed',
        response.data.error?.details
      );
    }
    return response.data.data as T;
  }

  /**
   * Make POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new ApiError(
        500,
        response.data.error?.code || 'API_ERROR',
        response.data.error?.message || 'Request failed',
        response.data.error?.details
      );
    }
    return response.data.data as T;
  }

  /**
   * Make PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new ApiError(
        500,
        response.data.error?.code || 'API_ERROR',
        response.data.error?.message || 'Request failed',
        response.data.error?.details
      );
    }
    return response.data.data as T;
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new ApiError(
        500,
        response.data.error?.code || 'API_ERROR',
        response.data.error?.message || 'Request failed',
        response.data.error?.details
      );
    }
    return response.data.data as T;
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw new ApiError(
        500,
        response.data.error?.code || 'API_ERROR',
        response.data.error?.message || 'Request failed',
        response.data.error?.details
      );
    }
    return response.data.data as T;
  }
}

export default new ApiClient();
