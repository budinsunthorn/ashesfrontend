'use client'
import GeneralLayout from '@/components/layouts/generalLayout';
import GuestLayout from '@/components/layouts/guestLayout';
import { userDataSave } from '@/store/userData';
import AdminLayout from '@/components/layouts/adminLayout';
import BudtenderLayout from '@/components/layouts/budtenderLayout';
import StoreManagerLayout from '@/components/layouts/storeManagerLayout';
import OrgManagerLayout from '@/components/layouts/orgManagerLayout';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
    const { userData, setUserData } = userDataSave();
    // console.log("userData ---------->", userData);
    if (userData.logined === true) {
        if (userData.userType === 'SUPER_ADMIN_MANAGER_USER') {
            return (
                <>
                    <AdminLayout children={children} />{' '}
                </>
            );
        } else if(userData.userType === "ADMIN_MANAGER_USER") {
            return (
                <>
                    <OrgManagerLayout children={children} />{' '}
                </>
            );
        } else if(userData.userType === 'USER') {
            return (
                <>
                    <BudtenderLayout children={children} />{' '}
                </>
            );
        } else  {
            return (
                <>
                    {' '}
                    <StoreManagerLayout children={children} />{' '}
                </>
            );
        }
    } else {
        return (
            <>
                {' '}
                <GuestLayout children={children} />{' '}
            </>
        );
    }
}
