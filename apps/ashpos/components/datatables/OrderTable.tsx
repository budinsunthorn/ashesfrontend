'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Fragment, useEffect, useState, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { useAtom } from 'jotai';
import { spinnerAtom } from '@/store/spinnerStatus';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { Transition, Dialog } from '@headlessui/react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';

import { Store } from 'react-notifications-component';

import { PRINTLIMIT } from '@/utils/variables';

import { useAllOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPagesQuery, useOrderQuery, useOrderWithTaxSumQuery, useVoidOrderMutation, useUnSyncOrderMutation, useSyncOrderMutation, MetrcOrderSyncType } from '@/src/__generated__/operations';
// import PackageRegisterModal from '../modals/PackageRegisterModal';
import { useQueryClient } from '@tanstack/react-query';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ProductPackageCard from '../etc/productPackageCard';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns } from 'react-icons/bs';
import IconPlus from '@/components/icon/icon-plus';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { FaArrowLeft } from 'react-icons/fa';
import { FiRefreshCcw } from 'react-icons/fi';
import { IoSearch } from 'react-icons/io5';

// import PackageCategory from '../etc/PackageCategory';

import Swal from 'sweetalert2';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import { userDataSave } from '@/store/userData';
import { DeepPartial } from '@/store/deepPartialType';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import * as generatedTypes from '@/src/__generated__/operations';
import ExportTable from '../etc/exportTable';
import { MdCancelPresentation, MdOutlineSync } from 'react-icons/md';
import ProductCategory from '../etc/productCategory';
import { FaArrowRight } from 'react-icons/fa6';
import { MdOutlineCloudSync } from 'react-icons/md';
import IconX from '@/components/icon/icon-x';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import { TbListDetails } from 'react-icons/tb';
import Link from 'next/link';
import SetPackage from '../etc/setPackage';
import OrderCard from '../etc/orderCard';
import OrderItem from '../etc/orderItem';
import { RxCross1 } from 'react-icons/rx';
import { ImCancelCircle } from 'react-icons/im';

import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import RefreshButton from '../etc/refreshButton';
import OrderStatusBadge from '../etc/OrderStatusBadge';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSkeleton from '../etc/loadingSkeleton';
import TableLoading from '../etc/tableLoading';
import { useDebouncedCallback } from 'use-debounce';
import { Span } from 'next/dist/trace';
import { GiAnticlockwiseRotation } from 'react-icons/gi';
import ExitLabelPrint from '../Print/exitLabelPrint';
import ReceiptPrint from '../Print/receiptPrint';

import { formatDateFromTimestamp, truncateToTwoDecimals } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

import { syncStatusAtom } from '@/store/syncStatusAtom';
import TableExport from '../etc/DataTableExport';

type RowOrderData = generatedTypes.OrderQuery;
type RowData = RowOrderData[] | null | undefined;

const OrderTable = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [spinnerStatus, setSpinnerStatus] = useAtom(spinnerAtom);
    const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);

    const [isRightBarShow, setIsRightBarShow] = useState(false);
    const [typeForFilter, setTypeForFilter] = useState('');
    const [statusForFilter, setStatusForFilter] = useState('');
    const [isAtTop, setIsAtTop] = useState(false);
    const [selectedRow, setSelectedRow] = useState(0);
    const targetRef = useRef<HTMLTableElement | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [modalShow, setModalShow] = useState(false);

    const [orderId, setOrderId] = useState<number>(0);

    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;

    const exitPrintButtonRef = useRef<HTMLDivElement>(null)
    const receiptPrintButtonRef = useRef<HTMLDivElement>(null)

    // Theme style
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const darkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);
    const menu = useSelector((state: IRootState) => state.themeConfig.menu);
    const sidebar = useSelector((state: IRootState) => state.themeConfig.sidebar)

    // For pagination
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [searchSelectValue, setSearchSelectValue] = useState('id');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('id');
    const [searchParam, setSearchParam] = useState('');
    const [searchPage, setSearchPage] = useState(1);
    const [orderType, setOrderType] = useState('sales');
    const [orderStatus, setOrderStatus] = useState('PAID');
    const [metrcType, setMetrcType] = useState<MetrcOrderSyncType>("all")
    const [voidComment, setVoidComment] = useState('');
    ////@ts-expect-error
    // const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(orderData, 'name'));
    // const [recordsData, setRecordsData] = useState(initialRecords);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'desc',
    });
    // fetching data
    const orderDataWithPage = useAllOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPagesQuery({
        dispensaryId: dispensaryId,
        orderType: orderType == 'return' ? 'RETURN' : 'SALE',
        status: orderStatus == 'EDIT' ? 'EDIT' : orderStatus == 'HOLD' ? 'HOLD' : orderStatus == 'PAID' ? 'PAID' : 'VOID',
        searchField: searchField,
        searchParam: searchParam,
        pageNumber: searchPage,
        onePageRecords: pageSize,
        sortField: sortStatus.columnAccessor,
        sortDirection: sortStatus.direction,
        synced: metrcType
    });
    const orderData = orderDataWithPage.data?.allOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPages?.orders;
    const totalCount = orderDataWithPage.data?.allOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPages?.totalCount;
    // console.log("orderData", orderData)

    // const orderPrintDataWithPage = useAllOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPagesQuery({
    //     dispensaryId: dispensaryId,
    //     orderType: orderType == 'return' ? 'RETURN' : 'SALE',
    //     status: orderStatus == 'EDIT' ? 'EDIT' : orderStatus == 'HOLD' ? 'HOLD' : orderStatus == 'PAID' ? 'PAID' : 'VOID',
    //     searchField: searchField,
    //     searchParam: searchParam,
    //     pageNumber: 1,
    //     onePageRecords: PRINTLIMIT,
    //     sortField: sortStatus.columnAccessor,
    //     sortDirection: sortStatus.direction,
    // });
    // const orderPrintData = orderPrintDataWithPage.data?.allOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPages?.orders;
    // console.log("orderPrintData", orderPrintData)

    // const [printData, setPrintData] = useState<any>(sortBy(orderPrintData, 'id'));

    const query = `
    query AllOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPages( $dispensaryId: String!, $orderType: OrderType!, $status: OrderStatus!, $searchField: String!, $searchParam: String!, $pageNumber: Int!, $onePageRecords: Int!, $sortField: String, $sortDirection: String) {
        allOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPages(dispensaryId: $dispensaryId, orderType: $orderType, status: $status,  searchField: $searchField, searchParam: $searchParam, pageNumber: $pageNumber, onePageRecords: $onePageRecords, sortField: $sortField, sortDirection: $sortDirection) {
            orders{
            id           
            metrcId
            dispensaryId 
            userId       
            customerId   
            customer {
                name
                isMedical
            }
            user {
                name
            }
            description  
            orderType
            cost  
            cashAmount 
            otherAmount
            changeDue
            loyalty
            discount
            grandTotal
            mjType
            status       
            orderDate      
            isReportedToMetrc
            createdAt    
            updatedAt    
            },
            totalCount
        }
        }`

    const [initialRecords, setInitialRecords] = useState<any>(sortBy(orderData, 'id'));


    const orderDetailRowData = useOrderWithTaxSumQuery({ id: orderId });
    const orderDetailData = orderDetailRowData.data?.orderWithTaxSum?.order;
    const orderDetailTaxSum = orderDetailRowData.data?.orderWithTaxSum?.tax;

    // mutation
    // console.log('orderDetailData', orderDetailData);
    const OrderVoidMutation = useVoidOrderMutation();
    const UnSyncOrderMutation = useUnSyncOrderMutation();
    const SyncOrderMutation = useSyncOrderMutation();

    const [hideCols, setHideCols] = useState<any>([
        'dispensaryId',
        'userId',
        'customerId',
        'description',
        'cost',
        'cashAmount',
        'changeDue',
        'loyalty',
        'orderType',
        'discount',
        'createdAt',
        'updatedAt',
        'customer.name',
    ]);

    const updateSearchParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        router.push(`?${params.toString()}`) // or use replace() to avoid history stacking
    }

    const handleRowClick = (record: any, index: any) => {
        setOrderId(Number(record?.id));
        // setDeliverId(record? record.deliveryId || 0 : 0);
        setSelectedRow(index);
        updateSearchParams('id', record?.id);
    }

    const handleSearch = () => {
        setSearchField(searchSelectValue);
        setSearchParam(searchValue.trim());
        setSearchPage(1);
    };

    const handleSearchByDate = (date: string) => {
        // console.log("searchSelectValue", searchSelectValue)
        // console.log("date", date)
        if(searchSelectValue == "orderDate"){
            setSearchField(searchSelectValue)
            setSearchParam(date);
            setSearchPage(1);
        }
    }

    useEffect(() => {
        if(searchParams.get('id')) {
            setOrderId(Number(searchParams.get('id')));

            setIsRightBarShow(true)
        }
    }, [searchParams])

    useEffect(() => {
        setPage(1);
        if (pageSize == 10) setIsAtTop(false);
    }, [pageSize]);

    useEffect(() => {
        setSearchPage(page);
    }, [page])

    useEffect(() => {
        setInitialRecords(orderData);
    }, [orderData]);

    useEffect(() => {
        if(syncStatus) {
            orderDataWithPage.refetch();
            orderDetailRowData.refetch();
        }
    }, [syncStatus])
    // useEffect(() => {
    //     const from = (page - 1) * pageSize;
    //     const to = from + pageSize;
    //     if (initialRecords) setRecordsData([...initialRecords.slice(from, to)]);
    // }, [page, pageSize, initialRecords]);
    useEffect(() => {
        const data = sortBy(orderData, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const [firstViewed, setFirstViewed] = useState(false);

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

    const handleOrderVoid = () => {
        OrderVoidMutation.mutate(
            {
                input: {
                    id: orderId,
                    voidReason: voidComment,
                },
            },
            {
                onError(error, variables, context) {
                    warnAlert('Order void failed!');
                },

                onSuccess(data, variables, context) {
                    successAlert('Order void success!');
                    setModalShow(false);
                    if(data.voidOrder?.pos) {
                        Store.addNotification({
                            title: "Success",
                            message: `Order #${orderId} Voided!`,
                            type: "success",
                            insert: "bottom",
                            container: "bottom-left",
                            animationIn: ["animate__animated", "animate__fadeIn"],
                            animationOut: ["animate__animated", "animate__fadeOut"],
                            dismiss: {
                                duration: 4000,
                                onScreen: true
                            }
                        });
                    } else {
                        Store.addNotification({
                            title: "Error",
                            message: `Order #${orderId} Void Failed!`,
                            type: "warning",
                            insert: "bottom",
                            container: "bottom-left",
                            animationIn: ["animate__animated", "animate__fadeIn"],
                            animationOut: ["animate__animated", "animate__fadeOut"],
                            dismiss: {
                                duration: 4000,
                                onScreen: true
                            }
                            });
                    }
                    setTimeout(() => {
                    
                    if (data.voidOrder?.metrc == 'success') {
                        // console.log("data.completeOrder?.metrc", data.voidOrder?.metrc);
                        Store.addNotification({
                            title: "Success",
                            message: `#${orderId} Metrc Unsynced!`,
                            type: "success",
                            insert: "bottom",
                            container: "bottom-left",
                            animationIn: ["animate__animated", "animate__fadeIn"],
                            animationOut: ["animate__animated", "animate__fadeOut"],
                            dismiss: {
                                duration: 4000,
                                onScreen: true
                            }
                        });
                    } else if (data.voidOrder?.metrc == 'failed') {
                        Store.addNotification({
                            title: "Error!",
                            message: `#${orderId} Metrc Unsync Failed!`,
                            type: "warning",
                            insert: "bottom",
                            container: "bottom-left",
                            animationIn: ["animate__animated", "animate__fadeIn"],
                            animationOut: ["animate__animated", "animate__fadeOut"],
                            dismiss: {
                                duration: 4000,
                                onScreen: true
                            }
                            });
                    }}, 1000);
                    orderDataWithPage.refetch();
                    orderDetailRowData.refetch();
                },
            }
        );
    };

    const checkPositionTable = (event: any) => {
        if (targetRef.current) {
            const tbody = targetRef.current.querySelector('tbody');
            const tr = tbody && tbody.querySelectorAll('tr')?.[0];
            if (tr) {
                const rect = tr.getBoundingClientRect();
                if (rect.top <= 100) {
                    if (event.deltaY < 0 && isShiftPressed === false && rect.top >= 0 && rect.top <= 100) {
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


    const handleUnsyncOrder = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Unsync Order?',
            text: 'Are you going to really Unsync?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await UnSyncOrderMutation.mutate(
                    {
                        input: {
                            id: orderDetailData?.id ?? -1,
                        },
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            if (data.unSyncOrder) {
                                // successAlert('Order unsynced Successfully!');
                                
                            }
                            if(data.unSyncOrder) {
                                Store.addNotification({
                                    title: "Success",
                                    message: `Order #${orderDetailData?.id} Metrc Unsync Success!`,
                                    type: "success",
                                    insert: "bottom",
                                    container: "bottom-left",
                                    animationIn: ["animate__animated", "animate__fadeIn"],
                                    animationOut: ["animate__animated", "animate__fadeOut"],
                                    dismiss: {
                                        duration: 4000,
                                        onScreen: true
                                    }
                                });
                                orderDetailRowData.refetch();
                                orderDataWithPage.refetch();
                            } else {
                                Store.addNotification({
                                    title: "Error",
                                    message: `Order #${orderDetailData?.id} Metrc Unsync Failed!`,
                                    type: "warning",
                                    insert: "bottom",
                                    container: "bottom-left",
                                    animationIn: ["animate__animated", "animate__fadeIn"],
                                    animationOut: ["animate__animated", "animate__fadeOut"],
                                    dismiss: {
                                        duration: 4000,
                                        onScreen: true
                                    }
                                    });
                            }
                        },
                    }
                );
            }
        });
    }
    const handleSyncOrder = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Sync Order?',
            text: 'Are you going to really Sync?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await SyncOrderMutation.mutate(
                    {
                        input: {
                            id: orderDetailData?.id ?? -1,
                        },
                    },
                    {
                        onError(error) {
                            // warnAlert(error.message);
                            Store.addNotification({
                                title: "Error",
                                message: `${error.message}`,
                                type: "warning",
                                insert: "bottom",
                                container: "bottom-left",
                                animationIn: ["animate__animated", "animate__fadeIn"],
                                animationOut: ["animate__animated", "animate__fadeOut"],
                                dismiss: {
                                    duration: 4000,
                                    onScreen: true
                                }
                            });
                        },
                        onSuccess(data) {
                            if (!data) return;
                            if (data.syncOrder) {
                                successAlert('Order synced Successfully!');
                                Store.addNotification({
                                    title: "Success",
                                    message: `Order synced Successfully!`,
                                    type: "success",
                                    insert: "bottom",
                                    container: "bottom-left",
                                    animationIn: ["animate__animated", "animate__fadeIn"],
                                    animationOut: ["animate__animated", "animate__fadeOut"],
                                    dismiss: {
                                        duration: 4000,
                                        onScreen: true
                                    }
                                });
                                orderDetailRowData.refetch();
                                orderDataWithPage.refetch();
                            }
                        },
                    }
                );
            }
        });
    }

    const handleKeyDown = (event: any) => {
        if (event.shiftKey) {
            setIsShiftPressed(true);
        }
    };

    const handleKeyUp = (event: any) => {
        if (event.key === 'Shift') {
            setIsShiftPressed(false);
        }
    };

    window.addEventListener('keydown', handleKeyDown); // Attach keydown listener
    window.addEventListener('keyup', handleKeyUp); // Attach keyup listener

    // for full width tabel
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
                if (darkMode) row.classList.add('dark-active');
                else row.classList.add('active');
            }
        }
    }, [selectedRow, darkMode]);

    const [tableClassname, setTableClassName] = useState('w-full');

    useEffect(() => {
        if (isAtTop) {
            // Add your logic here based on rightBarStatus
            if (isRightBarShow === true) {
                setTableClassName(
                    `fixed top-0 z-[99]  ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-518px)]' : 'w-[calc(100vw-780px)]' : 'left-[90px] w-[calc(100vw-590px)]'
                    } h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            } else {
                setTableClassName(
                    `fixed top-0 z-[99]  ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-20px)]' : 'w-[calc(100vw-285px)]' : 'left-[90px] w-[calc(100vw-90px)]'
                    }  h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-540px)]' : 'w-[calc(100vw-800px)]' : 'w-[calc(100vw-600px)]'} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == 'horizontal' ? 'left-0 w-[calc(100vw-60px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-55px)]' : 'w-[calc(100vw-320px)]' : 'w-[calc(100vw-115px)]'} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow, sidebar, menu]);

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'id', title: 'Order ID' },
        // { accessor: 'dispensaryId', title: 'Dispensary ID' },
        // { accessor: 'userId', title: 'User ID' },
        // { accessor: 'customerId', title: 'Customer ID' },
        { accessor: 'grandTotal', title: 'Grand Total' },
        { accessor: 'isReportedToMetrc', title: 'Synced' },
        { accessor: 'cost', title: 'Cost' },
        { accessor: 'cashAmount', title: 'Cash Amount' },
        { accessor: 'changeDue', title: 'Change Due' },
        { accessor: 'loyalty', title: 'Loyalty' },
        { accessor: 'discount', title: 'Discount' },
        { accessor: 'mjType', title: 'Is MJ' },
        { accessor: 'metrcId', title: 'Metrc ID' },
        { accessor: 'orderType', title: 'Order Type' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'orderDate', title: 'Order Date' },
        { accessor: 'createdAt', title: 'Created At' },
        { accessor: 'updatedAt', title: 'Updated At' },
        { accessor: 'customer.name', title: 'Customer' },
        // { accessor: 'customer.isMedical', title: 'customer.isMedical' },
        { accessor: 'user.name', title: 'User Name' },
    ];


    const handleRealtimeSearch = useDebouncedCallback((param) => {
        setSearchField(searchSelectValue);
        setSearchParam(param.trim());
        setSearchPage(1);
    }, 500);


    return (
        <div className={`mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <h5 className="text-lg font-semibold dark:text-white-dark">Orders</h5>
            <div className="my-2 flex gap-5 flex-row flex-wrap md:items-center">
                {/* <div className="flex items-center">
                    <label className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 sm:w-1/4 text-nowrap mr-4">Order Type:</label>
                    <select
                        onChange={(e) => {
                            setOrderType(e.target.value);
                        }}
                        id="orderType"
                        className={`flex-initial w-40 form-select mt-1 `}
                        name="orderNumber"
                        value={orderType}
                    >
                        <option key={0} value={0} disabled>
                            order type ...
                        </option>
                        <option value={'Return'}>Return</option>
                        <option value={'Sales'}>Sales</option>
                    </select>
                    <div className="relative inline-flex align-middle mr-2">
                        <button
                            type="button"
                            className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#1c2942] dark:hover:!text-[#878ca7] border-gray-200 dark:border-[#283b5d] ltr:rounded-r-none rtl:rounded-l-none ${
                                orderType == 'sales' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                            }`}
                            onClick={() => setOrderType((prev) => (prev == '' || prev != 'sales' ? 'sales' : ''))}
                        >
                            Sales
                        </button>
                        <button
                            type="button"
                            className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#1c2942] dark:hover:!text-[#878ca7] border-gray-200 dark:border-[#283b5d] sticky top-0 ltr:rounded-l-none rtl:rounded-r-none ${
                                orderType == 'return' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                            }`}
                            onClick={() => setOrderType((prev) => (prev == '' || prev != 'return' ? 'return' : ''))}
                        >
                            Return
                        </button>
                    </div>
                </div> */}
                <div className="flex items-center">
                    <label className="lg:text-right text-dark dark:text-white-dark  mb-0 text-nowrap mr-2">Status:</label>
                    <select
                        onChange={(e) => {
                            setOrderStatus(e.target.value);
                        }}
                        id="orderType"
                        className={`flex-initial w-40 form-select text-dark dark:text-white-dark`}
                        name="orderNumber"
                        value={orderStatus}
                    >
                        <option key={0} value={0} disabled>
                            order status ...
                        </option>
                        <option value={'all'}>All</option>
                        <option value={'PAID'}>PAID</option>
                        <option value={'HOLD'}>HOLD</option>
                        <option value={'VOID'}>VOID</option>
                        <option value={'EDIT'}>EDIT</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <label className="lg:text-right text-dark dark:text-white-dark  mb-0 text-nowrap mr-2">Metrc:</label>
                    <select
                        onChange={(e) => {
                            setMetrcType(e.target.value as MetrcOrderSyncType);
                        }}
                        className={`flex-initial w-40 form-select text-dark dark:text-white-dark`}
                        value={metrcType}
                    >
                        <option key={0} value={0} disabled>
                            Metrc status ...
                        </option>
                        <option value={'all'}>All</option>
                        <option value={'synced'}>Synced</option>
                        <option value={'notSynced'}>Not synced</option>
                        <option value={'nonMj'}>Non-MJ</option>
                    </select>
                </div>
                <div className={`absolute flex flex-row items-center gap-2 lg:ltr:ml-auto rtl:mr-auto transition-all duration-500 ${isRightBarShow ? '!right-[505px]' : 'right-6'}`}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <RefreshButton onClick={() => orderDataWithPage.refetch()} />
                        <Tippy content="Columns" placement="top">
                            <div className="dropdown">
                                <Dropdown
                                    placement={`${isRtl ? 'bottom-end' : 'bottom-end'}`}
                                    btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-2 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                    button={
                                        <>
                                            {/* <span className="ltr:mr-1 rtl:ml-1">Columns</span> */}
                                            {/* <IconCaretDown className="h-5 w-5" /> */}
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
                    </div>
                    {/* <ExportTable cols={cols} recordsData={orderPrintData} hideCols={hideCols} filename='order_table_data' /> */}
                    <TableExport cols={cols} hideCols={hideCols} filename='order' query={query}
                        variables={{  
                                dispensaryId: dispensaryId,
                                orderType: orderType == 'return' ? 'RETURN' : 'SALE',
                                status: orderStatus == 'EDIT' ? 'EDIT' : orderStatus == 'HOLD' ? 'HOLD' : orderStatus == 'PAID' ? 'PAID' : 'VOID',
                                searchField: searchField,
                                searchParam: searchParam,
                                pageNumber: 1,
                                onePageRecords: PRINTLIMIT,
                                sortField: sortStatus.columnAccessor,
                                sortDirection: sortStatus.direction,
                        }}
                    />
                    <div className="text-right flex justify-start items-center">
                        <select
                            onChange={(e) => {
                                setSearchSelectValue(e.target.value);
                                setSearchPage(1)
                            }}
                            id="currentDispensary"
                            className="flex-initial w-48 form-select rounded-r-none"
                        >
                            {/* <option value='packageLabel'>packageLabel</option> */}
                            <option value="id">Order Id</option>
                            <option value="metrcId">Metrc Id</option>
                            <option value="customer.name">Customer Name</option>
                            <option value="customer.medicalLicense">MJ License</option>
                            <option value="user.name">User Name</option>
                            <option value="orderDate">Order Date</option>
                            {/* <option value='packageId'>packageId</option> */}
                        </select>
                        {searchSelectValue == "orderDate" ? 
                        <Flatpickr
                        id="currentDate"
                        value={searchValue}
                        options={{
                            dateFormat: 'Y-m-d',
                            position: isRtl ? 'auto right' : 'auto left',
                        }}
                        className="h-full form-input flex-1 rounded-none py-[10px]"
                        onChange={(date) => {
                            setSearchValue(formatDateFromTimestamp(date[0]));
                            handleSearchByDate(formatDateFromTimestamp(date[0]));
                        }}
                    />:   
                    <input type="text" className="form-input !rounded-none w-44" placeholder="Search..." value={searchValue} onChange={(e) => {
                            setSearchValue(e.target.value);
                            handleRealtimeSearch(e.target.value)
                        }} />}
                        <button
                            onClick={handleSearch}
                            className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 py-3  font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                        >
                            <IoSearch />
                        </button>
                    </div>
                </div>
            </div>
            <div className={`datatables w-full`}>
                <div className={`transition-transform duration-300`} ref={targetRef}>
                    <DataTable
                        highlightOnHover
                        className={`table-hover whitespace-nowrap data-table ${tableClassname}`}
                        // style={{zIndex: 30}}
                        records={initialRecords ?? []}
                        fetching={orderDataWithPage.isLoading || orderDataWithPage.isFetching}
                        loaderBackgroundBlur={80}
                        customLoader={<TableLoading text="Loading Product Data..." />}
                        columns={[
                            {
                                accessor: 'index',
                                title: '#',
                                width: 40,
                                render: (record) => (initialRecords ? (page - 1) * pageSize + initialRecords.indexOf(record) + 1 : 0),
                            },
                            {
                                accessor: 'id',
                                title: 'Order ID',
                                sortable: true,
                                textAlignment: 'right',
                                render: (row) => {
                                    if (!row) {
                                        return null;
                                    }

                                    const { id } = row;

                                    if (id == null) {
                                        return null;
                                    }
                                    
                                    // return <div>#{id.toString()}</div>;
                                    return <div className='text-right'>#{id.toString()}</div>;
                                },
                                hidden: hideCols.includes('id'),
                            },

                            {
                                accessor: 'createdAt',
                                title: 'Created At',
                                titleClassName: 'text-red-500',
                                sortable: true,
                                render: (row: any) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { createdAt } = row;

                                    if (createdAt === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return formatDate(createdAt);
                                },
                                hidden: hideCols.includes('createdAt'),
                            },
                            {
                                accessor: 'orderType',
                                title: 'Type',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { orderType } = row;
                                    return <div className={`badge ${orderType == 'SALE' ? 'badge-outline-success ' : 'badge-outline-warning'} inline`}>{orderType}</div>;
                                },
                                hidden: hideCols.includes('orderType'),
                            },
                            {
                                accessor: 'alert',
                                title: 'Alert',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    // const { type } = row;
                                },
                                hidden: true,
                            },
                            {
                                accessor: 'changeDue',
                                title: 'Change Due',
                                sortable: true,
                                hidden: hideCols.includes('changeDue'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { changeDue } = row;

                                    if (changeDue === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div>{truncateToTwoDecimals(changeDue)}</div>;
                                },
                            },
                            {
                                accessor: 'isReportedToMetrc',
                                title: 'Synced',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { isReportedToMetrc, mjType } = row;

                                    if (isReportedToMetrc === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return mjType == "MJ" ? (isReportedToMetrc ? <span className='badge bg-success-light text-success dark:bg-success-dark-light'>Synced</span> 
                                    : <span className='badge bg-warning-light text-warning dark:bg-warning-dark-light'>Not Synced</span>)
                                    : <span className='badge bg-info-light text-info dark:bg-info-dark-light'>Non-MJ</span>;
                                },
                                hidden: hideCols.includes('isReportedToMetrc'),
                            },
                            {
                                accessor: 'grandTotal',
                                title: 'Grand Total',
                                sortable: true,
                                textAlignment: 'right',
                                hidden: hideCols.includes('grandTotal'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { grandTotal } = row;

                                    if (grandTotal === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div className='text-right'>{formatCurrency(truncateToTwoDecimals(grandTotal))}</div>;
                                },
                            },
                            {
                                accessor: 'status',
                                title: 'Status',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { status } = row;

                                    if (status === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <OrderStatusBadge status={status} />;
                                },
                                hidden: hideCols.includes('status'),
                            },
                            {
                                accessor: 'customerId',
                                title: 'customer ID',
                                sortable: true,
                                hidden: hideCols.includes('customerId'),
                            },
                            {
                                accessor: 'metrcId',
                                title: 'Metrc ID',
                                sortable: true,
                                hidden: hideCols.includes('metrcId'),
                            },

                            {
                                accessor: 'description',
                                title: 'Description',
                                sortable: true,
                                hidden: hideCols.includes('description'),
                            },
                            {
                                accessor: 'cashAmount',
                                title: 'Cash Amount',
                                sortable: true,
                                hidden: hideCols.includes('cashAmount'),
                                render: (row) => {
                                    if (!row) return null;
                                    return <div>{formatCurrency(row.cashAmount)}</div>;
                                },
                            },
                            {
                                accessor: 'cost',
                                title: 'Cost',
                                sortable: true,
                                hidden: hideCols.includes('cost'),
                                render: (row) => {
                                    if (!row) return null;
                                    return <div>{formatCurrency(row.cost)}</div>;
                                },
                            },
                            {
                                accessor: 'loyalty',
                                title: 'Loyalty',
                                sortable: true,
                                hidden: hideCols.includes('loyalty'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { loyalty } = row;

                                    if (loyalty === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div>{truncateToTwoDecimals(loyalty)}</div>;
                                },
                            },
                            {
                                accessor: 'discount',
                                title: 'Discount',
                                sortable: true,
                                hidden: hideCols.includes('discount'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { discount } = row;

                                    if (discount === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div>{formatCurrency(truncateToTwoDecimals(discount))}</div>;
                                },
                            },
                            {
                                accessor: 'dispensaryId',
                                title: 'Dispensary ID',
                                sortable: true,
                                hidden: hideCols.includes('dispensaryId'),
                            },
                            {
                                accessor: 'mjType',
                                title: 'MJ',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { mjType } = row;

                                    if (mjType == null) {
                                        return null;
                                    }
                                    const result = mjType === 'MJ' ? 'Yes' : '';
                                    return result;
                                },
                                hidden: hideCols.includes('mjType'),
                            },

                            {
                                accessor: 'orderDate',
                                title: 'Order Date',
                                sortable: true,
                                hidden: hideCols.includes('orderDate'),
                                render: (row: any) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { orderDate } = row;

                                    if (orderDate == null) {
                                        return null;
                                    }

                                    return orderDate;
                                }
                            },
                            {
                                accessor: 'updatedAt',
                                title: 'Updated At',
                                sortable: true,
                                hidden: hideCols.includes('updatedAt'),
                            },
                            {
                                accessor: 'customer.name',
                                title: 'Customer Name',
                                sortable: true,
                                hidden: hideCols.includes('customer.name'),
                            },
                            // {
                            //     accessor: 'customer.isMedical',
                            //     title: 'Customer is Medical',
                            //     sortable: true,
                            //     hidden: hideCols.includes('customer.isMedical'),
                            //     render: (row) => {
                            //         if (!row) {
                            //             return null; // Handle the null case as needed
                            //         }
                            //         const { customer } = row;
                            //         if (!customer) {
                            //             return null; // Handle the null case as needed
                            //         }
                            //         const { isMedical } = customer;
                            //         return <div>{isMedical ? 'Yes' : 'No'}</div>;
                            //     },
                            // },
                        ]}
                        totalRecords={totalCount ?? 0}
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
                            handleRowClick(record, index);
                        }}
                    />
                </div>
            </div>
            <div className={`fixed bottom-0 z-[101] transition-all duration-500 h-full right-0 bg-white ${isRightBarShow ? 'w-[500px]' : 'w-0'}`}>
                <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                    <PerfectScrollbar>
                        <div className="py-2 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                            <button
                                type="button"
                                className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                onClick={() => setIsRightBarShow(false)}
                            >
                                <FaArrowRightFromBracket className="m-auto text-2xl" />
                            </button>
                            {orderDetailData?.status == 'PAID' ? (
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
                            ) : null}
                        </div>
                        {orderDetailRowData.isLoading || orderDetailRowData.isFetching ? 
                        <LoadingSkeleton/>
                        : <div>
                        <div className="text-xl font-bold px-3 pt-3 text-dark dark:text-white-dark">Order #{orderId.toString()}</div>
                        <div className="flex flex-col itens-center px-3">{<OrderCard orderData={orderDetailData} isLoading={orderDetailRowData.isLoading || orderDetailRowData.isFetching}/>}</div>
                        <div className="px-3">
                            <OrderItem orderItemData={orderDetailData} taxSum={orderDetailTaxSum} isLoading={orderDetailRowData.isLoading || orderDetailRowData.isFetching}/>
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
                        </div>}
                    </PerfectScrollbar>
                </div>
            </div>
            <Transition appear show={modalShow} as={Fragment}>
                <Dialog as="div" open={modalShow} onClose={() => setModalShow(true)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 " />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] bg-[black]/60 overflow-auto">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel my-8 min-w-[400px] top-[30%] rounded-lg border-0 px-5 py-3 text-black dark:text-white-dark">
                                    <div className="flex justify-between items-center py-2 mb-2 border-b-[1px] border-gray-300">
                                        Void Order #{orderId.toString()}
                                        <div onClick={() => setModalShow(false)} className="text-dark hover:text-dark dark:text-white-dark cursor-pointer">
                                            <IconX />
                                        </div>
                                    </div>
                                    <div className="rounded-lg flex flex-col justify-between items-center">
                                        <div className="flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light">
                                            <span className="ltr:pr-2 rtl:pl-2">
                                                <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong>Voiding this order is permanent and can not be undone.
                                                <br />
                                                Inventory for all items in the order will be replenished.
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 w-full">
                                            <span className="text-dark dark:text-white-dark text-nowrap mr-2">Enter Void Comment:</span>
                                            <input
                                                type="text"
                                                className="form-input bg-gray-100"
                                                placeholder="Void comment"
                                                value={voidComment}
                                                onChange={(e) => {
                                                    setVoidComment(e.target.value);
                                                }}
                                            />
                                        </div>
                                        <div className="pt-2 w-full flex justify-end items-center border-t-[1px] border-gray-300">
                                            <button type="button" className="btn btn-secondary ltr:right-auto mr-2" onClick={() => setModalShow(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary" onClick={handleOrderVoid}>
                                                Complete Void
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default OrderTable;
