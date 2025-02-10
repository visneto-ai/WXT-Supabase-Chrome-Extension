# WXT Supabase Chrome Extension

A Chrome extension template integrating Supabase authentication with WXT (Web Extension Tools).

## Features

- Supabase Authentication Integration
- Google OAuth Support
- TypeScript Support
- React Components
- Automated Testing with Vitest

## Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- A Supabase account and project
- Google Cloud Console project with OAuth 2.0 credentials

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   WXT_CRX_KEY=your_extension_key
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests with UI:
```bash
npm run test:ui
```

## Project Structure

```
├── src/
│   ├── assets/        # Static assets
│   ├── components/    # React components
│   ├── entrypoints/   # Extension entry points
│   ├── lib/           # Core libraries and services
│   ├── public/        # Public assets
│   ├── test/         # Test setup and utilities
│   └── util/         # Utility functions
```

## Authentication Flow

1. User initiates login (email/password or Google OAuth)
2. Extension handles authentication through Supabase
3. On successful auth, user session is maintained
4. Protected routes/features become accessible

## Configuration

### Extension Configuration
See `wxt.config.ts` for extension configuration including:
- Permissions
- OAuth settings
- Host permissions
- Web accessible resources

### Build Configuration
See `vite.config.ts` and `tsconfig.json` for build and TypeScript configuration.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.