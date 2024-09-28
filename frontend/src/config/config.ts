// config.js
export const BASE_URL = import.meta.env.VITE_BASE_URL || 
(import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://church-management-backend.onrender.com');

console.log('BASE_URL:', BASE_URL);