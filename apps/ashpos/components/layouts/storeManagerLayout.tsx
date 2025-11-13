'use client';
import ContentAnimation from '@/components/layouts/factors/content-animation';
import Footer from '@/components/layouts/factors/footer';
import GeneralHeader from '@/components/layouts/header/generalHeader';
import MainContainer from '@/components/layouts/factors/main-container';
import Overlay from '@/components/layouts/factors/overlay';
import ScrollToTop from '@/components/layouts/factors/scroll-to-top';
import Setting from '@/components/layouts/factors/setting';
import GeneralSidebar from '@/components/layouts/factors/generalSidebar';
import Portals from '@/components/portals';
import { userDataSave } from '@/store/userData';

import { useAtom } from 'jotai';
import CustomerQueueSidebar from './factors/customerQueueSidebar';
import StoreManagerSidebar from './factors/StoreManagerSidebar';
import StoreManagerHeader from './header/StoreManagerHeader';

export default function StoreManagerLayout({ children }: { children: React.ReactNode }) {
    const { userData, setUserData } = userDataSave();
    return (
        <>
            {/* BEGIN MAIN CONTAINER */}
            <div className="relative">
                <Overlay />
                <ScrollToTop />

                {/* BEGIN APP SETTING LAUNCHER */}
                <Setting />
                <CustomerQueueSidebar/>
                
                {/* END APP SETTING LAUNCHER */}

                <MainContainer>
                    {/* BEGIN SIDEBAR */}
                    <StoreManagerSidebar />
                    {/* END SIDEBAR */}
                    <div className={`main-content flex min-h-screen flex-col`}>
                        <div>
                            <StoreManagerHeader />
                        </div>
                        {/* BEGIN TOP NAVBAR */}
                        {/* END TOP NAVBAR */}
                        <div className={`relative flex flex-col`}>
                            {/* BEGIN CONTENT AREA */}
                            <ContentAnimation>{children}</ContentAnimation>
                            {/* END CONTENT AREA */}

                            {/* BEGIN FOOTER */}
                            <Footer />
                            {/* END FOOTER */}
                            <Portals />
                        </div>
                    </div>
                </MainContainer>
            </div>
        </>
    );
}
