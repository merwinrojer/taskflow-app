import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {create} from 'zustand';
import {authApi} from '../api/authApi';
import {getApiError} from '../api/client';
import type {User} from '../types';

const TOKEN_KEY = 'taskflow.authToken';

interface AuthState {
  user: User | null;
  booting: boolean;
  bootError: string | null;
  authenticate: (mode: 'login' | 'register', email: string, password: string) => Promise<void>;
  restore: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  booting: true,
  bootError: null,
  authenticate: async (mode, email, password) => {
    const result =
      mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.register(email, password);
    await AsyncStorage.setItem(TOKEN_KEY, result.token);
    set({user: result.user, bootError: null});
  },
  restore: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        set({booting: false});
        return;
      }
      const user = await authApi.me();
      set({user, booting: false, bootError: null});
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) {
        try {
          await AsyncStorage.removeItem(TOKEN_KEY);
          set({user: null, booting: false, bootError: null});
        } catch (storageError) {
          set({
            booting: false,
            bootError: `Unable to clear the expired session: ${getApiError(storageError)}`,
          });
        }
      } else {
        set({
          booting: false,
          bootError: `Unable to restore session: ${getApiError(error)}`,
        });
      }
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({user: null});
  },
}));
