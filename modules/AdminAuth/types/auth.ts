export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface MeResponse {
  user: AdminUser;
}
