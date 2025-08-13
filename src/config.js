// API Configuration
console.log('🔍 DEBUGGING ENVIRONMENT VARIABLES:');
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All REACT_APP_ variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));

const config = {
  // API Base URL - with proper fallback for production
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://lms-backend-rehan-muslims-projects.vercel.app',
  
  // Supabase Configuration (if needed)
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      VERIFY_LOGIN: '/api/auth/verify-login',
      VERIFY_REGISTRATION: '/api/auth/verify-registration',
      RESEND_OTP: '/api/auth/resend-otp',
      ADMIN_LOGIN: '/api/auth/admin-login',
      ME: '/api/auth/me'
    },
    COURSES: '/api/courses',
    USERS: '/api/users',
    ENROLLMENTS: '/api/enrollments',
    ENROLLMENTS_PENDING_APPROVAL: '/api/enrollments/pending-approval',
    ENROLLMENTS_COMPLETED: '/api/enrollments/completed',
    ENROLLMENTS_MY_ENROLLMENTS: '/api/enrollments/my-enrollments',
    DEPARTMENTS: '/api/departments',
    UPLOAD: '/api/upload',
    ASSETS: '/api/assets',
    LESSONS: '/api/lessons',
    TEST: '/api/test'
  }
};

console.log('🎯 FINAL API_BASE_URL BEING USED:', config.API_BASE_URL);

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  // Handle nested endpoints like 'AUTH.REGISTER'
  if (endpoint.includes('.')) {
    const parts = endpoint.split('.');
    let current = config.ENDPOINTS;
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
      } else {
        console.error(`Endpoint not found: ${endpoint}`);
        return config.API_BASE_URL + '/api/error';
      }
    }
    return config.API_BASE_URL + current;
  }
  
  // Handle direct endpoints
  if (config.ENDPOINTS[endpoint]) {
    return config.API_BASE_URL + config.ENDPOINTS[endpoint];
  }
  
  // Handle custom paths (like '/api/enrollments/123/approve')
  if (endpoint.startsWith('/api/')) {
    return config.API_BASE_URL + endpoint;
  }
  
  // Handle relative paths
  return config.API_BASE_URL + endpoint;
};

// Helper function to get endpoint
export const getEndpoint = (path) => {
  return path;
};

export default config; 