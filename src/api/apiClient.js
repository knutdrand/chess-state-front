import { ApiClient, MoveApi, TokenApi, CoursesApi } from './index';
import { apiUrl } from '../config';

// Create and configure the API client
const apiClient = new ApiClient();
apiClient.basePath = apiUrl;

// Set up authentication interceptor
const setupAuth = (token) => {
  apiClient.defaultHeaders = {
    ...apiClient.defaultHeaders,
    'Authorization': `Bearer ${token}`
  };
};

// Create API instances
const moveApi = new MoveApi(apiClient);
const tokenApi = new TokenApi(apiClient);
const coursesApi = new CoursesApi(apiClient);

export {
  apiClient,
  setupAuth,
  moveApi,
  tokenApi,
  coursesApi
};