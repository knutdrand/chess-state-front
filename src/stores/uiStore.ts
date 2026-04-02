import { create } from 'zustand';

type ActiveTab = 'play' | 'courses' | 'settings';
type ScreenOrientation = 'column' | 'row';

interface UiState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  boardWidth: number;
  setBoardWidth: (width: number) => void;
  screenOrientation: ScreenOrientation;
  setScreenOrientation: (orientation: ScreenOrientation) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'play',
  setActiveTab: (activeTab) => set({ activeTab }),
  boardWidth: 400,
  setBoardWidth: (boardWidth) => set({ boardWidth }),
  screenOrientation: 'column',
  setScreenOrientation: (screenOrientation) => set({ screenOrientation }),
}));
