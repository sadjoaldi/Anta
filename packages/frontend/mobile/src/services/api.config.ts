/**
 * API Configuration for ANTA Mobile
 */

// API Base URL - configurable via environment variable
// Physical device: use your computer's local IP address
// Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:4000/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Health
  health: "/health",

  // Auth
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
    changePassword: "/auth/change-password",
  },

  // Users
  users: {
    base: "/users",
    byId: (id: number) => `/users/${id}`,
    byPhone: (phone: string) => `/users/phone/${encodeURIComponent(phone)}`,
    byEmail: (email: string) => `/users/email/${encodeURIComponent(email)}`,
  },

  // Drivers
  drivers: {
    base: "/drivers",
    byId: (id: number) => `/drivers/${id}`,
    byUserId: (userId: number) => `/drivers/user/${userId}`,
    online: "/drivers/online",
    byStatus: (status: string) => `/drivers/status/${status}`,
    updateStatus: (id: number) => `/drivers/${id}/status`,
    updateRating: (id: number) => `/drivers/${id}/rating`,
  },

  // Trips
  trips: {
    base: "/trips",
    byId: (id: number) => `/trips/${id}`,
    byPassenger: (passengerId: number) => `/trips/passenger/${passengerId}`,
    byDriver: (driverId: number) => `/trips/driver/${driverId}`,
    byStatus: (status: string) => `/trips/status/${status}`,
    pending: "/trips/pending",
    userHistory: (userId: number) => `/trips/user/${userId}/history`,
    details: (id: number) => `/trips/${id}/details`,
    assign: (id: number) => `/trips/${id}/assign`,
    complete: (id: number) => `/trips/${id}/complete`,
    cancel: (id: number) => `/trips/${id}/cancel`,
  },

  // Vehicles
  vehicles: {
    base: "/vehicles",
    byId: (id: number) => `/vehicles/${id}`,
    byDriver: (driverId: number) => `/vehicles/driver/${driverId}`,
  },

  // Payments
  payments: {
    base: "/payments",
    byId: (id: number) => `/payments/${id}`,
    byTrip: (tripId: number) => `/payments/trip/${tripId}`,
  },

  // Geocoding & Directions
  geocoding: {
    search: "/geocoding/search",
    searchNearby: "/geocoding/search-nearby",
    reverse: "/geocoding/reverse",
  },

  directions: {
    route: "/directions/route",
    pricing: "/directions/pricing",
  },

  // Rides
  rides: {
    create: "/rides/create",
    byId: (id: number) => `/rides/${id}`,
    updateStatus: (id: number) => `/rides/${id}/status`,
    accept: (id: number) => `/rides/${id}/accept`,
    start: (id: number) => `/rides/${id}/start`,
    complete: (id: number) => `/rides/${id}/complete`,
    cancel: (id: number) => `/rides/${id}/cancel`,
    passengerHistory: (passengerId: number) => `/rides/passenger/${passengerId}/history`,
    driverHistory: (driverId: number) => `/rides/driver/${driverId}/history`,
    activePassenger: (passengerId: number) => `/rides/passenger/${passengerId}/active`,
    activeDriver: (driverId: number) => `/rides/driver/${driverId}/active`,
  },
} as const;

// API Request timeout (milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};
