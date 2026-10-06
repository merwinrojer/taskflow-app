import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';

const THEME_KEY = 'taskflow.darkMode';

interface ThemeState {
  dark: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggle: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>(set => ({
  dark: false,
  hydrated: false,
  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      set({dark: saved === 'true', hydrated: true});
    } catch (error) {
      set({hydrated: true});
      throw error;
    }
  },
  toggle: async () => {
    let nextValue = false;
    set(state => {
      nextValue = !state.dark;
      return {dark: nextValue};
    });
    await AsyncStorage.setItem(THEME_KEY, String(nextValue));
  },
}));
