import { createClient, User } from "@supabase/supabase-js";

/**
 * Supabase configuration
 * These values should be set in your environment variables
 * @constant {string} SUPABASE_URL - Your Supabase project URL
 * @constant {string} SUPABASE_KEY - Your Supabase anonymous key
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://YOUR-PROJECT.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR.API.KEYS";

/**
 * Supabase client instance
 * @constant {SupabaseClient}
 */
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Authentication response interface
 * @interface AuthResponse
 * @property {('auth'|'un-auth')} type - Authentication type
 * @property {('success'|'error'|'no-auth')} status - Response status
 * @property {User|boolean|string} message - Response payload
 */
interface AuthResponse {
  type: 'auth' | 'un-auth';
  status: 'success' | 'error' | 'no-auth';
  message: User | boolean | string;
}

/**
 * Message interface for authentication commands
 * @interface Message
 * @property {string} command - Authentication command type
 * @property {Object} [data] - Optional authentication data
 * @property {string} [data.e] - Email
 * @property {string} [data.p] - Password
 */
interface Message {
  command: 'logoutAuth' | 'checkAuth' | 'loginUser' | 'signupUser' | 'googleAuth';
  data?: {
    e: string;
    p: string;
  };
}

/**
 * Handles authentication messages from the extension
 * @async
 * @function handleMessage
 * @param {Message} msg - The authentication message
 * @param {chrome.runtime.MessageSender} sender - Message sender information
 * @param {function} sendResponse - Callback function to send response
 * @returns {Promise<boolean>} - Promise indicating if the message was handled
 */
const handleMessage = async function (
  msg: Message, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response: AuthResponse) => void
): Promise<boolean> {
  console.log("Handling auth request:", msg.command);
  
  try {
    switch (msg.command) {
      case "logoutAuth":
        const { error: logoutError } = await supabase.auth.signOut();
        if (logoutError) throw logoutError;
        sendResponse({ type: "un-auth", status: "success", message: true });
        break;

      case "checkAuth":
        const { data: { user }, error: checkError } = await supabase.auth.getUser();
        if (checkError) throw checkError;
        sendResponse({
          type: "auth",
          status: user ? "success" : "no-auth",
          message: user || false
        });
        break;

      case "googleAuth":
        const { data, error: googleError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: chrome.identity.getRedirectURL(),
            skipBrowserRedirect: true // Prevent default redirect
          }
        });
        
        if (googleError) throw googleError;
        if (!data.url) throw new Error("No authentication URL received");

        return new Promise((resolve) => {
          chrome.identity.launchWebAuthFlow({
            url: data.url,
            interactive: true
          }, async (redirectUrl) => {
            try {
              if (chrome.runtime.lastError || !redirectUrl) {
                throw new Error(chrome.runtime.lastError?.message || "Google authentication failed");
              }
              
              const { data: { user }, error: sessionError } = await supabase.auth.getUser();
              if (sessionError) throw sessionError;
              if (!user) throw new Error("No user found after authentication");
              
              sendResponse({
                type: "auth",
                status: "success",
                message: user
              });
              resolve(true);
            } catch (error) {
              sendResponse({
                type: "auth",
                status: "error",
                message: error instanceof Error ? error.message : "Authentication failed"
              });
              resolve(true);
            }
          });
        });

      case "loginUser":
      case "signupUser":
        if (!msg.data?.e || !msg.data?.p) {
          throw new Error("Email and password are required");
        }
        
        const authMethod = msg.command === "loginUser" 
          ? supabase.auth.signInWithPassword
          : supabase.auth.signUp;

        const { data: { user: authUser }, error: authError } = await authMethod({
          email: msg.data.e,
          password: msg.data.p,
        });
        
        if (authError) throw authError;
        sendResponse({
          type: "auth",
          status: authUser ? "success" : "no-auth",
          message: authUser || false
        });
        break;

      default:
        throw new Error(`Unknown command: ${msg.command}`);
    }
  } catch (error) {
    console.error('Auth error:', error);
    sendResponse({
      type: "auth",
      status: "error",
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }

  return true;
};

/**
 * Chrome runtime message listener
 * Handles authentication requests from the extension
 * @listens chrome.runtime.onMessage
 */
chrome.runtime.onMessage.addListener((
  msg: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: AuthResponse) => void
) => {
  handleMessage(msg, sender, sendResponse);
  return true;
});

export default supabase;
