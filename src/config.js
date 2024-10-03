// config.js
//# 'https://chess-state.vercel.app',
const config = {
    apiUrl: 'http://68.183.12.6:8000',
    localApiUrl: 'http://0.0.0.0:8000',
    is_local: false,
};
const apiUrl = config.is_local ? config.localApiUrl : config.apiUrl;
module.exports = {config, apiUrl};
