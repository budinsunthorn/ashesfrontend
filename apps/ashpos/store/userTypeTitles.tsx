export const userTypeTitles = (tag: any) => {
    switch (tag) {
        case 'USER':
            return 'Budtender';
        case 'MANAGER_USER':
            return 'Manager';
        case 'ADMIN_MANAGER_USER':
            return 'Org-Manager';
        case 'SUPER_ADMIN_MANAGER_USER':
            return 'Admin';
        default:
            return 'Guest';
    }
};

export const userTypeColor = (tag: any) => {
    switch (tag) {
        case 'USER':
            return 'blue';
        case 'MANAGER_USER':
            return 'green';
        case 'ADMIN_MANAGER_USER':
            return 'amber';
        case 'SUPER_ADMIN_MANAGER_USER':
            return 'red';
        default:
            return 'gray';
    }
};
