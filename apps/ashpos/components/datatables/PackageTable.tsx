'use client';

import dynamic from 'next/dynamic';
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
import { useRouter, useSearchParams } from 'next/navigation'

// Import Custom Component
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
// import PackageCard from '../etc/packageCard';
const PackageCard = dynamic(() => import('../etc/packageCard'), { ssr: false });

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
    useFetchTestResultsByPackageIdMutation
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
import { PRINTLIMIT } from '@/utils/variables';
import TableExport from '../etc/DataTableExport';
import { truncateToTwoDecimals } from '@/lib/utils';

type RowDataType = generatedTypes.Package;
type RowData = (RowDataType | null)[];

const PackageTable = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);

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
    const [assignedStatus, setAssignedStatus] = useState('')

    // for the pagination
    const [searchSelectValue, setSearchSelectValue] = useState('assignPackage.product.name');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('assignPackage.product.name');
    const [searchParam, setSearchParam] = useState('');
    const [searchPage, setSearchPage] = useState(1);

    const allPakcageByPackagesByDispensaryIdWithPages = useAllPackagesByDispensaryIdWithPagesQuery({
        dispensaryId: dispensaryId,
        pageNumber: searchPage,
        onePageRecords: pageSize,
        searchField: searchField,
        searchParam: searchParam,
        sortField: sortStatus.columnAccessor,
        sortDirection: sortStatus.direction,
        packageStatus: searchPackageStatus,
        assignedStatus: assignedStatus
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
            PatientLicenseNumber
            Quantity
            ReceivedDateTime
            ReceivedFromFacilityLicenseNumber
            ReceivedFromFacilityName
            ReceivedFromManifestNumber
            UnitOfMeasureAbbreviation
            UnitOfMeasureName
            createdAt
            dispensaryId
            id
            itemId
            itemName
            itemUnitOfMeasureName
            itemUnitQuantity
            itemUnitQuantityUnitOfMeasureName
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

    const packageData1 = allPakcageByPackagesByDispensaryIdWithPages.data?.allPackagesByDispensaryIdWithPages?.packages ?? [];
    const totalCount = allPakcageByPackagesByDispensaryIdWithPages.data?.allPackagesByDispensaryIdWithPages?.totalCount;
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
    }, [syncStatus])

    useEffect(() => {
        setSearchPage(page);
    }, [page]);

    const updateSearchParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        router.push(`?${params.toString()}`) // or use replace() to avoid history stacking
    }

    const handleRowClick = (record: any, index: any) => {
        if (record == null) {
            return null;
        }
        setPackageId(record.id);
        setSelectedRow(index);
        updateSearchParams('packageId', record.id);

    }

    const handleSearch = () => {
        setSearchField(searchSelectValue);
        setSearchParam(searchValue.trim());
        setSearchPackageStatus(searchPackageStatus)
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
                    packageId: packageDataById?.packageId || 0
                },
            },

            {
                onError(error) {
                    // console.log(error);
                    warnAlert('Fetching Test Data failed');
                    setSpinnerStatus({})
                },
                onSuccess(data) {
                    successAlert('Fetching Test Data Successfully');
                    // allPakcageByPackagesByDispensaryIdWithPages.refetch();
                    packageRowDataById.refetch();
                    setSpinnerStatus({})
                },
            }
        );
    }
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
        { accessor: 'packageStatus', title: 'Package Status' },
        { accessor: 'assignPackage.cost', title: 'Cost' },
        { accessor: 'assignPackage.posQty', title: 'Current Qty' },
        { accessor: 'Quantity', title: 'Metrc Qty' },
        { accessor: 'originalQty', title: 'Original Qty' },
        { accessor: 'itemName', title: 'Metrc Name' },
        { accessor: 'packageId', title: 'Metrc ID' },
        { accessor: 'itemUnitWeight', title: 'Metrc Unit Weight' },
        { accessor: 'updatedAt', title: 'Synced At' },
        // { accessor: 'ArchivedDate', title: 'Archived Date' },
        // { accessor: 'ContainsRemediatedProduct', title: 'Contains Remediated Product' },
        // { accessor: 'ExpirationDate', title: 'Expiration Date' },
        // { accessor: 'FinishedDate', title: 'Finished Date' },
        // { accessor: 'InitialLabTestingState', title: 'Initial Lab Testing State' },
        // { accessor: 'IsDonation', title: 'Is Donation' },
        // { accessor: 'IsDonationPersistent', title: 'Is Donation Persistent' },
        // { accessor: 'IsFinished', title: 'Is Finished' },
        // { accessor: 'IsOnHold', title: 'Is On Hold' },
        // { accessor: 'IsOnRetailerDelivery', title: 'Is On Retailer Delivery' },
        // { accessor: 'IsOnTrip', title: 'Is On Trip' },
        // { accessor: 'IsProcessValidationTestingSample', title: 'Is Process Validation Testing Sample' },
        // { accessor: 'IsProductionBatch', title: 'Is Production Batch' },
        // { accessor: 'IsTestingSample', title: 'Is Testing Sample' },
        // { accessor: 'IsTradeSample', title: 'Is Trade Sample' },
        // { accessor: 'IsTradeSamplePersistent', title: 'Is Trade Sample Persistent' },
        // { accessor: 'ItemFromFacilityLicenseNumber', title: 'Item From Facility License Number' },
        // { accessor: 'ItemFromFacilityName', title: 'Item From Facility Name' },
        // { accessor: 'LabTestResultExpirationDateTime', title: 'Lab Test Result Expiration DateTime' },
        // { accessor: 'LabTestingPerformedDate', title: 'Lab Testing Performed Date' },
        // { accessor: 'LabTestingRecordedDate', title: 'Lab Testing Recorded Date' },
        // { accessor: 'LabTestingState', title: 'Lab Testing State' },
        // { accessor: 'LabTestingStateDate', title: 'Lab Testing State Date' },
        // { accessor: 'packageLabel', title: 'Label' },
        // { accessor: 'LastModified', title: 'Last Modified' },
        // { accessor: 'LocationId', title: 'Location ID' },
        // { accessor: 'LocationName', title: 'Location Name' },
        // { accessor: 'LocationTypeName', title: 'Location Type Name' },
        // { accessor: 'Note', title: 'Note' },
        // { accessor: 'PackageForProductDestruction', title: 'Package For Product Destruction' },
        // { accessor: 'PackageType', title: 'Package Type' },
        // { accessor: 'PackagedDate', title: 'Packaged Date' },
        // { accessor: 'PatientLicenseNumber', title: 'Patient License Number' },
        // { accessor: 'ProductRequiresRemediation', title: 'Product Requires Remediation' },
        // { accessor: 'ProductionBatchNumber', title: 'Production Batch Number' },
        // { accessor: 'Quantity', title: 'Quantity' },
        // { accessor: 'ReceivedDateTime', title: 'Received DateTime' },
        // { accessor: 'ReceivedFromFacilityLicenseNumber', title: 'Received From Facility License Number' },
        // { accessor: 'ReceivedFromFacilityName', title: 'Received From Facility Name' },
        // { accessor: 'ReceivedFromManifestNumber', title: 'Received From Manifest Number' },
        // { accessor: 'RemediationDate', title: 'Remediation Date' },
        // { accessor: 'RetailIdQrCount', title: 'Retail ID QR Count' },
        // { accessor: 'SellByDate', title: 'Sell By Date' },
        // { accessor: 'SourceHarvestCount', title: 'Source Harvest Count' },
        // { accessor: 'SourceHarvestNames', title: 'Source Harvest Names' },
        // { accessor: 'SourcePackageCount', title: 'Source Package Count' },
        // { accessor: 'SourcePackageIsDonation', title: 'Source Package Is Donation' },
        // { accessor: 'SourcePackageIsTradeSample', title: 'Source Package Is Trade Sample' },
        // { accessor: 'SourcePackageLabels', title: 'Source Package Labels' },
        // { accessor: 'SourceProcessingJobCount', title: 'Source Processing Job Count' },
        // { accessor: 'SourceProductionBatchNumbers', title: 'Source Production Batch Numbers' },
        // { accessor: 'UnitOfMeasureAbbreviation', title: 'Unit Of Measure Abbreviation' },
        // { accessor: 'UnitOfMeasureName', title: 'Unit Of Measure Name' },
        // { accessor: 'UseByDate', title: 'Use By Date' },
        // { accessor: 'createdAt', title: 'Created At' },
        // { accessor: 'dispensaryId', title: 'Dispensary ID' },
        // { accessor: 'id', title: 'ID' },
        // { accessor: 'itemAdministrationMethod', title: 'Item Administration Method' },
        // { accessor: 'itemAllergens', title: 'Item Allergens' },
        // { accessor: 'itemApprovalStatus', title: 'Item Approval Status' },
        // { accessor: 'itemApprovalStatusDateTime', title: 'Item Approval Status DateTime' },
        // { accessor: 'itemDefaultLabTestingState', title: 'Item Default Lab Testing State' },
        // { accessor: 'itemDescription', title: 'Item Description' },
        // { accessor: 'itemHasExpirationDate', title: 'Item Has Expiration Date' },
        // { accessor: 'itemHasSellByDate', title: 'Item Has Sell By Date' },
        // { accessor: 'itemHasUseByDate', title: 'Item Has Use By Date' },
        // { accessor: 'itemId', title: 'Item ID' },
        // { accessor: 'itemIsExpirationDateRequired', title: 'Item Is Expiration Date Required' },
        // { accessor: 'itemIsSellByDateRequired', title: 'Item Is Sell By Date Required' },
        // { accessor: 'itemIsUseByDateRequired', title: 'Item Is Use By Date Required' },
        // { accessor: 'itemIsUsed', title: 'Item Is Used' },
        // { accessor: 'itemItemBrandId', title: 'Item Brand ID' },
        // { accessor: 'itemItemBrandName', title: 'Item Brand Name' },
        // { accessor: 'itemLabTestBatchNames', title: 'Item Lab Test Batch Names' },
        // { accessor: 'itemLabelImages', title: 'Item Label Images' },
        // { accessor: 'itemLabelPhotoDescription', title: 'Item Label Photo Description' },
        // { accessor: 'itemName', title: 'Item Name' },
        // { accessor: 'itemNumberOfDoses', title: 'Item Number Of Doses' },
        // { accessor: 'itemPackagingImages', title: 'Item Packaging Images' },
        // { accessor: 'itemPackagingPhotoDescription', title: 'Item Packaging Photo Description' },
        // { accessor: 'itemProcessingJobCategoryName', title: 'Item Processing Job Category Name' },
        // { accessor: 'itemProductBrandName', title: 'Item Product Brand Name' },
        // { accessor: 'itemProductCategoryType', title: 'Item Product Category Type' },
        // { accessor: 'itemProductImages', title: 'Item Product Images' },
        // { accessor: 'itemProductPDFDocuments', title: 'Item Product PDF Documents' },
        // { accessor: 'itemProductPhotoDescription', title: 'Item Product Photo Description' },
        // { accessor: 'itemPublicIngredients', title: 'Item Public Ingredients' },
        // { accessor: 'itemQuantityType', title: 'Item Quantity Type' },
        // { accessor: 'itemServingSize', title: 'Item Serving Size' },
        // { accessor: 'itemStrainId', title: 'Item Strain ID' },
        // { accessor: 'itemStrainName', title: 'Item Strain Name' },
        // { accessor: 'itemUnitCbdContent', title: 'Item Unit CBD Content' },
        // { accessor: 'itemUnitCbdContentDose', title: 'Item Unit CBD Content Dose' },
        // { accessor: 'itemUnitCbdContentDoseUnitOfMeasureName', title: 'Item Unit CBD Content Dose Unit Of Measure Name' },
        // { accessor: 'itemUnitCbdContentUnitOfMeasureName', title: 'Item Unit CBD Content Unit Of Measure Name' },
        // { accessor: 'itemUnitCbdPercent', title: 'Item Unit CBD Percent' },
        // { accessor: 'itemUnitOfMeasureName', title: 'Item Unit Of Measure Name' },
        // { accessor: 'itemUnitQuantity', title: 'Item Unit Quantity' },
        // { accessor: 'itemUnitQuantityUnitOfMeasureName', title: 'Item Unit Quantity Unit Of Measure Name' },
        // { accessor: 'itemUnitThcContent', title: 'Item Unit THC Content' },
        // { accessor: 'itemUnitThcContentDose', title: 'Item Unit THC Content Dose' },
        // { accessor: 'itemUnitThcContentDoseUnitOfMeasureId', title: 'Item Unit THC Content Dose Unit Of Measure ID' },
        // { accessor: 'itemUnitThcContentDoseUnitOfMeasureName', title: 'Item Unit THC Content Dose Unit Of Measure Name' },
        // { accessor: 'itemUnitThcContentUnitOfMeasureName', title: 'Item Unit THC Content Unit Of Measure Name' },
        // { accessor: 'itemUnitThcPercent', title: 'Item Unit THC Percent' },
        // { accessor: 'itemUnitVolume', title: 'Item Unit Volume' },
        // { accessor: 'itemUnitVolumeUnitOfMeasureName', title: 'Item Unit Volume Unit Of Measure' },
        // { accessor: 'packageStatus', title: 'Package Status' },
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

            setIsRightBarShow(true)
        }
    }, [searchParams])

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
                    `fixed top-0  ${menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? sidebar == true ? 'left-[0px] w-[calc(100vw-515px)]' : 'left-[280px] w-[calc(100vw-780px)]' : 'left-[90px] w-[calc(100vw-590px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            } else {
                setTableClassName(
                    `fixed top-0 ${menu == 'horizontal' ? 'left-0 w-[calc(100vw)]' : menu == 'vertical' ? sidebar == true ? 'left-[0px] w-[calc(100vw-15px)]' : 'left-[280px] w-[calc(100vw-280px)]' : 'left-[90px] w-[calc(100vw-90px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-550px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-528px)]' : 'w-[calc(100vw-790px)]' : 'w-[calc(100vw-630px)]'} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-50px)]' : menu == 'vertical' ? sidebar == true ? 'w-[calc(100vw-50px)]' : 'w-[calc(100vw-310px)]' : 'w-[calc(100vw-120px)]'} duration-500 bounceInDown1`);
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
    }

    // const handleRefetchPakcageQuery = () => {
    //     allPakcageByPackagesByDispensaryIdWithPages.refetch();
    //     packageRowDataById.refetch()
    // }

    const handleRealtimeSearch = useDebouncedCallback((param) => {
        setSearchParam(param.trim());
        setSearchField(searchSelectValue);
        setSearchPackageStatus(searchPackageStatus)
        setSearchPage(1);
    }, 500);

    return (
        <div className={`mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center !mb-3">
                <h5 className="text-lg font-semibold dark:text-white-dark">Packages</h5>
                <div className={`absolute lg:flex items-center gap-2 lg:ltr:ml-auto rtl:mr-auto transition-all duration-500 ${isRightBarShow ? '!right-[508px]' : 'right-7'}`}>
                    {/* <Tippy content={`Synced by ${SyncHistoryData?.user.name}`} placement="top">
                        <button className="!flex items-center btn btn-primary border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-2 py-1.5 text-sm" onClick={syncPackageData}>
                            <MdOutlineSync className="text-xl mr-1" />
                            Synced {moment(SyncHistoryData?.createdAt).fromNow()}
                        </button>
                    </Tippy> */}
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
                    </select>
                    <select
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
                    </select>
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
                        <TableExport cols={cols} hideCols={hideCols} filename='package' query={query}
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
                                textAlignment: 'center',
                                render: (record) => <div className="flex items-center px-2">{record?.packageLabel?.slice(-10).toUpperCase()}</div>,
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
                                title: 'Package Status',
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
                                accessor: 'assignPackage.cost',
                                title: 'Cost',
                                sortable: true,
                                hidden: hideCols.includes('cost'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { assignPackage } = row;

                                    return (
                                        <div>
                                            {'$' + truncateToTwoDecimals(assignPackage?.cost)}
                                        </div>
                                    );
                                }
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

                                    return (
                                        <div>
                                            {truncateToTwoDecimals(assignPackage?.posQty)}
                                        </div>
                                    );
                                }
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
                                accessor: 'originalQty',
                                title: 'Original Qty',
                                sortable: true,
                                hidden: hideCols.includes('originalQty'),
                            },
                            {
                                accessor: 'itemName',
                                title: 'Metrc Name',
                                sortable: true,
                                hidden: hideCols.includes('itemName'),
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
                            {
                                accessor: 'packageId',
                                title: 'Metrc ID',
                                sortable: true,
                                hidden: hideCols.includes('packageId'),
                            },
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
                            {
                                accessor: 'itemUnitWeight',
                                title: 'Metrc Unit Weight',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { itemUnitWeight, itemUnitWeightUnitOfMeasureName } = row;

                                    if (itemUnitWeight === null || itemUnitWeightUnitOfMeasureName === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return (
                                        <div>
                                            {itemUnitWeight} {itemUnitWeightUnitOfMeasureName}
                                        </div>
                                    );
                                },
                                hidden: hideCols.includes('itemUnitWeight'),
                            },
                            {
                                accessor: 'updatedAt',
                                title: 'Synced At',
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
                                hidden: hideCols.includes('updatedAt'),
                            },
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
                            {
                                accessor: 'ReceivedDateTime',
                                title: 'Received Date',
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
                                <LoadingSkeleton />
                                : <div className="flex flex-col items-center px-3">
                                    <div className='w-full flex justify-between items-center'>
                                        <div className="w-full text-xl font-semibold text-dark dark:text-white-dark py-2 text-left">Package Details</div>
                                    </div>
                                    {/* <Suspense fallback={<RightSideBarSkeletonLoading/>}> */}
                                    <PackageCard packageLabel={packageId} packageData={packageDataById} isLoading={packageRowDataById.isLoading || packageRowDataById.isFetching} handleActivePackage={handleActivePackage} handleHoldPackage={handleHoldPackage} handleFinishPakcage={handleFinishPakcage} onAdjustPackage={handleOnAdjustPackage} handleFetchTestResult={handleFetchTestResult} handleRefetchPackage={handleOnAdjustPackage} />
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

export default PackageTable;
