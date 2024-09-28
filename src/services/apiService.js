import axios from 'axios';

const API_URL = 'https://api.ica.amigosserver.com/api';

// Create an axios instance for API calls
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for Sanctum's CSRF protection
});

// Store endpoint paths for reusability
const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  USER: '/user',
  USER_UPDATE: '/user/update',
  LOGOUT: '/logout',
  USER_PORTFOLIOS: '/user/portfolios',
  USER_WISHLIST: '/user/wishlist',
  GENERATE_PDF: '/generate-pdf',
};

// Intercept request to include token automatically if it exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor for global error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized error globally (e.g., logout user, refresh token, etc.)
      localStorage.removeItem('authToken');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

// User login
export const loginUser = (email, password) => {
  return axiosInstance.post(API_ENDPOINTS.LOGIN, { email, password });
};

// User registration
export const registerUser = (name, email, password, password_confirmation) => {
  return axiosInstance.post(API_ENDPOINTS.REGISTER, {
    name,
    email,
    password,
    password_confirmation,
  });
};

// Fetch current logged-in user
export const fetchUser = () => {
  return axiosInstance.get(API_ENDPOINTS.USER);
};

// Update user details
export const updateUserDetails = (user) => {
  return axiosInstance.post(API_ENDPOINTS.USER_UPDATE, user);
};

// User logout
export const logoutUser = () => {
  return axiosInstance.post(API_ENDPOINTS.LOGOUT);
};

// Update user's portfolio
export const updatePortfolio = (wishlist) => {
  return axiosInstance.post(`${API_ENDPOINTS.USER}/portfolio`, { wishlist });
};

// Fetch user's portfolios
export const fetchUserPortfolios = () => {
  return axiosInstance.get(API_ENDPOINTS.USER_PORTFOLIOS);
};

// Fetch posts from the API
export const fetchPosts = () => {
  return axiosInstance.get('/portfolios');
};

// Generate a PDF with product IDs
export const generatePdf = (productIds) => {
  return axiosInstance.post(API_ENDPOINTS.GENERATE_PDF, { productIds }, { responseType: 'blob' });
};

// Fetch user's wishlist
export const fetchUserWishlist = () => {
  return axiosInstance.get(API_ENDPOINTS.USER_WISHLIST);
};

// Add an item to a portfolio
export const addItemToPortfolio = async (portfolioId, itemId) => {
  try {
    const response = await axiosInstance.post(`/portfolios/${portfolioId}/add-item`, { item_id: itemId });
    return response.data;
  } catch (error) {
    console.error('Error adding item to portfolio:', error);
    throw error;
  }
};

// Fetch a specific product by ID
export const fetchPostById = (id) => {
  return axiosInstance.get(`/portfolios/${id}`);
};
