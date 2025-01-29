import { useState, useEffect } from 'react';
import { authService } from '@/lib/authService';
import { User } from '@supabase/supabase-js';

interface AuthResponse {
  status: 'success' | 'error' | 'no-auth';
  message: User | null;
  type: 'auth' | 'un-auth';
}

// Add new state for user profile
function AppSidePanel() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);  // Add this line
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Add debug logging
  useEffect(() => {
    console.log('Loading state:', loading);
    console.log('User state:', user);
    console.log('Error state:', error);
  }, [loading, user, error]);

  // Add function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await authService.getUserProfile();
      if (response.status === 'success') {
        setUserProfile(response.message);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Modify checkAuthStatus to fetch profile
  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      setError(null);
      const response = await authService.checkAuth();
      console.log('Auth response:', response);
      
      const isValidResponse = (resp: unknown): resp is AuthResponse => {
        return (
          resp !== null &&
          typeof resp === 'object' &&
          'status' in resp &&
          'message' in resp &&
          'type' in resp
        );
      };

      if (!isValidResponse(response)) {
        throw new Error('Invalid response format from server');
      }

      switch (response.status) {
        case 'success':
          setUser(response.message);
          if (response.message?.id) {
            await fetchUserProfile(response.message.id);
          }
          break;
        case 'no-auth':
          setUser(null);
          setError('Please sign in to continue');
          break;
        case 'error':
          setUser(null);
          setError(response.message?.toString() || 'Authentication failed');
          break;
        default:
          setUser(null);
          setError('Unexpected authentication status');
      }
    } catch (err) {
      setUser(null);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to check authentication status';
      console.error('Auth check failed:', errorMessage);
      //setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.googleLogin();
      
      const isValidResponse = (resp: unknown): resp is AuthResponse => {
        return (
          resp !== null &&
          typeof resp === 'object' &&
          'status' in resp &&
          'message' in resp &&
          'type' in resp
        );
      };

      if (!isValidResponse(response)) {
        throw new Error('Invalid response format from server');
      }

      if (response.status === 'success' && response.message) {
        setUser(response.message);
        await fetchUserProfile(response.message.id);
      } else {
        throw new Error(response.message?.toString() || 'Google login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to login with Google';
      console.error('Google login error:', errorMessage);
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
          // Reset form data
      setFormData({ email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      
      const isValidResponse = (resp: unknown): resp is AuthResponse => {
        return (
          resp !== null &&
          typeof resp === 'object' &&
          'status' in resp &&
          'message' in resp &&
          'type' in resp
        );
      };

      if (!isValidResponse(response)) {
        throw new Error('Invalid response format from server');
      }

      switch (response.status) {
        case 'success':
          setUser(response.message);
          break;
        case 'error':
          setError(response.message?.toString() || 'Login failed');
          break;
        default:
          setError('Unexpected response status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to login';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Similar implementations for handleSignup and handleLogout
  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div className="loading-spinner"></div>
        <p style={{
          marginTop: '20px',
          color: '#6c757d',
          fontSize: '16px',
          fontWeight: 500
        }}>Loading...</p>
      </div>
    );
  }


  // Add handleSignup function
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await authService.signup(formData.email, formData.password);
      
      const isValidResponse = (resp: unknown): resp is AuthResponse => {
        return (
          resp !== null &&
          typeof resp === 'object' &&
          'status' in resp &&
          'message' in resp &&
          'type' in resp
        );
      };

      if (!isValidResponse(response)) {
        throw new Error('Invalid response format from server');
      }

      if (response.status === 'success') {
        setUser(response.message);
      } else {
        throw new Error(response.message?.toString() || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to sign up';
      console.error('Signup error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Modify the return statement to include signup form
  return (
    <div className="userArea" style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white'
    }}>
      <div className="card" style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        margin: '0 auto',
        boxSizing: 'border-box',
        overflow: 'auto'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '24px',
          color: '#333',
          fontSize: '24px'
        }}>Supabase Auth</h1>
        {error && (
          <div className="error-message" style={{ 
            color: '#dc3545',
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        {user ? (
          // Add to your user info section
          <div className="user-info" style={{ textAlign: 'center' }}>
            <h2>Welcome!</h2>
            {user.user_metadata?.avatar_url && (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                style={{ 
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  marginBottom: '10px',
                  border: '2px solid #eee'
                }} 
              />
            )}
            <p style={{ margin: '10px 0' }}>
              <strong>{user.user_metadata?.full_name || user.email}</strong>
            </p>
            <div className="user-details" style={{ fontSize: '14px', color: '#666' }}>
              <p>Email: {user.email}</p>
              <p>Last Sign In: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</p>
              <p>Account Created: {user.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown'}</p>
              <p>Provider: {user.app_metadata?.provider || 'Email'}</p>
              {userProfile && (
                <>
                  <p>Role: {userProfile.role || 'User'}</p>
                  {userProfile.customData && (
                    <div className="custom-data">
                      <h3 style={{ marginTop: '15px', fontSize: '16px' }}>Additional Info</h3>
                      {Object.entries(userProfile.customData).map(([key, value]) => (
                        <p key={key}>{key}: {String(value)}</p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <button 
              onClick={handleSignOut}
              disabled={loading}
              style={{ 
                padding: '8px 16px',
                backgroundColor: loading ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1
              }}
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <div className="auth-buttons" style={{ textAlign: 'center' }}>
            {isSignup ? (
              <form onSubmit={handleSignup} style={{ maxWidth: '280px', margin: '0 auto' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '15px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
                <p style={{ marginTop: '15px', fontSize: '14px' }}>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsSignup(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0066cc',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Sign In
                  </button>
                </p>
              </form>
            ) : (
              <>
                {/* Add email/password login form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin(formData.email, formData.password);
                }} style={{ maxWidth: '280px', margin: '0 auto 15px' }}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '15px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      marginBottom: '15px'
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <div style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                  - OR -
                </div>

                {/* Existing Google login button */}
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                    maxWidth: '280px',
                    margin: '0 auto 15px',
                    opacity: loading ? 0.65 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {!loading && (
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  )}
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="spinner"></div>
                      Connecting...
                    </div>
                  ) : (
                    'Sign in with Google'
                  )}
                </button>
                <p style={{ fontSize: '14px' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsSignup(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0066cc',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #3498db;
          animation: spin 1s linear infinite;
        }

        .loading-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.9);
          z-index: 1000;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}

export default AppSidePanel;
