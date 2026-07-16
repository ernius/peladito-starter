import { useMutation, useQuery } from '@tanstack/react-query';
import { api, clearToken, getToken, setToken } from '@/lib/api';
import type { AuthUser, LoginRequest, LoginResponse } from './auth.types';

export const useLogin = () =>
  useMutation({
    mutationFn: async (request: LoginRequest): Promise<LoginResponse> => {
      const { data } = await api.post<LoginResponse>('/auth/login', request);
      setToken(data.accessToken);
      return data;
    },
  });

export const useCurrentUser = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<AuthUser> => {
      const { data } = await api.get<AuthUser>('/auth/me');
      return data;
    },
    enabled: Boolean(getToken()),
  });

export const logout = (): void => {
  clearToken();
  window.location.assign('/login');
};
