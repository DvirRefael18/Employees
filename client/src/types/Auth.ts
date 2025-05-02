export interface UserAuth {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isManager?: boolean;
  managerId?: number;
  role?: string;
}

export interface Manager {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserAuth | null;
  loading: boolean;
  error: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isManager?: boolean;
  managerId?: number;
  role?: string;
} 