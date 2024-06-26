// config.js
const config = {
    apiUrl: 'https://chess-state.vercel.app',
    localApiUrl: 'http://0.0.0.0:8000',
    is_local: true,
};
const apiUrl = config.is_local ? config.localApiUrl : config.apiUrl;
module.exports = {config, apiUrl};
