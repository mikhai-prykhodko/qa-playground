/**
 * Fake user store — demo credentials only, documented on the login page.
 */
export type Role = 'user' | 'admin';

export interface DemoUser {
  username: string;
  password: string;
  role: Role;
  locked: boolean;
  displayName: string;
}

export const DEMO_PASSWORD = 'Test1234!';

export const USERS: DemoUser[] = [
  { username: 'standard_user', password: DEMO_PASSWORD, role: 'user', locked: false, displayName: 'Standard User' },
  { username: 'admin_user', password: DEMO_PASSWORD, role: 'admin', locked: false, displayName: 'Admin User' },
  { username: 'locked_user', password: DEMO_PASSWORD, role: 'user', locked: true, displayName: 'Locked User' },
];
