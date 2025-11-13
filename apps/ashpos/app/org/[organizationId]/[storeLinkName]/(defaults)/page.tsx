'use client';
import { Metadata } from 'next';
import React from 'react';
import DispensaryDashboard from '@/components/dashboard/dispensaryDashboard';
import AdminDashboard from '@/components/dashboard/adminDashboard';
import GeneralDashboard from '@/components/dashboard/generalDashboard';
import { userDataSave } from '@/store/userData';

// export const metadata: Metadata = {
//     title: 'Dashboard',
// };

const Ashpos = () => {
    const { userData } = userDataSave();
    return (
        <div>
            {userData.logined ? <DispensaryDashboard /> : <GeneralDashboard />}
        </div>
    )
};

export default Ashpos;
