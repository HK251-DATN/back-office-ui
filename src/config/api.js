// API base URLs from environment variables
export const API_URLS = {
  AUTH: import.meta.env.VITE_API_AUTH_URL || 'http://localhost:9000',
  MAIN: import.meta.env.VITE_API_MAIN_URL || 'http://localhost:9100',
  STORAGE: import.meta.env.VITE_API_STORAGE_URL || 'http://localhost:9200',
  ECOMMERCE: import.meta.env.VITE_API_ECOMMERCE_URL || 'http://localhost:9300'
};
