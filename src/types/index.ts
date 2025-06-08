// Common types used across the application

export interface User {
  username: string;
}

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
  piece?: string | null;
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
  success?: boolean;
}