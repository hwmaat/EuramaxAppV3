export interface User {
  username: string;
  token: string;
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