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

const StoreManagerSidebar = () => {
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
                                        <li className="menu nav-item ml-5">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'customer' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    toggleMenu('customer');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <BsFillPeopleFill className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary">{t('Customer')}</span>
                                                </div>

                                                <div className={currentMenu !== 'customer' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === 'customer' ? 'auto' : 0}>
                                                <ul className="sub-menu text-dark">
                                                    <li onClick={() => handleSetActiveItem('discount')} className={`${activeItem == 'discount' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/discount-manage`} className="group">
                                                            <div className="flex items-center">
                                                                <TbShoppingBagDiscount className={`shrink-0 group-hover:!text-primary ${activeItem == 'discount' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'discount' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('discount')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li onClick={() => handleSetActiveItem('loyalty')} className={`${activeItem == 'loyalty' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/loyalty-manage`} className="group">
                                                            <div className="flex items-center">
                                                                <MdOutlineLoyalty className={`shrink-0 group-hover:!text-primary ${activeItem == 'loyalty' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'loyalty' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('loyalty')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li onClick={() => handleSetActiveItem('customers')} className={`${activeItem == 'customers' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/customer-manage`} className="group">
                                                            <div className="flex items-center">
                                                                <IoIosPeople className={`shrink-0 group-hover:!text-primary ${activeItem == 'customers' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'customers' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('customers')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>

                                                </ul>
                                            </AnimateHeight>
                                        </li>
                                        <li onClick={() => handleSetActiveItem('orders')} className={`menu nav-item ml-5 ${activeItem == 'orders' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                            <Link href={`/orders-manage`} className="group">
                                                <div className="flex items-center">
                                                    <SlBasketLoaded className={`shrink-0 group-hover:!text-primary ${activeItem == 'orders' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'orders' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('Orders')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        <li onClick={() => handleSetActiveItem('drawers')} className={`menu nav-item ml-5 ${activeItem == 'drawers' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                            <Link href={`/drawers-manage`} className="group">
                                                <div className="flex items-center">
                                                    <FaHistory className={`shrink-0 group-hover:!text-primary ${activeItem == 'drawers' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'drawers' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('drawers')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        {/* <li className="menu nav-item">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'orders' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    toggleMenu('orders');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <SlBasket className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary">{t('Orders')}</span>
                                                </div>

                                                <div className={currentMenu !== 'orders' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === 'orders' ? 'auto' : 0}>
                                                <ul className="sub-menu text-dark">
                                                    {/* <li onClick={() => handleSetActiveItem('held-orders')} className={`${activeItem == 'held-orders' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href="/held-orders-manage" className="group">
                                                            <div className="flex items-center">
                                                                <LuClock4 className={`shrink-0 group-hover:!text-primary ${activeItem == 'held-orders' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'held-orders' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('Held Orders')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li> 
                                                    <li onClick={() => handleSetActiveItem('orders')} className={`${activeItem == 'orders' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href="/orders-manage" className="group">
                                                            <div className="flex items-center">
                                                                <SlBasketLoaded className={`shrink-0 group-hover:!text-primary ${activeItem == 'orders' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'orders' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('Orders')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight>
                                        </li> */}
                                    </ul>
                                </li>
                                <li className="menu nav-item">
                                    <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                                        <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:text-[#bec1d3] dark:bg-dark dark:bg-opacity-[0.08]">
                                            <MdShoppingBasket className="shrink-0 group-hover:!text-primary dark:text-[#bec1d3]" />
                                            <span className="ml-3">{t('product')}</span>
                                        </h2>
                                        <li className="menu nav-item ml-5">
                                            <Link
                                                href={`/supplier-manage`}
                                                className={`group ${activeItem == 'supplier' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}
                                                onClick={() => handleSetActiveItem('supplier')}
                                            >
                                                <div className="flex items-center">
                                                    <TbTruckDelivery className={`shrink-0 group-hover:!text-primary ${activeItem == 'supplier' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'supplier' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('supplier')}
                                                    </span>
                                                </div>
                                            </Link>
                                            <Link
                                                href={`/product-manage`}
                                                className={`group ${activeItem == 'product' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}
                                                onClick={() => handleSetActiveItem('product')}
                                            >
                                                <div className="flex items-center">
                                                    <RiShoppingBasketLine className={`shrink-0 group-hover:!text-primary ${activeItem == 'product' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'product' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('products')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="menu nav-item ml-5">
                                            <Link href={`/categories`} className={`group ${activeItem == 'itemCategory' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`} onClick={() => handleSetActiveItem('itemCategory')}>
                                                <div className="flex items-center">
                                                    <CgList className={`shrink-0 group-hover:!text-primary ${activeItem == 'itemCategory' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'itemCategory' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('category')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu nav-item">
                                    <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                                        <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:text-[#bec1d3] dark:bg-dark dark:bg-opacity-[0.08]">
                                            <GrStorage className="shrink-0 group-hover:!text-primary dark:text-[#bec1d3]" />
                                            <span className="ml-3">{t('Inventory')}</span>
                                        </h2>
                                        {/* <li className="menu nav-item">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'package' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    toggleMenu('package');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <TbPackages className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary">{t('package')}</span>
                                                </div>

                                                <div className={currentMenu !== 'package' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === 'package' ? 'auto' : 0}>
                                                <ul className="sub-menu text-dark"> */}
                                                    <li onClick={() => handleSetActiveItem('package')} className={`menu nav-item ml-5 ${activeItem == 'package' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/package-manage`} className="group">
                                                            <div className="flex items-center">
                                                                <TbPackages className={`shrink-0 group-hover:!text-primary ${activeItem == 'package' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'package' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('Packages')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li onClick={() => handleSetActiveItem('transfer')} className={`menu nav-item ml-5 ${activeItem == 'transfer' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/transfer-manage`} className="group">
                                                            <div className="flex items-center">
                                                                <GrConnect className={`shrink-0 group-hover:!text-primary ${activeItem == 'transfer' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'transfer' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('Transfer')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li onClick={() => handleSetActiveItem('finish_package')} className={`menu nav-item ml-5 ${activeItem == 'finish_package' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/finish_package-manage`} className="group">
                                                            <div className="flex items-center">
                                                                <PiPackageLight className={`shrink-0 group-hover:!text-primary ${activeItem == 'finish_package' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'finish_package' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('Finish Packages')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li onClick={() => handleSetActiveItem('tiny_package')} className={`menu nav-item ml-5 ${activeItem == 'tiny_package' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/tiny_package-manage`} className="group">
                                                            <div className="flex items-center">
                                                                <LuPackageSearch className={`shrink-0 group-hover:!text-primary ${activeItem == 'tiny_package' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'tiny_package' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('Tiny Packages')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li onClick={() => handleSetActiveItem('metrc-reconciliation')} className={`menu nav-item ml-5 ${activeItem == 'metrc-reconciliation' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/metrc-reconciliation`} className="group">
                                                            <div className="flex items-center">
                                                                <AiOutlineFileSync className={`shrink-0 group-hover:!text-primary ${activeItem == 'metrc-reconciliation' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'metrc-reconciliation' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('Metrc Reconciliation')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li onClick={() => handleSetActiveItem('audit-packages')} className={`menu nav-item ml-5 ${activeItem == 'audit-packages' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/audit-packages`} className="group">
                                                            <div className="flex items-center">
                                                                <AiOutlineAudit className={`shrink-0 group-hover:!text-primary ${activeItem == 'audit-packages' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'audit-packages' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('Audit Packages')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                {/* </ul>
                                            </AnimateHeight>
                                        </li> */}
                                    </ul>
                                </li>
                                <li className="menu nav-item">
                                    <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                                        <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:text-[#bec1d3] dark:bg-dark dark:bg-opacity-[0.08]">
                                            <FaChartColumn className="shrink-0 group-hover:!text-primary dark:text-[#bec1d3]" />
                                            <span className="ml-3">{t('Insight')}</span>
                                        </h2>
                                        <li className="menu nav-item ml-5">
                                            {/* <Link href="/sales-manage" className="group" onClick={() => handleSetActiveItem('sales')}>
                                        <div className="flex items-center">
                                            <TbReportMoney className={`shrink-0 group-hover:!text-primary ${activeItem == 'sales' ? '!text-primary' : ''}`} />
                                            <span
                                                className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                    activeItem == 'sales' ? '!text-primary' : ''
                                                }`}
                                            >
                                                {t('Sales')}
                                            </span>
                                        </div>
                                    </Link> */}
                                            
                                            <Link href={`/summary-insight`} className={`group ${activeItem == 'summary' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`} onClick={() => handleSetActiveItem('summary')}>
                                                <div className="flex items-center">
                                                    <MdOutlineInsights className={`shrink-0 group-hover:!text-primary ${activeItem == 'summary' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`ltr:pl-3 rtl:pr-3 group-hover:!text-primary ${
                                                            activeItem == 'summary' ? '!text-primary dark:!text-primary' : 'text-dark dark:text-white-dark'
                                                        }`}
                                                    >
                                                        {t('Summary')}
                                                    </span>
                                                </div>
                                            </Link>
                                            <Link href="/daytime-insight" className={`group ${activeItem == 'dayTime' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`} onClick={() => handleSetActiveItem('dayTime')}>
                                                <div className="flex items-center">
                                                    <CiCalendarDate className={`shrink-0 group-hover:!text-primary ${activeItem == 'dayTime' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`ltr:pl-3 rtl:pr-3 group-hover:!text-primary ${
                                                            activeItem == 'dayTime' ? '!text-primary dark:!text-primary' : 'text-dark dark:text-white-dark'
                                                        }`}
                                                    >
                                                        {t('Day & Time')}
                                                    </span>
                                                </div>
                                            </Link>
                                            <Link href="/action-history" className={`group ${activeItem == 'actionHistory' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`} onClick={() => handleSetActiveItem('actionHistory')}>
                                                <div className="flex items-center">
                                                    <MdPendingActions className={`shrink-0 group-hover:!text-primary ${activeItem == 'actionHistory' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`ltr:pl-3 rtl:pr-3 group-hover:!text-primary ${
                                                            activeItem == 'actionHistory' ? '!text-primary dark:!text-primary' : 'text-dark dark:text-white-dark'
                                                        }`}
                                                    >
                                                        {t('Action History')}
                                                    </span>
                                                </div>
                                            </Link>
                                            {/* <Link
                                                href="/payment-report"
                                                className={`group ${activeItem == 'payment' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}
                                                onClick={() => handleSetActiveItem('payment')}
                                            >
                                                <div className="flex items-center">
                                                    <TbReportMoney className={`shrink-0 group-hover:!text-primary ${activeItem == 'payment' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`ltr:pl-3 rtl:pr-3 group-hover:!text-primary ${
                                                            activeItem == 'payment' ? '!text-primary dark:!text-primary' : 'text-dark dark:text-white-dark'
                                                        }`}
                                                    >
                                                        {t('Payment')}
                                                    </span>
                                                </div>
                                            </Link> */}
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu nav-item">
                                    <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                                        <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:text-[#bec1d3] dark:bg-dark dark:bg-opacity-[0.08]">
                                            <CgFileDocument className="shrink-0 group-hover:!text-primary dark:text-[#bec1d3]" />
                                            <span className="ml-3">{t('Report')}</span>
                                        </h2>
                                        <li className="menu nav-item ml-5">
                                            {/* <Link href="/sales-manage" className="group" onClick={() => handleSetActiveItem('sales')}>
                                        <div className="flex items-center">
                                            <TbReportMoney className={`shrink-0 group-hover:!text-primary ${activeItem == 'sales' ? '!text-primary' : ''}`} />
                                            <span
                                                className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                    activeItem == 'sales' ? '!text-primary' : ''
                                                }`}
                                            >
                                                {t('Sales')}
                                            </span>
                                        </div>
                                    </Link> */}
                                            <Link href={`/sales-report`} className={`group ${activeItem == 'sales' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`} onClick={() => handleSetActiveItem('sales')}>
                                                <div className="flex items-center">
                                                    <TbReportAnalytics className={`shrink-0 group-hover:!text-primary ${activeItem == 'sales' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`ltr:pl-3 rtl:pr-3 group-hover:!text-primary ${
                                                            activeItem == 'sales' ? '!text-primary dark:!text-primary' : 'text-dark dark:text-white-dark'
                                                        }`}
                                                    >
                                                        {t('Sales')}
                                                    </span>
                                                </div>
                                            </Link>
                                            </li>
                                            <li className="menu nav-item ml-5">
                                            <Link
                                                href={`/payment-report`}
                                                className={`group ${activeItem == 'payment' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}
                                                onClick={() => handleSetActiveItem('payment')}
                                            >
                                                <div className="flex items-center">
                                                    <TbReportMoney className={`shrink-0 group-hover:!text-primary ${activeItem == 'payment' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`ltr:pl-3 rtl:pr-3 group-hover:!text-primary ${
                                                            activeItem == 'payment' ? '!text-primary dark:!text-primary' : 'text-dark dark:text-white-dark'
                                                        }`}
                                                    >
                                                        {t('Payment')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                                <li className="menu nav-item">
                                    <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                                        <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:text-[#bec1d3] dark:bg-dark dark:bg-opacity-[0.08]">
                                            <IoSettingsSharp className="shrink-0 group-hover:!text-primary dark:text-[#bec1d3]" />
                                            <span className="ml-3">{t('setting')}</span>
                                        </h2>
                                        <li className="menu nav-item ml-5">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'metrc' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    toggleMenu('metrc');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <LiaCannabisSolid className="shrink-0 group-hover:!text-primary" />
                                                    <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary">{t('Metrc')}</span>
                                                </div>

                                                <div className={currentMenu !== 'metrc' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === 'metrc' ? 'auto' : 0}>
                                                <ul className="sub-menu text-dark">
                                                    <li onClick={() => handleSetActiveItem('metrc-connection')} className={`${activeItem == 'metrc-connection' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/metrc-connection`} className="group">
                                                            <div className="flex items-center">
                                                                <VscDebugDisconnect className={`shrink-0 group-hover:!text-primary ${activeItem == 'metrc-connection' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'metrc-connection' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('connection')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li onClick={() => handleSetActiveItem('metrcItemCategory')} className={`${activeItem == 'metrcItemCategory' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                        <Link href={`/metrc-item-category`} className="group">
                                                            <div className="flex items-center">
                                                                <CgList className={`shrink-0 group-hover:!text-primary ${activeItem == 'metrcItemCategory' ? '!text-primary' : ''}`} />
                                                                <span
                                                                    className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                                        activeItem == 'metrcItemCategory' ? '!text-primary' : ''
                                                                    }`}
                                                                >
                                                                    {t('metrcItemCategory')}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight>
                                        </li>
                                        <li className="menu nav-item ml-5" onClick={() => handleSetActiveItem('compliance')}>
                                            <Link href={`/compliance`} className={`group ${activeItem == 'compliance' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                <div className="flex items-center">
                                                    <GrCompliance className={`shrink-0 group-hover:!text-primary ${activeItem == 'compliance' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'compliance' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('Compliance')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="menu nav-item ml-5" onClick={() => handleSetActiveItem('store-details')}>
                                            <Link href={`/store-details`} className={`group ${activeItem == 'store-details' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                <div className="flex items-center">
                                                    <HiOutlineBuildingStorefront className={`shrink-0 group-hover:!text-primary ${activeItem == 'store-details' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'store-details' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('store')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="menu nav-item ml-5" onClick={() => handleSetActiveItem('users')}>
                                            <Link href={`/user-manage`} className={`group ${activeItem == 'users' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                <div className="flex items-center">
                                                    <RiGroupLine className={`shrink-0 group-hover:!text-primary ${activeItem == 'users' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'users' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('users')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="menu nav-item ml-5" onClick={() => handleSetActiveItem('printSetting')}>
                                            <Link href={`/print-setting`} className={`group ${activeItem == 'printSetting' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                <div className="flex items-center">
                                                    <RiPrinterFill className={`shrink-0 group-hover:!text-primary ${activeItem == 'printSetting' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'printSetting' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('print')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="menu nav-item ml-5" onClick={() => handleSetActiveItem('taxSetting')}>
                                            <Link href={`/tax-setting`} className={`group ${activeItem == 'taxSetting' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                <div className="flex items-center">
                                                    <FaHandHoldingDollar className={`shrink-0 group-hover:!text-primary ${activeItem == 'taxSetting' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'taxSetting' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('tax')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="menu nav-item ml-5" onClick={() => handleSetActiveItem('smsSetting')}>
                                            <Link href={`/sms-setting`} className={`group ${activeItem == 'smsSetting' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
                                                <div className="flex items-center">
                                                    <LiaSmsSolid className={`shrink-0 group-hover:!text-primary ${activeItem == 'smsSetting' ? '!text-primary' : ''}`} />
                                                    <span
                                                        className={`text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark group-hover:!text-primary ${
                                                            activeItem == 'smsSetting' ? '!text-primary' : ''
                                                        }`}
                                                    >
                                                        {t('sms')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                        {/* <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                    <LiaCannabisSolid className="shrink-0 group-hover:!text-primary" />
                                    <span className="ml-1">{t('metrc')}</span>
                                </h2> */}
                                        
                                        {/* <li className="menu nav-item">
                                    <Link href="/metrc-connection" className="group">
                                        <div className="flex items-center">
                                            <VscDebugDisconnect className="shrink-0 group-hover:!text-primary" />
                                            <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('connection')}</span>
                                        </div>
                                    </Link>
                                </li>
                                <li className="menu nav-item">
                                    <Link href="/metrc-item-category" className="group">
                                        <div className="flex items-center">
                                            <CgList className="shrink-0 group-hover:!text-primary" />
                                            <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('metrcItemCategory')}</span>
                                        </div>
                                    </Link>
                                </li> */}
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

export default StoreManagerSidebar;
