import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../authService';

describe('AuthService Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should handle successful login and session management', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      };

      // Mock successful login
      const loginResponse = await authService.login('test@example.com', 'password123');
      expect(loginResponse.status).toBe('success');
      expect(loginResponse.message).toEqual(mockUser);

      // Verify session is maintained
      const authCheck = await authService.checkAuth();
      expect(authCheck.status).toBe('success');
      expect(authCheck.message).toEqual(mockUser);

      // Test logout
      await authService.logout();
      const postLogoutCheck = await authService.checkAuth();
      expect(postLogoutCheck.status).toBe('no-auth');
    });

    it('should handle failed login attempts with invalid credentials', async () => {
      const response = await authService.login('test@example.com', 'wrongpassword');
      expect(response.status).toBe('error');
      expect(response.message).toContain('Invalid credentials');
    });

    it('should handle network errors during authentication', async () => {
      // Simulate network failure
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const response = await authService.login('test@example.com', 'password123');
      expect(response.status).toBe('error');
      expect(response.message).toContain('Network error');
    });
  });

  describe('Google OAuth Flow', () => {
    it('should handle successful Google authentication', async () => {
      const mockGoogleUser = {
        id: 'google123',
        email: 'google@example.com',
        user_metadata: {
          full_name: 'Google User',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      };

      const response = await authService.googleLogin();
      expect(response.status).toBe('success');
      expect(response.message).toEqual(mockGoogleUser);

      // Verify session after Google login
      const authCheck = await authService.checkAuth();
      expect(authCheck.status).toBe('success');
      expect(authCheck.message).toEqual(mockGoogleUser);
    });

    it('should handle Google OAuth failures', async () => {
      // Simulate OAuth failure
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('OAuth error'));

      const response = await authService.googleLogin();
      expect(response.status).toBe('error');
      expect(response.message).toContain('OAuth error');
    });
  });

  describe('User Profile Management', () => {
    it('should fetch user profile after successful authentication', async () => {
      const mockProfile = {
        role: 'user',
        customData: {
          preferences: { theme: 'dark' }
        }
      };

      const response = await authService.getUserProfile();
      expect(response.status).toBe('success');
      expect(response.message).toEqual(mockProfile);
    });

    it('should handle profile fetch errors', async () => {
      // Simulate API error
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API error'));

      const response = await authService.getUserProfile();
      expect(response.status).toBe('error');
      expect(response.message).toContain('API error');
    });
  });
});