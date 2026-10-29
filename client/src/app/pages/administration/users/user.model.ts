import { Role } from '../../../core/auth/session.model';

/** Backend DTO'larının birebir karşılığı (server: modules/user/dto). */

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserCreateRequest {
  email: string;
  fullName: string;
  password: string;
  role: Role;
}

export interface UserUpdateRequest {
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  version: number;
}

export interface UserPasswordResetRequest {
  newPassword: string;
}
