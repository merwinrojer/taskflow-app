import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://10.0.2.2:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {'Content-Type': 'application/json'},
});

apiClient.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('taskflow.authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiError(error: unknown): string {
  if (axios.isAxiosError<{error?: string}>(error)) {
    return error.response?.data?.error ?? error.message ?? 'Network request failed';
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
