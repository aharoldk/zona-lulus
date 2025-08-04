// Route constants for the application
export const ROUTES = {
  // Frontend routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/',
  PAYMENT: '/payment',

  // Tryout routes
  TRYOUTS: '/tryouts',
  TRYOUT_START: '/tryouts/start',
  TRYOUT_RESULT: '/tryouts/:id/result',

  // Coins routes
  COINS_TOPUP: '/coins/topup',

  // API routes
  API: {
    // Auth endpoints
    REGISTER: '/api/register',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    ME: '/api/me',
    CHECK_EMAIL: '/api/check-email',
    CHECK_PHONE: '/api/check-phone',

    // Tryout endpoints
    TRYOUTS: '/api/tryouts',
    TRYOUTS_MY_ATTEMPTS: '/api/tryouts/my-attempts',
    TRYOUTS_START: '/api/tryouts/:id/start',
    TRYOUTS_SUBMIT: '/api/tryouts/attempts/:id/submit',

    // Course endpoints
    COURSES: '/api/courses',
    COURSES_MY: '/api/courses/my-courses',
    COURSES_SHOW: '/api/courses/:id',

    // Question endpoints
    QUESTIONS: '/api/questions/:id',

    // Question Bank endpoints
    QUESTION_BANK: '/api/question-bank',
    QUESTION_BANK_STATS: '/api/question-bank/stats',

    // Achievement endpoints
    ACHIEVEMENTS_BADGES: '/api/achievements/badges',
    ACHIEVEMENTS_LEADERBOARD: '/api/achievements/leaderboard',
    ACHIEVEMENTS_CERTIFICATES: '/api/achievements/certificates',

    // Schedule endpoints
    SCHEDULE: '/api/schedule',
    SCHEDULE_TODAY: '/api/schedule/today',
    SCHEDULE_UPCOMING_EXAMS: '/api/schedule/upcoming-exams',

    // Profile endpoints
    PROFILE: '/api/profile',
    PROFILE_PASSWORD: '/api/profile/password',
    PROFILE_AVATAR: '/api/profile/avatar',
    PROFILE_SETTINGS: '/api/profile/settings',
    PROFILE_STATS: '/api/profile/stats',
    PROFILE_ACTIVITY: '/api/profile/activity',
    PROFILE_ACHIEVEMENTS: '/api/profile/achievements',

    // Notification endpoints
    NOTIFICATIONS: '/api/notifications',
    NOTIFICATIONS_STATS: '/api/notifications/stats',
    NOTIFICATIONS_READ: '/api/notifications/:id/read',
    NOTIFICATIONS_MARK_ALL_READ: '/api/notifications/mark-all-read',
    NOTIFICATIONS_DELETE: '/api/notifications/:id',
    NOTIFICATIONS_BULK_DELETE: '/api/notifications/bulk-delete',
    NOTIFICATIONS_CLEAR_ALL: '/api/notifications/clear-all',

    // Study endpoints
    STUDY_STATS: '/api/study/stats',
    STUDY_RECENT_ACTIVITY: '/api/study/recent-activity',
    STUDY_LOG_SESSION: '/api/study/log-session',

    // Analytics endpoints
    ANALYTICS: '/api/analytics',

    // Payment endpoints
    PAYMENTS_HISTORY: '/api/payments/history',
    PAYMENTS_STATS: '/api/payments/stats',
    PAYMENTS_STATUS: '/api/payments/:payment/status',
    PAYMENTS_CANCEL: '/api/payments/:payment/cancel',
    PAYMENTS_FINISH: '/api/payments/:payment/finish',

    // Duitku Payment endpoints
    DUITKU_CALLBACK: '/api/duitku/callback',
    DUITKU_RETURN: '/api/duitku/return',
    DUITKU_METHODS: '/api/payment/duitku/methods',
    DUITKU_CREATE: '/api/payment/duitku/create',
    DUITKU_STATUS: '/api/payment/duitku/:payment/status',
    DUITKU_INQUIRY: '/api/payment/duitku/inquiry',

    // Legacy Duitku endpoints
    DUITKU_PAYMENT_METHODS: '/api/duitku/payment-methods',
    DUITKU_PURCHASE_MODULE: '/api/duitku/modules/:module/purchase',
    DUITKU_PURCHASE_COURSE: '/api/duitku/courses/:course/purchase',
    DUITKU_PURCHASE_TRYOUT: '/api/duitku/tryouts/:test/purchase',
    DUITKU_CHECK_STATUS: '/api/duitku/payments/:payment/status',

    // Coin endpoints
    COINS_PACKAGES: '/api/coins/packages',
    COINS_PURCHASE: '/api/coins/purchase',
    COINS_BALANCE: '/api/coins/balance',
    COINS_TRANSACTIONS: '/api/coins/transactions',
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

// Helper function to get API route with parameters
export const getApiRoute = (route, params = {}) => {
  return getRoute(route, params);
};

export default ROUTES;
