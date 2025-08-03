// Route constants for the application
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Main routes
  DASHBOARD: '/',

  // API routes
  API: {
    REGISTER: '/api/register',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    FORGOT_PASSWORD: '/api/forgot-password',
  }
};

// Helper function to get route with parameters
export const getRoute = (route, params = {}) => {
  let finalRoute = route;
  Object.keys(params).forEach(key => {
    finalRoute = finalRoute.replace(`:${key}`, params[key]);
  });
  return finalRoute;
};

export default ROUTES;
