import axios, { AxiosInstance } from 'axios';
import { apiUrl } from '../config';
import { TokenResponse, MoveRequest, MoveResponse } from '../types';

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
  
  async register(username: string, password: string, invitationCode: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('invitation_code', invitationCode);
    formData.append('grant_type', 'password');
    
    const response = await this.client.post<TokenResponse>('/register', formData, {
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
    const moveRequest: MoveRequest = {
      fen: request.fen,
      from_square: request.from_square,
      to_square: request.to_square,
      mode: request.mode || 'play',
      elapsed_time: request.elapsed_time || -1,
      piece: request.piece || null,
      line: Array.isArray(request.line) ? request.line : []
    };
    
    const response = await this.client.post<MoveResponse>('/move', moveRequest);
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
