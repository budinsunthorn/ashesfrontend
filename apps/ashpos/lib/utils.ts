import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function calculateDaysBetweenDates(date1: string, date2: string): number {
    const startDate = new Date(date1);
    const endDate = new Date(date2);

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = endDate.getTime() - startDate.getTime();

    // Convert milliseconds to days
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    return differenceInDays;
}

export function formatDateFromTimestamp(timestamp: any) {
    // Create a new Date object from the timestamp
    const date = new Date(timestamp);

    // Extract the year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    // Return the formatted date
    return `${year}-${month}-${day}`;
}

export function truncateToTwoDecimals(num: number | undefined | null) {
    if (num === undefined || num == null) return null;
    if (num === 0) return 0;
    return Math.floor(num * 100) / 100;
}

export function setFourDecimals(num: number | undefined | null) {
    if (num === undefined || num == null) return 0;
    return Math.floor(num * 10000) / 10000;
}

export const formatCurrency = (value: number | undefined | null) => {  
    // Check if value is null, undefined, or not a finite number  
    if (value === null || value === undefined || typeof value !== 'number' || !isFinite(value)) {  
        return '';  
    }  
    
    // Truncate to two decimal places  
    const truncated = Math.floor(value * 100) / 100;  
    
    // Format the number as a currency string  
    const converted = truncated.toLocaleString('en-US', {  
        minimumFractionDigits: 2,  
        maximumFractionDigits: 2,  
    });  
    
    // Return formatted currency string  
    return Number(converted) < 0 ? `-$${-converted}` : `$${converted}`;  
};
