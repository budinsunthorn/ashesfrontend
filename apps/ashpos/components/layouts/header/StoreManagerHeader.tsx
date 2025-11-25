'use client';

// Import Third-Party Library
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Dropdown from '@/components/dropdown';
import { redirect, usePathname, useRouter } from 'next/navigation';
import { getTranslation } from '@/i18n';
import Cookies from 'universal-cookie';
import { useAtom } from 'jotai';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { NotifyType, useNotificationsQuery } from '@/src/__generated__/operations';

const MySwal = withReactContent(Swal);

// Import Customized Components
import StartDrawer from '@/components/etc/startDrawer';

// Import Store
import { IRootState } from '@/store';
import { userDataSave } from '@/store/userData';
import { userTypeTitles, userTypeColor } from '@/store/userTypeTitles';
import { ActiveSidebarItemAtom } from '@/store/activeSidebarItem';

import { useSyncMetrcIncomingTransferMutation, useImportMetrcPackageMutation, useGetLastSyncHistoryByDispensaryIdQuery } from '@/src/__generated__/operations';

// Import Icon
import { toggleTheme, toggleSidebar, toggleRTL } from '@/store/themeConfigSlice';
import IconMenu from '@/components/icon/icon-menu';
import IconXCircle from '@/components/icon/icon-x-circle';
import IconSun from '@/components/icon/icon-sun';
import IconMoon from '@/components/icon/icon-moon';
import IconLaptop from '@/components/icon/icon-laptop';
import IconMailDot from '@/components/icon/icon-mail-dot';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconInfoCircle from '@/components/icon/icon-info-circle';
import IconBellBing from '@/components/icon/icon-bell-bing';
import IconUser from '@/components/icon/icon-user';
import IconMail from '@/components/icon/icon-mail';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconLogout from '@/components/icon/icon-logout';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { FaChartColumn, FaChevronRight, FaPeopleGroup } from 'react-icons/fa6';
import { RiStore2Line, RiListSettingsLine, RiGroupLine, RiAdminLine, RiLockPasswordFill, RiPrinterFill } from 'react-icons/ri';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';
import { MdOutlineInsights, MdOutlineLoyalty, MdPendingActions } from 'react-icons/md';
import { TbReportAnalytics, TbReportMoney, TbShoppingBagDiscount } from 'react-icons/tb';
import { IoIosPeople } from 'react-icons/io';
import { FaCashRegister, FaHandHoldingDollar } from 'react-icons/fa6';
import { CgFileDocument, CgList, CgOpenCollective } from 'react-icons/cg';
import { RiShoppingBasketLine } from 'react-icons/ri';
import { TbTruckDelivery } from 'react-icons/tb';
import { MdShoppingBasket } from 'react-icons/md';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { TbPackages } from 'react-icons/tb';
import { MdOutlineBalance } from 'react-icons/md';
import { BiLogOut, BiSolidBadgeDollar } from 'react-icons/bi';
import { GrCompliance, GrConnect, GrStorage } from 'react-icons/gr';
import { LiaCannabisSolid, LiaSmsSolid } from 'react-icons/lia';
import { PiPackageLight } from 'react-icons/pi';
import { SlBasket, SlBasketLoaded } from 'react-icons/sl';
import { CiCalendarDate } from 'react-icons/ci';
import Marquee from 'react-fast-marquee';
import warnAlert from '@/components/notification/warnAlert';
import successAlert from '@/components/notification/successAlert';
import Tippy from '@tippyjs/react';
import moment from 'moment';

// atom
import { spinnerAtom } from '@/store/spinnerStatus';
import { syncStatusAtom } from '@/store/syncStatusAtom';
import { FaHistory } from 'react-icons/fa';
import { AiOutlineAudit, AiOutlineFileSync } from 'react-icons/ai';
import { Span } from 'next/dist/trace';
import { LuPackageCheck, LuPackageSearch } from 'react-icons/lu';
import { FiAlertTriangle } from 'react-icons/fi';
import { BsInfoCircle } from 'react-icons/bs';

type Notification = {
    notifyType: NotifyType;
    count: number;
};

const StoreManagerHeader = () => {
    const cookies = new Cookies();

    const { userData, setUserData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;
    const storeLinkName = userData.storeLinkName;
    const orgLinkName = userData.orgLinkName;
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const { t, i18n } = getTranslation();
    const [spinnerStatus, setSpinnerStatus] = useAtom(spinnerAtom);
    const [acitveSideBarItem] = useAtom(ActiveSidebarItemAtom);
    const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);
    const [activeItem, setActiveItem] = useState('');

    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

    // console.log("userData", userData)

    // Query
    const lastSyncHistoryRowData = useGetLastSyncHistoryByDispensaryIdQuery({ dispensaryId: dispensaryId, syncType: 'package' });
    const lastSyncHistoryData = lastSyncHistoryRowData.data?.getLastSyncHistoryByDispensaryId;

    const notificationsRowData = useNotificationsQuery({ dispensaryId: dispensaryId });
    const notificationsData = notificationsRowData.data?.notifications;

    useEffect(() => {
        setFilteredNotifications(notificationsData?.filter((item): item is Notification => item != null && item.count !== 0) || []);
    }, [notificationsData]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Your code here - this runs every 10 minutes
            // console.log('10 minutes passed! Performing scheduled task...');
            notificationsRowData.refetch();
        }, 600000); // 600,000 ms = 10 minutes

        // Cleanup the interval on component unmount
        return () => clearInterval(interval);
    }, []);

    // console.log('notificationsData', notificationsData);

    // Mutation
    const syncMetrcIncomingTransferMutation = useSyncMetrcIncomingTransferMutation();
    const importMetrPackageMutation = useImportMetrcPackageMutation();

    const notificationMessages = {
        orderSync: (count: number) => count == 1 ? `There is an unsynced order. Please go to Orders page then check unsynced order.` : `There are ${count} unsynced orders. Please go to Orders page then check unsynced orders.`,
        packageFinish: (count: number) => count == 1 ? `One package is needed to be finished. Please go to Finish Packages page.` : `${count} packages are needed to be finished. Please go to Finish Packages page.`,
        packageReconcile: (count: number) => count == 1 ? `One package is needed to be reconciled. Please go to Metrc Reconciliation page.` : `${count} packages are needed to be reconciled. Please go to Metrc Reconciliation page.`,
        tinyPackage: (count: number) => count == 1 ? `One package contains very few items. Please go to Tiny Packages page then adjust.` : `${count}   packages contain very few items. Please go to Tiny Packages page then adjust.`,
    };

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }

            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');

            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [pathname]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const setLocale = (flag: string) => {
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
        router.refresh();
    };

    function createMarkup(messages: any) {
        return { __html: messages };
    }
    const [messages, setMessages] = useState([
        {
            id: 1,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-success-light dark:bg-success text-success dark:text-success-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>',
            title: 'Congratulations!',
            message: 'Your OS has been updated.',
            time: '1hr',
        },
        {
            id: 2,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-info-light dark:bg-info text-info dark:text-info-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>',
            title: 'Did you know?',
            message: 'You can switch between artboards.',
            time: '2hr',
        },
        {
            id: 3,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-danger-light dark:bg-danger text-danger dark:text-danger-light"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>',
            title: 'Something went wrong!',
            message: 'Send Reposrt',
            time: '2days',
        },
        {
            id: 4,
            image: '<span class="grid place-content-center w-9 h-9 rounded-full bg-warning-light dark:bg-warning text-warning dark:text-warning-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">    <circle cx="12" cy="12" r="10"></circle>    <line x1="12" y1="8" x2="12" y2="12"></line>    <line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>',
            title: 'Warning',
            message: 'Your password strength is low.',
            time: '5days',
        },
    ]);

    const handleSetActiveItem = (item: string) => {
        if (item !== 'queue') {
            setActiveItem(item);
        }
        localStorage.setItem('activeItem', item);
    };

    const removeMessage = (value: number) => {
        setMessages(messages.filter((user) => user.id !== value));
    };

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            profile: 'user-profile.jpeg',
            message: '<strong class="text-sm mr-1">John Doe</strong>invite you to <strong>Prototyping</strong>',
            time: '45 min ago',
        },
        {
            id: 2,
            profile: 'profile-34.jpeg',
            message: '<strong class="text-sm mr-1">Adam Nolan</strong>mentioned you to <strong>UX Basics</strong>',
            time: '9h Ago',
        },
        {
            id: 3,
            profile: 'profile-16.jpeg',
            message: '<strong class="text-sm mr-1">Anna Morgan</strong>Upload a file',
            time: '9h Ago',
        },
    ]);

    const removeNotification = (value: number) => {
        setNotifications(notifications.filter((user) => user.id !== value));
    };

    const handleSyncData = async () => {
        setSpinnerStatus({
            isLoading: true,
            text: 'Metrc Package Data synchronizing...',
        });
        setSyncStatus(false);

        await importMetrPackageMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    userId: userId,
                },
            },
            {
                onError(error) {
                    setSpinnerStatus({});

                    // MySwal.fire({
                    //     title: 'Metrc Package Sync Failed',
                    //     toast: true,
                    //     position: 'bottom-end',
                    //     showConfirmButton: false,
                    //     timer: 5000,
                    //     showCloseButton: true,
                    // });
                },
                async onSuccess(data) {
                    // successAlert(data.importMetrcPackage?.count + " Packages Synced")
                    // MySwal.fire({
                    //     title: data.importMetrcPackage?.count + " Packages Synced",
                    //     toast: true,
                    //     position: 'bottom-end',
                    //     showConfirmButton: false,
                    //     timer: 5000,
                    //     showCloseButton: true,
                    // });
                    setSpinnerStatus({
                        isLoading: true,
                        text: 'Metrc Transfer Data synchronizing...',
                    });

                    await syncMetrcIncomingTransferMutation.mutate(
                        {
                            input: {
                                dispensaryId: dispensaryId,
                                userId: userId,
                            },
                        },
                        {
                            onError(error) {
                                setSpinnerStatus({});
                                warnAlert('Metrc Transfer Sync Failed');
                            },
                            onSuccess(data) {
                                // console.log('data', data)
                                // successAlert(data.syncMetrcIncomingTransfer?.count + " Transfers Synced")
                                successAlert('Metrc Synced Success');
                                setSyncStatus(true);
                            },
                            onSettled() {
                                setSpinnerStatus({});
                                lastSyncHistoryRowData.refetch();
                                // setIsSaveButtonDisabled(false);
                            },
                        }
                    );
                },
                onSettled() {
                    // setIsSaveButtonDisabled(false);
                },
            }
        );
    };

    const roleColor = `rounded bg-${userTypeColor(userData.userType)}-100 text-${userTypeColor(userData.userType)}-800 text-xs font-medium me-2 px-2.5 py-0.5 dark:bg-${userTypeColor(
        userData.userType
    )}-900 dark:text-${userTypeColor(userData.userType)}-300 ltr:ml-2 rtl:ml-2`;

    // console.log(acitveSideBarItem)
    return (
        <header className={`${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''} ${acitveSideBarItem == 'queue' ? '!fixed w-full !right-[500px]' : ''}`}>
            <div className="shadow-sm">
                <div className="relative flex w-full items-center justify-between px-5 py-2.5">
                    <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                        <Link href={`/org/${orgLinkName}/${storeLinkName}`} className="main-logo flex shrink-0 items-center">
                            <img className="inline w-36 h-10 ltr:-ml-1 rtl:-mr-1" src="/assets/images/ashpos-logo.png" alt="logo" />
                            {/* <span className="hidden align-middle text-2xl  font-semibold  transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-dark md:inline">AshesPOS</span> */}
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconMenu className="h-5 w-5" />
                        </button>
                    </div>
                    <Tippy content={`Synced ${moment(lastSyncHistoryData?.createdAt).fromNow()}`} placement="bottom">
                        <div
                            className="h-10 w-10 flex justify-center items-center rounded-full border-[1px] border-theme_green hover:scale-105 hover:shadow-sm shadow-gray-500 cursor-pointer"
                            onClick={handleSyncData}
                        >
                            <LiaCannabisSolid className="text-theme_green text-3xl" />
                        </div>
                    </Tippy>

                    <div className="relative flex justify-start items-center disabled">
                        {/* <div className="absolute left-0 w-full z-[99] h-16 bg-transparent cursor-not-allowed"></div> */}
                        {/* <div className="ltr:mr-2 rtl:ml-2 sm:block">
                            <ul className="flex items-center space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                                <li>
                                    <Link href="/apps/calendar" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                        <IconCalendar />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apps/todolist" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                        <IconEdit />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/apps/chat" className="block rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60">
                                        <IconChatNotification />
                                    </Link>
                                </li>
                            </ul>
                        </div> */}
                        {/* <div className="sm:ltr:mr-auto sm:rtl:ml-auto">
                            <form
                                className={`${search && '!block'} absolute inset-x-0 top-1/2 z-10 mx-4 hidden -translate-y-1/2 sm:relative sm:top-0 sm:mx-0 sm:block sm:translate-y-0`}
                                onSubmit={() => setSearch(false)}
                            >
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="peer form-input bg-gray-100 placeholder:tracking-widest ltr:pl-9 ltr:pr-9 rtl:pl-9 rtl:pr-9 sm:bg-transparent ltr:sm:pr-4 rtl:sm:pl-4"
                                        placeholder="Search..."
                                    />
                                    <button type="button" className="absolute inset-0 h-9 w-9 appearance-none peer-focus:text-primary ltr:right-auto rtl:left-auto">
                                        <IconSearch className="mx-auto" />
                                    </button>
                                    <button type="button" className="absolute top-1/2 block -translate-y-1/2 hover:opacity-80 ltr:right-2 rtl:left-2 sm:hidden" onClick={() => setSearch(false)}>
                                        <IconXCircle />
                                    </button>
                                </div>
                            </form>
                            <button
                                type="button"
                                onClick={() => setSearch(!search)}
                                className="search_btn rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 dark:bg-dark/40 dark:hover:bg-dark/60 sm:hidden"
                            >
                                <IconSearch className="mx-auto h-4.5 w-4.5 dark:text-[#d0d2d6]" />
                            </button>
                        </div> */}
                        
                    </div>
                    <div className='max-w-[450px] mx-2'>
                        <Marquee direction="left" speed={50} pauseOnHover={true}>
                            <div className='flex justify-start items-center mx-2'>
                            {filteredNotifications && filteredNotifications.length > 0
                                ? filteredNotifications.map((notification, idx) => {
                                        if (!notification) {
                                            return null;
                                        }
                                        return (
                                            <div key={notification.notifyType + idx} className="flex justify-start items-center dark:text-white-dark/90">
                                                    {/* <h6 className="font-semibold capitalize">{notification.notifyType}</h6> */}
                                                    {notification.notifyType == 'orderSync' ? (
                                                        <span className="flex justify-start items-center !badge text-sm text-danger bg-danger-light dark:bg-danger-dark-light mr-2 text-nowrap">
                                                        <FiAlertTriangle className='text-danger mr-1' />
                                                            Sync Order
                                                            <span className='text-[12px] ml-2'>{notificationMessages[notification.notifyType]?.(notification.count) || ``}</span>
                                                        </span>
                                                    ) : notification.notifyType == 'packageFinish' ? (
                                                        <span className="flex justify-start items-center badge text-sm text-info bg-info-light dark:bg-info-dark-light mr-2 text-nowrap">
                                                        <BsInfoCircle className='text-info mr-1'/>
                                                        Finish Package
                                                        <span className='text-[12px] ml-2'>{notificationMessages[notification.notifyType]?.(notification.count) || ``}</span>
                                                        </span>
                                                    ) : notification.notifyType == 'packageReconcile' ? (
                                                        <span className="flex justify-start items-center badge text-sm text-success bg-success-light dark:bg-success-dark-light text-nowrap">
                                                        <LuPackageCheck className='text-success mr-1'/>
                                                            Reconcile Package
                                                            <span className='text-[12px] ml-2'>{notificationMessages[notification.notifyType]?.(notification.count) || ``}</span>
                                                            </span>
                                                    ) : notification.notifyType == 'tinyPackage' ? (
                                                                                                          <span className="flex justify-start items-center badge text-sm text-success bg-success-light dark:bg-success-dark-light text-nowrap">
                                                                                                              <LuPackageCheck className="text-success mr-1" />
                                                                                                              Tiny Package
                                                                                                              <span className="text-[12px] ml-2">
                                                                                                                  {notificationMessages['tinyPackage']?.(notification.count) || ``}
                                                                                                              </span>
                                                                                                          </span>
                                                                                                      ) : null}
                                                    {/* <span className={`px-3 py-2 text-sm font-normal dark:text-white-dark text-dark} text-nowrap`}>
                                                        {notificationMessages[notification.notifyType]?.(notification.count) || ``}
                                                    </span> */}
                                            </div>
                                        );
                                    })
                                : null}
                                </div>
                        </Marquee>
                    </div>
                    <div className={`hidden sm:block mx-auto ${acitveSideBarItem == 'queue' ? 'translate-x-[400px]' : ''}`}>
                        <StartDrawer />
                    </div>
                    <div className={`flex items-center dark:text-white-dark`}>
                        <div className="mx-2">
                            <span className="text-lg text-primary font-semibold">{userData.storeName}</span>
                        </div>
                        <div className="mx-1">
                            {themeConfig.theme === 'light' ? (
                                <button
                                    className={`${
                                        themeConfig.theme === 'light' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('dark'))}
                                >
                                    <IconSun />
                                </button>
                            ) : (
                                ''
                            )}
                            {themeConfig.theme === 'dark' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'dark' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('light'))}
                                >
                                    <IconMoon />
                                </button>
                            )}
                            {/* {themeConfig.theme === 'system' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'system' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('light'))}
                                >
                                    <IconLaptop />
                                </button>
                            )} */}
                        </div>
                        <div className="dropdown shrink-0 mx-1 z-[100] disabled">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60 disabled"
                                button={<IconMailDot />}
                            >
                                <ul className="w-[300px] !py-0 text-xs text-dark dark:text-white-dark sm:w-[375px]">
                                    <li className="mb-5" onClick={(e) => e.stopPropagation()}>
                                        <div className="relative !h-[68px] w-full overflow-hidden rounded-t-md p-5 text-white hover:!bg-transparent">
                                            <div className="bg- absolute inset-0 h-full w-full bg-[url(/assets/images/menu-heade.jpg)] bg-cover bg-center bg-no-repeat"></div>
                                            <h4 className="text-lg font-semibold">Messages</h4>
                                        </div>
                                    </li>
                                    {messages.length > 0 ? (
                                        <>
                                            <li onClick={(e) => e.stopPropagation()}>
                                                {messages.map((message) => {
                                                    return (
                                                        <div key={message.id} className="flex items-center px-5 py-3">
                                                            <div dangerouslySetInnerHTML={createMarkup(message.image)}></div>
                                                            <span className="px-3 dark:text-white-dark">
                                                                <div className="text-sm font-semibold dark:text-white-dark/90">{message.title}</div>
                                                                <div>{message.message}</div>
                                                            </span>
                                                            <span className="whitespace-pre rounded bg-white-dark/20 px-1 font-semibold text-dark/60 ltr:ml-auto ltr:mr-2 rtl:ml-2 rtl:mr-auto dark:text-white-dark">
                                                                {message.time}
                                                            </span>
                                                            <button type="button" className="text-neutral-300 hover:text-danger" onClick={() => removeMessage(message.id)}>
                                                                <IconXCircle />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </li>
                                            <li className="mt-5 border-t border-white-light text-center dark:border-white/10">
                                                <button type="button" className="group !h-[48px] justify-center !py-4 font-semibold text-primary dark:text-gray-400">
                                                    <span className="group-hover:underline ltr:mr-1 rtl:ml-1">VIEW ALL ACTIVITIES</span>
                                                    <IconArrowLeft className="transition duration-300 group-hover:translate-x-1 ltr:ml-1 rtl:mr-1" />
                                                </button>
                                            </li>
                                        </>
                                    ) : (
                                        <li className="mb-5" onClick={(e) => e.stopPropagation()}>
                                            <button type="button" className="!grid min-h-[200px] place-content-center text-lg hover:!bg-transparent">
                                                <div className="mx-auto mb-4 rounded-full text-primary ring-4 ring-primary/30">
                                                    <IconInfoCircle fill={true} className="h-10 w-10" />
                                                </div>
                                                No data available.
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </Dropdown>
                        </div>
                        <div className="dropdown shrink-0 mx-1 z-[100]">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                                button={
                                    <span>
                                        <IconBellBing />
                                        <span className="absolute top-0 flex h-3 w-3 ltr:right-0 rtl:left-0">
                                            <span className="absolute -top-[3px] inline-flex h-full w-full animate-ping rounded-full bg-success/50 opacity-75 ltr:-left-[3px] rtl:-right-[3px]"></span>
                                            <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-success"></span>
                                        </span>
                                    </span>
                                }
                            >
                                <ul className="w-[300px] divide-y !py-0 text-dark dark:divide-white/10 dark:text-white-dark sm:w-[350px]">
                                    <li>
                                        <div className="flex items-center justify-between px-4 py-2 font-semibold">
                                            <h4 className="text-lg">Notification</h4>
                                            {filteredNotifications?.length ? <span className="badge bg-primary/80">{filteredNotifications.length} New</span> : null}
                                        </div>
                                    </li>
                                    {filteredNotifications && filteredNotifications.length > 0 ? (
                                        filteredNotifications.map((notification, idx) => {
                                            if (!notification) {
                                                return null;
                                            }
                                            return (
                                                <li key={notification.notifyType + idx} className="dark:text-white-dark/90">
                                                    <div className="flex flex-col">
                                                        {/* <h6 className="font-semibold capitalize">{notification.notifyType}</h6> */}
                                                        {notification.notifyType == 'orderSync' ? (
                                                            <span className="!badge text-sm text-danger bg-danger-light dark:bg-danger-dark-light ">Sync Order</span>
                                                        ) : notification.notifyType == 'packageFinish' ? (
                                                            <span className="badge text-sm text-info bg-info-light dark:bg-info-dark-light">Finish Package</span>
                                                        ) : notification.notifyType == 'packageReconcile' ? (
                                                            <span className="badge text-sm text-success bg-success-light dark:bg-success-dark-light">Reconcile Package</span>
                                                        ) : notification.notifyType == 'tinyPackage' ? (
                                                            <span className="badge text-sm text-success bg-success-light dark:bg-success-dark-light">Tiny Package</span>
                                                        ) : null}
                                                        <span className={`block px-3 py-2 text-sm font-normal dark:text-white-dark text-dark}`}>
                                                            {notificationMessages[notification.notifyType]?.(notification.count) || ``}
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li>
                                            <button type="button" className="!grid min-h-[200px] place-content-center text-lg hover:!bg-transparent">
                                                <div className="mx-auto mb-4 rounded-full ring-4 ring-primary/30">
                                                    <IconInfoCircle fill={true} className="h-10 w-10 text-primary" />
                                                </div>
                                                No data available.
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </Dropdown>
                        </div>
                        <div className="dropdown flex shrink-0 mx-1">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative group block"
                                // button={<img className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/user-profile.jpeg" alt="userProfile" />}
                                button={
                                    // <img className="h-9 w-9 rounded-full border object-cover saturate-50 group-hover:saturate-100" src="/assets/images/user.png" alt="userProfile" />
                                    <div className="flex justify-center items-center h-10 w-10 rounded-full bg-theme_green text-white dark:text-theme_green-dark">
                                        <span className="text-lg font-bold">{userData?.name[0]}</span>
                                    </div>
                                }
                            >
                                <ul className="w-[230px] !py-0 my-1 font-semibold text-dark dark:text-white-dark dark:text-white-dark/90">
                                    <li>
                                        <div className="py-4">
                                            {/* <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/user-profile.jpeg" alt="userProfile" /> */}
                                            <div className="truncate flex flex-col justify-between items-start ltr:pl-4 rtl:pr-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg">{userData.name}</span>
                                                    <span className={`w-16 !px-1 ${roleColor}`}>
                                                        <Marquee direction="left" speed={10} pauseOnHover={true}>
                                                            &nbsp;{userTypeTitles(userData.userType) as string} &nbsp;
                                                        </Marquee>
                                                    </span>
                                                </div>
                                                <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                                    {userData.email}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                    {/* <li>
                                        <Link href="/users/profile" className="dark:hover:text-white">
                                            <IconUser className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/apps/mailbox" className="dark:hover:text-white">
                                            <IconMail className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            Inbox
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/auth/boxed-lockscreen" className="dark:hover:text-white">
                                            <IconLockDots className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            Lock Screen
                                        </Link>
                                    </li> */}
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        <Link href="/change-password" className="group">
                                            <div className="flex justify-start items-center gap-2 py-1 dark:hover:text-white">
                                                <RiLockPasswordFill />
                                                <span>Change Password</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        <button
                                            className="!py-3 text-danger"
                                            onClick={() => {
                                                cookies.remove('token', { path: '/' });
                                                router.push(`/org/${orgLinkName}/${storeLinkName}/signin`);
                                            }}
                                        >
                                            <IconLogout className="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                                            Sign Out
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* horizontal menu */}
                <ul className="horizontal-menu hidden border-t border-[#ebedf2] bg-white px-6 py-1.5 font-semibold text-black rtl:space-x-reverse dark:border-[#191e3a] dark:bg-black dark:text-white-dark lg:space-x-1.5 xl:space-x-8">
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <BiSolidBadgeDollar className="shrink-0" />
                                <span className="px-1">{t('Sales')}</span>
                            </div>
                            <div className="right_arrow">
                                <IconCaretDown />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li className="menu nav-item relative">
                                <Link href="/sales-queue" className="group">
                                    <div className="flex items-center">
                                        <FaPeopleGroup className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{'Customer Queue'}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item relative">
                                <Link href="/sales-cashier" className="group">
                                    <div className="flex items-center">
                                        <FaCashRegister className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('cashier')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <div className="dropdown">
                                    <Dropdown
                                        placement={`right-end`}
                                        btnClassName="nav-link group w-full"
                                        button={
                                            <>
                                                <div className="flex items-center">
                                                    <IoIosPeople className="text-2xl mr-2 group-hover:!text-primary" />
                                                    {t('Customer')}
                                                </div>

                                                <FaChevronRight />
                                            </>
                                        }
                                    >
                                        <ul className="!min-w-[170px]">
                                            <li>
                                                <Link href="/customer-manage" className="group">
                                                    <div className="flex items-center">
                                                        <IoIosPeople className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('customers')}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/loyalty-manage" className="group">
                                                    <div className="flex items-center">
                                                        <MdOutlineLoyalty className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('loyalty')}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/discount-manage" className="group">
                                                    <div className="flex items-center">
                                                        <TbShoppingBagDiscount className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('discount')}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </li>
                            <li>
                                <Link href="/orders-manage" className="group">
                                    <div className="flex items-center">
                                        <SlBasket className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('orders')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li onClick={() => handleSetActiveItem('drawers')} className={`menu nav-item ${activeItem == 'drawers' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
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
                        </ul>
                    </li>
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <MdShoppingBasket className="shrink-0" />
                                <span className="px-1">{t('Product')}</span>
                            </div>
                            <div className="right_arrow">
                                <IconCaretDown />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li className="menu nav-item">
                                <Link href="/supplier-manage" className="group">
                                    <div className="flex items-center">
                                        <TbTruckDelivery className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('supplier')}</span>
                                    </div>
                                </Link>
                                <Link href="/product-manage" className="group">
                                    <div className="flex items-center">
                                        <RiShoppingBasketLine className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('products')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/categories" className="group">
                                    <div className="flex items-center">
                                        <CgList className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('category')}</span>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <GrStorage className="shrink-0" />
                                <span className="px-1">{t('Inventory')}</span>
                            </div>
                            <div className="right_arrow">
                                <IconCaretDown />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            {/* <li>
                                <div className="dropdown">
                                    <Dropdown
                                        placement={`right-start`}
                                        btnClassName="nav-link group w-full"
                                        button={
                                            <>
                                                <div className="flex items-center">
                                                    <TbPackages className="text-2xl mr-2 group-hover:!text-primary" />
                                                    {t('Package')}
                                                </div>
                                                <FaChevronRight />
                                            </>
                                        }
                                    >
                                        <ul className="!min-w-[170px]"> */}
                            <li className="menu nav-item">
                                <Link href="/package-manage" className="group">
                                    <div className="flex items-center">
                                        <TbPackages className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('Packages')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/transfer-manage" className="group">
                                    <div className="flex items-center">
                                        <GrConnect className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('Transfer')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/finish_package-manage" className="group">
                                    <div className="flex items-center">
                                        <PiPackageLight className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('Finish Packages')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/tiny_package-manage" className="group">
                                    <div className="flex items-center">
                                        <LuPackageSearch className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('Tiny Packages')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li onClick={() => handleSetActiveItem('metrc-reconciliation')} className={`menu nav-item ${activeItem == 'metrc-reconciliation' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
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
                            <li onClick={() => handleSetActiveItem('audit-packages')} className={`menu nav-item ${activeItem == 'audit-packages' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`}>
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
                                    </Dropdown>
                                </div>
                            </li> */}
                        </ul>
                    </li>
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <FaChartColumn className="shrink-0" />
                                <span className="px-1">{t('insight')}</span>
                            </div>
                            <div className="right_arrow">
                                <IconCaretDown />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            {/* <li>
                                <div className="dropdown">
                                    <Dropdown
                                        placement={`right-start`}
                                        btnClassName="nav-link group w-full"
                                        button={
                                            <>
                                                <div className="flex items-center">
                                                    <TbPackages className="text-2xl mr-2 group-hover:!text-primary" />
                                                    {t('Package')}
                                                </div>
                                                <FaChevronRight />
                                            </>
                                        }
                                    >
                                        <ul className="!min-w-[170px]"> */}
                            {/* <li className="menu nav-item">
                                                <Link href="/daytime-insight" className="group">
                                                    <div className="flex items-center">
                                                        <CiCalendarDate className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('Day & Time')}</span>
                                                    </div>
                                                </Link>
                                            </li> */}
                            <li className="menu nav-item">
                                <Link href="/summary-insight" className="group">
                                    <div className="flex items-center">
                                        <MdOutlineInsights className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('Summary')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link href="/daytime-insight" className={`group ${activeItem == 'dayTime' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`} onClick={() => handleSetActiveItem('dayTime')}>
                                    <div className="flex items-center">
                                        <CiCalendarDate className={`shrink-0 group-hover:!text-primary ${activeItem == 'dayTime' ? '!text-primary' : ''}`} />
                                        <span
                                            className={`ltr:pl-3 rtl:pr-3 group-hover:!text-primary ${activeItem == 'dayTime' ? '!text-primary dark:!text-primary' : 'text-dark dark:text-white-dark'}`}
                                        >
                                            {t('Day & Time')}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link href="/action-history" className={`group ${activeItem == 'actionHistory' ? 'bg-[#ebebeb] dark:bg-[#191f33]' : ''}`} onClick={() => handleSetActiveItem('actionHistory')}>
                                    <div className="flex items-center">
                                        <MdPendingActions className={`shrink-0 group-hover:!text-primary ${activeItem == 'actionHistory' ? '!text-primary' : ''}`} />
                                        <span
                                            className={`ltr:pl-3 rtl:pr-3 group-hover:!text-primary ${activeItem == 'actionHistory' ? '!text-primary dark:!text-primary' : 'text-dark dark:text-white-dark'}`}
                                        >
                                            {t('Action History')}
                                        </span>
                                    </div>
                                </Link>
                            </li>

                            {/* </ul>
                                    </Dropdown>
                                </div>
                            </li> */}
                        </ul>
                    </li>
                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                {/* <MdOutlineBalance className="shrink-0" /> */}
                                <CgFileDocument className="shrink-0 group-hover:!text-primary" />
                                <span className="px-1">{t('Report')}</span>
                            </div>
                            <div className="right_arrow">
                                <IconCaretDown />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li className="menu nav-item">
                                <Link href="/sales-report" className="group">
                                    <div className="flex items-center">
                                        <TbReportAnalytics className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('Sales')}</span>
                                    </div>
                                </Link>
                                <Link href="/payment-report" className="group">
                                    <div className="flex items-center">
                                        <TbReportMoney className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('Payment')}</span>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </li>

                    <li className="menu nav-item relative">
                        <button type="button" className="nav-link">
                            <div className="flex items-center">
                                <LiaCannabisSolid className="shrink-0" />
                                <span className="px-1">{t('Setting')}</span>
                            </div>
                            <div className="right_arrow">
                                <IconCaretDown />
                            </div>
                        </button>
                        <ul className="sub-menu">
                            <li>
                                <div className="dropdown">
                                    <Dropdown
                                        placement={`right-end`}
                                        btnClassName="nav-link group w-full"
                                        button={
                                            <>
                                                <div className="flex items-center">
                                                    <TbPackages className="text-2xl mr-2 group-hover:!text-primary" />
                                                    {t('Metrc')}
                                                </div>
                                                <FaChevronRight />
                                            </>
                                        }
                                    >
                                        <ul className="!min-w-[170px]">
                                            <li>
                                                <Link href="/metrc-connection" className="group">
                                                    <div className="flex items-center pl-3">
                                                        <VscDebugDisconnect className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('connection')}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/metrc-item-category" className="group">
                                                    <div className="flex items-center pl-3">
                                                        <CgList className="shrink-0 group-hover:!text-primary" />
                                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('metrcItemCategory')}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </li>
                            <li className="menu nav-item" onClick={() => handleSetActiveItem('compliance')}>
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
                            <li className="menu nav-item">
                                <Link href="/store-details" className="group">
                                    <div className="flex items-center">
                                        <HiOutlineBuildingStorefront className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('store')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/user-manage" className="group">
                                    <div className="flex items-center">
                                        <RiGroupLine className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('users')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item" onClick={() => handleSetActiveItem('printSetting')}>
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
                            <li className="menu nav-item">
                                <Link href="/tax-setting" className="group">
                                    <div className="flex items-center">
                                        <FaHandHoldingDollar className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('tax')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/sms-setting" className="group">
                                    <div className="flex items-center">
                                        <LiaSmsSolid className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-dark ltr:pl-3 rtl:pr-3 dark:text-white-dark dark:group-hover:text-white-dark">{t('sms')}</span>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </header>
    );
};

export default StoreManagerHeader;
