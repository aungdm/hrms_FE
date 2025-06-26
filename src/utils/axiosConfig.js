import axios from 'axios';

// Set default base URL for all axios requests
axios.defaults.baseURL = ''; // Empty base URL to use the proxy configured in vite.config.ts

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response || error);
    return Promise.reject(error);
  }
);

export default axios; 