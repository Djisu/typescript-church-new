import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://typescript-church-new.onrender.com')
});

// Interceptor to add the token to requests
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    }
    console.log('Request Headers:', config.headers); // Log headers before sending request
    
    return config;
});

export default axiosInstance;