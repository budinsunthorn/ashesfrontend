'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { createStyles, Divider } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAtom } from 'jotai';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';

import {
    useDrawerHistoryQuery,
    useDrawerReportByDrawerIdQuery,
    useAllOrdersInfoIncludingAllTypesByDrawerIdQuery,
    useMoneyDropHistoryByDrawerIdQuery,
    usePrintSettingByDispensaryIdQuery
} from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns } from 'react-icons/bs';
import IconPlus from '@/components/icon/icon-plus';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrashLines from '@/components/icon/icon-trash-lines';

import ProductCategory from '../etc/productCategory';

import Swal from 'sweetalert2';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import { userDataSave } from '@/store/userData';
import { DeepPartial } from '@/store/deepPartialType';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import * as generatedTypes from '@/src/__generated__/operations';
import ExportTable from '../etc/exportTable';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import { IoSearch } from 'react-icons/io5';
import { TbListDetails } from 'react-icons/tb';
import ProductCard from '../etc/productCard';
import RefreshButton from '../etc/refreshButton';
import CustomSelect from '../etc/customeSelect';
import TableLoading from '../etc/tableLoading';
import LoadingSkeleton from '../etc/loadingSkeleton';
import { useDebouncedCallback } from 'use-debounce';
import {syncStatusAtom} from "@/store/syncStatusAtom";
import { useReactToPrint } from 'react-to-print';
import { FaPrint } from 'react-icons/fa';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { registerLabel } from '@/utils/variables';
import { formatCurrency } from '@/lib/utils';
import { convertPSTTimestampToTimezone, getCurrentTimeByTimezone } from '@/utils/datetime';
import DrawerPrint from '../Print/drawerPrint';

type RowDataType = generatedTypes.Product;
type RowData = RowDataType[];

const DrawersTable = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);

    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;
    const storeTimeZone = userData.storeTimeZone;
    

    console.log("storeTimeZone", storeTimeZone);

    // Theme style
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const darkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);
    const menu = useSelector((state: IRootState) => state.themeConfig.menu);
    
    const [statusForFilter, setStatusForFilter] = useState('today');
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];

    const [startDay, setStartDay] = useState(currentDate);
    const [endDay, setEndDay] = useState(currentDate);
    // const [salesIndexData, setSalesIndexData] = useState<any>()
    const [dateParam, setDateParam] = useState({
        dateFrom: startDay,
        dateTo: endDay,
    });

    const [drawerId, setDrawerId] = useState('');
    const drawerReportContentRef = useRef<HTMLDivElement>(null);
    const [showAllOrders, setShowAllOrders] = useState(false);

    const [isAtTop, setIsAtTop] = useState(false);
    const [isRightBarShow, setIsRightBarShow] = useState(false);
    const [firstViewed, setFirstViewed] = useState(false);
    const [selectedRow, setSelectedRow] = useState(0);
    const targetRef = useRef<HTMLTableElement | null>(null);

    // for the pagination
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    //// @ts-expect-error

    const drawerHistoryRowData = useDrawerHistoryQuery({ dispensaryId: dispensaryId, dateFrom: dateParam.dateFrom, dateTo: dateParam.dateTo });
    const drawerHistoryData = drawerHistoryRowData.data?.drawerHistory;

    const drawerReportByDrawerId = useDrawerReportByDrawerIdQuery({ drawerId: drawerId || '' });
    const drawerReportData: any = drawerReportByDrawerId.data?.drawerReportByDrawerId; 

    const allOrdersInfoIncludingAllTypes = useAllOrdersInfoIncludingAllTypesByDrawerIdQuery({ drawerId: drawerId || '' });
    const allOrdersInfoIncludingAllTypesData = allOrdersInfoIncludingAllTypes.data?.allOrdersInfoIncludingAllTypesByDrawerId;

    const moneyDropHistoryByDrawerId = useMoneyDropHistoryByDrawerIdQuery({ drawerId: drawerId || '' });
    const moneyDropHistoryByDrawerIdData = moneyDropHistoryByDrawerId.data?.moneyDropHistoryByDrawerId;

    const printSettingRowData = usePrintSettingByDispensaryIdQuery({dispensaryId: dispensaryId})
    const printSettingData = printSettingRowData.data?.printSettingByDispensaryId

    const drawerPrintSettingData = printSettingData?.find((item) => item?.printType === 'drawer') || null

    console.log("drawerHistoryData", drawerHistoryData)

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    
    const [searchSelectValue, setSearchSelectValue] = useState('name');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('name');
    const [searchParam, setSearchParam] = useState('');

    const [hideCols, setHideCols] = useState<any>([]);
    const cols = [
        { accessor: 'user.name', title: 'Started By' },
        { accessor: 'createdAt', title: 'Started At' },
        { accessor: 'endedAt', title: 'Ended At' },
        { accessor: 'register', title: 'Register' },
    ];

    const [modalShow, setModalShow] = useState(false);
    const [modalMode, setModalMode] = useState('new');

    useEffect(() => {
        if (statusForFilter == 'yesterday') {
            setStartDay(currentDate);
            setEndDay(currentDate);
        } else if (statusForFilter == 'today') {
            setStartDay(yesterdayDate);
            setEndDay(yesterdayDate);
        }
    }, [statusForFilter]);

    // useEffect(() => {
    //     if(searchParams.get('productId')) {
    //         setProductId(searchParams.get('productId') as string);

    //         setIsRightBarShow(true)
    //     }
    // }, [searchParams])

    const handleSearch = () => {
        setSearchField(searchSelectValue);
        setSearchParam(searchValue.trim());
    };

    const handleRealtimeSearch = useDebouncedCallback((param) => {
        setSearchField(searchSelectValue);
        setSearchParam(param.trim());
    }, 500);



    useEffect(() => {
        setPage(1);
        if (pageSize == 10) setIsAtTop(false);
    }, [pageSize]);


    // const formatDate = (date: any) => {
    //     if (date) {
    //         const dt = new Date(date);
    //         const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
    //         const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
    //         return day + '/' + month + '/' + dt.getFullYear();
    //     }
    //     return '';
    // };

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };


    const updateSearchParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        router.push(`?${params.toString()}`) // or use replace() to avoid history stacking
    }

    const handleRowClick = (record : any, index : any) => {
        setDrawerId(record? record.id : "");
        setSelectedRow(index);
        updateSearchParams('drawerId', record?.id);
        setIsRightBarShow(true);
    }

    // for full width tabel
    const checkPositionWindow = () => {
        setFirstViewed(false);
        if (targetRef.current) {
            const dataTable = targetRef.current.getElementsByClassName('data-table');
            const rect = dataTable[0].getBoundingClientRect();
            // Check if the top of the element is at or near zero
            if (rect.top <= 50) {
                setIsAtTop(true);
            } else if (rect.top <= -10) {
                setIsAtTop(false);
            }
        }
    };

    const checkPositionTable = (event: any) => {
        if (targetRef.current) {
            const tbody = targetRef.current.querySelector('tbody');
            const tr = tbody && tbody.querySelectorAll('tr')?.[0];
            if (tr) {
                const rect = tr.getBoundingClientRect();
                if (rect.top <= 100) {
                    if (event.deltaY < 0 && rect.top >= 0 && rect.top <= 100) {
                        setIsAtTop(false);
                    }
                    if (firstViewed) {
                        setIsAtTop(false);
                        setFirstViewed(false);
                    }
                } else {
                    setFirstViewed(true);
                }
            }
        }
    };

    const getDrawerReportData = () => {
        setDateParam({ dateFrom: startDay, dateTo: endDay });
    };

    useEffect(() => {
        if (statusForFilter == 'yesterday') {
            setStartDay(currentDate);
            setEndDay(currentDate);
        } else if (statusForFilter == 'today') {
            setStartDay(yesterdayDate);
            setEndDay(yesterdayDate);
        }
    }, [statusForFilter]);

    useEffect(() => {
        window.addEventListener('scroll', checkPositionWindow);
        return () => {
            window.removeEventListener('scroll', checkPositionWindow);
        };
    }, [firstViewed]);

    useEffect(() => {
        if (targetRef.current) {
            const dataTable = targetRef.current.getElementsByClassName('mantine-ScrollArea-viewport');
            dataTable[0].addEventListener('scroll', checkPositionTable);
            dataTable[0].addEventListener('wheel', checkPositionTable);

            return () => {
                dataTable[0].removeEventListener('scroll', checkPositionTable);
                dataTable[0].removeEventListener('wheel', checkPositionTable);
            };
        }
    }, [firstViewed]);

    useEffect(() => {
        if (targetRef.current) {
            const rows = targetRef.current.querySelectorAll('tr');

            if (rows.length > 0) {
                for (let i = 0; i < rows.length; i++) {
                    rows[i].classList.remove('active');
                    rows[i].classList.remove('dark-active');
                }
                const row = rows[selectedRow + 1];
                if (darkMode) row?.classList.add('dark-active');
                else row.classList.add('active');
            }
        }
    }, [selectedRow, darkMode]);

    const [tableClassname, setTableClassName] = useState('w-full');

    useEffect(() => {
        if (isAtTop) {
            // Add your logic here based on rightBarStatus
            if (isRightBarShow === true) {
                setTableClassName(`fixed top-0 z-[99]  ${menu == "horizontal" ? "left-0 w-[calc(100vw-500px)]" : menu == "vertical" ? "left-[280px] w-[calc(100vw-780px)]" : "left-[90px] w-[calc(100vw-590px)]"} -translate-x-[20px] h-[100vh] bounceInUp1 duration-500`);
            } else {
                setTableClassName(`fixed top-0 z-[99] ${menu == "horizontal" ? "left-0 w-[calc(100vw)]" : menu == "vertical" ? "left-[280px] w-[calc(100vw-280px)]" : "left-[90px] w-[calc(100vw-90px)]"} -translate-x-[20px] h-[100vh] bounceInUp1 duration-500`);
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == "horizontal" ? "w-[calc(100vw-560px)]" : menu == "vertical" ? "w-[calc(100vw-810px)]" : "w-[calc(100vw-620px)]"} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == "horizontal" ? "w-[calc(100vw-90px)]" : menu == "vertical" ? "w-[calc(100vw-350px)]" : "w-[calc(100vw-160px)]"} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow]);

    const handleDrawerReportPrint = useReactToPrint({
        contentRef: drawerReportContentRef,
        // Dynamic page style with dimensions, margins, and font size
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            @page {
                size: ${drawerPrintSettingData?.dimensionWidth ? drawerPrintSettingData?.dimensionWidth + 'in' : 'auto'} ${drawerPrintSettingData?.dimensionHeight ? drawerPrintSettingData?.dimensionHeight + 'in' : 'auto'};
                margin: ${drawerPrintSettingData?.marginTop ? drawerPrintSettingData?.marginTop + 'in' : '0'} ${drawerPrintSettingData?.marginRight ? drawerPrintSettingData?.marginRight + 'in' : '0'} ${drawerPrintSettingData?.marginBottom ? drawerPrintSettingData?.marginBottom + 'in' : '0'} ${drawerPrintSettingData?.marginLeft ? drawerPrintSettingData?.marginLeft + 'in' : '0'};
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', Arial, sans-serif !important;
                }
                * {
                    box-sizing: border-box;
                    font-size: ${drawerPrintSettingData?.fontSize ? drawerPrintSettingData?.fontSize + 'px' : '14px'};
                }
            }
        `,
        onAfterPrint: () => {
            console.log('Print completed');
        }
    });

    const formatDate = (isoDateString: any) => {
        const date = new Date(isoDateString);

        // Get components of the date
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        // Get hours and minutes
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');

        // Determine AM/PM suffix
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? hours : 12; // The hour '0' should be '12'

        // Format the date
        return `${month}/${day}/${year} - ${hours}:${minutes} ${ampm}`;
    };


    

    return (
        <div className={`panel mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col justify-start items-start !mb-3">
            <h5 className="text-lg font-semibold dark:text-white-dark mb-3">Drawers</h5>
                <div className='flex justify-between items-center'>
                    <div className='flex justify-start items-center'>
                        <div className="relative inline-flex align-middle mb-2">
                            <button
                                type="button"
                                className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#101728] dark:hover:!text-[#878ca7]  border-gray-200 dark:border-[#283b5d] ltr:rounded-r-none rtl:rounded-l-none ${
                                    statusForFilter == 'yesterday' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                                }`}
                                onClick={() => {
                                    setStatusForFilter((prev) => (prev == '' || prev != 'yesterday' ? 'yesterday' : ''));
                                    getDrawerReportData();
                                }}
                            >
                                Yesterday
                            </button>
                            <button
                                type="button"
                                className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#1c2942] dark:hover:!text-[#878ca7]  border-gray-200 dark:border-[#283b5d] rounded-none ${
                                    statusForFilter == 'today' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                                }`}
                                onClick={() => {
                                    setStatusForFilter((prev) => (prev == '' || prev != 'today' ? 'today' : ''));
                                    getDrawerReportData();
                                }}
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#1c2942] dark:hover:!text-[#878ca7]  border-gray-200 dark:border-[#283b5d] ltr:rounded-l-none rtl:rounded-r-none ${
                                    statusForFilter == 'custom' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                                }`}
                                onClick={() => setStatusForFilter((prev) => (prev == '' || prev != 'custom' ? 'custom' : ''))}
                            >
                                Custom
                            </button>
                            {statusForFilter == 'custom' && (
                                <div className="flex justify-center items-center ml-3">
                                    <Flatpickr
                                        id="currentDate"
                                        value={startDay ? startDay : currentDate}
                                        options={{
                                            dateFormat: 'Y-m-d',
                                            position: 'auto left',
                                        }}
                                        className="h-full form-input flex-1 mr-2"
                                        onChange={(date) => {
                                            const formattedDate = date[0].toISOString().split('T')[0];
                                            setStartDay(formattedDate.toString());
                                            // refetchOrders()
                                        }}
                                    />
                                    <Flatpickr
                                        id="currentDate"
                                        value={endDay ? endDay : currentDate}
                                        options={{
                                            dateFormat: 'Y-m-d',
                                            position: 'auto left',
                                        }}
                                        className="h-full form-input flex-1"
                                        onChange={(date) => {
                                            const formattedDate = date[0].toISOString().split('T')[0];
                                            setEndDay(formattedDate.toString());
                                            // refetchOrders()
                                        }}
                                    />
                                    <button className="btn btn-primary mx-2" onClick={() => getDrawerReportData()}>
                                        Submit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={`absolute lg:flex items-center gap-2 lg:ltr:ml-auto rtl:mr-auto transition-all duration-500 ${isRightBarShow? "!right-[502px]" :"right-8"}`}>
                        {/* <div>
                            <button type="button" onClick={handleNewProduct} className="btn btn-primary flex justify-between items-center rounded-full py-1.5 px-3 !text-sm">
                                <IconPlus className="h-5 w-5 shrink-0 ltr:mr-1 rtl:ml-1" />
                                New
                            </button>
                        </div> */}
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <RefreshButton onClick={() => drawerHistoryRowData.refetch()}/>
                            <Tippy content="Columns" placement="top">
                                <div className="dropdown">
                                    <Dropdown
                                        placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                        btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                        button={
                                            <>
                                                {/* <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                            <IconCaretDown className="h-5 w-5" /> */}
                                                <BsColumns className="text-xl" />
                                            </>
                                        }
                                    >
                                        <ul className="!min-w-[240px]">
                                            {cols.map((col, i) => {
                                                return (
                                                    <li
                                                        key={i}
                                                        className="flex flex-col"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <div className="flex items-center px-4 py-1">
                                                            <label className="mb-0 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!hideCols.includes(col.accessor)}
                                                                    className="form-checkbox"
                                                                    value={col.accessor}
                                                                    onChange={(event: any) => {
                                                                        setHideCols(event.target.value);
                                                                        showHideColumns(col.accessor, event.target.checked);
                                                                    }}
                                                                />
                                                                <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                            </label>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </Dropdown>
                                </div>
                            </Tippy>
                            <ExportTable cols={cols} recordsData={drawerHistoryData} hideCols={hideCols} filename='drawers_table_data' />
                            
                        </div>
                        {/* <div className="text-right flex justify-start items-center">
                            <select
                                onChange={(e) => {
                                    setSearchSelectValue(e.target.value);
                                }}
                                id="currentDispensary"
                                className="flex-initial w-44 form-select text-white-dark rounded-r-none"
                            >
                                <option value='packageLabel'>packageLabel</option>
                                <option value="name">Product Name</option>
                                <option value="supplier.name">Supplier Name</option>
                                <option value='packageId'>packageId</option>
                            </select>
                            <input type="text" className="form-input !rounded-none w-44" placeholder="Search..." value={searchValue} onChange={(e) => {
                                setSearchValue(e.target.value);
                                handleRealtimeSearch(e.target.value);
                            }} />
                            <button
                                onClick={handleSearch}
                                className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 py-3  font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                            >
                                <IoSearch />
                            </button>
                        </div> */}
                        {/* <div className="text-right">
                            <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div> */}

                        {/* <div className="flex flex-wrap items-center">
                        <button type="button" onClick={() => exportTable('csv')} className="btn btn-primary btn-sm m-1 ">
                            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                            CSV
                        </button>
                        <button type="button" onClick={() => exportTable('txt')} className="btn btn-primary btn-sm m-1">
                            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                            TXT
                        </button>
                        <button type="button" onClick={() => exportTable('xls')} className="btn btn-primary btn-sm m-1">
                            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                            Excel
                        </button>
                    </div> */}
                    </div>
                </div>
            </div>
            <div className="datatables !relative w-full">
                <div className={`transition-transform duration-300`} ref={targetRef}>
                    <DataTable
                        highlightOnHover
                        className={`table-hover whitespace-nowrap data-table ${tableClassname}`}
                        records={drawerHistoryData ?? []}
                        fetching={drawerHistoryRowData.isLoading || drawerHistoryRowData.isFetching}
                        columns={[
                            {
                                accessor: 'index',
                                title: '#',
                                width: 40,
                                render: (record) => (drawerHistoryData ? (page-1) * pageSize + drawerHistoryData.indexOf(record) + 1 : 0),
                            },
                            {
                                accessor: 'id',
                                title: 'ID',
                                sortable: true,
                                hidden: true,
                            },
                            {
                                accessor: 'createdAt',
                                title: 'Started',
                                sortable: true,
                                hidden: hideCols.includes('itemCategory.name'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { createdAt } = row;

                                    if (createdAt === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return convertPSTTimestampToTimezone(createdAt, storeTimeZone);
                                },
                            },
                            {
                                accessor: 'user.name',
                                title: 'Started By',
                                sortable: true,
                                hidden: hideCols.includes('user.name'),
                            },
                            {
                                accessor: 'endedAt',
                                title: 'Ended',
                                sortable: true,
                                hidden: hideCols.includes('endedAt'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { endedAt } = row;
                                    if (endedAt === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return convertPSTTimestampToTimezone(endedAt, storeTimeZone);
                                },
                            },
                            {
                                accessor: 'register',
                                title: 'Register',
                                sortable: true,
                                hidden: hideCols.includes('register'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { register } = row;
                                    if (register === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return registerLabel[register];
                                },
                            },
                        ]}
                        totalRecords={drawerHistoryData?.length ?? 0}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        onRowClick={(record, index) => {
                            // setSideBarStatus({ show: true, data: { packageId: record.id, deliverId: record.deliveryId } });
                            // setTransferId(record.id || '')
                            // setDeliverId(record.deliveryId || 0)
                            handleRowClick(record, index);
                        }}
                        // loaderSize="xl"
                        // noRecordsText="No products found"
                        loaderBackgroundBlur={80}
                        customLoader={<TableLoading text="Loading Product Data..." />}
                    />
                </div>
            </div>
            <div className={`fixed bottom-0 z-[101] transition-all duration-500 h-full right-0 bg-white ${isRightBarShow ? 'w-[500px]' : 'w-0'}`}>
                <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                    <PerfectScrollbar>
                        <div className="py-2 px-3 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                            <button
                                type="button"
                                className="collapse-icon flex h-8 w-8 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                onClick={() => setIsRightBarShow(false)}
                            >
                                <FaArrowRightFromBracket className="m-auto text-2xl" />
                            </button>
                            <div className="dropdown !relative">
                                <Dropdown
                                    placement={``}
                                    btnClassName="p-2 roudned-md bg-gray-100 hover:bg-gray-200 dark:bg-[#1c2942] dropdown-toggle"
                                    button={
                                        <>
                                            <HiOutlineDotsHorizontal className="" />
                                        </>
                                    }
                                >
                                    <ul className="!min-w-[170px] absolute -right-0 text-md">
                                        <li>
                                            {/* <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button" onClick={() => handleDrawerReportPrint()}>
                                                <FaPrint className="mr-1" />
                                                Print
                                            </button> */}
                                            <DrawerPrint drawerId={drawerId} className='flex justify-between items-center font-bold py-2 px-5 text-nowrap hover:bg-primary/10 hover:text-primary cursor-pointer' text={''}/>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                        {(drawerReportByDrawerId.isLoading || drawerReportByDrawerId.isFetching) ?
                        <LoadingSkeleton/>
                        : 
                            <div className="flex flex-col items-center px-3 w-full">
                                 <h1 className='text-xl text-left font-semibold text-dark dark:text-white-dark'>Shift Details</h1>
                                <div className="bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full mx-auto my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b] p-5">
                                    <RowItem label='Store:' value={drawerReportData?.storeName} />
                                    <RowItem label='Shift Started By:' value={drawerReportData?.startedBy} />
                                    <RowItem label='Time Printed:' value={getCurrentTimeByTimezone(storeTimeZone)} />
                                    <Divider className='my-3' />
                                    <RowItem label='Register Name:' value={drawerReportData?.registerName && registerLabel[drawerReportData?.registerName]} />
                                    <RowItem label='Started By:' value={drawerReportData?.startedBy} />
                                    <RowItem label='Started At:' value={drawerReportData?.startedAt ? convertPSTTimestampToTimezone(Number(drawerReportData?.startedAt), storeTimeZone) : ''} />
                                    <RowItem label='Starting Balance:' value={formatCurrency(drawerReportData?.startingBalance)} />
                                    <RowItem label='Starting Discrepancy:' value={formatCurrency(Number(drawerReportData?.discrepancyReason))} />
                                    <RowItem label='Discrepancy Reason:' value={'_'} />
                                    <RowItem label='Start Note' value={drawerReportData?.startNote} />
                                    <RowItem label='Returns:' value={formatCurrency(drawerReportData?.returns)} className='mt-5'/>
                                    <RowItem label='Voids:' value={formatCurrency(drawerReportData?.voids)} />
                                    <RowItem label='Incoming Drops:' value={formatCurrency(drawerReportData?.incomingDrops)} />
                                    <RowItem label='Outgoing Drops:' value={formatCurrency(drawerReportData?.outgoingDrops)} />
                                    <RowItem label='Closing Drop:' value={formatCurrency(drawerReportData?.closingDrop)} />
                                    <RowItem label='Left In Drawer:' value={formatCurrency(drawerReportData?.leftInDrawer)} />
                                    <RowItem label='Expected Cash In Drawer:' value={formatCurrency(drawerReportData?.expectedCash)} />
                                    <RowItem label='Actual Cash In Drawer:' value={formatCurrency(drawerReportData?.actualCashInDrawer)} className='mt-5' />
                                    <RowItem label='Closing Discrepancy:' value={formatCurrency(Number(drawerReportData?.closingDiscrepancy))} />
                                    <RowItem label='Discrepancy Reason:' value={formatCurrency(Number(drawerReportData?.discrepancyReason))} />
                                    <RowItem label='End Note' value={drawerReportData?.endNote} />
                                    <RowItem label='Cash Sales:' value={formatCurrency(Number(drawerReportData?.cashPayments))} className='mt-5' />
                                    <RowItem label='Other Sales:' value={formatCurrency(Number(drawerReportData?.otherPayments))} />
                                    <RowItem label='Total Sales:' value={formatCurrency(Number(drawerReportData?.totalPayments))} />
                                    {/* <RowItem label='Cash Sales:' value={formatCurrency(drawerReportData?.cashPayments)} />
                                    <RowItem label='Taxed:' value={formatCurrency(drawerReportData?.otherPayments)} />
                                    <RowItem label='Sales Tax:' value={formatCurrency(drawerReportData?.totalPayments)} /> */}
                                    <p className='text-md text-left !font-varela_Round font-semibold text-dark dark:text-white-dark mt-5'>Taxes</p>
                                    {(drawerReportData?.taxes && drawerReportData?.taxes?.length > 0) && drawerReportData?.taxes?.map((tax: any) => (
                                        <RowItem 
                                            key={tax?.taxName} 
                                            label={tax?.taxName || ''} 
                                            value={formatCurrency(tax?.taxAmount)} 
                                            className='pl-4' 
                                        />
                                    ))}
                                    <RowItem label='Tax Total:' value={formatCurrency(drawerReportData?.taxTotal)}/>
                                    {/* <RowItem label='Net Cash:' value={formatCurrency(drawerReportData?.totalPayments)} />
                                    <RowItem label='Net Card Payments:' value={formatCurrency(drawerReportData?.totalPayments)} />
                                    <RowItem label='Net Other Payments:' value={formatCurrency(drawerReportData?.totalPayments)} /> */}

                                    <RowItem label='Total Net Sales:' value={formatCurrency(drawerReportData?.totalPayments)} className='mt-3'/>
                                </div>
                            <div className="bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b] p-5">
                                <h1 className='text-lg font-semibold text-dark dark:text-white-dark'>All Orders</h1>
                                <a className='text-sm text-gray-500 underline cursor-pointer' onClick={() => setShowAllOrders(!showAllOrders)}>Show {showAllOrders ? 'Less' : 'More'} Orders</a>
                                
                                {showAllOrders ? allOrdersInfoIncludingAllTypesData?.map((order: any) => (
                                    <div key={order.id} className='flex justify-evenly items-center border-b-[1px] border-gray-200 dark:border-[#1a1e3b]'>
                                        <span className='text-sm text-left w-1/6 py-2'>#{order.id}</span>
                                        {order.status === 'PAID' ? 
                                        <span className='text-sm text-left w-1/6 py-2'>{formatCurrency(order.cashAmount + order.otherAmount - order.changeDue)}</span> 
                                        : 
                                        <span className='text-sm text-left w-1/6 py-2'>{order.status}</span>}
                                        <span className='text-sm text-left w-1/2 text-nowrap py-2'>{convertPSTTimestampToTimezone(order.updatedAt, storeTimeZone)}</span>
                                        <span className='text-sm text-left w-1/6 py-2'>{order.user?.name}</span>
                                    </div>
                                )) : allOrdersInfoIncludingAllTypesData?.slice(0, 5).map((order: any) => (
                                    <div key={order.id} className='flex justify-evenly items-center border-b-[1px] border-gray-200 dark:border-[#1a1e3b]'>
                                        <span className='text-sm text-left w-1/6 py-2'>#{order.id}</span>
                                        {order.status === 'PAID' ? 
                                        <span className='text-sm text-left w-1/6 py-2'>{formatCurrency(order.cashAmount + order.otherAmount - order.changeDue)}</span> 
                                        : 
                                        <span className='text-sm text-left w-1/6 py-2'>{order.status}</span>}
                                        <span className='text-sm text-left w-1/2 text-nowrap py-2'>{convertPSTTimestampToTimezone(order.updatedAt, storeTimeZone)}</span>
                                        <span className='text-sm text-left w-1/6 py-2'>{order.user?.name}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center mt-5">
                                    <div>
                                        {allOrdersInfoIncludingAllTypesData?.length} Total Orders
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <p>Total Sales: </p>  
                                        {formatCurrency(allOrdersInfoIncludingAllTypesData?.reduce((acc: number, order: any) => acc + (order.cashAmount || 0), 0))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b] p-5">
                               <h1 className='text-xl font-semibold text-dark dark:text-white-dark'>Drops</h1>
                                <Divider className='my-2' />
                                {moneyDropHistoryByDrawerIdData?.map((drop: any) => (
                                    <div key={drop.id} className='flex justify-evenly items-center'>
                                        <span className='text-sm text-left w-1/3'>{drop.dropType}</span>
                                        <span className='text-sm text-left w-1/3'>{formatCurrency(drop.amount)}</span>
                                        <span className='text-sm text-left w-1/3'>{drop.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>}
                    </PerfectScrollbar>
                </div>
            </div>

            {/* <div className='hidden'>
                <div ref={drawerReportContentRef} style={{
                    width: drawerPrintSettingData?.dimensionWidth ? `${drawerPrintSettingData?.dimensionWidth}in` : '200px',
                    height: drawerPrintSettingData?.dimensionHeight ? `${drawerPrintSettingData?.dimensionHeight}in` : '100%',
                    marginTop: drawerPrintSettingData?.marginTop ? `${drawerPrintSettingData?.marginTop}in` : '0',
                    marginLeft: drawerPrintSettingData?.marginLeft ? `${drawerPrintSettingData?.marginLeft}in` : '0',
                    fontSize: drawerPrintSettingData?.fontSize ? `${drawerPrintSettingData?.fontSize}px` : '14px',
                    fontFamily: 'Roboto',
                }}>
                    <h1 className='text-lg font-semibold text-black dark:text-white-dark'>Shift Details</h1>
                    <div className="flex flex-col justify-between items-start mb-3 w-full">
                        <div className='flex justify-start items-center text-[8px] leading-none'><p>Store:</p><p className='ml-2'>{drawerReportData?.storeName}</p></div>
                        <div className='flex justify-start items-center text-[8px] leading-none'><p>Shift Started:</p><p className='ml-2'>{convertPSTTimestampToTimezone(Number(drawerReportData?.startedAt), storeTimeZone)}</p></div>
                        <div className='flex justify-start items-center text-[8px] leading-none'><p>Time Printed:</p><p className='ml-2'>{''}</p></div>
                    </div>
                    <Divider className='my-3' />
                    <div className="flex flex-col justify-between items-start mb-3 w-full">
                        <div className='flex justify-between items-center w-full' style={{
                            fontSize: `${drawerPrintSettingData?.fontSize}px`
                        }}><p>Register Name:</p><p>{drawerReportData?.registerName && registerLabel[drawerReportData?.registerName]}</p></div>
                        <div className='flex justify-between items-center w-full' style={{
                            fontSize: `${drawerPrintSettingData?.fontSize}px`
                        }}><p>Started By:</p><p>{drawerReportData?.startedBy}</p></div>
                        <div className='flex justify-between items-center w-full' style={{
                            fontSize: `${drawerPrintSettingData?.fontSize}px`
                        }}><p>Started At:</p><p>{convertPSTTimestampToTimezone(Number(drawerReportData?.startedAt), storeTimeZone)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{
                            fontSize: `${drawerPrintSettingData?.fontSize}px`
                        }}><p>Ended By:</p><p>{drawerReportData?.startedBy}</p></div>
                        <div className='flex justify-between items-center w-full' style={{
                            fontSize: `${drawerPrintSettingData?.fontSize}px`
                        }}><p>Ended At:</p><p>{convertPSTTimestampToTimezone(Number(drawerReportData?.endedAt), storeTimeZone)}</p></div>
                    </div>
                    <Divider className='my-3'/>
                    <div className="flex flex-col justify-between items-start mb-3 w-full">
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}>
                            <p>Starting Balance:</p>
                            <p>{formatCurrency(drawerReportData?.startingBalance)}</p>
                        </div>
                            <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}>
                            <p>Starting Discrepancy:</p>
                            <p>{drawerReportData?.discrepancyReason}</p>
                        </div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}>
                            <p>Discrepancy Reason:</p>
                            <p>{'_'}</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-start mb-3 w-full">
                        <div className='flex justify-between items-center w-full mt-5'><p>Returns:</p><p>{formatCurrency(drawerReportData?.returns)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Voids:</p><p>{formatCurrency(drawerReportData?.voids)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Incoming Drops:</p><p>{formatCurrency(drawerReportData?.incomingDrops)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Outgoing Drops:</p><p>{formatCurrency(drawerReportData?.outgoingDrops)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Closing Drop:</p><p>{formatCurrency(drawerReportData?.closingDrop)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Left In Drawer:</p><p>{formatCurrency(drawerReportData?.leftInDrawer)}</p></div>
                        <div className='flex justify-between items-center w-full mt-5'><p>Expected Cash In Drawer:</p><p>{formatCurrency(drawerReportData?.expectedCash)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Actual Cash In Drawer:</p><p>{formatCurrency(drawerReportData?.actualCashInDrawer)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Closing Discrepancy:</p><p>{formatCurrency(drawerReportData?.closingDiscrepancy)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Discrepancy Reason:</p><p>{drawerReportData?.discrepancyReason}</p></div>
                        <div className='flex justify-between items-center w-full mt-5'><p>Cash Sales:</p><p>{formatCurrency(drawerReportData?.cashPayments)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Other Sales:</p><p>{formatCurrency(drawerReportData?.otherPayments)}</p></div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Total Sales:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div>
                    </div>
                    <p className='text-md text-left !font-varela_Round font-semibold text-black dark:text-white-dark mt-4'>Taxes</p>
                    <div className="flex flex-col justify-between items-start mb-3 w-full">
                        {drawerReportData?.taxes?.map((tax: any, index: number) => (
                            <div key={index} className='flex justify-between items-center w-full pl-4' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}>
                                <p>{tax.taxName}</p>
                                <p>{formatCurrency(tax.taxAmount)}</p>
                            </div>
                        ))}
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Tax Total:</p><p>{formatCurrency(drawerReportData?.taxTotal)}</p></div>
                    </div>
                    <div className="flex flex-col justify-between items-start mb-3 w-full">
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Net Sales:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

const RowItem = ({label, value, className}: {label: string, value: string | number | undefined, className?: string}) => {

    return (
        <div className={`flex justify-start items-center w-full my-[6px] ${className}`}>
            <span className='text-md text-left w-1/2 !font-varela_Round font-semibold text-dark dark:text-white-dark'>{label}</span>
            <span className='text-md text-left w-1/2'>{value}</span>
        </div>
    )
}

export default DrawersTable;
