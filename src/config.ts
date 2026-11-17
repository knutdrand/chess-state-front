const config = {
    apiUrl: 'https://polarchess.com',
    localApiUrl: 'http://localhost:8000',
    is_local: import.meta.env.VITE_IS_LOCAL === 'true',
};

const fallbackBaseUrl: string = config.is_local ? config.localApiUrl : config.apiUrl;

// VITE_API_URL (e.g. "https://polarchess.com", without the "/api" suffix)
// overrides the default. Falls back to VITE_IS_LOCAL switching.
export const baseUrl: string = (import.meta.env.VITE_API_URL || fallbackBaseUrl).replace(/\/+$/, '');
export const apiUrl: string = baseUrl + '/api';
export { config };
