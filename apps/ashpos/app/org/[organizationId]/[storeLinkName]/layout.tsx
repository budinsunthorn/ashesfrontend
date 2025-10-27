// app/store/[storeId]/layout.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSetAtom, useAtomValue } from 'jotai';
import { userDataSave } from '@/store/userData';
import errorAlert from '@/components/notification/errorAlert';
import store from '@/store';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const { storeLinkName } = useParams();
    const router = useRouter();

    const { userData, setUserData } = userDataSave();
    // console.log('storeLinkName', storeLinkName);

    // const handleValidateStore = async () => {
    //     console.log('handleValidateStore: storeLinkName', storeLinkName);
    //     const response = await fetch(`${process.env.NEXT_PUBLIC_REST_API_URL}/store?storeLinkName=${storeLinkName}`);

    //     // if (!response.ok) {
    //     //   throw new Error(`HTTP error! status: ${response.status}`);
    //     // }

    //     const result = await response.json();
    //     console.log('result', result);

    //     if (result.ok) {
    //         setUserData({
    //             ...userData,
    //             storeLinkName: storeLinkName,
    //         });

    //         router.replace(`/store/${storeLinkName}/signin`);
    //     } else {
    //         errorAlert('Invalid Store ID');
    //         router.replace(`/store/${storeLinkName}/invalid-store`);
    //     }
    // };
    // useEffect(() => {
    //     console.log('userData.storeLinkName', userData.storeLinkName);
    //     // if (userData.storeLinkName !== storeLinkName) {
    //     //     handleValidateStore();
    //     // }
    // }, [storeLinkName]);

    return <>{children}</>;
}
