// config.js
//# 'https://chess-state.vercel.app',   
const config = {
    apiUrl: 'https://polarchess.com/api',
    localApiUrl: 'http://localhost:8000',  // Remove /api since auth server doesn't use this prefix
    is_local: true,
};
const apiUrl = config.is_local ? config.localApiUrl : config.apiUrl;
module.exports = { config, apiUrl };
