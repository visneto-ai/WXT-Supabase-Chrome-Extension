import supabase from "./supabasescript";

/**
 * Interface for authentication response
 * @interface AuthResponse
 * @property {string} status - The status of the authentication request ('success', 'error', or 'no-auth')
 * @property {any} message - The response message or user data
 * @property {string} [type] - The type of authentication ('auth' or 'un-auth')
 */
interface AuthResponse {
  status: 'success' | 'error' | 'no-auth';
  message: User | null | string;
  type: 'auth' | 'un-auth';
}

/**
 * Service for handling authentication operations
 */
export const authService = {
  /**
   * Check the current authentication status
   * @returns {Promise<AuthResponse>} Authentication status and user data if authenticated
   */
  checkAuth: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error && error.message === 'Auth session missing!') {
        // Return no-auth status instead of throwing error for non-logged in users
        return {
          status: 'no-auth',
          message: null,
          type: 'un-auth'
        };
      }

      if (error) throw error;

      if (!user) {
        return {
          status: 'no-auth',
          message: null,
          type: 'un-auth'
        };
      }

      return {
        status: 'success',
        message: user,
        type: 'auth'
      };
    } catch (error) {
      console.error('Check auth error:', error);
      return {
        status: 'error',
        message: (error as Error).message || 'Failed to check auth status',
        type: 'un-auth'
      };
    }
  },

  /**
   * Login with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<AuthResponse>} Authentication result with user data
   */
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        status: 'success',
        message: data.user,
        type: 'auth'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        status: 'error',
        message: (error as Error).message || 'Failed to login',
        type: 'auth'
      };
    }
  },

  /**
   * Sign up a new user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<AuthResponse>} Authentication result with new user data
   */
  signup: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return {
        status: 'success',
        message: data.user,
        type: 'auth'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        status: 'error',
        message: (error as Error).message || 'Failed to sign up',
        type: 'auth'
      };
    }
  },

  /**
   * Initiate Google OAuth login
   * @returns {Promise<AuthResponse>} Authentication result with Google user data
   * @throws {Error} If popup is blocked or authentication fails
   */
  googleLogin: async () => {
    try {
      // Log extension ID and redirect URLs
      const extensionId = chrome.runtime.id;
      const redirectUrl = chrome.runtime.getURL('sidepanel.html');
      
      console.log('Auth Debug Info:', {
        extensionId,
        extensionRedirectUrl: redirectUrl,
        supabaseCallbackUrl: 'https://mgqjaefqxwrunsykwfgd.supabase.co/auth/v1/callback',
        fullExtensionUrl: `chrome-extension://${extensionId}/sidepanel.html`
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        if (error.message.includes('provider is not enabled')) {
          throw new Error('Google sign-in is not enabled. Please enable it in your Supabase dashboard.');
        }
        throw error;
      }

      // Handle the OAuth popup response
      if (data.url) {
        // Open popup window
        const popup = window.open(
          data.url,
          'Google Sign In',
          'width=500,height=600,centerscreen=yes'
        );

        if (!popup) {
          throw new Error('Failed to open popup window. Please allow popups for this site.');
        }

        // Wait for the OAuth flow to complete
        return new Promise((resolve, reject) => {
          const checkInterval = setInterval(async () => {
            if (popup.closed) {
              clearInterval(checkInterval);
              const { data: { user }, error: sessionError } = await supabase.auth.getUser();
              
              if (sessionError || !user) {
                reject(new Error('Authentication failed or cancelled'));
                return;
              }

              resolve({
                status: 'success',
                message: user,
                type: 'auth'
              });
            }
          }, 500);
        });
      }

      throw new Error('No authentication URL received');
    } catch (error) {
      console.error('Google login error:', error);
      return {
        status: 'error',
        message: (error as Error).message || 'An unknown error occurred',
        type: 'auth'
      };
    }
  },

  /**
   * Log out the current user
   * @returns {Promise<AuthResponse>} Logout operation result
   */
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return {
        status: 'success',
        message: 'Successfully logged out',
        type: 'auth'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        status: 'error',
        message: (error as Error).message || 'Failed to logout',
        type: 'auth'
      };
    }
  },

  /**
   * Get detailed user profile including custom data
   * @returns {Promise<AuthResponse>} User profile data including:
   * - Basic user info (id, email)
   * - User metadata (full name, avatar)
   * - App metadata (provider)
   * - Custom profile data from profiles table
   * @throws {Error} If no user is found or database query fails
   */
  getUserProfile: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (!user) {
        throw new Error('No user found');
      }

      // Get additional profile data if needed
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        status: 'success',
        message: {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata.full_name,
          avatar: user.user_metadata.avatar_url,
          provider: user.app_metadata.provider,
          lastSignIn: user.last_sign_in_at,
          createdAt: user.created_at,
          customData: profile || {} // Additional profile data if you have a profiles table
        },
        type: 'auth'
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        status: 'error',
        message: (error as Error).message || 'Failed to get user profile',
        type: 'auth'
      };
    }
  }
};