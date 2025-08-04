// Route constants for the application
export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Main routes
  DASHBOARD: '/',

  // Tryout routes
  TRYOUTS: '/tryouts',
  TRYOUT_START: '/tryouts/start',
  TRYOUT_RESULT: '/tryouts/:id/result',

  // API routes
  API: {
    REGISTER: '/api/register',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    FORGOT_PASSWORD: '/api/forgot-password',
    TRYOUTS: '/api/tryouts',
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
