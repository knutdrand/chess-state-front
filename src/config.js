// config.js
//# 'https://chess-state.vercel.app',
const config = {
    apiUrl: 'https://polarchess.com',
    localApiUrl: 'http://localhost:8000',
    is_local: true,
};
const apiUrl = config.is_local ? config.localApiUrl : config.apiUrl;
module.exports = {config, apiUrl};
