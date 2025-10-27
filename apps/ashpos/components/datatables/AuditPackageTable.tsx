'use client';

// Import Third-Party Library
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, useRef, Fragment } from 'react';
import { Transition, Dialog } from '@headlessui/react';

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
import { useRouter, useSearchParams } from 'next/navigation';

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
    useFetchTestResultsByPackageIdMutation,
    useAuditDiscrepancyPackagesQuery,
    useAdjustPackageMutation,
    useMetrcAdjustmentReasonsByDispensaryIdQuery,
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
import { log } from 'console';
import { GrDocumentTest } from 'react-icons/gr';

import { syncStatusAtom } from '@/store/syncStatusAtom';
// import { spinnerAtom } from '@/store/spinnerStatus';
import { PRINTLIMIT, quantityAbbreviations } from '@/utils/variables';
import TableExport from '../etc/DataTableExport';
import { truncateToTwoDecimals } from '@/lib/utils';
import { RxCross1 } from 'react-icons/rx';
import { FaBarcode, FaChevronDown } from 'react-icons/fa';

import { Store } from 'react-notifications-component';
import IconTrashLines from '../icon/icon-trash-lines';

type RowDataType = generatedTypes.Package;
type RowData = (RowDataType | null)[];

const AuditPackageTable = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);

    const queryClient = useQueryClient();
    const currentDate = new Date().toISOString().split('T')[0];
    const [spinnerStatus, setSpinnerStatus] = useAtom(spinnerAtom);
    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;
    const [adjustPackageModal, setAdjustPackageModal] = useState(false);

    // For adjust package
    const [adjustmentNote, setAdjustmentNote] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [isReport, setIsReport] = useState(false);
    const [newQty, setNewQty] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [totalTerpenes, setTotalTerpenes] = useState('');

    const { data: adjustmentReasonsData, isLoading: adjustmentReasonsLoading } = useMetrcAdjustmentReasonsByDispensaryIdQuery({
        dispensaryId: dispensaryId,
    });
    const adjustPackageMutation = useAdjustPackageMutation();

    // const allItemCategoriesByDispensaryId = useAllItemCategoriesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    // const itemCategories = allItemCategoriesByDispensaryId.data?.allItemCategoriesByDispensaryId;

    // const deletePackageMutation = useDeletePackageMutation();
    const allPackagesByDispensaryId = useAllPackagesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const PackageData = allPackagesByDispensaryId.data?.allPackagesByDispensaryId;

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const menu = useSelector((state: IRootState) => state.themeConfig.menu);
    const darkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);
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
    const [searchPackageStatus, setSearchPackageStatus] = useState('all');
    const [assignedStatus, setAssignedStatus] = useState('');

    // for the pagination
    const [searchSelectValue, setSearchSelectValue] = useState('assignPackage.product.name');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('assignPackage.product.name');
    const [searchParam, setSearchParam] = useState('');
    const [searchPage, setSearchPage] = useState(1);

    const allPakcageByPackagesByDispensaryIdWithPages = useAuditDiscrepancyPackagesQuery({
        dispensaryId: dispensaryId,
        pageNumber: searchPage,
        onePageRecords: pageSize,
        searchField: searchField,
        searchParam: searchParam,
        sortField: sortStatus.columnAccessor,
        sortDirection: sortStatus.direction,
        packageStatus: searchPackageStatus,
        assignedStatus: assignedStatus,
    });

    const query = `
            query AllPackagesByDispensaryIdWithPages($dispensaryId: String!, $packageStatus: String!, $assignedStatus: String!, $pageNumber: Int!, $onePageRecords: Int!, $searchField: String!, $searchParam: String!, $sortField: String, $sortDirection: String) {
            allPackagesByDispensaryIdWithPages(dispensaryId: $dispensaryId, packageStatus: $packageStatus, assignedStatus: $assignedStatus, pageNumber: $pageNumber, onePageRecords: $onePageRecords, searchField: $searchField, searchParam: $searchParam, sortField: $sortField, sortDirection: $sortDirection) {
                packages{
                    packageStatus
                    productId
                    product {
                    name
                    itemCategory {
                        name
                        color
                    }
                }
                assignPackage {
                cost
                product {
                    name
                }
                posQty
                }
                originalQty
                cost
                ExpirationDate
                FinishedDate
                IsFinished
                IsOnHold
                ItemFromFacilityLicenseNumber
                ItemFromFacilityName
                packageLabel
                LastModified
                Note
                PackageType
                PackagedDate
                Quantity
                ReceivedDateTime
                ReceivedFromFacilityLicenseNumber
                ReceivedFromFacilityName
                UnitOfMeasureAbbreviation
                UnitOfMeasureName
                createdAt
                dispensaryId
                id
                itemId
                itemItemBrandId
                itemItemBrandName
                itemName
                itemProductCategoryName
                itemProductCategoryType
                itemQuantityType
                itemUnitOfMeasureName
                itemUnitQuantity
                itemUnitQuantityUnitOfMeasureName
                itemUnitVolume
                itemUnitVolumeUnitOfMeasureName
                itemUnitWeight
                itemUnitWeightUnitOfMeasureName
                packageId
                updatedAt
            
                },
                totalCount
            }
            }
            `;

    // const allPackagePrintData = useAllPackagesByDispensaryIdWithPagesQuery({
    //     dispensaryId: dispensaryId,
    //     pageNumber: 1,
    //     onePageRecords: PRINTLIMIT,
    //     searchField: searchField,
    //     searchParam: searchParam,
    //     sortField: sortStatus.columnAccessor,
    //     sortDirection: sortStatus.direction,
    //     packageStatus: searchPackageStatus,
    //     assignedStatus: assignedStatus
    // });

    // const packagePrintData = allPackagePrintData.data?.allPackagesByDispensaryIdWithPages?.packages ?? [];
    // console.log("packagePrintData", packagePrintData);

    const packageData1 = allPakcageByPackagesByDispensaryIdWithPages.data?.auditDiscrepancyPackages?.packages ?? [];
    const totalCount = allPakcageByPackagesByDispensaryIdWithPages.data?.auditDiscrepancyPackages?.totalCount;
    const getLastSyncHistoryByDispensaryId = useGetLastSyncHistoryByDispensaryIdQuery({ dispensaryId: dispensaryId, syncType: 'transfer' });
    const SyncHistoryData = getLastSyncHistoryByDispensaryId.data?.getLastSyncHistoryByDispensaryId;

    const [hideCols, setHideCols] = useState<any>(['ItemFromFacilityLicenseNumber', 'IsOnRetailerDelivery', 'IsFinished', 'IsOnHold', 'IsOnRetailerDelivery', 'ItemFromFacilityName', 'LocationId']);

    // console.log("packageData1", packageData1);

    // Mutation
    const activePackageMutation = useActivePackageMutation();
    const holdPackageMutation = useHoldPackageMutation();
    const finishPackageMutation = useFinishPackageMutation();
    const createSyncHistory = useCreateSyncHistoryMutation();
    const fetchTestMutation = useFetchTestResultsByPackageIdMutation();

    useEffect(() => {
        if (syncStatus) {
            allPakcageByPackagesByDispensaryIdWithPages.refetch();
            packageRowDataById.refetch();
        }
    }, [syncStatus]);

    useEffect(() => {
        setSearchPage(page);
    }, [page]);

    const updateSearchParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${params.toString()}`); // or use replace() to avoid history stacking
    };

    const handleRowClick = (record: any, index: any) => {
        if (record == null) {
            return null;
        }
        setPackageId(record.id);
        setSelectedRow(index);
        updateSearchParams('packageId', record.id);
    };

    const handleSearch = () => {
        setSearchField(searchSelectValue);
        setSearchParam(searchValue.trim());
        setSearchPackageStatus(searchPackageStatus);
        setSearchPage(1);
    };

    const handleFetchTestResult = async () => {
        // console.log("packageId", packageId)
        setSpinnerStatus({
            isLoading: true,
            text: 'Fetching Test Result...',
        });
        await fetchTestMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    packageId: packageDataById?.packageId || 0,
                },
            },

            {
                onError(error) {
                    // console.log(error);
                    warnAlert('Fetching Test Data failed');
                    setSpinnerStatus({});
                },
                onSuccess(data) {
                    successAlert('Fetching Test Data Successfully');
                    // allPakcageByPackagesByDispensaryIdWithPages.refetch();
                    packageRowDataById.refetch();
                    setSpinnerStatus({});
                },
            }
        );
    };
    // const syncPackageData = async () => {
    //     setSpinnerStatus({
    //         isLoading: true,
    //         text: 'Package Data synchronizing...',
    //     });
    //     await importPackageMutation.mutate(
    //         {
    //             input: {
    //                 dispensaryId: dispensaryId,
    //             },
    //         },
    //         {
    //             onError(error) {
    //                 setSpinnerStatus({});
    //                 warnAlert('Package Synchronization Failed');
    //             },
    //             async onSuccess(data) {
    //                 // else warnAlert('Synchronization failed');
    //                 await syncDeliveryPackages.mutate(
    //                     {
    //                         input: {
    //                             dispensaryId: dispensaryId,
    //                         },
    //                     },
    //                     {
    //                         onError(error) {
    //                             setSpinnerStatus({});
    //                             warnAlert('Delivery Synchronization Failed');
    //                         },
    //                         onSuccess(data) {
    //                         },
    //                         onSettled() {
    //                             // setIsSaveButtonDisabled(false);
    //                         },
    //                     }
    //                 );

    //                 await createSyncHistory.mutate(
    //                     {
    //                         input: {
    //                             dispensaryId: dispensaryId,
    //                             syncType: 'transfer',
    //                             userId: userId
    //                         }
    //                     },
    //                     {
    //                         onError(error) {
    //                             // warnAlert('Create Sync History failed');
    //                         },
    //                         onSuccess(data) {
    //                             // successAlert('Create Sync History Successfully');
    //                             getLastSyncHistoryByDispensaryId.refetch();

    //                         },
    //                         onSettled() {
    //                             // setIsSaveButtonDisabled(false);
    //                         },
    //                     }
    //                 );
    //                 setSpinnerStatus({});
    //                 if (data.importMetrcPackage?.count || data.importMetrcPackage?.count == 0 ? data.importMetrcPackage?.count >= 0 : false)
    //                     successAlert(data.importMetrcPackage?.count + ' Packages added');

    //             },
    //             onSettled() {
    //                 // setIsSaveButtonDisabled(false);
    //             },
    //         }
    //     );
    // };
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
        { accessor: 'packageId', title: 'Metrc ID' },
        { accessor: 'packageLabel', title: 'Package ID' },
        { accessor: 'assignPackage.product.name', title: 'Product' },
        { accessor: 'packageStatus', title: 'Status' },
        { accessor: 'itemName', title: 'Metrc Name' },
        { accessor: 'packageId', title: 'Metrc Tag' },
        { accessor: 'originalQty', title: 'Original Qty' },
        { accessor: 'Quantity', title: 'Metrc Qty' },
        { accessor: 'assignPackage.posQty', title: 'Current Qty' },
        // { accessor: 'itemUnitWeight', title: 'Metrc Unit Weight' },
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
        if (searchParams.get('packageId')) {
            setPackageId(searchParams.get('packageId') as string);

            setIsRightBarShow(true);
        }
    }, [searchParams]);

    // useEffect(() => {
    //     allPakcageByPackagesByDispensaryIdWithPages.refetch()
    // }, [sortStatus])

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
                    `fixed top-0  ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? 'left-[280px] w-[calc(100vw-780px)]' : 'left-[90px] w-[calc(100vw-590px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            } else {
                setTableClassName(
                    `fixed top-0 ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw)]' : menu == 'vertical' ? 'left-[280px] w-[calc(100vw-280px)]' : 'left-[90px] w-[calc(100vw-90px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-550px)]' : menu == 'vertical' ? 'w-[calc(100vw-793px)]' : 'w-[calc(100vw-630px)]'} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-50px)]' : menu == 'vertical' ? 'w-[calc(100vw-328px)]' : 'w-[calc(100vw-120px)]'} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow]);

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
                            allPakcageByPackagesByDispensaryIdWithPages.refetch();
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
                            allPakcageByPackagesByDispensaryIdWithPages.refetch();
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
                            allPakcageByPackagesByDispensaryIdWithPages.refetch();
                            packageRowDataById.refetch();
                        },
                    }
                );
            }
        });
    };

    const handleOnAdjustPackage = () => {
        allPakcageByPackagesByDispensaryIdWithPages.refetch();
        packageRowDataById.refetch();
    };

    const handleRealtimeSearch = useDebouncedCallback((param) => {
        setSearchParam(param.trim());
        setSearchField(searchSelectValue);
        setSearchPackageStatus(searchPackageStatus);
        setSearchPage(1);
    }, 500);

    const handleAjustPackage = async () => {
        if (newQty < 0 || adjustmentNote == '' || adjustmentReason == '') return;
        setAdjustPackageModal(false);
        Swal.fire({
            icon: 'warning',
            title: 'Adjust Package?',
            text: 'Are you going to really adjust?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await adjustPackageMutation.mutate(
                    {
                        input: {
                            dispensaryId: dispensaryId,
                            newQty: newQty,
                            notes: adjustmentNote,
                            packageLabel: packageDataById?.packageLabel || '',
                            reason: adjustmentReason,
                            deltaQty: newQty - (packageDataById?.assignPackage?.posQty || 0),
                            needMetrcSync: isReport,
                        },
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            // successAlert('Package Adjustment successful.');
                            Store.addNotification({
                                title: 'Success',
                                message: packageDataById?.id
                                    ? 'Package stock adjustment was successful. Please go to Metrc Reconciliation page then sync with Metrc.'
                                    : `Package stock adjustment was successful.`,
                                type: 'success',
                                insert: 'bottom',
                                container: 'bottom-left',
                                animationIn: ['animate__animated', 'animate__fadeIn'],
                                animationOut: ['animate__animated', 'animate__fadeOut'],
                                dismiss: {
                                    duration: 4000,
                                    onScreen: true,
                                },
                            });
                        },
                    }
                );
            }
        });
    };

    return (
        <div className={`mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center !mb-3">
                <h5 className="text-lg font-semibold dark:text-white-dark">Audit Packages</h5>
                <div className={`absolute lg:flex items-center gap-2 lg:ltr:ml-auto rtl:mr-auto transition-all duration-500 ${isRightBarShow ? '!right-[508px]' : 'right-7'}`}>
                    {/* <Tippy content={`Synced by ${SyncHistoryData?.user.name}`} placement="top">
                        <button className="!flex items-center btn btn-primary border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-2 py-1.5 text-sm" onClick={syncPackageData}>
                            <MdOutlineSync className="text-xl mr-1" />
                            Synced {moment(SyncHistoryData?.createdAt).fromNow()}
                        </button>
                    </Tippy> */}
                    {/* Status:
                    <select
                        onChange={(e) => {
                            setSearchPage(1)
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
                    {/* <select
                        onChange={(e) => {
                            setSearchPage(1)
                            setAssignedStatus(e.target.value);
                        }}
                        id="assignedStatus"
                        className="flex-initial w-32 form-select text-dark dark:text-white-dark ml-2"
                    >
                        <option value="" disabled={true}>
                            Assigned Status
                        </option>
                        <option className="text-dark dark:text-white-dark" value="">
                            All
                        </option>
                        <option className="text-dark dark:text-white-dark" value="complete">
                            Complete
                        </option>
                        <option className="text-dark dark:text-white-dark" value="incomplete">
                            Incomplete
                        </option>
                    </select> */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <RefreshButton onClick={() => allPakcageByPackagesByDispensaryIdWithPages.refetch()} />
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
                                    <PerfectScrollbar className="!z-[101] max-h-[calc(100vh-300px)]">
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
                        <TableExport
                            cols={cols}
                            hideCols={hideCols}
                            filename="package"
                            query={query}
                            variables={{
                                dispensaryId: dispensaryId,
                                pageNumber: searchPage,
                                onePageRecords: PRINTLIMIT,
                                searchField: searchField,
                                searchParam: searchParam,
                                sortField: sortStatus.columnAccessor,
                                sortDirection: sortStatus.direction,
                                packageStatus: searchPackageStatus,
                                assignedStatus: assignedStatus,
                            }}
                        />
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
                            <option value="assignPackage.product.name">Product Name</option>
                            <option value="packageLabel">Package Id</option>
                            <option value="itemName">Metrc Name</option>
                            <option value="packageId">Metrc Id</option>
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
                    </div>

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
                        records={packageData1 ?? []}
                        fetching={allPakcageByPackagesByDispensaryIdWithPages.isLoading || allPakcageByPackagesByDispensaryIdWithPages.isFetching}
                        loaderBackgroundBlur={80}
                        customLoader={<TableLoading text="Loading Product Data..." />}
                        columns={[
                            {
                                accessor: 'index',
                                title: '#',
                                width: 40,
                                render: (record) => (packageData1 ? (page - 1) * pageSize + packageData1.indexOf(record) + 1 : 0),
                            },
                            {
                                accessor: 'packageLabel',
                                title: 'Package ID',
                                sortable: true,
                                render: (record) => <div className="flex items-center">{record?.packageLabel?.slice(-10).toUpperCase()}</div>,
                            },
                            {
                                accessor: 'assignPackage.product.name',
                                title: 'Product',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { assignPackage } = row;
                                    if (assignPackage === null) {
                                        return <span className="badge text-warning bg-warning-light dark:bg-warning-dark">Incomplete</span>; // Handle null case if necessary
                                    }
                                    return <div>{assignPackage?.product?.name}</div>;
                                },
                            },
                            {
                                accessor: 'packageStatus',
                                title: 'Status',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { packageStatus } = row;

                                    if (packageStatus === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <PackageStatusBadge packageStatus={packageStatus} />;
                                },
                                hidden: hideCols.includes('status'),
                            },
                            {
                                accessor: 'itemName',
                                title: 'Metrc Name',
                                sortable: true,
                                hidden: hideCols.includes('itemName'),
                            },
                            {
                                accessor: 'SourcePackageLabels',
                                title: 'Metrc Tag',
                                sortable: true,
                                hidden: hideCols.includes('itemName'),
                            },
                            {
                                accessor: 'originalQty',
                                title: 'Original Qty',
                                sortable: true,
                                hidden: hideCols.includes('originalQty'),
                            },
                            {
                                accessor: 'Quantity',
                                title: 'Metrc Qty',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { Quantity, UnitOfMeasureAbbreviation } = row;

                                    if (Quantity === null || UnitOfMeasureAbbreviation === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return (
                                        <div>
                                            {Quantity} {UnitOfMeasureAbbreviation === 'g' ? 'g' : 'Items'}
                                        </div>
                                    );
                                },
                                hidden: hideCols.includes('Quantity'),
                            },
                            {
                                accessor: 'assignPackage.posQty',
                                title: 'Current Qty',
                                sortable: true,
                                hidden: hideCols.includes('currentQty'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { assignPackage } = row;

                                    if (assignPackage?.posQty) {
                                        return <div>{truncateToTwoDecimals(assignPackage?.posQty)}</div>;
                                    }
                                },
                            },
                            // {
                            //     accessor: 'itemProductCategoryName',
                            //     title: 'Metrc Category Name',
                            //     sortable: true,
                            //     hidden: hideCols.includes('itemProductCategoryName'),
                            // },
                            // {
                            //     accessor: 'itemProductCategoryType',
                            //     title: 'Metrc Category Type',
                            //     sortable: true,
                            //     hidden: hideCols.includes('itemProductCategoryType'),
                            // },
                            // {
                            //     accessor: 'itemStrainName',
                            //     title: 'Metrc Strain Name',
                            //     sortable: true,
                            //     hidden: hideCols.includes('itemStrainName'),
                            // },
                            // {
                            //     accessor: 'packageId',
                            //     title: 'Metrc ID',
                            //     sortable: true,
                            //     hidden: hideCols.includes('packageId'),
                            // },
                            // {
                            //     accessor: 'LastModified',
                            //     title: 'Last Modified At',
                            //     sortable: true,
                            //     hidden: hideCols.includes('LastModified'),
                            //     render: (row) => {
                            //         if (!row) {
                            //             return null; // Handle the null case as needed
                            //         }
                            //         const { LastModified } = row;

                            //         if (LastModified === null) {
                            //             return null; // Handle null case if necessary
                            //         }
                            //         return <div>{convertPSTTimestampToTimezone(LastModified, userData.storeTimeZone)}</div>;
                            //     },
                            // },
                            // {
                            //     accessor: 'ArchivedDate',
                            //     title: 'Archived Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('ArchivedDate'),
                            // },
                            // {
                            //     accessor: 'ContainsRemediatedProduct',
                            //     title: 'Contains Remediated Product',
                            //     sortable: true,
                            //     hidden: hideCols.includes('ContainsRemediatedProduct'),
                            // },
                            // {
                            //     accessor: 'itemUnitWeight',
                            //     title: 'Metrc Unit Weight',
                            //     sortable: true,
                            //     render: (row) => {
                            //         if (!row) {
                            //             return null; // Handle the null case as needed
                            //         }
                            //         const { itemUnitWeight, itemUnitWeightUnitOfMeasureName } = row;

                            //         if (itemUnitWeight === null || itemUnitWeightUnitOfMeasureName === null) {
                            //             return null; // Handle null case if necessary
                            //         }
                            //         return (
                            //             <div>
                            //                 {itemUnitWeight} {itemUnitWeightUnitOfMeasureName}
                            //             </div>
                            //         );
                            //     },
                            //     hidden: hideCols.includes('itemUnitWeight'),
                            // },
                            // {
                            //     accessor: 'updatedAt',
                            //     title: 'Synced At',
                            //     titleClassName: 'text-red-500',
                            //     sortable: true,
                            //     render: (row) => {
                            //         if (!row) {
                            //             return null; // Handle the null case as needed
                            //         }
                            //         const { createdAt } = row;

                            //         if (createdAt === null) {
                            //             return null; // Handle null case if necessary
                            //         }
                            //         return convertPSTTimestampToTimezone(createdAt, userData.storeTimeZone);
                            //     },
                            //     hidden: hideCols.includes('updatedAt'),
                            // },
                            // {
                            //     accessor: 'ReceivedFromFacilityName',
                            //     title: 'Supplier',
                            //     sortable: true,
                            //     hidden: hideCols.includes('ReceivedFromFacilityName'),
                            // },
                            // {
                            //     accessor: 'ReceivedFromFacilityLicenseNumber',
                            //     title: 'Supplier License',
                            //     sortable: true,
                            //     hidden: hideCols.includes('ReceivedFromFacilityLicenseNumber'),
                            // },
                            // {
                            //     accessor: 'UnitOfMeasureName',
                            //     title: 'Metrc UOM',
                            //     sortable: true,
                            //     hidden: hideCols.includes('UnitOfMeasureName'),
                            // },
                            // {
                            //     accessor: 'ExpirationDate',
                            //     title: 'Expiration Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('ExpirationDate'),
                            // },
                            // {
                            //     accessor: 'FinishedDate',
                            //     title: 'Finished Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('FinishedDate'),
                            // },
                            // {
                            //     accessor: 'InitialLabTestingState',
                            //     title: 'Initial Lab Testing State',
                            //     sortable: true,
                            //     hidden: hideCols.includes('InitialLabTestingState'),
                            // },
                            // {
                            //     accessor: 'IsDonation',
                            //     title: 'Is Donation',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsDonation'),
                            // },
                            // {
                            //     accessor: 'IsDonationPersistent',
                            //     title: 'Is Donation Persistent',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsDonationPersistent'),
                            // },
                            // {
                            //     accessor: 'IsFinished',
                            //     title: 'Is Finished',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsFinished'),
                            // },
                            // {
                            //     accessor: 'IsOnHold',
                            //     title: 'Is On Hold',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsOnHold'),
                            // },
                            // {
                            //     accessor: 'IsOnRetailerDelivery',
                            //     title: 'Is On Retailer Delivery',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsOnRetailerDelivery'),
                            // },
                            // {
                            //     accessor: 'IsOnTrip',
                            //     title: 'Is On Trip',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsOnTrip'),
                            // },
                            // {
                            //     accessor: 'IsProcessValidationTestingSample',
                            //     title: 'Is Process Validation Testing Sample',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsProcessValidationTestingSample'),
                            // },
                            // {
                            //     accessor: 'IsProductionBatch',
                            //     title: 'Is Production Batch',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsProductionBatch'),
                            // },
                            // {
                            //     accessor: 'IsTestingSample',
                            //     title: 'Is Testing Sample',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsTestingSample'),
                            // },
                            // {
                            //     accessor: 'IsTradeSample',
                            //     title: 'Is Trade Sample',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsTradeSample'),
                            // },
                            // {
                            //     accessor: 'IsTradeSamplePersistent',
                            //     title: 'Is Trade Sample Persistent',
                            //     sortable: true,
                            //     hidden: hideCols.includes('IsTradeSamplePersistent'),
                            // },
                            // {
                            //     accessor: 'LabTestResultExpirationDateTime',
                            //     title: 'Lab Test Result Expiration DateTime',
                            //     sortable: true,
                            //     hidden: hideCols.includes('LabTestResultExpirationDateTime'),
                            // },
                            // {
                            //     accessor: 'LabTestingPerformedDate',
                            //     title: 'Lab Testing Performed Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('LabTestingPerformedDate'),
                            // },
                            // {
                            //     accessor: 'LabTestingRecordedDate',
                            //     title: 'Lab Testing Recorded Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('LabTestingRecordedDate'),
                            // },
                            // {
                            //     accessor: 'LabTestingState',
                            //     title: 'Lab Testing State',
                            //     sortable: true,
                            //     hidden: hideCols.includes('LabTestingState'),
                            // },
                            // {
                            //     accessor: 'LabTestingStateDate',
                            //     title: 'Lab Testing State Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('LabTestingStateDate'),
                            // },
                            // {
                            //     accessor: 'LocationId',
                            //     title: 'Location ID',
                            //     sortable: true,
                            //     hidden: hideCols.includes('LocationId'),
                            // },
                            // {
                            //     accessor: 'LocationName',
                            //     title: 'Metrc Location',
                            //     sortable: true,
                            //     hidden: hideCols.includes('LocationName'),
                            // },
                            // {
                            //     accessor: 'LocationTypeName',
                            //     title: 'Location Type Name',
                            //     sortable: true,
                            //     hidden: hideCols.includes('LocationTypeName'),
                            // },
                            // {
                            //     accessor: 'Note',
                            //     title: 'Note',
                            //     sortable: true,
                            //     hidden: hideCols.includes('Note'),
                            // },
                            // {
                            //     accessor: 'PackageForProductDestruction',
                            //     title: 'Package For Product Destruction',
                            //     sortable: true,
                            //     hidden: hideCols.includes('PackageForProductDestruction'),
                            // },
                            // {
                            //     accessor: 'PackageType',
                            //     title: 'Package Type',
                            //     sortable: true,
                            //     hidden: hideCols.includes('PackageType'),
                            // },
                            // {
                            //     accessor: 'PackagedDate',
                            //     title: 'Packaged Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('PackagedDate'),
                            // },
                            // {
                            //     accessor: 'PatientLicenseNumber',
                            //     title: 'Patient License Number',
                            //     sortable: true,
                            //     hidden: hideCols.includes('PatientLicenseNumber'),
                            // },
                            // {
                            //     accessor: 'ProductRequiresRemediation',
                            //     title: 'Product Requires Remediation',
                            //     sortable: true,
                            //     hidden: hideCols.includes('ProductRequiresRemediation'),
                            // },
                            // {
                            //     accessor: 'ProductionBatchNumber',
                            //     title: 'Production Batch Number',
                            //     sortable: true,
                            //     hidden: hideCols.includes('ProductionBatchNumber'),
                            // },
                            // {
                            //     accessor: 'ReceivedDateTime',
                            //     title: 'Received Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('ReceivedDateTime'),
                            //     render: (row) => {
                            //         if (!row) {
                            //             return null; // Handle the null case as needed
                            //         }
                            //         const { ReceivedDateTime } = row;

                            //         if (ReceivedDateTime === null) {
                            //             return null; // Handle null case if necessary
                            //         }
                            //         return <div>{convertPSTTimestampToTimezone(ReceivedDateTime, userData.storeTimeZone)}</div>;
                            //     },
                            // },
                            // {
                            //     accessor: 'ReceivedFromManifestNumber',
                            //     title: 'Received From Manifest Number',
                            //     sortable: true,
                            //     hidden: hideCols.includes('ReceivedFromManifestNumber'),
                            // },
                            // {
                            //     accessor: 'RemediationDate',
                            //     title: 'Remediation Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('RemediationDate'),
                            // },
                            // {
                            //     accessor: 'RetailIdQrCount',
                            //     title: 'Retail ID QR Count',
                            //     sortable: true,
                            //     hidden: hideCols.includes('RetailIdQrCount'),
                            // },
                            // {
                            //     accessor: 'SellByDate',
                            //     title: 'Sell By Date',
                            //     sortable: true,
                            //     hidden: hideCols.includes('SellByDate'),
                            // },
                            // {
                            //     accessor: 'SourceHarvestCount',
                            //     title: 'Source Harvest Count',
                            //     sortable: true,
                            //     hidden: hideCols.includes('SourceHarvestCount'),
                            // },
                            // {
                            //     accessor: 'SourceHarvestNames',
                            //     title: 'Source Harvest Names',
                            //     sortable: true,
                            //     hidden: hideCols.includes('SourceHarvestNames'),
                            // },
                            // {
                            //     accessor: 'SourcePackageCount',
                            //     title: 'Source Package Count',
                            //     sortable: true,
                            //     hidden: hideCols.includes('SourcePackageCount'),
                            // },
                            // {
                            //     accessor: 'SourcePackageIsDonation',
                            //     title: 'Source Package Is Donation',
                            //     sortable: true,
                            //     hidden: hideCols.includes('SourcePackageIsDonation'),
                            // },
                            // {
                            //     accessor: 'SourcePackageIsTradeSample',
                            //     title: 'Source Package Is Trade Sample',
                            //     sortable: true,
                            //     hidden: hideCols.includes('SourcePackageIsTradeSample'),
                            // },
                            // {
                            //     accessor: 'SourcePackageLabels',
                            //     title: 'Source Package Labels',
                            //     sortable: true,
                            //     hidden: hideCols.includes('SourcePackageLabels'),
                            // },
                            // {
                            //     accessor: 'SourceProcessingJobCount',
                            //     title: 'Source Processing Job Count',
                            //     sortable: true,
                            //     hidden: hideCols.includes('SourceProcessingJobCount'),
                            // },
                            // {
                            //     accessor: 'SourceProductionBatchNumbers',
                            //     title: 'Source Production Batch Numbers',
                            //     sortable: true,
                            //     hidden: hideCols.includes('SourceProductionBatchNumbers'),
                            // },
                            {
                                accessor: 'action',
                                title: 'Action',
                                sortable: false,
                                render: (record) => (
                                    <div>
                                        {/* <Tippy content="Edit">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setModalMode('update');
                                                    setCurrentPackage({
                                                        id,
                                                        dispensaryId,
                                                        supplierId,
                                                        userId,
                                                        itemCategoryId,
                                                        name,
                                                        sku,
                                                        upc,
                                                        price,
                                                        unitOfMeasure,
                                                        unitWeight,
                                                        netWeight,
                                                        metrcPackage,
                                                        createdAt,
                                                        updatedAt,
                                                    });
                                                    setModalShow(true);
                                                }}
                                            >
                                                <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                            </button>
                                        </Tippy> */}
                                        {/* <Tippy content="Adjust"> */}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                                setPackageId(record?.id || '');
                                                setAdjustPackageModal(true);
                                            }}
                                        >
                                            Adjust
                                        </button>
                                        {/* </Tippy> */}
                                    </div>
                                ),
                            },
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
                            // setTransferId(record.id || '')
                            // setDeliverId(record.deliveryId || 0)
                            handleRowClick(record, index);
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
                            {packageRowDataById.isLoading || packageRowDataById.isFetching ? (
                                <LoadingSkeleton />
                            ) : (
                                <div className="flex flex-col items-center px-3">
                                    <div className="w-full flex justify-between items-center">
                                        <div className="w-full text-xl font-semibold text-dark dark:text-white-dark py-2 text-left">Package Details</div>
                                    </div>
                                    {/* <Suspense fallback={<RightSideBarSkeletonLoading/>}> */}
                                    <PackageCard
                                        packageLabel={packageId}
                                        packageData={packageDataById}
                                        isLoading={packageRowDataById.isLoading || packageRowDataById.isFetching}
                                        handleActivePackage={handleActivePackage}
                                        handleHoldPackage={handleHoldPackage}
                                        handleFinishPakcage={handleFinishPakcage}
                                        onAdjustPackage={handleOnAdjustPackage}
                                        handleFetchTestResult={handleFetchTestResult}
                                    />
                                    {/* </Suspense> */}
                                </div>
                            )}
                        </PerfectScrollbar>
                    </div>
                </div>
                <Transition appear show={adjustPackageModal} as={Fragment}>
                    <Dialog as="div" open={adjustPackageModal} onClose={() => setAdjustPackageModal(true)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0" />
                        </Transition.Child>
                        <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                            <div className="flex items-start justify-center min-h-screen px-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel as="div" className="panel my-8 w-1/2 absolute m rounded-lg border-0 px-5 py-3 text-black dark:text-white-dark">
                                        <div className="flex items-center justify-between px-4 py-2">
                                            <div className="flex items-center text-lg font-bold">
                                                {/* <FaCashRegister className="mr-3 text-dark dark:text-white-dark" /> */}
                                                Add New Adjustment
                                            </div>
                                            <button type="button" className="text-dark hover:text-dark dark:text-white-dark" onClick={() => setAdjustPackageModal(false)}>
                                                <RxCross1 />
                                            </button>
                                        </div>
                                        <div className="max-w-3xl mx-auto p-6 shadow-sm rounded-lg mt-3 border-[0px] dark:border-[#1b2e4b] text-dark dark:text-white-dark">
                                            {/* Product Info  */}
                                            <div className="flex flex-col mb-4">
                                                <div>
                                                    <span className="font-medium">Product:</span>
                                                    <span className="ml-2">{packageDataById?.assignPackage?.product?.name} </span>
                                                    <div className="flex justify-start items-center">
                                                        <FaBarcode className="mr-1" />
                                                        {packageDataById?.packageLabel?.slice(-10).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Current Qty:</span>
                                                    <span className="ml-2">5 Items</span>
                                                </div>
                                            </div>

                                            {/* <!-- Divider --> */}
                                            <div className="border-t border-gray-200 dark:border-[#1b2e4b] my-4"></div>

                                            {/* <!-- Table Header --> */}
                                            <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-200 dark:border-[#1b2e4b] text-dark dark:text-white-dark">
                                                {/* <div className="font-medium">Storage Location</div> */}
                                                <div className="font-bold">Expected Quantity</div>
                                                <div className="font-bold">New Quantity</div>
                                            </div>

                                            {/* <!-- Table Row --> */}
                                            <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-200 dark:border-[#1b2e4b] text-dark dark:text-white-dark">
                                                {/* <div className="">(No Location)</div> */}
                                                <div className="">{packageDataById?.assignPackage?.posQty + ' ' + (packageDataById?.UnitOfMeasureName || 'items')}</div>
                                                <div className={`flex ${submitted && newQty < 0 ? 'has-error' : ''}`}>
                                                    <span className="text-red-500 mr-2">*</span>
                                                    <input
                                                        type={`${packageDataById?.UnitOfMeasureName == 'Each' ? 'text' : 'number'}`}
                                                        placeholder="Recipient's username"
                                                        className="form-input no-spinner ltr:rounded-r-none rtl:rounded-l-none"
                                                        value={newQty}
                                                        onChange={(e) => setNewQty(Number(e.target.value))}
                                                    />
                                                    <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                        {packageDataById?.UnitOfMeasureName}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Form Fields --> */}
                                            <div className="mt-6 space-y-4">
                                                <div className="flex items-center">
                                                    <label className="w-56 text-right pr-4 font-medium">
                                                        Adjustment Reasons <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className={`flex-1 ${submitted && !adjustmentReason ? 'has-error' : ''}`}>
                                                        {/* <input className='form-input' value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value) }/>
                                                         */}
                                                        <div className="relative">
                                                            <select name="" id="" className="form-input pr-8" value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)}>
                                                                <option value="">Select Adjustment Reason</option>
                                                                {adjustmentReasonsData?.metrcAdjustmentReasonsByDispensaryId?.map((item, index) => (
                                                                    <option key={index} value={item?.Name}>
                                                                        {item?.Name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                                                                <FaChevronDown />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-dark dark:text-white-dark">
                                                    <label className="w-56 text-right pr-4 font-medium">
                                                        Adjustment Notes <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className={`flex-1 ${submitted && !adjustmentNote ? 'has-error' : ''}`}>
                                                        <input type="text" className="form-input" value={adjustmentNote} onChange={(e) => setAdjustmentNote(e.target.value)} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <label className="w-56 text-right pr-4 font-medium">
                                                        Report Adjustment to State
                                                        <br />
                                                        Traceability System
                                                    </label>
                                                    <div className="flex-1">
                                                        <label className="w-12 h-6 relative">
                                                            <input
                                                                type="checkbox"
                                                                className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                                id="custom_switch_checkbox1"
                                                                checked={isReport}
                                                                onChange={() => setIsReport(!isReport)}
                                                            />
                                                            <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Divider --> */}
                                            <div className="border-t border-gray-200 dark:border-[#1b2e4b] my-6"></div>

                                            {/* <!-- Summary --> */}
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div>
                                                    <span className="font-medium">Difference:</span>
                                                    <span className="ml-2">{truncateToTwoDecimals(newQty - (packageDataById?.assignPackage?.posQty || 0))} packageDataById?.UnitOfMeasureName</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium">New Quantity:</span>
                                                    <span className="ml-2">{truncateToTwoDecimals(newQty) + ' ' + packageDataById?.UnitOfMeasureName}</span>
                                                </div>
                                            </div>

                                            {/* <!-- Buttons --> */}
                                            <div className="flex justify-end space-x-3">
                                                <button className="btn btn-outline-secondary" onClick={() => setAdjustPackageModal(false)}>
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => {
                                                        setSubmitted(true);
                                                        handleAjustPackage();
                                                    }}
                                                >
                                                    Save & Close
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

export default AuditPackageTable;
