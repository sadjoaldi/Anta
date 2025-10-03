/**
 * Standardized API response format
 */
export class ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };

  constructor(success: boolean, data?: T, error?: any, meta?: any) {
    this.success = success;
    if (data !== undefined) this.data = data;
    if (error) this.error = error;
    if (meta) this.meta = meta;
  }

  static success<T>(data: T, meta?: any): ApiResponse<T> {
    return new ApiResponse(true, data, undefined, meta);
  }

  static error(code: string, message: string, details?: any): ApiResponse {
    return new ApiResponse(false, undefined, { code, message, details });
  }

  static paginated<T>(data: T[], page: number, limit: number, total: number): ApiResponse<T[]> {
    return new ApiResponse(true, data, undefined, { page, limit, total });
  }
}
