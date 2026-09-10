import axios from 'axios';

const TOKEN_KEY = 'peladito.token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const api = axios.create({
  baseURL: '/api',
  headers: { 'API-Version': '1' },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(undefined, (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    window.location.pathname !== '/login'
  ) {
    clearToken();
    window.location.assign('/login');
  }

  return Promise.reject(error);
});
