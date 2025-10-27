declare global {
    interface Window {
        electronAPI?: {
            loadURL?: (url: string) => void;
            printSilently?: (data: any) => Promise<any>;
            printReceipt?: (htmlContent: string) => void;
        };
    }
}

export {};
