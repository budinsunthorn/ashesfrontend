'use client';
import ContentAnimation from '@/components/layouts/factors/content-animation';
import Footer from '@/components/layouts/factors/footer';
import AdminHeader from '@/components/layouts/header/adminHeader';
import MainContainer from '@/components/layouts/factors/main-container';
import Overlay from '@/components/layouts/factors/overlay';
import ScrollToTop from '@/components/layouts/factors/scroll-to-top';
import Setting from '@/components/layouts/factors/setting';
import AdminSidebar from '@/components/layouts/factors/adminSidebar';
import Portals from '@/components/portals';
import { userDataSave } from '@/store/userData';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { userData, setUserData } = userDataSave();
    return (
        <>
            {/* BEGIN MAIN CONTAINER */}
            <div className="relative">
                <Overlay />
                <ScrollToTop />

                {/* BEGIN APP SETTING LAUNCHER */}
                <Setting />
                {/* END APP SETTING LAUNCHER */}

                <MainContainer>
                    {/* BEGIN SIDEBAR */}
                    <AdminSidebar />
                    {/* END SIDEBAR */}
                    <div className="main-content flex min-h-screen flex-col">
                        {/* BEGIN TOP NAVBAR */}
                        <AdminHeader />
                        {/* END TOP NAVBAR */}

                        {/* BEGIN CONTENT AREA */}
                        <ContentAnimation>{children}</ContentAnimation>
                        {/* END CONTENT AREA */}

                        {/* BEGIN FOOTER */}
                        <Footer />
                        {/* END FOOTER */}
                        <Portals />
                    </div>
                </MainContainer>
            </div>
        </>
    );
}
