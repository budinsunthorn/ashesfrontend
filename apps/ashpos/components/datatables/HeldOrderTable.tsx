'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Fragment, useEffect, useState, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { useAtom } from 'jotai';
import { spinnerAtom } from '@/store/spinnerStatus';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { Transition, Dialog } from '@headlessui/react';

import { useAllOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPagesQuery } from '@/src/__generated__/operations';
import { TransferType, TransferStatus } from '@/src/__generated__/operations';
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
import { MdOutlineSync } from 'react-icons/md';
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
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import TableLoading from '../etc/tableLoading';
import { useDebouncedCallback } from 'use-debounce';

type RowDataType = generatedTypes.Transfer;
type RowData = RowDataType[];

const HeldOrderTable = () => {
    const queryClient = useQueryClient();
    const [isRightBarShow, setIsRightBarShow] = useState(false);
    const [isAtTop, setIsAtTop] = useState(false);
    const [selectedRow, setSelectedRow] = useState(0);
    const targetRef = useRef<HTMLTableElement | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [modalShow, setModalShow] = useState(false);

    const [orderId, setOrderId] = useState<number | string>('');

    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;

    // Theme style
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const darkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);
    const menu = useSelector((state: IRootState) => state.themeConfig.menu);

    // For pagination
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [searchSelectValue, setSearchSelectValue] = useState('ShipperFacilityName');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('ShipperFacilityName');
    const [searchParam, setSearchParam] = useState('');
    const [searchPage, setSearchPage] = useState(1);
    const [orderType, setOrderType] = useState('');
    const [orderStatus, setOrderStatus] = useState('EDIT');
    ////@ts-expect-error
    const transferDataWithPage = useAllOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPagesQuery({
        dispensaryId: dispensaryId,
        orderType: orderType == '' ? 'RETURN' : 'SALE',
        status: orderStatus == 'EDIT' ? 'EDIT' : orderStatus == 'HOLD' ? 'HOLD' : orderStatus == 'PAID' ? 'PAID' : 'VOID',
        searchField: searchField,
        searchParam: searchParam,
        pageNumber: searchPage,
        onePageRecords: pageSize,
        synced: 'synced'
    });

    const transferData = transferDataWithPage.data?.allOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPages?.orders;
    const totalCount = transferDataWithPage.data?.allOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPages?.totalCount;

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
});

    const [hideCols, setHideCols] = useState<any>([
        'id',
        'dispensaryId',
        'userId',
        'customerId',
        'description',
        'cost',
        'cashAmount',
        'changeDue',
        'loyalty',
        'discount',
        'status',
        'orderDate',
        'createdAt',
        'updatedAt',
        'customer.name',
        'customer.isMedical',
    ]);

    const handleSearch = () => {
        setSearchField(searchSelectValue);
        setSearchParam(searchValue.trim());
        setSearchPage(1);
    };

    const handleRealtimeSearch = useDebouncedCallback((param) => {
        setSearchField(searchSelectValue);
        setSearchParam(param.trim());
        setSearchPage(1);
    }, 500);

    useEffect(() => {
        setPage(1);
        if (pageSize == 10) setIsAtTop(false);
    }, [pageSize]);

    useEffect(() => {
        
        setSearchPage(page);
    }, [page]);

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
                    `fixed top-0  ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? 'w-[calc(100vw-780px)]' : 'left-[90px] w-[calc(100vw-590px)]'
                    } h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            } else {
                setTableClassName(
                    `fixed top-0  ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw)]' : menu == 'vertical' ? 'w-[calc(100vw-260px)]' : 'left-[90px] w-[calc(100vw-90px)]'
                    }  h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? 'w-[calc(100vw-790px)]' : 'w-[calc(100vw-600px)]'} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == 'horizontal' ? 'left-0 w-[calc(100vw-60px)]' : menu == 'vertical' ? 'w-[calc(100vw-305px)]' : 'w-[calc(100vw-115px)]'} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow]);

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'id', title: 'ID' },
        { accessor: 'dispensaryId', title: 'Dispensary ID' },
        { accessor: 'userId', title: 'User ID' },
        { accessor: 'customerId', title: 'Customer ID' },
        { accessor: 'description', title: 'Description' },
        { accessor: 'cost', title: 'Cost' },
        { accessor: 'cashAmount', title: 'Cash Amount' },
        { accessor: 'changeDue', title: 'Change Due' },
        { accessor: 'loyalty', title: 'Loyalty' },
        { accessor: 'discount', title: 'Discount' },
        { accessor: 'mjType', title: 'Is MJ' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'orderDate', title: 'Order Date' },
        { accessor: 'createdAt', title: 'Created At' },
        { accessor: 'updatedAt', title: 'Updated At' },
        { accessor: 'customer.name', title: 'customer.name' },
        { accessor: 'customer.isMedical', title: 'customer.isMedical' },
    ];
    return (
        <div className={`mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <h5 className="text-lg font-semibold dark:text-white-dark">Orders</h5>
            <div className="my-2 flex-row flex-wrap md:items-center h-10">
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
                </div>
                <div className="flex items-center">
                    <label className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 text-nowrap mr-2">Order Status:</label>
                    <select
                        onChange={(e) => {
                            setOrderStatus(e.target.value);
                        }}
                        id="orderType"
                        className={`flex-initial w-40 form-select mt-1 `}
                        name="orderNumber"
                        value={orderStatus}
                    >
                        <option key={0} value={0} disabled>
                            order status ...
                        </option>
                        <option value={'EDIT'}>EDIT</option>
                        <option value={'HOLD'}>HOLD</option>
                        <option value={'PAID'}>PAID</option>
                        <option value={'VOID'}>VOID</option>
                    </select>
                </div> */}
                <div className={`absolute flex flex-row items-center gap-5 lg:ltr:ml-auto rtl:mr-auto transition-all duration-500 ${isRightBarShow ? '!right-[505px]' : 'right-6'}`}>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
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
                    <ExportTable cols={cols} recordsData={transferData} hideCols={hideCols} filename='heldOder_table_data'/>
                    <div className="text-right flex justify-start items-center">
                        <select
                            onChange={(e) => {
                                setSearchSelectValue(e.target.value);
                            }}
                            id="currentDispensary"
                            className="flex-initial w-48 form-select text-white-dark rounded-r-none"
                        >
                            {/* <option value='packageLabel'>packageLabel</option> */}
                            <option value="ShipperFacilityName">Shipper Facility Name</option>
                            {/* <option value='packageId'>packageId</option> */}
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
                    </div>
                </div>
            </div>
            <div className={`datatables w-full`}>
                <div className={`transition-transform duration-300`} ref={targetRef}>
                    <DataTable
                        highlightOnHover
                        className={`table-hover whitespace-nowrap data-table ${tableClassname}`}
                        // style={{zIndex: 30}}
                        records={transferData ?? []}
                        fetching={transferDataWithPage.isLoading || transferDataWithPage.isFetching}
                        loaderBackgroundBlur={80}
                        customLoader={<TableLoading text="Loading Product Data..." />}
                        columns={[
                            {
                                accessor: 'index',
                                title: '#',
                                width: 40,
                                render: (record) => (transferData ? transferData.indexOf(record) + 1 : 0),
                            },
                            {
                                accessor: 'id',
                                title: 'Order ID',
                                sortable: true,
                                render: (row) => {
                                    if(!row) {
                                        return null;
                                    }

                                    const {id} = row;

                                    if(id == null) {
                                        return null;
                                    }

                                    return id.toString().padStart(10, "0");
                                }
                                // hidden: true,
                            },

                            {
                                accessor: 'createdAt',
                                title: 'Created At',
                                titleClassName: 'text-red-500',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { createdAt } = row;

                                    if (createdAt === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return convertPSTTimestampToTimezone(createdAt, userData.storeTimeZone);
                                },
                                hidden: hideCols.includes('createdAt'),
                            },
                            {
                                accessor: 'type',
                                title: 'type',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    // const { type } = row;
                                },
                                hidden: hideCols.includes('transferType'),
                            },
                            {
                                accessor: 'alert',
                                title: 'alert',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    // const { type } = row;
                                },
                                hidden: hideCols.includes('transferType'),
                            },
                            {
                                accessor: 'changeDue',
                                title: 'Change Due',
                                sortable: true,
                                hidden: hideCols.includes('changeDue'),
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
                                    return status === 'EDIT' ? (
                                        <span className={`rounded bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 dark:bg-green-900 dark:text-green-300`}>{status}</span>
                                    ) : status === 'HOLD' ? (
                                        <span className={`rounded bg-[#d39b46] text-white text-xs font-medium px-2.5 py-0.5 dark:bg-yellow-900 dark:text-yellow-300`}>{status}</span>
                                    ) : status === 'PAID' ? (
                                        <span className={`rounded bg-[#d39b46] text-white text-xs font-medium px-2.5 py-0.5 dark:bg-yellow-900 dark:text-yellow-300`}>{status}</span>
                                    ) : (
                                        <span className={`rounded bg-gray-500 text-white text-xs font-medium px-2.5 py-0.5 dark:bg-gray-700 dark:text-gray-300`}>{status}</span>
                                    );
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
                            },
                            {
                                accessor: 'cost',
                                title: 'Cost',
                                sortable: true,
                                hidden: hideCols.includes('cost'),
                            },
                            {
                                accessor: 'loyalty',
                                title: 'Loyalty',
                                sortable: true,
                                hidden: hideCols.includes('loyalty'),
                            },
                            {
                                accessor: 'discount',
                                title: 'Discount',
                                sortable: true,
                                hidden: hideCols.includes('discount'),
                            },
                            {
                                accessor: 'dispensaryId',
                                title: 'Dispensary ID',
                                sortable: true,
                                hidden: hideCols.includes('dispensaryId'),
                            },
                            {
                                accessor: 'id',
                                title: 'ID',
                                sortable: true,
                                hidden: hideCols.includes('id'),
                            },
                            {
                                accessor: 'mjType',
                                title: 'Contains Marijuana?',
                                sortable: true,
                                hidden: hideCols.includes('mjType'),
                            },

                            {
                                accessor: 'orderDate',
                                title: 'Order Date',
                                sortable: true,
                                hidden: hideCols.includes('orderDate'),
                            },
                            {
                                accessor: 'createdAt',
                                title: 'Created At',
                                sortable: true,
                                hidden: hideCols.includes('createdAt'),
                            },
                            {
                                accessor: 'updatedAt',
                                title: 'Updated At',
                                sortable: true,
                                hidden: hideCols.includes('updatedAt'),
                            },
                            {
                                accessor: 'customer.name',
                                title: 'customer Name',
                                sortable: true,
                                hidden: hideCols.includes('customer.name'),
                            },
                            {
                                accessor: 'customer.isMedical',
                                title: 'customer isMedical',
                                sortable: true,
                                hidden: hideCols.includes('customer.isMedical'),
                            },
                            // {
                            //     accessor: 'userId',
                            //     title: 'User ID',
                            //     sortable: true,
                            //     hidden: hideCols.includes('userId'),
                            // },
                            // {
                            //     accessor: 'action',
                            //     title: 'Action',
                            //     sortable: false,
                            //     render: ({ id, dispensaryId, supplierId, userId, itemCategoryId, name, sku, upc, price, unitOfMeasure, unitWeight, netWeight, metrcPackage, createdAt, updatedAt }) => (
                            //         <div>
                            //             <Tippy content="Edit">
                            //                 <button
                            //                     type="button"
                            //                     onClick={() => {
                            //                         setModalMode('update');
                            //                         setCurrentPackage({
                            //                             id,
                            //                             dispensaryId,
                            //                             supplierId,
                            //                             userId,
                            //                             itemCategoryId,
                            //                             name,
                            //                             sku,
                            //                             upc,
                            //                             price,
                            //                             unitOfMeasure,
                            //                             unitWeight,
                            //                             netWeight,
                            //                             metrcPackage,
                            //                             createdAt,
                            //                             updatedAt,
                            //                         });
                            //                         setModalShow(true);
                            //                     }}
                            //                 >
                            //                     <IconPencil className="ltr:mr-2 rtl:ml-2" />
                            //                 </button>
                            //             </Tippy>
                            //             <Tippy content="Delete">
                            //                 <button
                            //                     type="button"
                            //                     onClick={() => {
                            //                         deleteAlert(id, name);
                            //                     }}
                            //                 >
                            //                     <IconTrashLines />
                            //                 </button>
                            //             </Tippy>
                            //         </div>
                            //     ),
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
                            setOrderId(record ? record.id || '' : '');
                            // setDeliverId(record? record.deliveryId || 0 : 0);
                            setSelectedRow(index);
                            setIsRightBarShow(true);
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
                            <button className="btn btn-outline-primary mx-2 flex items-center" onClick={() => setModalShow(true)}>
                                <TbListDetails className="mr-2" />
                                Detail
                            </button>
                        </div>
                        <div className="text-xl font-bold px-3 pt-3 text-dark dark:text-white-dark">Order #{orderId.toString()}</div>
                        <div className="flex flex-col itens-center px-3">{<OrderCard />}</div>
                        <div className="px-3">
                            <OrderItem />
                        </div>

                        {/* Items Sold */}
                        <div className="px-3 mt-2">
                            <div className="max-w-2xl mx-auto bg-white dark:bg-[#0f1727] rounded-lg shadow p-6">
                                {/* License Number Section */}
                                <div className="mb-6">
                                    <div className="text-sm text-gray-600">Patient License Number:</div>
                                    <div className="font-mono text-base">{'licenseNumber'}</div>
                                </div>

                                {/* Items Sold Section */}
                                <div>
                                    <h2 className="text-lg font-semibold mb-4">MJ Items Sold</h2>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 border-b dark:border-[#1a1e3b] pb-4">
                                                <div className="text-gray-600">{index + 1}</div>
                                                <div className="bg-gray-100 dark:bg-[#1c2942] p-2 rounded-md text-xs w-24 text-center">{'item.type'}</div>
                                                <div className="flex-1">
                                                    <div className="text-gray-800">{'item.name'}</div>
                                                </div>
                                                <div className="text-gray-600 text-right w-16">{'item.weight'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                <Dialog.Panel className="panel my-8 w-10/12 rounded-lg border-0 p-0 text-dark dark:text-white-dark">
                                    <div className="flex justify-end bg-[#fbfbfb] px-5 py-3 dark:bg-[#060817]">
                                        {/* <div className="text-lg font-bold">{'Set Package'}</div> */}
                                        <div onClick={() => setModalShow(false)} className="text-dark hover:text-dark dark:text-white-dark cursor-pointer">
                                            <IconX />
                                        </div>
                                    </div>
                                    <div className="bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                        {/* <SetPackage deliverId={deliverId} transferId={transferDataById?.transferId} status={transferDataById?.status}/> */}
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

export default HeldOrderTable;
