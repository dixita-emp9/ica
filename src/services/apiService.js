import axios from 'axios';

const API_URL = 'https://api.ica.amigosserver.com/api';
// const API_URL = 'http://127.0.0.1:8000/api';

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
  USER_PORTFOLIO: '/user/portfolio',
  USER_WISHLIST: '/user/wishlist',
  GENERATE_PDF: '/generate-pdf',
  SEND_OTP: "/send-otp", // New OTP endpoint
  VERIFY_OTP: "/verify-otp", // New OTP verification endpoint
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
export const createPortfolio = async (name) => {
  return axiosInstance.post(API_ENDPOINTS.USER_PORTFOLIO, { name });
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

export const createPortfolioAndAddItem = async (name, itemId) => {
  try {
    const response = await axiosInstance.post('/portfolios/create-and-add-item', {
      name,
      item_id: itemId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating portfolio and adding item:", error.response?.data);
    throw error;
  }
};

export const deletePortfolio = async (portfolioId) => {
  try {
    const response = await axiosInstance.delete(`/portfolios/${portfolioId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    throw error;
  }
};

// Fetch a specific product by ID
export const fetchPostById = (id) => {
  return axiosInstance.get(`/portfolios/${id}`);
};

export const fetchPostBySlug = (slug) => {
  return axiosInstance.get(`/portfolios/${slug}`);
};

export const updateWishlistName = async (wishlistId, newName) => {
  return await axiosInstance.put(`/wishlist/${wishlistId}/update-name`, { name: newName });
};

export const sendOtp = async (phone_number) => {
  return axiosInstance.post("/send-otp", { phone_number });
};

export const verifyOtp = async (phoneNumber, otp) => {
  try {
    const response = await axiosInstance.post("/verify-otp", {
      phone_number: phoneNumber,
      otp
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Verification failed. Try again.");
  }
};


export const fetchFinishesData = async () => {
  try {
    const response = await axiosInstance.get("/finishes");
    return response.data?.data || {}; // Access the data directly from response
  } catch (error) {
    console.error("Error fetching finishes data:", error);
    return {};
  }
};
