/** Backend'deki SessionInfo ve parçalarının birebir karşılığı (Backend_Architecture.md §8.6). */

export type Role = 'ADMIN' | 'USER';

export interface SessionUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface MenuNode {
  id: number;
  titleKey: string;
  route: string | null;
  icon: string | null;
  children: MenuNode[];
}

export interface SessionInfo {
  accessToken: string;
  expiresIn: number;
  user: SessionUser;
  menus: MenuNode[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
