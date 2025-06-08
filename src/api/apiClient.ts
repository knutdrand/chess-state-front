import axios, { AxiosInstance } from 'axios';
import { apiUrl } from '../config';

// Define types for your API responses
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface MoveRequest {
  fen: string;
  from_square: string;
  to_square: string;
  mode: string;
  elapsed_time?: number;
  line?: string[];
}

export interface MoveResponse {
  board: string;
  is_correct: boolean;
  correct_move?: string;
  message?: string;
  mode: string;
  white_score: number;
  black_score: number;
  endgame_level: number;
  line?: string[];
}

// Create API client class
class ApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Token API
  async login(username: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await this.client.post<TokenResponse>('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  }
  
  // Move API
  async init(): Promise<MoveResponse> {
    const response = await this.client.get<MoveResponse>('/init');
    return response.data;
  }
  
  async move(request: MoveRequest): Promise<MoveResponse> {
    const response = await this.client.post<MoveResponse>('/move', request);
    return response.data;
  }
  
  async show(fen: string, elapsed_time?: number, line?: string[]): Promise<MoveResponse> {
    const response = await this.client.post<MoveResponse>('/show', {
      fen: fen.replace(/ /g, "_").replace(/\//g, '+'),
      elapsed_time,
      line
    });
    return response.data;
  }
}

// Create and export instance
const api = new ApiClient(apiUrl);

export { api };
