import axios from 'axios';

const API_URL = 'https://api.ica.amigosserver.com/api';

// Create an axios instance for API calls
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Required for Sanctum's CSRF protection
});

// Intercept request to include token automatically if it exists
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// User login
export const loginUser = (email, password) => {
    return axiosInstance.post('/login', { email, password });
};

// User registration
export const registerUser = (name, email, password, password_confirmation) => {
    return axiosInstance.post('/register', { name, email, password, password_confirmation });
};

// Fetch current logged-in user
export const fetchUser = () => {
    return axiosInstance.get('/user'); // Adjust API endpoint if necessary
};

export const updateUserDetails = (user) => {
    return axiosInstance.post('/user/update', user);
};

// User logout
export const logoutUser = () => {
    return axiosInstance.post('/logout');
};

// Update user's portfolio
export const updatePortfolio = (wishlist) => {
    return axiosInstance.post('/user/portfolio', { wishlist });
};

// Fetch user's portfolios
export const fetchUserPortfolios = () => {
    return axiosInstance.get('/user/portfolios'); // Ensure this endpoint exists in your Laravel routes
};

// Fetch posts from the API
export const fetchPosts = () => {
    return axiosInstance.get('/portfolios');
};


export const generatePdf = (productIds) => {
    return axiosInstance.post('/generate-pdf', { productIds }, { responseType: 'blob' });
};


// Fetch user's wishlist
export const fetchUserWishlist = () => {
    return axiosInstance.get('/user/wishlist');
};

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