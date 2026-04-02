const config = {
    apiUrl: 'https://polarchess.com',
    localApiUrl: 'http://localhost:8000',
    is_local: process.env.REACT_APP_IS_LOCAL === 'true',
};

export const baseUrl: string = config.is_local ? config.localApiUrl : config.apiUrl;
export const apiUrl: string = baseUrl + '/api';
export { config };
