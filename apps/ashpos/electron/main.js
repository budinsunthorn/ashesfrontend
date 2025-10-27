const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../public/favicon.ico'), // Add your app icon
        show: false, // Don't show until ready
    });

    // Load the app
    if (isDev) {
        // In development, load from Next.js dev server
        mainWindow.loadURL('http://localhost:3000');
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the built Next.js app
        mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
    }

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle IPC messages from renderer process
ipcMain.handle('load-url', (event, url) => {
    if (mainWindow) {
        mainWindow.loadURL(url);
    }
});

// Handle print requests
ipcMain.handle('print-silently', async (event, data) => {
    // Implement silent printing logic here
    console.log('Print silently:', data);
    return { success: true };
});

ipcMain.handle('print-receipt', async (event, htmlContent) => {
    // Implement receipt printing logic here
    console.log('Print receipt:', htmlContent);
    return { success: true };
});
