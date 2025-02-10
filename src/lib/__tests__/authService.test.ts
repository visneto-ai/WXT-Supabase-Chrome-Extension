import { describe, it, expect, vi } from 'vitest';
import { authService } from '../authService';

describe('authService', () => {
  it('should check auth status', async () => {
    const response = await authService.checkAuth();
    expect(response.status).toBe('no-auth');
  });

  it('should handle login', async () => {
    const response = await authService.login('test@example.com', 'password');
    expect(response.status).toBe('error');
  });

  it('should handle google login', async () => {
    const response = await authService.googleLogin();
    expect((response as { status: string }).status).toBe('success');
  });
});