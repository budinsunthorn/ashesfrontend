export const returnPackageStatusClass = (status: string | undefined) => {
    switch (status) {
        case 'ACTIVE':
            // return 'bg-theme_green text-white dark:text-green-900'
            return 'bg-success-light text-success dark:bg-success-dark-light';
        case 'ACCEPTED':
            return 'bg-success-light text-success dark:bg-success-dark-light';
        case 'PENDING':
            return 'bg-warning-light text-warning dark:bg-warning-dark-light';
        case 'HOLD':
            return 'text-secondary bg-secondary-light dark:bg-secondary-dark-light';
        default:
            return 'bg-info-light text-info dark:bg-info-dark-light';
    }
};

export const getPackageStatusNameAsString = (status: string | undefined) => {
    switch (status) {
        case 'ACTIVE':
            return 'Active';
        case 'ACCEPTED':
            return 'Accepted';
        case 'PENDING':
            return 'Pending';
        case 'HOLD':
            return 'Hold';
        case 'VOID':
            return 'Void';
        case 'VOIDED':
            return 'Voided';
        case 'FINISHED':
            return 'Finished';
        default:
            return 'Unknown';
    }
};

// Utility function to truncate decimal places
export const truncateDecimal = (num: number): number => {
    return Math.floor(num * 100) / 100;
};