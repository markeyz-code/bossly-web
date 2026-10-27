import { http } from '~/config/axios';
import type { AuthSession, User } from '~/types';
import type { LoginPayload, RegisterPayload } from '../types';

async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

export const authApi = {
  register(payload: RegisterPayload): Promise<AuthSession> {
    return unwrap(http().post('/auth/register', payload));
  },
  login(payload: LoginPayload): Promise<AuthSession> {
    return unwrap(http().post('/auth/login', payload));
  },
  platformLogin(payload: LoginPayload): Promise<AuthSession> {
    return unwrap(http().post('/auth/platform/login', payload));
  },
  me(): Promise<{ user: User; businesses: AuthSession['businesses']; activeBusinessId: string | null }> {
    return unwrap(http().get('/auth/me'));
  },
  logout(refreshToken?: string): Promise<{ loggedOut: boolean }> {
    return unwrap(http().post('/auth/logout', { refreshToken }));
  },
  switchBusiness(businessId: string, refreshToken?: string): Promise<AuthSession> {
    return unwrap(http().post('/auth/switch-business', { businessId, refreshToken }));
  },
  updateProfile(payload: { name?: string; phone?: string; avatarUrl?: string }): Promise<User> {
    return unwrap(http().patch('/auth/profile', payload));
  },
  changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ changed: boolean }> {
    return unwrap(http().post('/auth/change-password', payload));
  },
  forgotPassword(email: string): Promise<{ sent: boolean }> {
    return unwrap(http().post('/auth/forgot-password', { email }));
  },
  resetPassword(token: string, password: string): Promise<{ reset: boolean }> {
    return unwrap(http().post('/auth/reset-password', { token, password }));
  },
  verifyEmail(token: string): Promise<{ verified: boolean }> {
    return unwrap(http().post('/auth/verify-email', { token }));
  },
  resendVerification(): Promise<{ sent: boolean }> {
    return unwrap(http().post('/auth/resend-verification'));
  },
};
