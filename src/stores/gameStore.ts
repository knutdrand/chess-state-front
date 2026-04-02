import { create } from 'zustand';

interface GameState {
  position: string | null;
  setPosition: (position: string | null) => void;
  gameState: any | null;
  setGameState: (gameState: any | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  position: null,
  setPosition: (position) => set({ position }),
  gameState: null,
  setGameState: (gameState) => set({ gameState }),
  resetGame: () => set({ position: null, gameState: null }),
}));
