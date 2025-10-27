'use client';

// Import Third-Party Library
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { useAtom } from 'jotai';
import { spinnerAtom } from '@/store/spinnerStatus';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Swal from 'sweetalert2';
import Dropdown from '@/components/dropdown';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import {useRouter, useSearchParams} from 'next/navigation'

// Import Custom Component
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import PackageCard from '../etc/packageCard';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import RefreshButton from '../etc/refreshButton';
import ExportTable from '../etc/exportTable';
import {
    useAllPackagesByDispensaryIdQuery,
    useAllItemCategoriesByDispensaryIdQuery,
    useImportMetrcPackageMutation,
    usePackageQuery,
    useAllPackagesByDispensaryIdWithPagesQuery,
    useActivePackageMutation,
    useHoldPackageMutation,
    useFinishPackageMutation,
    useGetLastSyncHistoryByDispensaryIdQuery,
    useCreateSyncHistoryMutation,
    useSyncDeliveryPackagesMutation,
    useAllPendingAdjustedPackagesByDispensaryIdQuery,
    useReconcilePackageWithMetrcByAdjustIdMutation,
    useCancelReconcileMutation
} from '@/src/__generated__/operations';

import { PackageStatus } from '@/src/__generated__/operations';

// import PackageRegisterModal from '../modals/PackageRegisterModal';

// Import Icon
import { BsColumns } from 'react-icons/bs';
import { IoSearch } from 'react-icons/io5';

// Import Store
import { userDataSave } from '@/store/userData';
import * as generatedTypes from '@/src/__generated__/operations';
import { MdOutlineSync } from 'react-icons/md';
import { FaArrowRightFromBracket, FaClock } from 'react-icons/fa6';
import RightSideBarSkeletonLoading from '../etc/rightSideBarSkeletonLoading';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import PackageStatusBadge from '../etc/packageStatus';
import moment from 'moment';
import { create } from 'lodash';
import LoadingSkeleton from '../etc/loadingSkeleton';
import TableLoading from '../etc/tableLoading';
import { useDebouncedCallback } from 'use-debounce';
import { Store } from 'react-notifications-component';

type RowDataType = generatedTypes.Package;
type RowData = (RowDataType | null)[];

const MetrcReconciliationTable = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const queryClient = useQueryClient();
    const currentDate = new Date().toISOString().split('T')[0];
    const [spinnerStatus, setSpinnerStatus] = useAtom(spinnerAtom);
    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;
    // const allItemCategoriesByDispensaryId = useAllItemCategoriesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    // const itemCategories = allItemCategoriesByDispensaryId.data?.allItemCategoriesByDispensaryId;

    // const deletePackageMutation = useDeletePackageMutation();
    const allPackagesByDispensaryId = useAllPackagesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const PackageData = allPackagesByDispensaryId.data?.allPackagesByDispensaryId;

    const cancelReconcileMutation = useCancelReconcileMutation()

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const menu = useSelector((state: IRootState) => state.themeConfig.menu);
    const darkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);
    const sidebar = useSelector((state: IRootState) => state.themeConfig.sidebar)

    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    ////@ts-expect-error

    // const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(PackageData, 'name'));
    // const [recordsData, setRecordsData] = useState(initialRecords);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [packageId, setPackageId] = useState('');
    const [isAtTop, setIsAtTop] = useState(false);
    const [firstViewed, setFirstViewed] = useState(false);
    const [isRightBarShow, setIsRightBarShow] = useState(false);
    const [selectedRow, setSelectedRow] = useState(0);
    const [hide, setHide] = useState(false);
    const targetRef = useRef<HTMLTableElement | null>(null);
    const packageRowDataById = usePackageQuery({ id: packageId });
    const packageDataById = packageRowDataById.data?.package;
    const packageData = { package: packageDataById };
    const [tableClassname, setTableClassName] = useState('w-full');
    const [searchPackageStatus, setSearchPackageStatus] = useState("all")

    // for the pagination
    const [searchSelectValue, setSearchSelectValue] = useState('assignPackage.product.name');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('assignPackage.product.name');
    const [searchParam, setSearchParam] = useState('');
    const [searchPage, setSearchPage] = useState(1);

    // const allPakcageByPackagesByDispensaryIdWithPages = useAllPackagesByDispensaryIdWithPagesQuery({
    //     dispensaryId: "cm254pfz3009bvhxlzektyw8h",
    //     pageNumber: 1,
    //     onePageRecords: 10,
    //     searchField: "itemName",
    //     searchParam: ""
    //   })
    const getLastSyncHistoryByDispensaryId = useGetLastSyncHistoryByDispensaryIdQuery({ dispensaryId: dispensaryId, syncType: 'transfer' });
    const SyncHistoryData = getLastSyncHistoryByDispensaryId.data?.getLastSyncHistoryByDispensaryId;

    const allPendingAdjustedPackageData = useAllPendingAdjustedPackagesByDispensaryIdQuery({dispensaryId: dispensaryId});
    const pendingAdjustedPackageData = allPendingAdjustedPackageData.data?.allPendingAdjustedPackagesByDispensaryId

    const [hideCols, setHideCols] = useState<any>([]);

    // Mutation
    const activePackageMutation = useActivePackageMutation();
    const holdPackageMutation = useHoldPackageMutation();
    const finishPackageMutation = useFinishPackageMutation();
    const createSyncHistory = useCreateSyncHistoryMutation();
    const reconciliePackageMutation = useReconcilePackageWithMetrcByAdjustIdMutation();

    
    const updateSearchParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        router.push(`?${params.toString()}`) // or use replace() to avoid history stacking
    }

    const handleRowClick = (record: any, index: any) => {
        if (record == null) {
            return null;
        }

        console.log("record", record)
        setPackageId(record?.package?.id);
        setSelectedRow(index);
        updateSearchParams('packageId', record?.package?.id);
        setIsRightBarShow(true)

    }
    console.log("pendingAdjustedPackageData", pendingAdjustedPackageData)

    const handleSearch = () => {
        setSearchField(searchSelectValue);
        setSearchParam(searchValue.trim());
        setSearchPackageStatus(searchPackageStatus)
        setSearchPage(1);
    };
    

    const handleReconcilePackage = (id: string) => {
        Swal.fire({
            icon: 'warning',
            title: 'Reconcile Package?',
            text: 'Are you sure you would like to reconcile?',
            showCancelButton: true,
            confirmButtonText: 'Accept',
            cancelButtonText: 'Decline',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await reconciliePackageMutation.mutate(
                    {
                        input: {
                            dispensaryId: dispensaryId,
                            adjustmentId: id
                        },
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            // successAlert('Pakcage Reconcile Successfully!');
                            Store.addNotification({
                                title: "Success",
                                message: `Metrc Report Success!`,
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
                            allPendingAdjustedPackageData.refetch();
                            
                        },
                    }
                );
            }
        });

    }
    const handleCancelReconcile = (id: string) => {
        Swal.fire({
            icon: 'warning',
            title: 'Cancel Reconcile?',
            text: 'Are you going to really Cancel?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await cancelReconcileMutation.mutate(
                    {
                        id: id
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            // successAlert('Pakcage Reconcile Successfully!');
                            Store.addNotification({
                                title: "Success",
                                message: `Cancel Reconcile Success!`,
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
                            allPendingAdjustedPackageData.refetch();
                            
                        },
                    }
                );
            }
        });

    }
    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'packageLabel', title: 'Package ID' },
        { accessor: 'product.name', title: 'Product' },
        { accessor: 'package.Quantity', title: 'Metrc Qty' },
        { accessor: 'assignPackage.posQty', title: 'Current Qty' },
        // { accessor: 'supplier.name', title: 'Supplier' },
        { accessor: 'newQty', title: 'New Qty' },
        // { accessor: 'deltaQty', title: 'Difference' },
        { accessor: 'itemUnitOfMeasureName', title: 'UOF' },
        { accessor: 'Sync', title: 'Sync' },
    ];

    function calculateDaysBetweenDates(date1: string, date2: string): number {
        const startDate = new Date(date1);
        const endDate = new Date(date2);

        // Calculate the difference in milliseconds
        const differenceInMilliseconds = endDate.getTime() - startDate.getTime();

        // Convert milliseconds to days
        const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

        return differenceInDays;
    }

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

    useEffect(() => {
        if(searchParams.get('packageId')) {
            setPackageId(searchParams.get('packageId') as string);

            setIsRightBarShow(true)
        }
    }, [searchParams])

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

    useEffect(() => {
        if (isAtTop) {
            // Add your logic here based on rightBarStatus
            if (isRightBarShow === true) {
                setTableClassName(
                    `fixed top-0 z-[99]  ${menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? sidebar == true ? 'left-[0px] w-[calc(100vw-510px)]' : 'left-[280px] w-[calc(100vw-780px)]' : 'left-[90px] w-[calc(100vw-590px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            } else {
                setTableClassName(
                    `fixed top-0 z-[99] ${menu == 'horizontal' ? 'left-0 w-[calc(100vw)]' : menu == 'vertical' ? sidebar == true ? 'left-[280px] w-[calc(100vw-0px)]' : 'left-[280px] w-[calc(100vw-280px)]' : 'left-[90px] w-[calc(100vw-90px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-550px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-527px)]' : 'w-[calc(100vw-793px)]' : 'w-[calc(100vw-630px)]'} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-50px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-60px)]' : 'w-[calc(100vw-328px)]' : 'w-[calc(100vw-120px)]'} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow, sidebar, menu]);

    const handleActivePackage = async () => {
        Swal.fire({
            icon: 'warning',
            title: 'Acitve Package?',
            text: 'Are you going to really active this package?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                activePackageMutation.mutate(
                    {
                        input: {
                            id: packageDataById?.id || '',
                        },
                    },

                    {
                        onError(error) {
                            // console.log(error);
                            warnAlert('Pakcage Activation Failed');
                        },
                        onSuccess(data) {
                            successAlert('Package Activated Successfully');
                            packageRowDataById.refetch();
                        },
                    }
                );
            }
        });
    };

    const handleHoldPackage = async () => {
        Swal.fire({
            icon: 'warning',
            title: 'Hold Package?',
            text: 'Are you going to really hold this package?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await holdPackageMutation.mutate(
                    {
                        input: {
                            id: packageDataById?.id || '',
                        },
                    },
                    {
                        onError(error) {
                            // console.log(error);
                            if (error.message) {
                                warnAlert(error.message);
                            } else {
                                warnAlert('Pakcage Hold Failed');
                            }
                        },
                        onSuccess(data) {
                            successAlert('Package Hold Successfully');
                            packageRowDataById.refetch();
                        },
                    }
                );
            }
        });
    };

    const handleFinishPakcage = async () => {
        Swal.fire({
            icon: 'warning',
            title: 'Finish Package?',
            text: 'Are you going to really Finish this package?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await finishPackageMutation.mutate(
                    {
                        input: {
                            id: packageDataById?.id || '',
                        },
                    },
                    {
                        onError(error) {
                            // console.log(error);
                            if (error.message) {
                                warnAlert(error.message);
                            } else {
                                warnAlert('Pakcage Finish Failed');
                            }
                        },
                        onSuccess(data) {
                            successAlert('Package Finish Successfully');
                            packageRowDataById.refetch();
                        },
                    }
                );
            }
        });
    };

    const handleRealtimeSearch = useDebouncedCallback((param) => {
        setSearchParam(param.trim());
        setSearchField(searchSelectValue);
        setSearchPackageStatus(searchPackageStatus)
    }, 500);

    return (
        <div className={`mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center !mb-3">
                <h5 className="text-lg font-semibold dark:text-white-dark">Reconcile Packages</h5>
                <div className={`absolute lg:flex items-center gap-2 lg:ltr:ml-auto rtl:mr-auto transition-all duration-500 ${isRightBarShow ? '!right-[508px]' : 'right-7'}`}>
                    {/* <Tippy content={`Synced by ${SyncHistoryData?.user.name}`} placement="top">
                        <button className="!flex items-center btn btn-primary border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-2 py-1.5 text-sm" onClick={syncPackageData}>
                            <MdOutlineSync className="text-xl mr-1" />
                            Synced {moment(SyncHistoryData?.createdAt).fromNow()}
                        </button>
                    </Tippy> */}
                    {/* <select
                        onChange={(e) => {
                            setSearchPackageStatus(e.target.value);
                        }}
                        id="currentDispensary"
                        className="flex-initial w-32 form-select text-dark dark:text-white-dark"
                    >
                        <option value="" disabled={true}>
                            Status
                        </option>
                        <option className="text-dark dark:text-white-dark" value="all">
                            All
                        </option>
                        <option className="text-dark dark:text-white-dark" value="ACTIVE">
                            Active
                        </option>
                        <option className="text-dark dark:text-white-dark" value="HOLD">
                            Hold
                        </option>
                        <option className="text-dark dark:text-white-dark" value="FINISHED">
                            Finished
                        </option>
                    </select> */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <RefreshButton onClick={() => allPendingAdjustedPackageData.refetch()} />
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
                                    <PerfectScrollbar className="!z-[101] max-h-[calc(100vh-300px)] ">
                                        <ul className="!min-w-[240px] h-full !z-[101]">
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
                                    </PerfectScrollbar>
                                </Dropdown>
                            </div>
                        </Tippy>
                        <ExportTable cols={cols} recordsData={PackageData} hideCols={hideCols} filename='metrcReconciliation_table_data'/>
                    </div>
                    {/* <div className="text-right flex justify-start items-center">
                        <select
                            onChange={(e) => {
                                setSearchSelectValue(e.target.value);
                            }}
                            id="currentDispensary"
                            className="flex-initial w-44 form-select rounded-r-none"
                        >
                            <option value="assignPackage.product.name">Product Name</option>
                            <option value="packageLabel">Package Id</option>
                            <option value="itemName">Metrc Name</option>
                            <option value="packageId">Metrc Id</option>
                        </select>
                        <input type="text" className="form-input !rounded-none w-44" placeholder="Search..." value={searchValue} onChange={(e) => {
                            setSearchValue(e.target.value)
                            handleRealtimeSearch(e.target.value)
                            }} />
                        <button
                            onClick={handleSearch}
                            className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 py-3  font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                        >
                            <IoSearch />
                        </button>
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
            <div className="datatables w-full overflow-x-auto">
                <div className={`transition-transform duration-300`} ref={targetRef}>
                    <DataTable
                        highlightOnHover
                        className={`table-hover whitespace-nowrap data-table ${tableClassname}`}
                        records={pendingAdjustedPackageData ?? []}
                        fetching={allPendingAdjustedPackageData.isLoading || allPendingAdjustedPackageData.isFetching}
                        loaderBackgroundBlur={80}
                        customLoader={<TableLoading text="Loading Product Data..." />}
                        columns={[
                            {
                                accessor: 'index',
                                title: '#',
                                width: 40,
                                render: (record) => (pendingAdjustedPackageData ? (page - 1) * pageSize + pendingAdjustedPackageData.indexOf(record) + 1 : 0),
                            },
                            {
                                accessor: 'packageLabel',
                                title: 'Package ID',
                                sortable: true,
                                render: (record) => <div className="flex items-center">{record?.packageLabel?.slice(-10).toUpperCase()}</div>,
                                hidden: hideCols.includes('packageLabel')
                            },
                            {
                                accessor: 'package.assignPackage.product.name',
                                title: 'Product',
                                sortable: true,
                                hidden: hideCols.includes('product.name'),
                            },
                            {
                                accessor: 'package.Quantity',
                                title: 'Metrc Qty',
                                sortable: true,
                                hidden: hideCols.includes('package.Quantity'),
                            },
                            {
                                accessor: 'package.assignPackage.posQty',
                                title: 'Current Qty',
                                sortable: true,
                                hidden: hideCols.includes('assignPackage.posQty'),
                            },
                            // {
                            //     accessor: 'package.assignPackage.product.supplier.name',
                            //     title: 'Supplier',
                            //     sortable: true,
                            //     hidden: hideCols.includes('supplier.name'),
                            // },
                            {
                                accessor: 'newQty',
                                title: 'New Qty',
                                sortable: true,
                                hidden: hideCols.includes('newQty'),
                            },
                            // {
                            //     accessor: 'deltaQty',
                            //     title: 'Difference',
                            //     sortable: true,
                            //     hidden: hideCols.includes('deltaQty'),
                            // },
                            {
                                accessor: 'package.itemUnitOfMeasureName',
                                title: 'UOF',
                                sortable: true,
                                hidden: hideCols.includes('itemUnitOfMeasureName'),
                            },
                            {
                                accessor: 'Sync',
                                title: 'Action',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { id } = row;

                                    if (id === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div className='flex justify-center items-center'>
                                        <button className='btn btn-outline-primary mr-2' onClick={(e) => {
                                            e.stopPropagation();
                                            handleReconcilePackage(id)
                                        }}>Sync</button>
                                        <button className='btn btn-outline-danger' onClick={(e) => {
                                            e.stopPropagation();
                                            handleCancelReconcile(id)
                                        }}>Cancel</button>
                                    </div>;
                                },
                                hidden: hideCols.includes('Sync'),
                            },
                        ]}
                        totalRecords={pendingAdjustedPackageData?.length ?? 0}
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
                            handleRowClick(record, index)
                        }}
                    />
                </div>
                <div className={`fixed bottom-0 z-[101] transition-all duration-500 h-full right-0 bg-white ${isRightBarShow ? 'w-[500px]' : 'w-0'}`}>
                    <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                        <PerfectScrollbar>
                            <div className="py-3 px-3 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                                <button
                                    type="button"
                                    className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                    onClick={() => setIsRightBarShow(false)}
                                >
                                    <FaArrowRightFromBracket className="m-auto text-2xl" />
                                </button>
                            </div>
                            {(packageRowDataById.isLoading || packageRowDataById.isFetching) ?
                            <LoadingSkeleton/>
                            : <div className="flex flex-col items-center px-3">
                                <div className="w-full text-xl font-semibold text-dark dark:text-white-dark py-2 text-left">Package Details</div>
                                {/* <Suspense fallback={<RightSideBarSkeletonLoading/>}> */}
                                    <PackageCard packageData={packageDataById} isLoading={packageRowDataById.isLoading || packageRowDataById.isFetching} handleActivePackage={handleActivePackage}  handleHoldPackage={handleHoldPackage} handleFinishPakcage={handleFinishPakcage}/>
                                {/* </Suspense> */}
                            </div>}
                        </PerfectScrollbar>
                    </div>
                </div>
            </div>
        </div>
    );
};

function DetailItem({ label, value }: { label: string | null; value: string | number | null | undefined }) {
    return (
        <div className="flex justify-start">
            <span className="text-sm !font-varela_Round font-semibold text-dark dark:text-white-dark w-1/2">{label}</span>
            <span className="text-sm text-left">{value}</span>
        </div>
    );
}

export default MetrcReconciliationTable;
