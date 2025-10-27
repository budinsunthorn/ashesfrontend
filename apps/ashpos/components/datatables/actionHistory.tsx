'use client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useDebouncedCallback } from 'use-debounce';
import PerfectScrollbar from 'react-perfect-scrollbar';
import moment from 'moment';

import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';

import {
    Scalars,
    useActionHistoryQuery,
    useOrderWithTaxSumQuery,
    usePackageQuery,
    usePackageByLabelQuery,
    useCustomerQuery,
    usePackagesByConnectedProductIdQuery,
    useProductQuery,
    useDrawerReportByDrawerIdQuery,
    useAllOrdersInfoIncludingAllTypesByDrawerIdQuery,
    useMoneyDropHistoryByDrawerIdQuery,
} from '@/src/__generated__/operations';

import { userDataSave } from '@/store/userData';

// Icons
import { IoSearch } from 'react-icons/io5';
import { FaArrowRightFromBracket } from 'react-icons/fa6';

// Custom components
import { convertLocalTimetoUTCTimezone, convertPSTTimestampToTimezone, convertUTCTimeToLocalTimezone, formatDateTime, getCurrentTimeByTimezone } from '@/utils/datetime';
import LoadingSkeleton from '../etc/loadingSkeleton';
import OrderCard from '../etc/orderCard';
import OrderItem from '../etc/orderItem';
import ProductCategory from '../etc/productCategory';
import PackageCard from '../etc/packageCard';
import { TbPackages } from 'react-icons/tb';
import { FaUser } from 'react-icons/fa';
import UserBadge from '../etc/UserNameBadge';
import CustomerProfile from '../etc/customerDetail';
import ProductCard from '../etc/productCard';
import Divider from '../etc/divider';
import { formatCurrency } from '@/lib/utils';
import RefreshButton from '../etc/refreshButton';

// Type definition for action history item
interface ActionHistoryItem {
    id: string;
    actionName: string;
    userName: string;
    createdAt: string;
    f1?: string | null;
    f2?: string | null;
    f3?: string | null;
    f4?: string | null;
    orderId?: number | null;
    packageLabel?: string | null;
}

interface RegisterLabelType {
    [key: string]: string;
}

// Function to format date
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } else if (diffInHours < 48) {
        return (
            'Yesterday at ' +
            date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
        );
    } else {
        return (
            date.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit',
            }) +
            ', ' +
            date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
        );
    }
};

function ActionHistory() {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const storeTimeZone = userData.storeTimeZone;
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);

    // right sidebar
    const [isShowingRightSideBar, setIsShowingRightSideBar] = useState(false);
    const [rightSideBarType, setRightSideBarType] = useState('');
    const [orderId, setOrderId] = useState(0);
    const [packageLabel, setPackageLabel] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [productId, setProductId] = useState('');
    const [drawerId, setDrawerId] = useState('');
    const [showAllOrders, setShowAllOrders] = useState(false);

    const orderDetailRowData = useOrderWithTaxSumQuery({ id: orderId });
    const orderDetailData = orderDetailRowData.data?.orderWithTaxSum?.order;
    const orderDetailTaxSum = orderDetailRowData.data?.orderWithTaxSum?.tax;

    const packageRowDataById = usePackageByLabelQuery({ label: packageLabel });
    const packageDataById = packageRowDataById.data?.packageByLabel;

    const customerById = useCustomerQuery({ id: customerId });
    const customerDataById = customerById.data?.customer;

    const productRowDataById = useProductQuery({ id: productId });
    const productDataById = productRowDataById.data?.product;

    const packageRowData = usePackagesByConnectedProductIdQuery({ productId: productId });
    const packageData = packageRowData.data?.packagesByConnectedProductId;

    const drawerReportByDrawerId = useDrawerReportByDrawerIdQuery({ drawerId: drawerId || '' });
    const drawerReportData: any = drawerReportByDrawerId.data?.drawerReportByDrawerId;

    const allOrdersInfoIncludingAllTypes = useAllOrdersInfoIncludingAllTypesByDrawerIdQuery({ drawerId: drawerId || '' });
    const allOrdersInfoIncludingAllTypesData = allOrdersInfoIncludingAllTypes.data?.allOrdersInfoIncludingAllTypesByDrawerId;

    const moneyDropHistoryByDrawerId = useMoneyDropHistoryByDrawerIdQuery({ drawerId: drawerId || '' });
    const moneyDropHistoryByDrawerIdData = moneyDropHistoryByDrawerId.data?.moneyDropHistoryByDrawerId;

    const registerLabel: RegisterLabelType = {
        'register-1': 'Register-1',
        'register-2': 'Register-2',
        'register-3': 'Register-3',
        'register-4': 'Register-4',
    };

    const [searchSelectValue, setSearchSelectValue] = useState('orderId');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('orderId');
    const [searchParam, setSearchParam] = useState('');
    const [searchPage, setSearchPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const [startDay, setStartDay] = useState<any>(yesterday);
    const [endDay, setEndDay] = useState<any>(today);

    const [dateParam, setDateParam] = useState({
        dateFrom: formatDateTime(startDay),
        dateTo: formatDateTime(endDay),
    });

    const actionHistoryRowData = useActionHistoryQuery({
        dispensaryId: dispensaryId,
        searchField: searchField,
        searchParam: searchParam,
        pageNumber: searchPage,
        onePageRecords: pageSize,
        sortDirection: 'asc',
        fromDate: convertLocalTimetoUTCTimezone(dateParam.dateFrom, storeTimeZone),
        toDate: convertLocalTimetoUTCTimezone(dateParam.dateTo, storeTimeZone),
    });

    const actionHistoryData = actionHistoryRowData?.data?.actionHistory?.actionHistory;
    const totalCount = actionHistoryRowData?.data?.actionHistory?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasMorePages = searchPage < totalPages;
    const currentPageItems = actionHistoryData?.filter((item) => item !== null).length || 0;

    console.log('actionHistoryData', actionHistoryData);
    console.log('hasMorePages', hasMorePages, 'currentPageItems', currentPageItems);

    const handleRealtimeSearch = useDebouncedCallback((param) => {
        setSearchParam(param.trim());
        setSearchField(searchSelectValue);
        setSearchPage(1);
    }, 500);

    const handleSearch = () => {
        setSearchField(searchSelectValue);
        setSearchParam(searchValue.trim());
        setSearchPage(1);
    };

    const getSalesIndexData = () => {
        setDateParam({ dateFrom: formatDateTime(startDay), dateTo: formatDateTime(endDay) });
    };

    // Pagination handlers
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchPage(newPage);
        }
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setSearchPage(1); // Reset to first page when changing page size
    };

    // Generate page numbers for pagination based on total pages
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages is less than or equal to max visible pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show a range of pages around the current page
            let startPage = Math.max(1, searchPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            // Adjust start page if we're near the end
            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    return (
        <div className="">
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-dark">Action History</h5>
            </div>
            <div className="text-right flex justify-start items-center">
                <select
                    onChange={(e) => {
                        setSearchSelectValue(e.target.value);
                    }}
                    id="currentDispensary"
                    className="flex-initial w-44 form-select rounded-r-none"
                >
                    {/* <option value='' className='text-white-dark'>Select Serch Field</option> */}
                    <option value="orderId">Order Id</option>
                    <option value="packageLabel">Package Label</option>
                    {/* <option value='packageId'>packageId</option> */}
                </select>
                <input
                    type="text"
                    className="form-input !rounded-none w-44"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        handleRealtimeSearch(e.target.value);
                    }}
                />
                <button
                    onClick={handleSearch}
                    className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 py-3  font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                >
                    <IoSearch />
                </button>
                <div>
                    <div className="flex justify-center items-center ml-3">
                        <Flatpickr
                            data-enable-time
                            id="currentDate"
                            value={startDay ? startDay : today}
                            options={{
                                position: 'auto left',
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i',
                                time_24hr: true,
                            }}
                            className="form-input w-[180px] flex-1 mr-2"
                            onChange={(date) => {
                                setStartDay(date[0]);
                                // refetchOrders()
                            }}
                        />
                        ~
                        <Flatpickr
                            data-enable-time
                            options={{
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i',
                                position: 'auto left',
                                time_24hr: true,
                            }}
                            value={endDay ? endDay : today}
                            className="form-input ml-2"
                            onChange={(date) => {
                                setEndDay(date[0]);
                                // refetchOrders()
                            }}
                        />
                        <button className="btn btn-primary mx-2" onClick={getSalesIndexData}>
                            Submit
                        </button>
                        <RefreshButton onClick={() => actionHistoryRowData.refetch()} />
                    </div>
                </div>
            </div>
            <div style={{ width: isShowingRightSideBar ? 'calc(100% - 500px)' : 'auto' }}>
                {/* Pagination Controls */}
                <div className={`panel mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* Pagination Info */}
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Page {searchPage} of {totalPages} - Showing {currentPageItems} of {totalCount} entries
                            </div>

                            {/* Page Size Selector */}
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Show:</p>
                                <select
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    className="form-select no-appearance appearance-none text-sm py-1 px-2 w-14 border border-gray-300 dark:border-gray-600 rounded"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
                            </div>
                        </div>

                        {/* Pagination Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(searchPage - 1)}
                                disabled={searchPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1 text-sm border rounded ${
                                            pageNum === searchPage ? 'bg-primary text-white border-primary' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(searchPage + 1)}
                                disabled={!hasMorePages}
                                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`panel mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
                    <div className="flex flex-col items-start justify-start mx-auto">
                        {actionHistoryData && actionHistoryData.length > 0 ? (
                            actionHistoryData
                                .filter((item): item is NonNullable<typeof item> => item !== null)
                                .map((item, index) => {
                                    const isLast = index === actionHistoryData.filter((i) => i !== null).length - 1;
                                    const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
                                    const colorClass = colors[index % colors.length];

                                    return (
                                        <div key={item.id} className="flex w-full">
                                            <div className="text-wrap text-dark dark:text-white-dark text-sm font-semibold py-2.5">{convertUTCTimeToLocalTimezone(item.createdAt, storeTimeZone)}</div>
                                            <div
                                                style={{ color: `before:border-${colorClass} isLast ? 'after:border-${colorClass}' : ''` } as React.CSSProperties}
                                                className="relative px-3 before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[15px] before:w-2.5 before:h-2.5 before:border-2 before:border-primary before:rounded-full after:absolute after:left-1/2 after:-translate-x-1/2 after:top-[25px] after:-bottom-[15px] after:w-0 after:h-auto after:border-l-2 after:border-primary after:rounded-full"
                                            ></div>
                                            <div className="p-2.5 w-[75%] text-dark dark:text-white-dark font-semibold text-[15px] text-wrap break-words">
                                                {(() => {
                                                    const { actionName, userName, f1, f2, f3, f4, orderId, packageLabel, productId, targetRecordId, customerId } = item;
                                                    switch (actionName) {
                                                        case 'createOrganization':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <span className="flex justify-start text-sm items-center mx-1 badge text-info bg-info-light dark:bg-info-dark-light">
                                                                        <FaUser className="mx-[1px]" />
                                                                        {userName}
                                                                    </span>
                                                                    created an organization {f1}.
                                                                </span>
                                                            );
                                                        case 'createDispensary':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <span className="">
                                                                        <span className="flex justify-start text-sm items-center mx-1 badge text-info bg-info-light dark:bg-info-dark-light">
                                                                            <FaUser className="mx-[1px]" />
                                                                            {userName}
                                                                        </span>
                                                                    </span>{' '}
                                                                    created a dispensary {f1}
                                                                </span>
                                                            );
                                                        case 'createSupplier':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a supplier <span className="italic text-primary ml-1">{f1}({f2})</span> 
                                                                </span>
                                                            );
                                                        case 'createMoneyDrop':
                                                            if (f1 === 'IN') {
                                                                return (
                                                                    <span className="flex justify-start items-center">
                                                                        <UserBadge userName={userName} /> dropped ${f2} in. (Reason: {f3})
                                                                    </span>
                                                                );
                                                            } else if (f1 === 'OUT') {
                                                                return (
                                                                    <span className="flex justify-start items-center">
                                                                        <UserBadge userName={userName} /> dropped ${f2} out. (Reason: {f3})
                                                                    </span>
                                                                );
                                                            }
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a money drop {f1}
                                                                </span>
                                                            );
                                                        case 'createUser':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a user {f1}.
                                                                </span>
                                                            );
                                                        case 'createCustomer':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a customer
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-secondary mx-1"
                                                                        onClick={() => {
                                                                            setCustomerId(customerId || '');
                                                                            setIsShowingRightSideBar(true);
                                                                            setRightSideBarType('customer');
                                                                        }}
                                                                    >
                                                                        {f1}
                                                                    </span>
                                                                    ({f2})
                                                                </span>
                                                            );
                                                        case 'startDrawer':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> started with a drawer with a starting amount of ${f1} in
                                                                    <span
                                                                        className="badge badge-small text-info bg-info-light dark:bg-info-dark-light mx-1 flex justify-start items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            setDrawerId(targetRecordId || '');
                                                                            setRightSideBarType('drawer');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        {registerLabel[f2 || '']}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'createProduct':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a new product{' '}
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-info mx-1"
                                                                        onClick={() => {
                                                                            setProductId(productId || '');
                                                                            setRightSideBarType('product');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        {f1}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'createLoyalty':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a new loyalty{' '}
                                                                    <span className="cursor-pointer badge badge-outline-primary mx-1">{f1}</span>
                                                                </span>
                                                            );
                                                        case 'createDiscount':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a new discount{' '}
                                                                    <span className="cursor-pointer badge badge-outline-primary mx-1">{f1}</span>
                                                                </span>
                                                            );
                                                        case 'createItemCategory':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a new category {f1}
                                                                </span>
                                                            );
                                                        case 'setPurchaseLimitByDispensaryId':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated Medical Purchase limits.
                                                                </span>
                                                            );
                                                        case 'createTaxSetting':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a new tax <span className="cursor-pointer badge badge-outline-primary mx-1">{f1}</span>
                                                                </span>
                                                            );
                                                        case 'holdPackage':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> held package{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-warning ml-1 flex justify-start items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            setPackageLabel(packageLabel || '');
                                                                            setIsShowingRightSideBar(true);
                                                                            setRightSideBarType('package');
                                                                        }}
                                                                    >
                                                                        <TbPackages className="mx-[1px]" />
                                                                        {packageLabel}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'unHoldPackage':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> activated package{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-warning mx-1 flex justify-start items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            setPackageLabel(packageLabel || '');
                                                                            setRightSideBarType('package');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        <TbPackages className="mx-[1px]" />
                                                                        {packageLabel}
                                                                    </span>{' '}
                                                                    from hold status.
                                                                </span>
                                                            );
                                                        case 'activePackage':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> activated package{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-warning mx-1 flex justify-start items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            setPackageLabel(packageLabel || '');
                                                                            setRightSideBarType('package');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        <TbPackages className="mx-[1px]" />
                                                                        {packageLabel}
                                                                    </span>{' '}
                                                                    from finished status.
                                                                </span>
                                                            );
                                                        case 'finishPackage':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> finished package{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-warning ml-1 flex justify-start items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            setPackageLabel(packageLabel || '');
                                                                            setRightSideBarType('package');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        <TbPackages className="mx-[1px]" />
                                                                        {packageLabel}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'finishZeroPackage':
                                                            return (
                                                                <span className="flex flex-wrap justify-start items-center">
                                                                    <UserBadge userName={userName} /> finished {f1} packages. (
                                                                    {f2 &&
                                                                        f2
                                                                            .toString()
                                                                            .split(',')
                                                                            .map((item, index) => (
                                                                                <span
                                                                                    key={index} // Use index as a key, but consider using a unique identifier if available
                                                                                    className="badge badge-small badge-outline-warning mx-1 flex justify-start items-center cursor-pointer"
                                                                                    onClick={() => {
                                                                                        setPackageLabel(item.trim()); // Use item instead of packageLabel
                                                                                        setRightSideBarType('package');
                                                                                        setIsShowingRightSideBar(true);
                                                                                    }}
                                                                                >
                                                                                    <TbPackages className="mx-[1px]" />
                                                                                    {item.trim()} {/* Display the current item */}
                                                                                </span>
                                                                            ))}{' '}
                                                                    )
                                                                </span>
                                                            );
                                                        case 'createTransfer':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created a new Non-MJ Transfer.
                                                                </span>
                                                            );
                                                        case 'createPrintSetting':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated Print Setting.
                                                                </span>
                                                            );
                                                        case 'createCustomerQueue':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> added a customer{' '}
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-secondary mx-1"
                                                                        onClick={() => {
                                                                            setCustomerId(customerId || '');
                                                                            setIsShowingRightSideBar(true);
                                                                            setRightSideBarType('customer');
                                                                        }}
                                                                    >
                                                                        {f1}({f2})
                                                                    </span>
                                                                    to queue.
                                                                </span>
                                                            );
                                                        case 'createOrderItem':
                                                            return (
                                                                <span className="flex justify-start flex-row flex-wrap items-center">
                                                                    <UserBadge userName={userName} /> added a product
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-info mx-1"
                                                                        onClick={() => {
                                                                            setProductId(productId || '');
                                                                            setRightSideBarType('product');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        {f1}
                                                                    </span>{' '}
                                                                    (
                                                                    <span
                                                                        className="badge badge-small badge-outline-warning mx-1 flex justify-start items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            setPackageLabel(packageLabel || '');
                                                                            setRightSideBarType('package');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        <TbPackages className="mx-[1px]" />
                                                                        {packageLabel}
                                                                    </span>{' '}
                                                                    ) to order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'completeOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> completed an order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                    {f1 == 'failed' ? (
                                                                        <span className="ml-2 badge badge-small text-warning dark:bg-warning-dark bg-warning-light">Metrc Report Failed</span>
                                                                    ) : (
                                                                        <span className="ml-2 badge badge-small text-success dark:bg-success-dark-light bg-success-light">Metrc Report Success</span>
                                                                    )}
                                                                </span>
                                                            );
                                                        case 'createOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> created an order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'setDiscountForOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> set discount ({f1}, {f2}, {f3}) for order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'syncOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> synced an order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                    {f1 == 'failed' ? (
                                                                        <span className="ml-2 badge badge-small text-warning dark:bg-warning-dark bg-warning-light">Metrc Report Failed</span>
                                                                    ) : (
                                                                        <span className="ml-2 badge badge-small text-success dark:bg-success-dark-light bg-success-light">Metrc Report Success</span>
                                                                    )}
                                                                </span>
                                                            );
                                                        case 'unSyncOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> unsynced an order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                    {f1 == 'failed' ? (
                                                                        <span className="ml-2 badge badge-small text-warning dark:bg-warning-dark bg-warning-light">Metrc Report Failed</span>
                                                                    ) : (
                                                                        <span className="ml-2 badge badge-small text-success dark:bg-success-dark-light bg-success-light">Metrc Report Success</span>
                                                                    )}
                                                                </span>
                                                            );
                                                        case 'setLoyaltyForOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> set loyalty discount(
                                                                    <span className="cursor-pointer badge badge-outline-primary mx-1">
                                                                        {f1}, {f2}, {f4}, {f3}
                                                                    </span>
                                                                    ) for order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'updateOrganization':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated an organization {f1}.
                                                                </span>
                                                            );
                                                        case 'updateDispensary':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated a dispensary {f1}
                                                                </span>
                                                            );
                                                        case 'updateSmsByDispensaryId':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated SMS setting.
                                                                </span>
                                                            );
                                                        case 'updateSupplier':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated a supplier <span className="italic text-primary ml-1">{f1}</span>
                                                                </span>
                                                            );
                                                        case 'changePassword':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> changed password.
                                                                </span>
                                                            );
                                                        case 'updateUser':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated a user {f1}'s info.
                                                                </span>
                                                            );
                                                        case 'holdOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> held an order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'cancelOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> cancelled an order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'bulkCancelOrderByDrawerId':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> cancelled an order #{f1} while drawer ending.
                                                                </span>
                                                            );
                                                        case 'unHoldOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> unheld an order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'voidOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> voided an order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>{' '}
                                                                    {f1 == 'failed' ? (
                                                                        <span className="ml-2 badge badge-small text-warning dark:bg-warning-dark bg-warning-light">Metrc Report Failed</span>
                                                                    ) : (
                                                                        <span className="ml-2 badge badge-small text-success dark:bg-success-dark-light bg-success-light">Metrc Report Success</span>
                                                                    )}
                                                                </span>
                                                            );
                                                        case 'endDrawer':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> ended a drawer on
                                                                    <span
                                                                        className="badge badge-small text-info bg-info-light dark:bg-info-dark-light mx-1 flex justify-start items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            setDrawerId(targetRecordId || '');
                                                                            setRightSideBarType('drawer');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        {registerLabel[f1 || '']}
                                                                    </span>
                                                                    with ${f2} ending amount.
                                                                </span>
                                                            );
                                                        case 'setUsingRegister':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> switched to{' '}
                                                                    <span
                                                                        className="badge badge-small text-info bg-info-light dark:bg-info-dark-light mx-1 flex justify-start items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            setDrawerId(targetRecordId || '');
                                                                            setRightSideBarType('drawer');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        {registerLabel[f1 || '']}
                                                                    </span>{' '}
                                                                    drawer
                                                                </span>
                                                            );
                                                        case 'updateLoyalty':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated loyalty setting for loyalty{' '}
                                                                    <span className="cursor-pointer badge badge-outline-primary mx-1">{f1}</span>
                                                                </span>
                                                            );
                                                        case 'updateDiscount':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated discount setting for discount{' '}
                                                                    <span className="cursor-pointer badge badge-outline-primary mx-1">{f1}</span>
                                                                </span>
                                                            );
                                                        case 'updateItemCategory':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated product category {f1}
                                                                </span>
                                                            );
                                                        case 'updateTaxSetting':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated tax setting for tax
                                                                    <span className="cursor-pointer badge badge-outline-primary mx-1">{f1}</span>({f2}%)
                                                                </span>
                                                            );
                                                        case 'updateCustomerByOrderId':
                                                            return (
                                                                <span className="flex flex-wrap justify-start items-center">
                                                                    <UserBadge userName={userName} /> <span className="text-nowrap">selected a customer</span>
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-secondary mx-1 text-nowrap"
                                                                        onClick={() => {
                                                                            setCustomerId(customerId || '');
                                                                            setIsShowingRightSideBar(true);
                                                                            setRightSideBarType('customer');
                                                                        }}
                                                                    >
                                                                        {f1} ({f2})
                                                                    </span>
                                                                    for order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'metrcConnectionUpdate':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> updated Metrc connection setting
                                                                </span>
                                                            );
                                                        case 'cancelDiscountForOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> cancelled discount applying for order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'cancelLoyaltyForOrder':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> cancelled loyalty applying for order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'deleteOrganization':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted an organization {f1}
                                                                </span>
                                                            );
                                                        case 'deleteDispensary':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted a dispensary {f1}
                                                                </span>
                                                            );
                                                        case 'deleteSupplier':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted a supplier <span className="italic text-primary ml-1">{f1}({f2})</span>
                                                                </span>
                                                            );
                                                        case 'deleteUser':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted a user {f1}
                                                                </span>
                                                            );
                                                        case 'deleteCustomer':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted a customer
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-secondary mx-1"
                                                                        onClick={() => {
                                                                            setCustomerId(customerId || '');
                                                                            setIsShowingRightSideBar(true);
                                                                            setRightSideBarType('customer');
                                                                        }}
                                                                    >
                                                                        {f1}
                                                                    </span>
                                                                    ({f2})
                                                                </span>
                                                            );
                                                        case 'deleteProduct':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted a product{' '}
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-info mx-1"
                                                                        onClick={() => {
                                                                            setProductId(productId || '');
                                                                            setRightSideBarType('product');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        {f1}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'deleteLoyalty':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted a loyalty setting{' '}
                                                                    <span className="cursor-pointer badge badge-outline-primary mx-1">{f1}</span>{' '}
                                                                </span>
                                                            );
                                                        case 'deleteDiscount':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted a discount setting{' '}
                                                                    <span className="cursor-pointer badge badge-outline-primary mx-1">{f1}</span>
                                                                </span>
                                                            );
                                                        case 'deleteItemCategory':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted a product category {f1}
                                                                </span>
                                                            );
                                                        case 'deleteTransfer':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> deleted a blank Non-Mj Transfer
                                                                </span>
                                                            );
                                                        case 'deleteOrderItem':
                                                            return (
                                                                <span className="flex flex-row flex-wrap justify-start items-center">
                                                                    <UserBadge userName={userName} /> removed a product{' '}
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-info mx-1"
                                                                        onClick={() => {
                                                                            setProductId(productId || '');
                                                                            setRightSideBarType('product');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        {f1}
                                                                    </span>{' '}
                                                                    (
                                                                    <span
                                                                        className="badge badge-small badge-outline-warning mx-1 flex justify-start items-center cursor-pointer"
                                                                        onClick={() => {
                                                                            setPackageLabel(packageLabel || '');
                                                                            setRightSideBarType('package');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        <TbPackages className="mx-[1px]" />
                                                                        {packageLabel}
                                                                    </span>
                                                                    ) in order{' '}
                                                                    <span
                                                                        className="badge badge-small badge-outline-success cursor-pointer ml-[2px]"
                                                                        onClick={() => {
                                                                            setOrderId(orderId || 0);
                                                                            setRightSideBarType('order');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        #{orderId}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'adjustPackage':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> adjusted quantity of package
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-warning mx-1 flex justify-start items-center"
                                                                        onClick={() => {
                                                                            setPackageLabel(packageLabel || '');
                                                                            setRightSideBarType('package');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        <TbPackages className="mx-[1px]" />
                                                                        {packageLabel}
                                                                    </span>
                                                                    to {f1} in POS side
                                                                </span>
                                                            );
                                                        case 'assignPackageToProduct':
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> assigned {f1} items of the MJ package
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-warning mx-1 flex justify-start items-center"
                                                                        onClick={() => {
                                                                            setPackageLabel(packageLabel || '');
                                                                            setRightSideBarType('package');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        <TbPackages className="mx-[1px]" />
                                                                        {packageLabel}
                                                                    </span>{' '}
                                                                    to the product{' '}
                                                                    <span
                                                                        className="cursor-pointer badge badge-outline-info mx-1"
                                                                        onClick={() => {
                                                                            setProductId(productId || '');
                                                                            setRightSideBarType('product');
                                                                            setIsShowingRightSideBar(true);
                                                                        }}
                                                                    >
                                                                        {f2}
                                                                    </span>
                                                                </span>
                                                            );
                                                        case 'assignNonMjPackageToProduct':
                                                            <span className="flex justify-start items-center">
                                                                <UserBadge userName={userName} /> assigned {f1} items of Non-MJ package
                                                                <span
                                                                    className="cursor-pointer badge badge-outline-warning mx-1 flex justify-start items-center"
                                                                    onClick={() => {
                                                                        setPackageLabel(packageLabel || '');
                                                                        setRightSideBarType('package');
                                                                        setIsShowingRightSideBar(true);
                                                                    }}
                                                                >
                                                                    <TbPackages className="mx-[1px]" />
                                                                    {packageLabel}
                                                                </span>{' '}
                                                                to the product{' '}
                                                                <span
                                                                    className="cursor-pointer badge badge-outline-info mx-1"
                                                                    onClick={() => {
                                                                        setProductId(productId || '');
                                                                        setRightSideBarType('product');
                                                                        setIsShowingRightSideBar(true);
                                                                    }}
                                                                >
                                                                    {f2}
                                                                </span>
                                                            </span>;
                                                        case 'createNonMJPackage':
                                                            <span className="flex justify-start items-center">
                                                                <UserBadge userName={userName} /> created a non-mj package{' '}
                                                                <span
                                                                    className="cursor-pointer badge badge-outline-warning mx-1 flex justify-start items-center"
                                                                    onClick={() => {
                                                                        setPackageLabel(packageLabel || '');
                                                                        setRightSideBarType('package');
                                                                        setIsShowingRightSideBar(true);
                                                                    }}
                                                                >
                                                                    <TbPackages className="mx-[1px]" />
                                                                    {packageLabel}
                                                                </span>
                                                            </span>;
                                                        default:
                                                            return (
                                                                <span className="flex justify-start items-center">
                                                                    <UserBadge userName={userName} /> performed {actionName}
                                                                </span>
                                                            );
                                                    }
                                                })()}
                                                <p className="ml-[2px] text-white-dark dark:text-dark text-xs font-bold self-center min-w-[100px] max-w-[100px]">{moment(item.createdAt).fromNow()}</p>
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="flex justify-center items-center py-8">
                                <p className="text-[#3b3f5c] dark:text-white-light">No action history found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right sidebar */}
            <div className={`fixed bottom-0 z-[101] transition-all duration-500 h-full right-0 bg-white ${isShowingRightSideBar ? 'w-[500px]' : 'w-0'}`}>
                {/* <div className="my-2 lg:flex flex-col gap-5 md:sm:flex-row md:items-center">
                        <h5 className="text-lg font-semibold dark:text-white-dark">Order Details</h5>
                    </div> */}
                {rightSideBarType == 'order' && (
                    <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                        <PerfectScrollbar>
                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                    onClick={() => setIsShowingRightSideBar(false)}
                                >
                                    <FaArrowRightFromBracket className="m-auto text-2xl" />
                                </button>
                                {/* {orderDetailData?.status == 'PAID' ? (
                                <div className="dropdown mr-5">
                                    <Dropdown placement={`bottom-end`} btnClassName="" button={<div className="text-3xl text-dark dark:text-white-dark font-extrabold">...</div>}>
                                        <ul className="absolute right-0">
                                            
                                            <li>
                                                <ExitLabelPrint orderId={orderDetailData?.id} text={"Print Exit Label"} className="flex justify-between items-center font-bold py-2 px-5 text-nowrap hover:bg-primary/10 hover:text-primary cursor-pointer" printButtonRef={exitPrintButtonRef} onAfterPrint={() => {}}/>
                                            </li>
                                            <li>
                                                <ReceiptPrint isCompleteOrder={false} orderId={orderDetailData?.id} text={"Print Receipt"} className="flex justify-between items-center font-bold py-2 px-5 text-nowrap hover:bg-primary/10 hover:text-primary cursor-pointer" printButtonRef={receiptPrintButtonRef} onAfterPrint={() => {}}/>
                                            </li>
                                            {orderDetailData?.isReportedToMetrc ? 
                                            <li>
                                                <button type="button" className="flex justify-between items-center font-bold" onClick={handleUnsyncOrder}>
                                                    <GiAnticlockwiseRotation className="mr-2 font-bold text-xl" /> Unsync 
                                                </button>
                                            </li>
                                            : <li>
                                                <button type="button" className="flex justify-between items-center font-bold" onClick={handleSyncOrder}>
                                                    <FiRefreshCcw className="mr-2 font-bold text-xl" /> Sync 
                                                </button>
                                            </li>}
                                            <li>
                                                <button type="button" className="flex justify-between items-center font-bold" onClick={() => setModalShow(true)}>
                                                    <MdCancelPresentation className="mr-2 font-bold text-xl" /> Void
                                                </button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            ) : null}
                            {orderDetailData?.status == 'VOID' ? (
                                <div className="dropdown mr-5">
                                    <Dropdown placement={`bottom-end`} btnClassName="" button={<div className="text-3xl text-dark dark:text-white-dark font-extrabold">...</div>}>
                                        <ul className="absolute right-0">
                                            
                                            <li>
                                                <ExitLabelPrint orderId={orderDetailData?.id} text={"Print Exit Label"} className="flex justify-between items-center font-bold py-2 px-5 text-nowrap hover:bg-primary/10 hover:text-primary cursor-pointer" printButtonRef={exitPrintButtonRef} onAfterPrint={() => {}}/>
                                            </li>
                                            <li>
                                                <ReceiptPrint isCompleteOrder={false} orderId={orderDetailData?.id} text={"Print Receipt"} className="flex justify-between items-center font-bold py-2 px-5 text-nowrap hover:bg-primary/10 hover:text-primary cursor-pointer" printButtonRef={receiptPrintButtonRef} onAfterPrint={() => {}}/>
                                            </li>
                                            {orderDetailData?.isReportedToMetrc ? 
                                            <li>
                                                <button type="button" className="flex justify-between items-center font-bold" onClick={handleUnsyncOrder}>
                                                    <GiAnticlockwiseRotation className="mr-2 font-bold text-xl" /> Unsync 
                                                </button>
                                            </li>
                                            : null}
                                        </ul>
                                    </Dropdown>
                                </div>
                            ) : null} */}
                            </div>
                            {orderDetailRowData.isLoading || orderDetailRowData.isFetching ? (
                                <LoadingSkeleton />
                            ) : (
                                <div>
                                    <div className="text-xl font-bold px-3 pt-3 text-dark dark:text-white-dark">Order #{orderId.toString()}</div>
                                    <div className="flex flex-col px-3 items-center">
                                        {<OrderCard orderData={orderDetailData} isLoading={orderDetailRowData.isLoading || orderDetailRowData.isFetching} />}
                                    </div>
                                    <div className="px-3">
                                        <OrderItem orderItemData={orderDetailData} taxSum={orderDetailTaxSum} isLoading={orderDetailRowData.isLoading || orderDetailRowData.isFetching} />
                                    </div>

                                    {/* Items Sold */}
                                    <div className="px-3 mt-2">
                                        <div className="max-w-2xl mx-auto bg-white dark:bg-[#0f1727] rounded-lg shadow p-6">
                                            {/* License Number Section */}
                                            <div className="mb-6">
                                                <div className="text-sm text-gray-600">Patient License Number:</div>
                                                <div className="font-mono text-base">{orderDetailData?.customer?.medicalLicense}</div>
                                            </div>

                                            {/* Items Sold Section */}
                                            <div>
                                                <h2 className="text-lg font-semibold mb-4 text-dark dark:text-white-dark">MJ Items Sold</h2>
                                                <div className="space-y-4">
                                                    {orderDetailData?.OrderItem?.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-4 border-b dark:border-[#1a1e3b] pb-2">
                                                            <div className="text-dark dark:text-white-dark">{index + 1}</div>
                                                            <ProductCategory name={item?.product.itemCategory.name} color={item?.product.itemCategory.color} />
                                                            <div className="flex-1">
                                                                <div className="text-dark dark:text-white-dark">{item?.product.name}</div>
                                                            </div>
                                                            <div className="text-dark dark:text-white-dark text-right w-16">{item?.product.productUnitOfMeasure == 'g' ? '1 g' : '1 s'}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </PerfectScrollbar>
                    </div>
                )}
                {rightSideBarType == 'package' && (
                    <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                        <PerfectScrollbar>
                            <div className="py-3 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                                <button
                                    type="button"
                                    className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                    onClick={() => setIsShowingRightSideBar(false)}
                                >
                                    <FaArrowRightFromBracket className="m-auto text-2xl" />
                                </button>
                            </div>
                            {packageRowDataById.isLoading || packageRowDataById.isFetching ? (
                                <LoadingSkeleton />
                            ) : (
                                <div className="flex flex-col items-center px-3">
                                    <div className="w-full flex justify-between items-center">
                                        <div className="w-full text-xl font-semibold text-dark dark:text-white-dark py-2 text-left">Package Details</div>
                                    </div>
                                    {/* <Suspense fallback={<RightSideBarSkeletonLoading/>}> */}
                                    <PackageCard
                                        packageLabel={packageLabel}
                                        packageData={packageDataById}
                                        isLoading={packageRowDataById.isLoading || packageRowDataById.isFetching}
                                        handleActivePackage={() => {}}
                                        handleHoldPackage={() => {}}
                                        handleFinishPakcage={() => {}}
                                        onAdjustPackage={() => {}}
                                        handleFetchTestResult={() => {}}
                                        handleRefetchPackage={() => {}}
                                    />
                                    {/* </Suspense> */}
                                </div>
                            )}
                        </PerfectScrollbar>
                    </div>
                )}

                {rightSideBarType == 'customer' && (
                    <div className={`fixed bottom-0 z-[101] transition-all duration-500 h-full right-0 bg-white ${isShowingRightSideBar ? 'w-[500px]' : 'w-0'}`}>
                        <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                            <PerfectScrollbar>
                                <div className="py-2 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                                    <button
                                        type="button"
                                        className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                        onClick={() => setIsShowingRightSideBar(false)}
                                    >
                                        <FaArrowRightFromBracket className="m-auto text-2xl" />
                                    </button>
                                </div>
                                <div className="flex flex-col items-center px-3 py-1">
                                    <div className="w-full text-xl font-semibold text-dark dark:text-white-dark py-2 text-left">{customerDataById?.name}</div>
                                    {/* <div className="w-full flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light">
                                        <span className="ltr:pr-2 rtl:pl-2">
                                            <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong>Currently at Register 4 with Skylar Zaitshik in store Highway Cannabis.
                                        </span>
                                        <button type="button" className="ltr:ml-auto rtl:mr-auto hover:opacity-80">
                                            <FaTimes/>
                                        </button>
                                    </div>  */}
                                    {/* <textarea rows={4} placeholder='Notes' className="form-textarea ltr:rounded-l-none rtl:rounded-r-none my-2 text-dark dark:text-white-dark" onChange={(e) => setCustomerNote(e.target.value)} onBlur={handleCustomerNote} value={customerNote || customerDataById?.note}></textarea> */}
                                    <CustomerProfile customerData={customerDataById} />
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                )}

                {rightSideBarType == 'product' && (
                    <div className={`fixed bottom-0 z-[101] transition-all duration-500 h-full right-0 bg-white ${isShowingRightSideBar ? 'w-[500px]' : 'w-0'}`}>
                        <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                            <PerfectScrollbar>
                                <div className="py-2 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                                    <button
                                        type="button"
                                        className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                        onClick={() => setIsShowingRightSideBar(false)}
                                    >
                                        <FaArrowRightFromBracket className="m-auto text-2xl" />
                                    </button>
                                </div>
                                {productRowDataById.isLoading || productRowDataById.isFetching ? (
                                    <LoadingSkeleton />
                                ) : (
                                    <div>
                                        <div className="flex flex-col items-center px-3">
                                            <div className="w-full text-lg text-dark dark:text-white-dark font-semibold py-2">{productDataById?.name}</div>
                                            <div className="w-full bg-white dark:bg-[#0f1727] rounded-md border-[1px] border-gray-50  dark:border-[#1a1e3b] shadow-sm shadow-gray-200 dark:shadow-[#0a0b0f]">
                                                <div className={`pb-2 rounded-t-md border-gray-200 dark:border-[#1a1e3b] font-bold text-dark dark:text-white-dark dark:bg-`}>
                                                    <div className="text-xl font-semibold m-2">Product Details</div>
                                                    <hr className="border-gray-100 dark:border-[#23284e]" />
                                                </div>
                                                {/* <div className="p-3 border-b-gray-200 border-b-[1px]  dark:border-[#1a1e3b] text-lg font-semibold text-dark dark:text-white-dark">Product Details</div> */}
                                                <div className="p-3 flex flex-col ">
                                                    <div className="flex justify-start items-center my-[6px] text-md">
                                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Supplier:</div>
                                                        <div className="w-[50%] text-left">{productDataById?.supplier?.name}</div>
                                                    </div>
                                                    <div className="flex justify-start items-center my-[6px] text-md">
                                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Product Category:</div>
                                                        <div className="w-[50%] text-left">{productDataById?.itemCategory?.name}</div>
                                                    </div>
                                                    <div className="flex justify-start items-center my-[6px] text-md">
                                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Unit of Measure:</div>
                                                        <div className="w-[50%] text-left">{productDataById?.productUnitOfMeasure}</div>
                                                    </div>
                                                    <div className="flex justify-start items-center my-[6px] text-md">
                                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Unit Weight:</div>
                                                        <div className="w-[50%] text-left">{productDataById?.unitWeight}</div>
                                                    </div>
                                                    <div className="flex justify-start items-center my-[6px] text-md">
                                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Sales Price:</div>
                                                        <div className="w-[50%] text-left">${productDataById?.price}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col itens-center px-3">{packageData ? packageData.map((data, key) => <ProductCard key={key} packageData={data} />) : null}</div>
                                        {/* <div className="text-xl font-bold px-3 pt-3 text-dark dark:text-white-dark">Active Inventory at {productDataById?.dispensary?.name}</div> */}
                                        {/* <div className="flex flex-col itens-center px-3">
                                    {packageData ? packageData.filter((data) => data?.packageStatus == 'ACTIVE').length == 0 ? <div className='text-gray-400 dark:text-gray-600 text-center text-sm my-1'>No Active Package</div> : packageData.filter((data) => data?.packageStatus == 'ACTIVE').map((data, key) => <ProductCard key={key} packageData={data} />) : null}
                                </div> */}
                                        {/* {!isShowFinishedPackage && <button className="btn shadow-none hover:bg-gray-300 text-dark dark:text-white-dark text-md bg-gray-200 dark:bg-[#1c2942] dark:hover:bg-[#172236] dark:border-[#23284e] px-10 py-2 my-3 mx-auto rounded-md" onClick={() => setIsShowFinishedPackage(!isShowFinishedPackage)}>
                                    Show finished packages
                                </button>} */}
                                        {/* {isShowFinishedPackage && (
                                    <div>
                                        <div className="text-xl font-bold px-3 pt-1 text-dark dark:text-white-dark">Inactive Packages at {productDataById?.dispensary?.name}</div>
                                        <div className="flex flex-col items-center px-3">
                                            {packageData ? packageData.filter((data) => data?.packageStatus != 'ACTIVE').length == 0 ? <div className='text-gray-400 dark:text-gray-600 text-center text-sm my-1'>No Inactive Package</div> : packageData.filter((data) => data?.packageStatus != 'ACTIVE' ).map((data, key) => <ProductCard key={key} packageData={data} />) : null}
                                        </div>
                                    </div>
                                )} */}
                                    </div>
                                )}
                            </PerfectScrollbar>
                        </div>
                    </div>
                )}

                {rightSideBarType == 'drawer' && (
                    <div className={`fixed bottom-0 z-[101] transition-all duration-500 h-full right-0 bg-white ${isShowingRightSideBar ? 'w-[500px]' : 'w-0'}`}>
                        <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                            <PerfectScrollbar>
                                <div className="py-2 px-3 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                                    <button
                                        type="button"
                                        className="collapse-icon flex h-8 w-8 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                        onClick={() => setIsShowingRightSideBar(false)}
                                    >
                                        <FaArrowRightFromBracket className="m-auto text-2xl" />
                                    </button>
                                </div>
                                {drawerReportByDrawerId.isLoading || drawerReportByDrawerId.isFetching ? (
                                    <LoadingSkeleton />
                                ) : (
                                    <div className="flex flex-col items-center px-3 w-full">
                                        <h1 className="text-xl text-left font-semibold text-dark dark:text-white-dark">Shift Details</h1>
                                        <div className="bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full mx-auto my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b] p-5">
                                            <RowItem label="Store:" value={drawerReportData?.storeName} />
                                            <RowItem label="Shift Started By:" value={drawerReportData?.startedBy} />
                                            <RowItem label="Time Printed:" value={getCurrentTimeByTimezone(storeTimeZone)} />
                                            <Divider className="my-3" />
                                            <RowItem label="Register Name:" value={drawerReportData?.registerName && registerLabel[drawerReportData?.registerName]} />
                                            <RowItem label="Started By:" value={drawerReportData?.startedBy} />
                                            <RowItem label="Started At:" value={drawerReportData?.startedAt ? convertPSTTimestampToTimezone(Number(drawerReportData?.startedAt), storeTimeZone) : ''} />
                                            <RowItem label="Starting Balance:" value={formatCurrency(drawerReportData?.startingBalance)} />
                                            <RowItem label="Starting Discrepancy:" value={formatCurrency(Number(drawerReportData?.discrepancyReason))} />
                                            <RowItem label="Discrepancy Reason:" value={'_'} />
                                            <RowItem label="Returns:" value={formatCurrency(drawerReportData?.returns)} className="mt-5" />
                                            <RowItem label="Voids:" value={formatCurrency(drawerReportData?.voids)} />
                                            <RowItem label="Incoming Drops:" value={formatCurrency(drawerReportData?.incomingDrops)} />
                                            <RowItem label="Outgoing Drops:" value={formatCurrency(drawerReportData?.outgoingDrops)} />
                                            <RowItem label="Closing Drop:" value={formatCurrency(drawerReportData?.closingDrop)} />
                                            <RowItem label="Left In Drawer:" value={formatCurrency(drawerReportData?.leftInDrawer)} />
                                            <RowItem label="Expected Cash In Drawer:" value={formatCurrency(drawerReportData?.expectedCash)} />
                                            <RowItem label="Actual Cash In Drawer:" value={formatCurrency(drawerReportData?.actualCashInDrawer)} className="mt-5" />
                                            <RowItem label="Closing Discrepancy:" value={formatCurrency(Number(drawerReportData?.closingDiscrepancy))} />
                                            <RowItem label="Discrepancy Reason:" value={formatCurrency(Number(drawerReportData?.discrepancyReason))} />
                                            <RowItem label="Cash Sales:" value={formatCurrency(Number(drawerReportData?.cashPayments))} className="mt-5" />
                                            <RowItem label="Other Sales:" value={formatCurrency(Number(drawerReportData?.otherPayments))} />
                                            <RowItem label="Total Sales:" value={formatCurrency(Number(drawerReportData?.totalPayments))} />
                                            {/* <RowItem label='Cash Sales:' value={formatCurrency(drawerReportData?.cashPayments)} />
                                                            <RowItem label='Taxed:' value={formatCurrency(drawerReportData?.otherPayments)} />
                                                            <RowItem label='Sales Tax:' value={formatCurrency(drawerReportData?.totalPayments)} /> */}
                                            <p className="text-md text-left !font-varela_Round font-semibold text-dark dark:text-white-dark mt-5">Taxes</p>
                                            {drawerReportData?.taxes &&
                                                drawerReportData?.taxes?.length > 0 &&
                                                drawerReportData?.taxes?.map((tax: any) => (
                                                    <RowItem key={tax?.taxName} label={tax?.taxName || ''} value={formatCurrency(tax?.taxAmount)} className="pl-4" />
                                                ))}
                                            <RowItem label="Tax Total:" value={formatCurrency(drawerReportData?.taxTotal)} />
                                            {/* <RowItem label='Net Cash:' value={formatCurrency(drawerReportData?.totalPayments)} />
                                                            <RowItem label='Net Card Payments:' value={formatCurrency(drawerReportData?.totalPayments)} />
                                                            <RowItem label='Net Other Payments:' value={formatCurrency(drawerReportData?.totalPayments)} /> */}

                                            <RowItem label="Total Net Sales:" value={formatCurrency(drawerReportData?.totalPayments)} className="mt-3" />
                                        </div>
                                        <div className="bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b] p-5">
                                            <h1 className="text-lg font-semibold text-dark dark:text-white-dark">All Orders</h1>
                                            <a className="text-sm text-gray-500 underline cursor-pointer" onClick={() => setShowAllOrders(!showAllOrders)}>
                                                Show {showAllOrders ? 'Less' : 'More'} Orders
                                            </a>

                                            {showAllOrders
                                                ? allOrdersInfoIncludingAllTypesData?.map((order: any) => (
                                                      <div key={order.id} className="flex justify-evenly items-center border-b-[1px] border-gray-200 dark:border-[#1a1e3b]">
                                                          <span className="text-sm text-left w-1/6 py-2">#{order.id}</span>
                                                          {order.status === 'PAID' ? (
                                                              <span className="text-sm text-left w-1/6 py-2">{formatCurrency(order.cashAmount + order.otherAmount - order.changeDue)}</span>
                                                          ) : (
                                                              <span className="text-sm text-left w-1/6 py-2">{order.status}</span>
                                                          )}
                                                          <span className="text-sm text-left w-1/2 text-nowrap py-2">{convertPSTTimestampToTimezone(order.updatedAt, storeTimeZone)}</span>
                                                          <span className="text-sm text-left w-1/6 py-2">{order.user?.name}</span>
                                                      </div>
                                                  ))
                                                : allOrdersInfoIncludingAllTypesData?.slice(0, 5).map((order: any) => (
                                                      <div key={order.id} className="flex justify-evenly items-center border-b-[1px] border-gray-200 dark:border-[#1a1e3b]">
                                                          <span className="text-sm text-left w-1/6 py-2">#{order.id}</span>
                                                          {order.status === 'PAID' ? (
                                                              <span className="text-sm text-left w-1/6 py-2">{formatCurrency(order.cashAmount + order.otherAmount - order.changeDue)}</span>
                                                          ) : (
                                                              <span className="text-sm text-left w-1/6 py-2">{order.status}</span>
                                                          )}
                                                          <span className="text-sm text-left w-1/2 text-nowrap py-2">{convertPSTTimestampToTimezone(order.updatedAt, storeTimeZone)}</span>
                                                          <span className="text-sm text-left w-1/6 py-2">{order.user?.name}</span>
                                                      </div>
                                                  ))}
                                            <div className="flex justify-between items-center mt-5">
                                                <div>{allOrdersInfoIncludingAllTypesData?.length} Total Orders</div>
                                                <div className="flex justify-between items-center">
                                                    <p>Total Sales: </p>
                                                    {formatCurrency(allOrdersInfoIncludingAllTypesData?.reduce((acc: number, order: any) => acc + (order.cashAmount || 0), 0))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b] p-5">
                                            <h1 className="text-xl font-semibold text-dark dark:text-white-dark">Drops</h1>
                                            <Divider className="my-2" />
                                            {moneyDropHistoryByDrawerIdData?.map((drop: any) => (
                                                <div key={drop.id} className="flex justify-evenly items-center">
                                                    <span className="text-sm text-left w-1/3">{drop.dropType}</span>
                                                    <span className="text-sm text-left w-1/3">{formatCurrency(drop.amount)}</span>
                                                    <span className="text-sm text-left w-1/3">{drop.reason}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </PerfectScrollbar>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActionHistory;

const RowItem = ({ label, value, className }: { label: string; value: string | number | undefined; className?: string }) => {
    return (
        <div className={`flex justify-start items-center w-full my-[6px] ${className}`}>
            <span className="text-md text-left w-1/2 !font-varela_Round font-semibold text-dark dark:text-white-dark">{label}</span>
            <span className="text-md text-left w-1/2">{value}</span>
        </div>
    );
};
