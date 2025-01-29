import { defineConfig } from 'wxt';

// Add debugging to check environment variables
console.log('Environment variables:', {
  WXT_CRX_KEY: import.meta.env.WXT_CRX_KEY, // This should be defined in your .env file
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  WXT_CRX_ID: import.meta.env.WXT_CRX_ID,

});

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',

  manifest: {
    name: "Supabase Auth Extension",
    version: "1.0.0",
    description: "Chrome extension with Supabase authentication",
    author: { email: "your@email.com" },
    homepage_url: "https://your-website.com",
    update_url: "https://clients2.google.com/service/update2/crx",
    "manifest_version": 3,
    "permissions": [
      "identity",
      "storage",
      "identity.email"  // Add this permission
    ],
    key: import.meta.env.WXT_CRX_KEY || (() => {
      console.warn('WXT_CRX_KEY is not defined in environment variables');
      return undefined;
    })(),
    host_permissions: [
      'https://*.supabase.co/*',
      "https://accounts.google.com/*",
      "https://www.googleapis.com/*"  // Add this permission
    ],
    oauth2: {
      client_id: "673843895252-ci2l31q5omc5kfnr8d6u0igd7sbldhu4.apps.googleusercontent.com",
      scopes: [
        "openid", 
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ]
    },
    web_accessible_resources: [{  // Add this section
      resources: ["sidepanel.html"],
      matches: [
        "https://*.supabase.co/*",
        "https://accounts.google.com/*"
      ]
    }]
  },
});
