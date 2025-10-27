'use client';
import ContentAnimation from '@/components/layouts/factors/content-animation';
import Footer from '@/components/layouts/factors/footer';
import UnauthorizedHeader from '@/components/layouts/header/unauthorizedHeader';
import MainContainer from '@/components/layouts/factors/main-container';
import Overlay from '@/components/layouts/factors/overlay';
import ScrollToTop from '@/components/layouts/factors/scroll-to-top';
import Setting from '@/components/layouts/factors/setting';
import GuestSidebar from '@/components/layouts/factors/guestSidebar';
import Portals from '@/components/portals';
import { userDataSave } from '@/store/userData';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    const { userData, setUserData } = userDataSave();
    return (
        <>
            {/* BEGIN MAIN CONTAINER */}
            <div className="relative">
                <Overlay />
                <ScrollToTop />
                <Setting />
                <MainContainer>
                    {/* BEGIN SIDEBAR */}
                    {/* <Sidebar /> */}
                    {/* END SIDEBAR */}
                    <div className="main-content-guest ml-0 flex min-h-screen flex-col">
                        {/* BEGIN TOP NAVBAR */}
                        <UnauthorizedHeader />
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
