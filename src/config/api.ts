/// <reference types="vite/client" />

// API Configuration
export const API_URL = import.meta.env.PROD
    ? `${window.location.origin}/api`  // Production: use same origin
    : 'http://localhost:5000/api';      // Development: use local backend

export const config = {
    apiUrl: API_URL,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
};
