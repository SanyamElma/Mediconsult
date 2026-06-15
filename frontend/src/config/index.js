// Runtime configuration. Toggle USE_MOCK to switch between mock data and the live backend.

export const config = {
  // When true, the app runs entirely on in-browser mock data (no backend required).
  // Set to false (or VITE_USE_MOCK=false) once the Spring Boot backend is running.
  USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TOKEN_KEY: 'mc_access_token',
  REFRESH_KEY: 'mc_refresh_token',
  USER_KEY: 'mc_current_user',
  THEME_KEY: 'mc_theme',
  // Simulated network latency for mock requests (ms) to exercise loading states.
  MOCK_LATENCY: 350,
  APP_NAME: 'MediConsult',
};
