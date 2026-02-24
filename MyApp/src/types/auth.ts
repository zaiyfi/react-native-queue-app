export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    email: string;
    role?: string;
  };
}
