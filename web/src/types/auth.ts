export type Role = 'SUPER_ADMIN' | 'RETAILER' | 'CLIENT' | 'BUILDER';

export interface User {
  id: number;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}
