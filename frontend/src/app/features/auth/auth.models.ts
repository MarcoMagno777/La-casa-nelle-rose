export type AuthMode = 'login' | 'register' | 'resetRequest' | 'resetConfirm';

export interface AuthSubmit {
  username: string;
  identifier: string;
  password: string;
  resetToken: string;
  remember: boolean;
}
