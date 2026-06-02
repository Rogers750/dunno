import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  apiKey: string | null;
  projectName: string;
  setApiKey: (key: string) => Promise<void>;
  loadApiKey: () => Promise<void>;
  clearApiKey: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  apiKey: null,
  projectName: 'My Project',

  setApiKey: async (key: string) => {
    await AsyncStorage.setItem('dunno_api_key', key);
    set({ apiKey: key });
  },

  loadApiKey: async () => {
    const key = await AsyncStorage.getItem('dunno_api_key');
    set({ apiKey: key });
  },

  clearApiKey: async () => {
    await AsyncStorage.removeItem('dunno_api_key');
    set({ apiKey: null });
  },
}));
