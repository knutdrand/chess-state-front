
// config.js
//# 'https://chess-state.vercel.app',
const config = {
    apiUrl: 'https://polarchess.com',
    localApiUrl: 'http://localhost:8000',  // Remove /api since auth server doesn't use this prefix
    is_local: process.env.REACT_APP_IS_LOCAL === 'true',
};
const baseUrl = config.is_local ? config.localApiUrl : config.apiUrl;
const apiUrl = baseUrl + '/api';
module.exports = { config, apiUrl, baseUrl };
