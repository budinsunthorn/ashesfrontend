// Utility functions for Electron integration

export const isElectron = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(window && window.process && window.process.versions && window.process.versions.electron);
};

export const isElectronAPI = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(window.electronAPI);
};

export const navigateInElectron = (url: string): boolean => {
    if (isElectron() && isElectronAPI() && window.electronAPI?.loadURL) {
        try {
            window.electronAPI.loadURL(url);
            return true;
        } catch (error) {
            console.warn('Electron navigation failed:', error);
            return false;
        }
    }
    return false;
};

export const printSilently = async (data: any): Promise<any> => {
    if (isElectron() && isElectronAPI() && window.electronAPI?.printSilently) {
        try {
            return await window.electronAPI.printSilently(data);
        } catch (error) {
            console.warn('Electron silent printing failed:', error);
            throw error;
        }
    }
    throw new Error('Electron API not available');
};

export const printReceipt = async (htmlContent: string): Promise<any> => {
    if (isElectron() && isElectronAPI() && window.electronAPI?.printReceipt) {
        try {
            return await window.electronAPI.printReceipt(htmlContent);
        } catch (error) {
            console.warn('Electron receipt printing failed:', error);
            throw error;
        }
    }
    throw new Error('Electron API not available');
};
