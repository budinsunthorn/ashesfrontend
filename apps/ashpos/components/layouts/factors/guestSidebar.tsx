'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuChat from '@/components/icon/menu/icon-menu-chat';
import IconMenuMailbox from '@/components/icon/menu/icon-menu-mailbox';
import IconMenuTodo from '@/components/icon/menu/icon-menu-todo';
import IconMenuNotes from '@/components/icon/menu/icon-menu-notes';
import IconMenuScrumboard from '@/components/icon/menu/icon-menu-scrumboard';
import IconMenuContacts from '@/components/icon/menu/icon-menu-contacts';
import IconMenuInvoice from '@/components/icon/menu/icon-menu-invoice';
import IconMenuCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconMenuComponents from '@/components/icon/menu/icon-menu-components';
import IconMenuElements from '@/components/icon/menu/icon-menu-elements';
import IconMenuCharts from '@/components/icon/menu/icon-menu-charts';
import IconMenuWidgets from '@/components/icon/menu/icon-menu-widgets';
import IconMenuFontIcons from '@/components/icon/menu/icon-menu-font-icons';
import IconMenuDragAndDrop from '@/components/icon/menu/icon-menu-drag-and-drop';
import IconMenuTables from '@/components/icon/menu/icon-menu-tables';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconMenuPages from '@/components/icon/menu/icon-menu-pages';
import IconMenuAuthentication from '@/components/icon/menu/icon-menu-authentication';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';

import { TbTruckDelivery } from 'react-icons/tb';
import { GrDeliver } from 'react-icons/gr';
import { TbTruckLoading } from 'react-icons/tb';
import { MdShoppingBasket } from 'react-icons/md';
import { SlBasketLoaded } from 'react-icons/sl';
import { BsBasket2Fill } from 'react-icons/bs';
import { RiShoppingBasketLine } from 'react-icons/ri';
import { TbShoppingBagDiscount } from 'react-icons/tb';
import { CiDiscount1 } from 'react-icons/ci';
import { BsFillPeopleFill } from 'react-icons/bs';
import { IoSettingsSharp } from 'react-icons/io5';
import { VscSettingsGear } from 'react-icons/vsc';
import { RiStore2Line, RiListSettingsLine, RiGroupLine, RiAdminLine, RiAdminFill } from 'react-icons/ri';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';
import { MdLoyalty } from 'react-icons/md';
import { MdOutlineLoyalty } from 'react-icons/md';
import { IoSettings } from 'react-icons/io5';
import { IoIosPeople } from 'react-icons/io';
import { TbCannabis } from 'react-icons/tb';
import { LiaCannabisSolid } from 'react-icons/lia';
import { SiAwsorganizations } from 'react-icons/si';
import { GiReceiveMoney } from 'react-icons/gi';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import { CgList } from 'react-icons/cg';

import { IoMdSettings } from 'react-icons/io';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';
import IconUser from '../../icon/icon-user';

const GuestSidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    return (
        <>
            <div className={semidark ? 'dark' : ''}>
                <nav
                    className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
                >
                    <div className="h-full bg-white dark:bg-black">
                        <div className="flex items-center justify-between px-4 py-3">
                            <Link href="/" className="main-logo flex shrink-0 items-center">
                                <img className="ml-[5px] w-8 flex-none" src="/assets/images/ashpos-logo.png" alt="logo" />
                                {/* <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-dark lg:inline">AshesPOS</span> */}
                            </Link>

                            <button
                                type="button"
                                className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-dark dark:hover:bg-dark-light/10"
                                onClick={() => dispatch(toggleSidebar())}
                            >
                                <IconCaretsDown className="m-auto rotate-90" />
                            </button>
                        </div>
                        <PerfectScrollbar className="relative h-[calc(100vh-80px)]"></PerfectScrollbar>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default GuestSidebar;
