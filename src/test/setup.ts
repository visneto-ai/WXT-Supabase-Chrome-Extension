import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock Chrome API
global.chrome = {
  runtime: {
    id: 'test-extension-id',
    getURL: (path: string) => `chrome-extension://test-extension-id/${path}`,
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn()
    }
  },
  identity: {
    getRedirectURL: () => 'chrome-extension://test-extension-id/callback.html',
    launchWebAuthFlow: vi.fn()
  }
} as unknown as typeof chrome;

// Mock Supabase responses
const server = setupServer(
  // Mock auth endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'test-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg'
        },
        app_metadata: {
          provider: 'google'
        },
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      }
    });
  }),

  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      }
    });
  }),

  http.post('*/auth/v1/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  })
);

// Start MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// Clean up after all tests
afterAll(() => server.close());

// Export for test utilities
export { server, http, HttpResponse };