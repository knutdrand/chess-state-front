// config.js
//# 'https://chess-state.vercel.app',
const config = {
    apiUrl: 'https://polarchess.com/api',
    localApiUrl: 'http://localhost:8000',
    is_local: false,
};
const apiUrl = config.is_local ? config.localApiUrl : config.apiUrl;
module.exports = {config, apiUrl};
