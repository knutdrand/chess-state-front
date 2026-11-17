const config = {
    apiUrl: 'https://polarchess.com',
    localApiUrl: 'http://localhost:8000',
    is_local: process.env.REACT_APP_IS_LOCAL === 'true',
};

const fallbackBaseUrl: string = config.is_local ? config.localApiUrl : config.apiUrl;

// REACT_APP_API_URL (e.g. "https://polarchess.com", without the "/api" suffix)
// overrides the default. Falls back to REACT_APP_IS_LOCAL switching.
export const baseUrl: string = (process.env.REACT_APP_API_URL || fallbackBaseUrl).replace(/\/+$/, '');
export const apiUrl: string = baseUrl + '/api';
export { config };
