export const UserRole = {
  USER: 'USER',
  ENGINEER: 'ENGINEER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
}
