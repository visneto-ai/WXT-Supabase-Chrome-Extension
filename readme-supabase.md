# Supabase

### Configure Supabase Authentication

1. Configure Google OAuth in Supabase:
   - Go to Supabase Dashboard
   - Select your project
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials (Client ID and Secret)

2. Configure Redirect URIs:
   - In Supabase: Authentication > URL Configuration
     - Add: `chrome-extension://<your-extension-id>/sidepanel.html`
   
   - In Google Cloud Console: APIs & Services > Credentials
     - Add both:
       ```
       https://mgqjaefqxwrunsykwfgd.supabase.co/auth/v1/callback
       chrome-extension://<your-extension-id>/sidepanel.html
       ```

3. Get your extension ID:
   - Load your extension in Chrome
   - Go to chrome://extensions
   - Enable Developer mode
   - Find your extension ID
   - Replace `<your-extension-id>` with actual ID in URLs above