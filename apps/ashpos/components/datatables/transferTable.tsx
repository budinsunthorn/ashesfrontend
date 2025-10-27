'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Fragment, useEffect, useState, useRef, Suspense } from 'react';
import sortBy from 'lodash/sortBy';
import { useAtom } from 'jotai';
import { spinnerAtom } from '@/store/spinnerStatus';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { Transition, Dialog } from '@headlessui/react';
import { useRouter, useSearchParams } from 'next/navigation';

import moment from 'moment';
import {
    useAllTransfersByDispensaryIdAndTransferTypeAndStatusQuery,
    useSyncMetrcIncomingTransferMutation,
    useTransferByIdQuery,
    usePackagesByDeliveryIdQuery,
    useAllTransfersByDispensaryIdAndTransferTypeAndStatusWithPagesQuery,
    MutationCreateTransferArgs,
    useAllSuppliersByOrganizationIdQuery,
    useCreateTransferMutation,
    useGetNonMjPackagesByTransferIdQuery,
    useCreateNonMjPackageMutation,
    useGetLastSyncHistoryByDispensaryIdQuery,
    useCreateSyncHistoryMutation,
    useDeleteTransferMutation,
} from '@/src/__generated__/operations';
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
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
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
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import RefreshButton from '../etc/refreshButton';
import LoadingSkeleton from '../etc/loadingSkeleton';
import SkeletonLoader from '../etc/skeletonLoader';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { RxCross1 } from 'react-icons/rx';
import { GrConnect } from 'react-icons/gr';
import PackageTransfer from '../etc/packageTransfer';
import PackageStatusBadge from '../etc/packageStatus';
import { packageStatusArray, PRINTLIMIT } from '@/utils/variables';
import { getPackageStatusNameAsString, returnPackageStatusClass } from '@/utils/helper';
import TableLoading from '../etc/tableLoading';
import { useDebouncedCallback } from 'use-debounce';
import CustomSelect from '../etc/customeSelect';
import { Store } from 'react-notifications-component';


import { syncStatusAtom } from "@/store/syncStatusAtom";
import { Span } from 'next/dist/trace';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import TableExport from '../etc/DataTableExport';

type RowDataType = generatedTypes.Transfer;
type RowData = RowDataType[];

const TransferTable = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const queryClient = useQueryClient();
    const [spinnerStatus, setSpinnerStatus] = useAtom(spinnerAtom);
    const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);

    const [isRightBarShow, setIsRightBarShow] = useState(false);
    const [typeForFilter, setTypeForFilter] = useState('');
    const [statusForFilter, setStatusForFilter] = useState('');
    const [mjFilter ,setMjFilter] = useState("")
    const [isAtTop, setIsAtTop] = useState(false);
    const [selectedRow, setSelectedRow] = useState(0);
    const targetRef = useRef<HTMLTableElement | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [showNewTransferModal, setShowNewTransferModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAddPackage, setIsAddPackage] = useState(false)

    const [transferId, setTransferId] = useState('');
    const [deliverId, setDeliverId] = useState(0);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [transferType, setTransferType] = useState('IN');

    const rowData = useTransferByIdQuery({ id: transferId.toString() });
    const transferDataById = rowData.data?.transferById;
    const packageRowData = usePackagesByDeliveryIdQuery({ deliveryId: deliverId });
    const packageData = packageRowData.data?.packagesByDeliveryId;

    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;
    const organizationId = userData.organizationId;

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
    const [searchSelectValue, setSearchSelectValue] = useState('ShipperFacilityName');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('ShipperFacilityName');
    const [searchParam, setSearchParam] = useState('');
    const [searchPage, setSearchPage] = useState(1);
    const [isUpdate, setIsUpdate] = useState(false);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: '',
        direction: 'asc',
    });

    const [customOptions, setCustomOptions] = useState<any>([])
    const [currentsupplier, setCurrentSupplier] = useState("")

    // Fetch Data
    const getLastSyncHistoryByDispensaryId = useGetLastSyncHistoryByDispensaryIdQuery({ dispensaryId: dispensaryId, syncType: 'transfer' });
    const SyncHistoryData = getLastSyncHistoryByDispensaryId.data?.getLastSyncHistoryByDispensaryId;
    // const AllTransfersByDispensaryId = useAllTransfersByDispensaryIdAndTransferTypeAndStatusQuery({ dispensaryId: dispensaryId, transferType: typeForFilter, status: statusForFilter });
    // const allTransferData = AllTransfersByDispensaryId.data?.allTransfersByDispensaryIdAndTransferTypeAndStatus;
    const transferDataWithPage = useAllTransfersByDispensaryIdAndTransferTypeAndStatusWithPagesQuery({
        dispensaryId: dispensaryId,
        transferType: typeForFilter,
        status: statusForFilter,
        mjType: mjFilter,
        pageNumber: searchPage,
        onePageRecords: pageSize,
        searchField: searchField,
        searchParam: searchParam,
        sortDirection: sortStatus.direction,
        sortField: sortStatus.columnAccessor
    });
    const transferData = transferDataWithPage.data?.allTransfersByDispensaryIdAndTransferTypeAndStatusWithPages?.transfers;

    // const transferPrintDataWithPage = useAllTransfersByDispensaryIdAndTransferTypeAndStatusWithPagesQuery({
    //     dispensaryId: dispensaryId,
    //     transferType: typeForFilter,
    //     status: statusForFilter,
    //     pageNumber: 1,
    //     onePageRecords: PRINTLIMIT,
    //     searchField: searchField,
    //     searchParam: searchParam,
    //     sortDirection: sortStatus.direction,
    //     sortField: sortStatus.columnAccessor
    // });

    // const transferPrintData = transferPrintDataWithPage.data?.allTransfersByDispensaryIdAndTransferTypeAndStatusWithPages?.transfers;
    const query = `
    query AllTransfersByDispensaryIdAndTransferTypeAndStatusWithPages($dispensaryId: String!, $transferType: String!, $status: String!, $pageNumber: Int!, $onePageRecords: Int!, $searchField: String!, $searchParam: String!, $sortField: String, $sortDirection: String, $mjType: String) {
        allTransfersByDispensaryIdAndTransferTypeAndStatusWithPages(dispensaryId: $dispensaryId, transferType: $transferType, status: $status, pageNumber: $pageNumber, onePageRecords: $onePageRecords, searchField: $searchField, searchParam: $searchParam, sortField: $sortField, sortDirection: $sortDirection, mjType: $mjType) {
            transfers {
            id   
            dispensaryId
            userId
            user{
            name
            userType
            }
            supplier{
            name
            phone
            email
            businessLicense
            }
            transferType
            isMJ
            status
            transferId
            deliveryId
            PackageCount
            ReceivedPackageCount
            CreatedDateTime
            ReceivedDateTime
            ShipperFacilityLicenseNumber
            ShipperFacilityName
            createdAt
            updatedAt
            assignedPackageCount
            },
            totalCount
        }
        }`

    const totalCount = transferDataWithPage.data?.allTransfersByDispensaryIdAndTransferTypeAndStatusWithPages?.totalCount;
    const allSuppliersByOrganizationId = useAllSuppliersByOrganizationIdQuery({ organizationId: organizationId });
    const supplierData = allSuppliersByOrganizationId.data?.allSuppliersByOrganizationId;
    const nonMjPackageRowData = useGetNonMjPackagesByTransferIdQuery({ transferId: transferId });
    const nonMjPackageData = nonMjPackageRowData?.data?.getNonMjPackagesByTransferId;
    const [currentPackageData, setCurrentPackageData] = useState<any>(packageData);
    const createNonMjPackageMutation = useCreateNonMjPackageMutation();

    const [assignedPackageCount, setAssignedPackageCount] = useState(0)

    // console.log('nonMjPackageData', nonMjPackageData);
    // console.log('packageData', packageData);
    // console.log('transferDataById', transferDataById);
    // console.log('SyncHistoryData', SyncHistoryData);
    // Mutation
    const createTransferMutation = useCreateTransferMutation();
    const syncTransferMutation = useSyncMetrcIncomingTransferMutation();
    const createSyncHistory = useCreateSyncHistoryMutation();
    const deleteTransferMutation = useDeleteTransferMutation();
    // console.log("packageData", packageData);

    const [hideCols, setHideCols] = useState<any>([
        'CreatedDateTime',
        'PackageCount',
        'ShipperFacilityLicenseNumber',
        'ShipperFacilityName',
        'deliveryId',
        'isMJ',
        'updatedAt',
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
        if(syncStatus) {
            transferDataWithPage.refetch();
            nonMjPackageRowData.refetch();
            packageRowData.refetch();
        }
    }, [syncStatus])

    useEffect(() => {
        if (transferDataById?.isMJ) {
            setCurrentPackageData(packageData);
        } else {
            setCurrentPackageData(nonMjPackageData);
        }
    }, [transferDataById, packageData, nonMjPackageData]);

    // useEffect(() => {  
    //     if(currentPackageData) {
    //     const packageCounts = currentPackageData?.reduce((acc: number, packageData: any) => {  
    //         if (packageData?.package?.assignPackage) {  
    //             acc += 1; // Increment the accumulator if assignPackage is truthy  
    //         }  
    //         return acc; // Return the accumulator  
    //     }, 0); // Initialize the accumulator to 0  
    
    //     console.log(packageCounts);
    //     setAssignedPackageCount(packageCounts);
    // } // Optionally log the count 
    // }, [currentPackageData]); 

    // console.log('transferDataById', transferDataById);

    // console.log('currentPackageData', currentPackageData);
    useEffect(() => {
        if (isUpdate || syncStatus) {
            rowData.refetch();
            packageRowData.refetch();
            nonMjPackageRowData.refetch();
            transferDataWithPage.refetch();
            setIsUpdate(false);
        }
    }, [isUpdate, syncStatus]);

    useEffect(() => {
        setPage(1);
        if (pageSize == 10) setIsAtTop(false);
    }, [pageSize]);

    useEffect(() => {
        setSearchPage(page);
    }, [page]);

    // useEffect(() => {
    //     const from = (page - 1) * pageSize;
    //     const to = from + pageSize;
    //     if (initialRecords) setRecordsData([...initialRecords.slice(from, to)]);
    // }, [page, pageSize, initialRecords]);

    const getTransferData = () => {
        setLoading(true);
        transferDataWithPage.refetch();
        setLoading(false);
    };
    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    useEffect(() => {

        if (searchParams.get('transferId')) {
            // console.log('transferId', searchParams.get('transferId'));
            setTransferId(searchParams.get('transferId') as string);
            setIsRightBarShow(true);
        }
    }, [searchParams]);

    useEffect(() => {
        const deliverId = transferDataById?.deliveryId;
        // console.log('deliverId', deliverId);
        if(deliverId)
            setDeliverId(deliverId);
    }, [transferDataById]);

    const [firstViewed, setFirstViewed] = useState(false);

    const updateSearchParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${params.toString()}`); // or use replace() to avoid history stacking
    };

    const handleRowClick = (record: any, index: any) => {
        if (record == null) {
            return null;
        }
        setSelectedRow(index);
        updateSearchParams('transferId', record.id);
        // setDeliverId(record.deliveryId);
    };

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
                    `fixed top-0 z-[99]  ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-510px)]' : 'w-[calc(100vw-780px)]' : 'left-[90px] w-[calc(100vw-590px)]'
                    } h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            } else {
                setTableClassName(
                    `fixed top-0 z-[99] ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-0px)]' : 'w-[calc(100vw-260px)]' : 'left-[90px] w-[calc(100vw-90px)]'
                    }  h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-510px)]' : 'w-[calc(100vw-790px)]' : 'w-[calc(100vw-600px)]'} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == 'horizontal' ? 'left-0 w-[calc(100vw-60px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-45px)]' : 'w-[calc(100vw-305px)]' : 'w-[calc(100vw-115px)]'} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow, sidebar, menu]);

    // useEffect(() => {
    //     if (transferData) {

    //     }
    // }, [search, transferData]);

    // useEffect(() => {
    //     const data = sortBy(initialRecords, sortStatus.columnAccessor);
    //     setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    //     setPage(1);
    // }, [sortStatus]);

    const handleCreateNonMJTransfer = async () => {
        setIsAddPackage(true)
        await createNonMjPackageMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    transferId: transferId,
                },
            },
            {
                onError: (error) => {
                    warnAlert('Failed to Create Non MJ Package');
                },
                onSuccess: (data) => {
                    if (data) {
                        successAlert('New Non Mj Package Created!');
                        setIsAddPackage(false);
                        nonMjPackageRowData.refetch();
                    }
                },
            }
        );
    };

    const handleCreateTransfer = () => {
        createTransferMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    isMJ: false,
                    status: 'ACCEPTED',
                    supplierId: selectedSupplier,
                    transferType: transferType == 'IN' ? 'Incoming' : 'Outgoing',
                    userId: userId,
                },
            },
            {
                onError(error) {
                    warnAlert('Transfer Creating failed!');
                },
                onSuccess(data) {
                    if (!data) return;
                    // AllTransfersByDispensaryId.refetch();
                    transferDataWithPage.refetch();
                    successAlert('Transfer Successfully Created!');
                },
            }
        );
    };

    // const syncTransferData = async () => {
    //     setSpinnerStatus({
    //         isLoading: true,
    //         text: 'Transfer Data synchronizing...',
    //     });
    //     await syncTransferMutation.mutate(
    //         {
    //             input: {
    //                 userId: userId,
    //                 dispensaryId: dispensaryId,
    //             },
    //         },
    //         {
    //             onError(error) {
    //                 setSpinnerStatus({});
    //                 warnAlert('Synchronization failed');
    //             },
    //             onSuccess(data) {
    //                 setSpinnerStatus({});
    //                 if (data.syncMetrcIncomingTransfer?.count || data.syncMetrcIncomingTransfer?.count == 0 ? data.syncMetrcIncomingTransfer?.count >= 0 : false)
    //                     successAlert('Syncronization success.');
    //                 else warnAlert('Synchronization failed');

    //                 createSyncHistory.mutate(
    //                     {
    //                         input: {
    //                             dispensaryId: dispensaryId,
    //                             userId: userId,
    //                             syncType: 'transfer',
    //                         },
    //                     },
    //                     {
    //                         onError: (error) => {
    //                             // warnAlert("Failed to Create Sync History");
    //                         },
    //                         onSuccess: (data) => {
    //                             if (data) {
    //                                 // successAlert("Sync History Created!");
    //                                 getLastSyncHistoryByDispensaryId.refetch();
    //                             }
    //                         },
    //                     }
    //                 );
    //             },
    //             onSettled() {
    //                 // setIsSaveButtonDisabled(false);
    //             },
    //         }
    //     );
    // };

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        // { accessor: 'createdAt', title: 'Created At' },
        { accessor: 'updatedAt', title: 'Synced At' },
        { accessor: 'transferType', title: 'Transfer Type' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'ShipperFacilityName', title: 'Supplier' },
        { accessor: 'CreatedDateTime', title: 'Created Date Time' },
        // { accessor: 'CreatedDateTime', title: 'Metrc ID' },
        { accessor: 'ReceivedDateTime', title: 'Received Date Time' },
        { accessor: 'transferId', title: 'Metrc ID' },
        { accessor: 'PackageCount', title: 'Package Count' },
        { accessor: 'ReceivedPackageCount', title: 'Received Package Count' },
        { accessor: 'assignedPackageCount ', title: 'Assigned Count' },
        { accessor: 'ShipperFacilityLicenseNumber', title: 'Shipper Facility License Number' },
        { accessor: 'deliveryId', title: 'Delivery ID' },
        // { accessor: 'dispensaryId', title: 'Dispensary ID' },
        // { accessor: 'isMJ', title: 'Is Medical Marijuana?' },
    ];

    useEffect(() => {
        let categoryOption: any[] = [];
        supplierData?.map((item) => {
            categoryOption.push({ value: item?.id, label: item?.name });
        });
        setCustomOptions(categoryOption);
    }, [supplierData]);

    const handleSelectSupplier = (value: any) => {
        setSelectedSupplier(value);
        
        const matched = customOptions.find((item: any) => item.value === value);
        const name = matched?.label || '';
    
        setCurrentSupplier(name);
    };

    const handleDeleteTransfer = async () => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await deleteTransferMutation.mutate(
                    {
                        id: transferId,
                    },
                    {
                    onError: (error) => {
                        warnAlert('Failed to Delete Transfer');
                    },
                    onSuccess: (data) => {
                        // successAlert('Transfer Deleted Successfully');
                        Store.addNotification({
                            title: `Success`,
                            message: "Transfer Deleted Successfully",
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
                        transferDataWithPage.refetch();
                    },
                });
            }
        })
    };

    const newTransferSchima = Yup.object().shape({
        transfer_type: Yup.string().required('Please fill amount'),
        supplier: Yup.string().required('Please fill amount'),
    });
    return (
        <div className={`mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <h5 className="text-lg font-semibold dark:text-white-dark">Transfers</h5>
            <div className="my-2 flex gap-5 flex-row flex-wrap justify-between md:items-end">
                <div className="flex flex-wrap justify-start items-center">
                    <div className="relative inline-flex align-middle mr-5 mb-1">
                        <button
                            type="button"
                            className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#1c2942] dark:hover:!text-[#878ca7] border-gray-200 dark:border-[#283b5d] sticky top-0 ltr:rounded-r-none rtl:rounded-l-none ${
                                typeForFilter == 'Incoming' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                            }`}
                            onClick={() => setTypeForFilter((prev) => (prev == '' || prev != 'Incoming' ? 'Incoming' : ''))}
                        >
                            Incoming
                        </button>
                        <button
                            type="button"
                            className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#1c2942] dark:hover:!text-[#878ca7] border-gray-200 dark:border-[#283b5d] ltr:rounded-l-none rtl:rounded-r-none ${
                                typeForFilter == 'Outgoing' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                            }`}
                            onClick={() => setTypeForFilter((prev) => (prev == '' || prev != 'Outgoing' ? 'Outgoing' : ''))}
                        >
                            Outging
                        </button>
                    </div>
                    <div className="relative inline-flex align-middle mb-1">
                        {/* <button
                            type="button"
                            className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#1c2942] dark:hover:!text-[#878ca7]  border-gray-200 dark:border-[#283b5d] ltr:rounded-r-none rtl:rounded-l-none ${
                                statusForFilter == 'ACCEPTED' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                            }`}
                            onClick={() => setStatusForFilter((prev) => (prev == '' || prev != 'ACCEPTED' ? 'ACCEPTED' : ''))}
                        >
                            Accepted
                        </button>
                        <button
                            type="button"
                            className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#1c2942] dark:hover:!text-[#878ca7]  border-gray-200 dark:border-[#283b5d] rounded-none ${
                                statusForFilter == 'PENDING' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                            }`}
                            onClick={() => setStatusForFilter((prev) => (prev == '' || prev != 'PENDING' ? 'PENDING' : ''))}
                        >
                            Pending
                        </button>
                        <button
                            type="button"
                            className={`btn btn-outline-dark hover:!bg-[#f0f3f6] hover:!text-[#0f1727] dark:hover:!bg-[#1c2942] dark:hover:!text-[#878ca7]  border-gray-200 dark:border-[#283b5d] ltr:rounded-l-none rtl:rounded-r-none ${
                                statusForFilter == 'VOIDED' ? '!bg-[#f0f3f6] !text-[#0f1727] dark:!bg-[#1c2942] dark:!text-[#878ca7]' : ''
                            }`}
                            onClick={() => setStatusForFilter((prev) => (prev == '' || prev != 'VOIDED' ? 'VOIDED' : ''))}
                        >
                            Voided
                        </button> */}
                        <select
                            onChange={(e) => {
                                setStatusForFilter(e.target.value);
                                setSearchPage(1)
                            }}
                            id="currentDispensary"
                            className="flex-initial w-32 form-select text-dark dark:text-white-dark"
                            value={statusForFilter}
                        >
                            <option className="text-dark dark:text-white-dark" value="">
                                All
                            </option>
                            <option className="text-dark dark:text-white-dark" value="complete">
                                Complete
                            </option>
                            <option className="text-dark dark:text-white-dark" value="incomplete">
                                Incomplete
                            </option>
                        </select>
                        <select
                            onChange={(e) => {
                                setMjFilter(e.target.value);
                                setSearchPage(1)
                            }}
                            id="mjFilter"
                            className="flex-initial w-32 form-select text-dark dark:text-white-dark ml-2"
                            value={mjFilter}
                        >
                            <option className="text-dark dark:text-white-dark" value="">
                                All
                            </option>
                            <option className="text-dark dark:text-white-dark" value="mj">
                                MJ
                            </option>
                            <option className="text-dark dark:text-white-dark" value="nmj">
                                Non MJ
                            </option>
                        </select>
          
                    </div>
                </div>
                <div
                    className={`absolute flex flex-row flex-wrap max-w-[600px] justify-end items-center gap-2 lg:ltr:ml-auto rtl:mr-auto transition-all duration-500 ${
                        isRightBarShow ? '!right-[505px]' : 'right-6'
                    }`}
                >
                    <button className="btn btn-primary rounded-full py-1.5 px-2.5 !text-sm" onClick={() => setShowNewTransferModal(true)}>
                        <IconPlus className="h-4 w-4 shrink-0 ltr:mr-1.5 rtl:ml-1.5" />
                        New
                    </button>
                    {/* <Tippy content={`Synced by ${SyncHistoryData?.user.name}`} placement="top">
                        <button className="!flex items-center btn btn-primary border border-white-light dark:border-[#253b5c] rounded-md px-2 py-1.5 !text-sm" onClick={syncTransferData}>
                            <MdOutlineSync className="text-lg mr-2" />
                            <FiRefreshCcw className="text-md mr-1" />
                            Synced {moment(SyncHistoryData?.createdAt).fromNow()}
                        </button>
                    </Tippy> */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <RefreshButton onClick={() => transferDataWithPage.refetch()} />
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
                    {/* <ExportTable cols={cols} recordsData={transferPrintData} hideCols={hideCols} filename='transfer_table_data'/> */}
                    <TableExport cols={cols} hideCols={hideCols} filename='transfer' query={query}
                        variables={{  
                            dispensaryId: dispensaryId,
                            transferType: typeForFilter,
                            status: statusForFilter,
                            pageNumber: 1,
                            onePageRecords: PRINTLIMIT,
                            searchField: searchField,
                            searchParam: searchParam,
                            sortDirection: sortStatus.direction,
                            sortField: sortStatus.columnAccessor
                        }}  
                    />
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
                            <option value="metrcId">Metrc ID</option>
                            <option value="deliveryId">Delivery ID</option>
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
                                render: (record) => (transferData ? (page - 1) * pageSize + transferData.indexOf(record) + 1 : 0),
                            },
                            {
                                accessor: 'id',
                                title: 'ID',
                                sortable: true,
                                hidden: true,
                            },

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
                            {
                                accessor: 'transferType',
                                title: 'Transfer Type',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { transferType, transferId, deliveryId } = row;

                                    if (transferType === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div className="flex justify-start items-center">
                                                {transferType == 'Incoming' ? <FaArrowLeft className="text-theme_green mr-2" />: <FaArrowRight className="text-red-300 mr-2" />}
                                                {transferType}
                                                {transferId && transferId > 0 ? <span className='text-success bg-success-light dark:bg-success-dark-light py-[1px] px-[3px] ml-1 rounded-md text-[10px]'>MJ</span> : <span className='text-primary bg-primary-light dark:bg-primary-dark-light py-[1px] px-[3px] ml-1 rounded-md text-[10px]'>NMJ</span>}
                                            </div>
                                },
                                hidden: hideCols.includes('transferType'),
                            },
                            {
                                accessor: 'ShipperFacilityName',
                                title: 'Supplier',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { isMJ, ShipperFacilityName, supplier } = row;

                                    if (isMJ) {
                                        return <div>{ShipperFacilityName}</div>; // Handle null case if necessary
                                    } else {
                                        return <div>{supplier?.name}</div>; // Handle null case if necessary
                                    }
                                },
                                hidden: hideCols.includes('ShipperFacilityName'),
                            },
                            {
                                accessor: 'status',
                                title: 'Status',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { status, ReceivedPackageCount, assignedPackageCount, transferId } = row;

                                    // console.log("data ------------> ", ReceivedPackageCount, assignedPackageCount)

                                    // if (status === null || ReceivedPackageCount === null || assignedPackageCount === null) {
                                    //     return null; // Handle null case if necessary
                                    // }
                                    if(transferId && transferId > 0) {
                                        if (status == 'PENDING') {
                                            return <span className="badge text-danger bg-danger-light dark:bg-danger-dark-light">Pending</span>;
                                        }

                                        if ((ReceivedPackageCount || 0) > (assignedPackageCount || 0)) {
                                            return <span className="badge text-warning bg-warning-light dark:bg-warning-dark-light">Incomplete</span>;
                                        } 
                                        if (ReceivedPackageCount == assignedPackageCount) {
                                            return <span className="badge text-success bg-success-light dark:bg-success-dark-light">Complete</span>;
                                        }
                                    } else {
                                        if (assignedPackageCount || 0 > 0) 
                                            return <span className="badge text-success bg-success-light dark:bg-success-dark-light">Complete</span>; 
                                        else 
                                            return <span className="badge text-warning bg-warning-light dark:bg-warning-dark-light">Incomplete</span>;
                                    }
                                    
                                    return null;
                                },
                                hidden: hideCols.includes('status'),
                            },
                            {
                                accessor: 'transferId',
                                title: 'Metrc ID',
                                sortable: true,
                                hidden: hideCols.includes('transferId'),
                            },

                            {
                                accessor: 'CreatedDateTime',
                                title: 'Created Date Time',
                                sortable: true,
                                hidden: hideCols.includes('CreatedDateTime'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { CreatedDateTime } = row;

                                    if (CreatedDateTime === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div>{convertPSTTimestampToTimezone(CreatedDateTime, userData.storeTimeZone)}</div>;
                                },
                            },
                            {
                                accessor: 'PackageCount',
                                title: 'Package Count',
                                sortable: true,
                                hidden: hideCols.includes('PackageCount'),
                            },
                            {
                                accessor: 'ReceivedDateTime',
                                title: 'Received Date Time',
                                sortable: true,
                                hidden: hideCols.includes('ReceivedDateTime'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { ReceivedDateTime } = row;

                                    if (ReceivedDateTime === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div>{convertPSTTimestampToTimezone(ReceivedDateTime, userData.storeTimeZone)}</div>;
                                },
                            },
                            {
                                accessor: 'ReceivedPackageCount',
                                title: 'Received Package Count',
                                sortable: true,
                                hidden: hideCols.includes('ReceivedPackageCount'),
                            },
                            {
                                accessor: 'assignedPackageCount',
                                title: 'Assigned Count',
                                sortable: true,
                                hidden: hideCols.includes('assignedPackageCount'),
                            },
                            {
                                accessor: 'ShipperFacilityLicenseNumber',
                                title: 'Shipper Facility License Number',
                                sortable: true,
                                hidden: hideCols.includes('ShipperFacilityLicenseNumber'),
                            },

                            {
                                accessor: 'deliveryId',
                                title: 'Delivery ID',
                                sortable: true,
                                hidden: hideCols.includes('deliveryId'),
                            },
                            // {
                            //     accessor: 'dispensaryId',
                            //     title: 'Dispensary ID',
                            //     sortable: true,
                            //     hidden: hideCols.includes('dispensaryId'),
                            // },
                            // {
                            //     accessor: 'id',
                            //     title: 'ID',
                            //     sortable: true,
                            //     hidden: hideCols.includes('id'),
                            // },
                            {
                                accessor: 'isMJ',
                                title: 'Is Medical Marijuana?',
                                sortable: true,
                                hidden: hideCols.includes('isMJ'),
                            },

                            {
                                accessor: 'updatedAt',
                                title: 'Updated At',
                                sortable: true,
                                hidden: hideCols.includes('updatedAt'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { updatedAt } = row;

                                    if (updatedAt === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div>{convertPSTTimestampToTimezone(updatedAt, userData.storeTimeZone)}</div>;
                                },
                            },
                            // {
                            //     accessor: 'user.name',
                            //     title: 'User Name',
                            //     sortable: true,
                            //     hidden: hideCols.includes('user.name'),
                            // },
                            // {
                            //     accessor: 'user.userType',
                            //     title: 'User Type',
                            //     sortable: true,
                            //     hidden: hideCols.includes('user.userType'),
                            // },
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
                            handleRowClick(record, index);
                        }}
                    />
                </div>
            </div>

            <div className={`fixed bottom-0 z-[101] transition-all duration-500 h-full right-0 bg-white ${isRightBarShow ? 'w-[500px]' : 'w-0'}`}>
                <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                    <PerfectScrollbar>
                        <Suspense fallback={<LoadingSkeleton />}>
                            <div className="py-2 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                                <button
                                    type="button"
                                    className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                    onClick={() => setIsRightBarShow(false)}
                                >
                                    <FaArrowRightFromBracket className="m-auto text-2xl" />
                                </button>
                                <button className="btn btn-outline-primary mx-2 flex items-center" onClick={() => {
                                        setModalShow(true)
                                        packageRowData.refetch()
                                        rowData.refetch()
                                    }}>
                                    <TbListDetails className="mr-2" />
                                    Detail
                                </button>
                            </div>
                            {(packageRowData.isLoading || packageRowData.isFetching) || (rowData.isFetching || rowData.isLoading)  ? (
                                <LoadingSkeleton />
                            ) : (
                                <div>
                                    <div className="flex flex-col items-center px-3">
                                        <div className="w-full text-lg text-dark dark:text-white-dark font-semibold py-2">Incoming Transfer from {transferDataById?.isMJ ? transferDataById?.ShipperFacilityName : transferDataById?.supplier?.name}</div>
                                        <div className="w-full bg-white dark:bg-[#0f1727] rounded-md border-[1px] border-gray-50  dark:border-[#1a1e3b] shadow-sm shadow-gray-200 dark:shadow-[#0a0b0f]">
                                            <div className={`flex justify-between items-center ${
                                                    // transferDataById?.status == 'ACCEPTED'
                                                    //     ? 'bg-success-light text-success dark:bg-success-dark-light'
                                                    //     : transferDataById?.status == 'PENDING'
                                                    //     ? // ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                    //       'bg-warning-light text-warning dark:bg-warning-dark-light'
                                                    //     : 'bg-dark text-gray-100 dark:text-gray-800'
                                                    (transferDataById?.isMJ) ? 
                                                    (transferDataById?.ReceivedPackageCount || 0) > (transferDataById?.assignedPackageCount || 0) 
                                                    ? 'bg-warning-light dark:bg-warning-dark-light' : 'bg-success-light dark:bg-success-dark-light'
                                                    : (transferDataById?.assignedPackageCount || 0) > 0 ? 'bg-success-light dark:bg-success-dark-light' : 'bg-warning-light dark:bg-warning-dark-light'
                                                }`}>
                                            <div
                                                className={`p-2 rounded-t-md border-gray-200 dark:border-[#1a1e3b] font-bold`}
                                            >
                                                {/* {getPackageStatusNameAsString(transferDataById?.status)} */}
                                                {(transferDataById?.isMJ) ? 
                                                (transferDataById?.ReceivedPackageCount || 0) > (transferDataById?.assignedPackageCount || 0) ? 
                                                <span className="badge text-warning font-bold text-lg  bg-warning-light dark:bg-warning-dark-light ">Incomplete</span>
                                                :<span className="badge text-success font-bold text-lg  bg-success-light dark:bg-success-dark-light ">Complete</span> 
                                                : (transferDataById?.assignedPackageCount || 0) > 0 ? <span className="badge text-success font-bold text-lg  bg-success-light dark:bg-success-dark-light ">Complete</span>
                                                :<span className="badge text-warning font-bold text-lg  bg-warning-light dark:bg-warning-dark-light ">Incomplete</span>}
                                            </div>
                                            {!transferDataById?.isMJ && transferDataById?.assignedPackageCount == 0 ?  (
                                                    <button className="flex justify-start items-center text-sm text-dark        dark:text-white-dark" type="button" onClick={() => handleDeleteTransfer()}>
                                                        <IconTrashLines className="mr-2 text-red-500" />
                                                        {/* Delete Transfer */}
                                                    </button>
                                            ) : null}
                                            {/* <div className="dropdown !relative">
                                                <Dropdown
                                                    placement={``}
                                                    btnClassName="p-3 roudned-md hover:bg-gray-200 hover:bg-success-dark-light dropdown-toggle"
                                                    button={
                                                        <>
                                                            <HiOutlineDotsHorizontal className="text-2xl" />
                                                        </>
                                                    }
                                                >
                                                    <ul className="!min-w-[170px] absolute -right-0 text-md">
                                                        {!transferDataById?.isMJ && transferDataById?.assignedPackageCount == 0 ?  (
                                                            <li>
                                                                <button className="flex justify-start items-center text-sm text-dark        dark:text-white-dark" type="button" onClick={() => handleDeleteTransfer()}>
                                                                    <IconTrashLines className="mr-2 text-red-500" />
                                                                    Delete Transfer
                                                                </button>
                                                            </li>
                                                        ) : null}
                                                    </ul>
                                                </Dropdown>
                                            </div> */}
                                            </div>
                                            <div className="p-3 flex justify-between items-center border-b-gray-200 border-b-[1px] dark:border-[#1a1e3b] text-lg font-semibold text-dark dark:text-white-dark">
                                                <span>Transfer Details</span>
                                                <div className="flex justify-end items-center">
                                                    <span className={`${transferDataById?.ReceivedPackageCount == transferDataById?.assignedPackageCount ? 'text-theme_green' : 'text-primary'}`}>{transferDataById?.assignedPackageCount} complete</span>
                                                    &nbsp;/&nbsp; <span className="text-theme_green">{transferDataById?.ReceivedPackageCount} total</span>
                                                    
                                                </div>
                                            </div>
                                            <div className="p-3 flex flex-col">
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Created At:</div>
                                                    <div className="w-[50%] text-left">{convertPSTTimestampToTimezone(transferDataById?.createdAt || '', userData.storeTimeZone)}</div>
                                                </div>
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Received At:</div>
                                                    <div className="w-[50%] text-left">{convertPSTTimestampToTimezone(transferDataById?.ReceivedDateTime || '', userData.storeTimeZone)}</div>
                                                </div>
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Transfer ID:</div>
                                                    <div className="w-[50%] text-left">{transferDataById?.transferId}</div>
                                                </div>
                                                {/* <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Last Synced At:</div>
                                                    <div className="w-[50%] text-left">09/28/2024</div>
                                                </div> */}
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Transfer Type:</div>
                                                    <div className="w-[50%] text-left">{transferDataById?.transferType}</div>
                                                </div>
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Supplier Name:</div>
                                                    <div className="w-[50%] text-left">{transferDataById?.isMJ ? transferDataById?.ShipperFacilityName : transferDataById?.supplier?.name}</div>
                                                </div>
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Supplier License Number:</div>
                                                    <div className="w-[50%] text-left">
                                                        {transferDataById?.isMJ ? transferDataById?.ShipperFacilityLicenseNumber : transferDataById?.supplier?.businessLicense}
                                                    </div>
                                                </div>
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Marijuana Transfer:</div>
                                                    <div className="w-[50%] text-left">{transferDataById?.isMJ == true ? 'Yes' : 'No'}</div>
                                                </div>
                                                {/* <div className="flex justify-start items-center my-[6px] text-md">
                                            <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Supplier:</div>
                                            <div className="w-[50%] text-left">{transferDataById?.ShipperFacilityName}</div>
                                        </div> */}
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Total Packages:</div>
                                                    <div className="w-[50%] text-left">{transferDataById?.PackageCount}</div>
                                                </div>
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Receieved Date:</div>
                                                    <div className="w-[50%] text-left">{convertPSTTimestampToTimezone(transferDataById?.ReceivedDateTime || '', userData.storeTimeZone)}</div>
                                                </div>
                                                <div className="flex justify-start items-center my-[6px] text-md">
                                                    <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Total Cost:</div>
                                                    <div className="w-[50%] text-left">{}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold px-3 pt-3 text-dark dark:text-white-dark">Packages</div>
                                    <div className="flex flex-col itens-center px-3">
                                        {currentPackageData
                                            ? currentPackageData.map((data: any, key: any) => (
                                                  <ProductPackageCard key={key} packageData={data} isLoading={packageRowData.isLoading || packageRowData.isFetching} isMj={transferDataById?.isMJ} />
                                              ))
                                            : null}
                                    </div>
                                </div>
                            )}
                        </Suspense>
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
                                <Dialog.Panel className="panel my-8 w-10/12 rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex justify-end bg-[#fbfbfb] px-5 py-3 dark:bg-[#060817]">
                                        {/* <div className="text-lg font-bold">{'Set Package'}</div> */}
                                        <div onClick={() => setModalShow(false)} className="text-white-dark hover:text-dark dark:text-white-dark cursor-pointer">
                                            <IconX />
                                        </div>
                                    </div>
                                    <div className="bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                        {/* <SetPackage deliverId={deliverId} transferId={transferDataById?.id} mtrTransferId={transferDataById?.transferId} status={transferDataById?.status} isMj={transferDataById?.isMJ}/> */}
                                        <div>
                                            <div className="dark:bg-[#060818] px-3">
                                                <div className="mx-auto mb-3 bg-white dark:bg-[#0f1727] shadow-lg rounded-lg overflow-hidden">
                                                    {/* <div className="bg-theme_green text-white text-center py-1 text-base font-semibold">Accepted</div> */}
                                                    <div
                                                        className={`p-2 rounded-t-md border-gray-200 text-center dark:border-[#1a1e3b] font-bold ${returnPackageStatusClass(transferDataById?.status)}`}
                                                    >
                                                        {getPackageStatusNameAsString(transferDataById?.status)}
                                                    </div>
                                                    <div className="p-6">
                                                        <h2 className="text-xl font-semibold text-dark dark:text-white-dark text-center mb-2">
                                                            <span className="text-gray-600">
                                                                Incoming Transfer from &nbsp;
                                                                {transferDataById?.isMJ ? transferDataById?.ShipperFacilityName : transferDataById?.supplier?.name}
                                                                &nbsp;
                                                                {transferDataById?.isMJ ? transferDataById?.ShipperFacilityLicenseNumber : transferDataById?.supplier?.businessLicense + ')'}
                                                            </span>
                                                        </h2>
                                                        {transferDataById?.isMJ ? (
                                                            <div className="text-center text-dark dark:text-white-dark !mt-0">Metrc Transfer ID: {transferDataById?.transferId}</div>
                                                        ) : null}
                                                        {/* <div className="flex flex-col space-y-2 text-sm text-gray-600 mb-3">
                                                            <div className="text-center !mt-0">Imported by GrowFlow {transferData.importedDate}</div>
                                                            <div className="text-center !mt-0">Last Synced {transferData.lastSyncedDate}</div>
                                                            <div className="text-center !mt-0">Accepted & Completed {transferData.acceptedDate}</div>
                                                        </div>
                                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                                                            <div className="flex-1 h-32 p-3 border-[1px] border-gray-200 dark:border-[#1a1e3b]">
                                                                <h3 className="font-semibold mb-2">Transfer From</h3>
                                                                <p>{transferData.fromCompany}</p>
                                                                <p>Lic# {transferData.fromLicense}</p>
                                                            </div>
                                                            <div className="flex justify-center items-center">
                                                                <RxDoubleArrowRight className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                            <div className="flex-1 h-32 p-3 border-[1px] border-gray-200 dark:border-[#1a1e3b]">
                                                                <h3 className="font-semibold mb-2">Transfer To</h3>
                                                                <p>{transferData.toCompany}</p>
                                                                <p>Lic# {transferData.toLicense}</p>
                                                                <p>{transferData.toPhone}</p>
                                                                <p>{transferData.toAddress}</p>
                                                                <p>
                                                                    {transferData.toCity}, {transferData.toState} {transferData.toZip}
                                                                </p>
                                                            </div>
                                                        </div> */}
                                                    </div>
                                                </div>
                                                {currentPackageData?.map((data: any, key: any) => (
                                                    <PackageTransfer
                                                        key={key}
                                                        packageData={data}
                                                        setIsUpdate={setIsUpdate}
                                                        transferId={transferDataById?.id}
                                                        mtcTransferId={transferDataById?.transferId}
                                                        isMj={transferDataById?.isMJ}
                                                    />
                                                ))}
                                                {transferDataById?.isMJ ? null : (
                                                    <div className="w-full flex justify-center py-2">
                                                        <button className="relative btn btn-outline-primary mx-auto my-2" onClick={() => handleCreateNonMJTransfer()} disabled={isAddPackage}>
                                                            {' '}
                                                            {isAddPackage ? <FaSpinner className='animate-spin mr-1' /> : null}
                                                            + Add Package
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={showNewTransferModal} as={Fragment}>
                <Dialog as="div" open={showNewTransferModal} onClose={() => setShowNewTransferModal(true)}>
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
                                <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-4 py-2">
                                        <div className="flex items-center text-lg font-bold ">
                                            <GrConnect className="mr-3 text-dark dark:text-white-dark group-hover:text-primary" />
                                            New Transfer
                                        </div>
                                        <button type="button" className="text-dark hover:text-dark dark:text-white-dark" onClick={() => setShowNewTransferModal(false)}>
                                            <RxCross1 />
                                        </button>
                                    </div>
                                    <hr />
                                    <Formik
                                        initialValues={{
                                            transfer_type: 'IN',
                                            supplier: null,
                                        }}
                                        validationSchema={newTransferSchima}
                                        onSubmit={() => {
                                            // props.modalMode === "new" ? handleCreateCustomer() : handleUpdateOrganization()
                                        }}
                                    >
                                        {({ errors, submitCount, touched, values }) => (
                                            <Form>
                                                <div className="p-4">
                                                    <div className="bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                        <div className="w-full flex justify-center items-center my-2">
                                                            <div className="w-[20%] text-right text-base mr-3 text-nowrap">
                                                                Transfer Type
                                                                <span className="text-sm text-red-500 ml-1">*</span>
                                                            </div>
                                                            <div className="w-[70%] flex justify-start items-end ml-2">
                                                                <label className="inline-flex mr-3">
                                                                    <input
                                                                        name="transfer_type"
                                                                        type="radio"
                                                                        value="IN"
                                                                        className="form-radio peer text-success"
                                                                        checked={transferType == 'IN'}
                                                                        onChange={() => setTransferType('IN')}
                                                                    />
                                                                    <span className="peer-checked:text-success text-nowrap">Incoming</span>
                                                                </label>
                                                                <label className="inline-flex">
                                                                    <input
                                                                        name="transfer_type"
                                                                        type="radio"
                                                                        value="OUT"
                                                                        className="form-radio peer text-warning peer"
                                                                        onChange={() => setTransferType('OUT')}
                                                                    />
                                                                    <span className="peer-checked:text-warning text-nowrap">Outgoing</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="relative w-full flex justify-center items-center">
                                                            <div className="w-[20%] text-right text-base mr-3 text-nowrap">
                                                                Supplier
                                                                <span className="text-sm text-red-500 ml-1">*</span>
                                                            </div>
                                                            <select className="w-[70%] form-select ml-2" onChange={(e) => setSelectedSupplier(e.target.value)}>
                                                                <option value="">Select Supplier</option>
                                                                {supplierData?.map((item, key) => (
                                                                    <option key={key} value={item?.id}>
                                                                        {item?.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {/* <div className='w-full fixed bottom-10 right-0'>
                                                                <CustomSelect
                                                                    options={customOptions}
                                                                    onChange={handleSelectSupplier}
                                                                    currentOption={currentsupplier}
                                                                    setModalShow={setModalShow}
                                                                    showingText='All supplier'
                                                                    disabled={false}
                                                                    showingSearch={false}
                                                                />
                                                            </div> */}
                                                        </div>
                                                    </div>
                                                    <hr className="mt-3" />
                                                    <div className="w-full flex justify-end items-center">
                                                        <div className="flex justify-end items-center mt-2">
                                                            <button className="btn btn-outline-secondary mr-2" onClick={() => setShowNewTransferModal(false)}>
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="px-4 py-2 btn btn-primary"
                                                                onClick={() => {
                                                                    if (selectedSupplier) {
                                                                        setShowNewTransferModal(false);
                                                                        handleCreateTransfer();
                                                                    } else {
                                                                    }
                                                                }}
                                                            >
                                                                Done
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default TransferTable;
