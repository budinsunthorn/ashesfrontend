# AshPOS Electron App

This directory contains the Electron wrapper for the AshPOS Next.js application.

## Setup

1. Install Electron dependencies:
```bash
cd electron
npm install
```

2. Install Next.js dependencies (if not already done):
```bash
cd ..
npm install
```

## Development

To run the app in development mode:

```bash
# From the ashpos directory
npm run electron:dev
```

This will:
1. Start the Next.js development server on http://localhost:3000
2. Wait for the server to be ready
3. Launch the Electron app

## Building for Production

To build the app for production:

```bash
# Build the Next.js app and export static files
npm run electron:build

# Create distributable packages
npm run electron:dist
```

## Available Scripts

- `npm run electron:dev` - Run in development mode
- `npm run electron:build` - Build the Next.js app for Electron
- `npm run electron:dist` - Create distributable packages

## Platform-specific Builds

- `npm run dist:win` - Build for Windows
- `npm run dist:mac` - Build for macOS  
- `npm run dist:linux` - Build for Linux

## Features

- **Navigation**: The app supports Electron-specific navigation through the `handleGotoLink` function
- **Printing**: Built-in support for silent printing and receipt printing
- **Security**: Uses contextIsolation for secure communication between main and renderer processes

## File Structure

- `main.js` - Main Electron process
- `preload.js` - Preload script for secure API exposure
- `package.json` - Electron app configuration
- `README.md` - This file

## Troubleshooting

1. **Port 3000 already in use**: Make sure no other Next.js app is running on port 3000
2. **Build errors**: Ensure all dependencies are installed
3. **Navigation not working**: Check that the preload script is properly configured

## Notes

- The app uses `contextIsolation: true` for security
- All Electron APIs are exposed through the `window.electronAPI` object
- The app automatically detects if it's running in Electron vs web browser
