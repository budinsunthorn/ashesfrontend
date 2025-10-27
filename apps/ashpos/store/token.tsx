export interface CustomJwtPayload {
    userId: string;
    email: string;
    name: string;
    userType: string;
    dispensaryId: number;
    organizationId: number;
    cannabisLicense: string;
    metrcApiKey: string;
    isActive: boolean;
    isDispensaryAdmin: boolean;
    isEmailVerified: boolean;
    isOrganizationAdmin: boolean;
    locationState: string;
    exp: number;
    iat: number;
}

export const isTokenExpired = (decoded: any) => {
    if (decoded.exp !== undefined) return decoded.exp < Date.now() / 1000;
    else return false;
};
