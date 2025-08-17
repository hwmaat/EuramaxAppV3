export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;   // ISO string
  refreshToken: string;

  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  usergroupId: number;
  usergroupName: string;
}

export interface UserDto {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  usergroupId: number;
  usergroupName: string;
  isActive: boolean;
}

export interface UserGroupDto {
  id: number;
  groupName: string;
}

export type UserSummary = Pick<AuthResponse,
  'userId' | 'username' | 'firstname' | 'lastname' | 'usergroupId' | 'usergroupName'
>;

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
