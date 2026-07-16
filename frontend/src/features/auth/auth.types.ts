export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ENGINEER';
}

export interface LoginRequest {
  email: string;
  displayName: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
