const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Navigation
    loadURL: (url) => ipcRenderer.send('load-url', url),
    
    // Printing
    printSilently: (data) => ipcRenderer.invoke('print-silently', data),
    printReceipt: (htmlContent) => ipcRenderer.invoke('print-receipt', htmlContent),
    
    // Utility functions
    isElectron: () => true,
    
    // Add more APIs as needed
    getVersion: () => process.versions.electron,
    getPlatform: () => process.platform,
});
