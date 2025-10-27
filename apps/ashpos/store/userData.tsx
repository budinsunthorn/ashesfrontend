import { atom, useAtomValue, useSetAtom } from 'jotai';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const token = cookies.get('token');
import jwt from 'jsonwebtoken';

interface UserInfo {
    logined: boolean;                  // Assuming logined is a boolean
    userId: string;                    // Assuming userId is a string
    email: string;                     // Assuming email is a string
    name: string;                      // Assuming name is a string
    userType: string;                  // Assuming userType is a string
    dispensaryId: string;              // Assuming dispensaryId is a string
    organizationId: string;            // Assuming organizationId is a string
    storeName?: string;                 // Assuming storeName is a string
    storeLinkName: string;             // Assuming storeLinkName is a string
    orgLinkName: string;               // Assuming orgLinkName is a string
    cannabisLicense: string;           // Assuming cannabisLicense is a string
    metrcApiKey: string;               // Assuming metrcApiKey is a string
    isActive: boolean;                 // Assuming isActive is a boolean
    isDispensaryAdmin: boolean;        // Assuming isDispensaryAdmin is a boolean
    isEmailVerified: boolean;          // Assuming isEmailVerified is a boolean
    isOrganizationAdmin: boolean;      // Assuming isOrganizationAdmin is a boolean
    locationState: string;             // Assuming locationState is a string
    storeTimeZone: any;             // Assuming storeTimeZone is a string
    isCustomerAgeVerify: boolean;      // Assuming isCustomerAgeVerify is a boolean
}


let logined,
    userId,
    email,
    name,
    userType,
    dispensaryId,
    organizationId,
    storeName,
    storeLinkName,
    orgLinkName,
    cannabisLicense,
    metrcApiKey,
    isActive,
    isDispensaryAdmin,
    isEmailVerified,
    isOrganizationAdmin,
    locationState,
    storeTimeZone,
    isCustomerAgeVerify;

if (token === undefined) {
    logined = false;
    userId = '';
    email = '';
    name = '';
    userType = '';
    dispensaryId = '';
    organizationId = '';
    storeName = '';
    storeLinkName = '';
    orgLinkName = '';
    cannabisLicense = '';
    metrcApiKey = '';
    isActive = false;
    isDispensaryAdmin = false;
    isEmailVerified = false;
    isOrganizationAdmin = false;
    isCustomerAgeVerify = false;
    locationState = '';
} else {
    const loginData: any = jwt.decode(token);

    logined = loginData?.userId !== '' || loginData?.userId === null;
    userId = loginData?.userId;
    email = loginData?.email;
    name = loginData?.name;
    userType = loginData?.userType;
    dispensaryId = loginData?.dispensaryId;
    organizationId = loginData?.organizationId;
    storeName = loginData?.storeName;
    storeLinkName = loginData?.storeLinkName;
    orgLinkName = loginData?.orgLinkName;
    cannabisLicense = loginData?.cannabisLicense;
    metrcApiKey = loginData?.metrcApiKey;
    isActive = loginData?.isActive;
    isDispensaryAdmin = loginData?.isDispensaryAdmin;
    isEmailVerified = loginData?.isEmailVerified;
    isOrganizationAdmin = loginData?.isOrganizationAdmin;
    locationState = loginData?.locationState;
    storeTimeZone = loginData?.storeTimeZone;
    isCustomerAgeVerify = loginData?.isCustomerAgeVerify;
}

const userInfo = atom<UserInfo>({
    logined: logined,
    userId: userId,
    email: email,
    name: name,
    userType: userType,
    dispensaryId: dispensaryId,
    organizationId: organizationId,
    storeName: storeName || '',
    storeLinkName: storeLinkName,
    orgLinkName: orgLinkName,
    cannabisLicense: cannabisLicense,
    metrcApiKey: metrcApiKey,
    isActive: isActive,
    isDispensaryAdmin: isDispensaryAdmin,
    isEmailVerified: isEmailVerified,
    isOrganizationAdmin: isOrganizationAdmin,
    locationState: locationState,
    storeTimeZone: storeTimeZone,
    isCustomerAgeVerify: isCustomerAgeVerify,
});

export function userDataSave() {
    const userData = useAtomValue(userInfo);
    const setUserData = useSetAtom(userInfo);
    return { userData, setUserData };
}
