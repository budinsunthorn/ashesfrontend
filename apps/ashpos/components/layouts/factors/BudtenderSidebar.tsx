'use client';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import IconCaretsDown from '@/components/icon/icon-carets-down';


// Improt store
import { toggleSidebar } from '@/store/themeConfigSlice';
import { ActiveSidebarItemAtom } from '@/store/activeSidebarItem';

// Import Icon
import { TbReportAnalytics, TbTruckDelivery } from 'react-icons/tb';
import { MdOutlineInsights, MdOutlineTimeline, MdPendingActions, MdShoppingBasket } from 'react-icons/md';
import { SlBasket, SlBasketLoaded } from 'react-icons/sl';
import { RiPrinterFill, RiShoppingBasketLine } from 'react-icons/ri';
import { TbShoppingBagDiscount } from 'react-icons/tb';
import { CiCalendarDate, CiDiscount1 } from 'react-icons/ci';
import { BsFillPeopleFill } from 'react-icons/bs';
import { IoSettingsSharp } from 'react-icons/io5';
import { RiStore2Line, RiListSettingsLine, RiGroupLine, RiAdminLine, RiAdminFill } from 'react-icons/ri';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';
import { MdOutlineLoyalty } from 'react-icons/md';
import { IoIosPeople } from 'react-icons/io';
import { LiaCannabisSolid, LiaSmsSolid } from 'react-icons/lia';
import { FaChartBar, FaChartColumn, FaClockRotateLeft, FaHandHoldingDollar, FaPeopleGroup } from 'react-icons/fa6';
import { CgList } from 'react-icons/cg';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { FaCashRegister } from 'react-icons/fa6';
import { BiSolidBadgeDollar } from 'react-icons/bi';
import { getTranslation } from '@/i18n';
import { TbPackages } from 'react-icons/tb';
import { GrCompliance, GrConnect } from 'react-icons/gr';
import { CgFileDocument } from 'react-icons/cg';
import { TbReportMoney } from 'react-icons/tb';
import { GrStorage } from 'react-icons/gr';
import { LuClock4, LuPackageSearch } from 'react-icons/lu';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconUser from '../../icon/icon-user';
import { useAtom } from 'jotai';
import { PiPackageLight } from 'react-icons/pi';

import { userDataSave } from '@/store/userData';
import { useParams, usePathname } from 'next/navigation';
import { AiOutlineAudit, AiOutlineFileSync } from 'react-icons/ai';
import { FaHistory, FaPrint } from 'react-icons/fa';

const BudtenderSidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    const navRef = useRef<HTMLDivElement>(null)
    const [logoShow, setLogoShow] = useState(true)
    const [navWidth, setNavWidth] = useState<number | null>(null);
    const [activeSideBarItem, setActiveSidebarItem] = useAtom(ActiveSidebarItemAtom);

    const {userData} = userDataSave();
    const storeLinkName = userData.storeLinkName;
    const orgLinkName = userData.orgLinkName;
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);

    const [activeItem, setActiveItem] = useState(localStorage.getItem('activeItem') !== '' ? localStorage.getItem('activeItem') : '');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        // console.log('toggleMenu----->', value);
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    // get the last segment of the URL path
    useEffect(() => {

        if(lastSegment) {
            handleSetActiveItem(lastSegment)
        }
    },[lastSegment])

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
    
    const handleSetActiveItem = (item: string) => {
        if(item !== 'queue'){
            setActiveSidebarItem(item);
        }
        localStorage.setItem('activeItem',item)
    }
    // useEffect(() => {
    //     localStorage.setItem('activeItem', activeItem || '');
    // }, [activeItem]);

    useEffect(() => {
        setActiveItem(activeSideBarItem as string);
    }, [activeSideBarItem])
    
    return (
        <>
            <div className={semidark ? 'dark' : ''}>
                <nav
                    ref={navRef}
                    className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${
                        semidark ? 'text-white-dark' : ''
                    }`}
                    onMouseOver={() => setLogoShow(false)}
                    onMouseLeave={() => setLogoShow(true)}
                >
                    <div className="h-full bg-white dark:bg-black">
                        <div className="flex items-center justify-between px-4 py-3">
                            <Link href={`/org/${orgLinkName}/${storeLinkName}`} className="main-logo flex shrink-0 items-center">
                                {/* <img className="ml-[5px] w-8 flex-none" src="/assets/images/logo.png" alt="logo" /> */}
                                {themeConfig.menu == "collapsible-vertical" && logoShow ? 
                                <img className="ml-[5px] w-8 flex-none " src="/assets/images/logo.png" alt="logo" />
                                :
                                <img className="ml-[5px] w-36 h-10 flex-none" src="/assets/images/ashpos-logo.png" alt="logo" />
                                }
                                {/* <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-dark lg:inline">AshesPOS</span> */}
                            </Link>
                            <button
                                type="button"
                                className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-dark dark:hover:bg-dark-light/10"
                                onClick={() => dispatch(toggleSidebar())}
                            >
                                <IconCaretsDown className="m-auto rotate-90"/>
                            </button>
                        </div>
                        <PerfectScrollbar className="relative h-[calc(100vh-150px)] pb-20">
                            <ul className="relative space-y-0.5 py-0 font-semibold">
                                <li className="menu nav-item">
                                    <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                                        <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:text-[#bec1d3] dark:bg-dark dark:bg-opacity-[0.08]">
                                            <BiSolidBadgeDollar className="shrink-0 group-hover:!text-primary dark:text-[#bec1d3]" />
                                            <span className="ml-3">{t('sales')}</span>
                                        </h2>
                                        <li className="menu nav-item ml-5">
                                            <Link href={`/sales-queue`} className={`group ${activeItem == 'customer-queue' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`} onClick={() => handleSetActiveItem('customer-queue')}>
                                                <div className="flex items-center ">
                                                    <FaPeopleGroup className={`shrink-0 group-hover:!text-primary ${activeItem == 'customer-queue' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'customer-queue' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('Customer Queue')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="menu nav-item ml-5">
                                            <Link href={`/sales-cashier`} className={`group ${activeItem == 'cashier' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`} onClick={() => handleSetActiveItem('cashier')}>
                                                <div className="flex items-center ">
                                                    <FaCashRegister className={`shrink-0 group-hover:!text-primary ${activeItem == 'cashier' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'cashier' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('cashier')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </PerfectScrollbar>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default BudtenderSidebar;
