'use client';

// Import Third-Party Library
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { useAtom } from 'jotai';
import { spinnerAtom } from '@/store/spinnerStatus';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import moment from 'moment';
import { Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Swal from 'sweetalert2';
import Dropdown from '@/components/dropdown';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

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
    useGetZeroMetrcQtyPackagesByDispensaryIdQuery,
    useFinishZeroPackageMutation
} from '@/src/__generated__/operations';

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
import TableLoading from '../etc/tableLoading';
import { useDebouncedCallback } from 'use-debounce';
import { syncStatusAtom } from '@/store/syncStatusAtom';

type RowDataType = generatedTypes.Package;
type RowData = (RowDataType | null)[];

const FinishPackageTable = () => {
    const queryClient = useQueryClient();
    const currentDate = new Date().toISOString().split('T')[0];
    const [spinnerStatus, setSpinnerStatus] = useAtom(spinnerAtom);
    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;
    const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);
    // const allItemCategoriesByDispensaryId = useAllItemCategoriesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    // const itemCategories = allItemCategoriesByDispensaryId.data?.allItemCategoriesByDispensaryId;

    // const deletePackageMutation = useDeletePackageMutation();
    const allPackagesByDispensaryId = useAllPackagesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const PackageData = allPackagesByDispensaryId.data?.allPackagesByDispensaryId;

    // Mutation
    const finishZeroPackageMutation = useFinishZeroPackageMutation();

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

    // for the pagination
    const [searchSelectValue, setSearchSelectValue] = useState('assignPackage.product.name');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('assignPackage.product.name');
    const [searchParam, setSearchParam] = useState('');
    const [searchPage, setSearchPage] = useState(1);
    const [searchPageSize, setSearchPageSize] = useState(PAGE_SIZES[0]);

    // const [page, setPage] = useState(1);
    // const PAGE_SIZES = [10, 20, 30, 50, 100];
    // const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    // Fetch data
    // const allPakcageByPackagesByDispensaryIdWithPages = useAllPackagesByDispensaryIdWithPagesQuery({
    //     dispensaryId: dispensaryId,
    //     pageNumber: page,
    //     onePageRecords: pageSize,
    //     searchField: searchField,
    //     searchParam: searchParam,
    // });
    
    const getZeroMetrcQtyPackages = useGetZeroMetrcQtyPackagesByDispensaryIdQuery({
        dispensaryId: dispensaryId,
        pageNumber: searchPage,
        onePageRecords: searchPageSize,
        searchField: searchField,
        searchParam: searchParam,
        sortField: sortStatus.columnAccessor,
        sortDirection: sortStatus.direction,

    });
    // const getZeroMetrcQtyPackagesData = getZeroMetrcQtyPackages.data?.getZeroMetrcQtyPackagesByDispensaryId;
    const packageData1 = getZeroMetrcQtyPackages.data?.getZeroMetrcQtyPackagesByDispensaryId?.packages ?? [];
    const totalCount = getZeroMetrcQtyPackages.data?.getZeroMetrcQtyPackagesByDispensaryId?.totalCount;

    // Mutation
    const finishPackageMutation = useFinishPackageMutation();

    const [hideCols, setHideCols] = useState<any>(['']);

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

    useEffect(() => {
        if(syncStatus) {
            getZeroMetrcQtyPackages.refetch();
        }
    }, [syncStatus])

    const cols = [
        { accessor: 'id', title: 'PackageID' },
        { accessor: 'assginPackage.product.name', title: 'Product' },
        { accessor: 'packageId', title: 'Metrc Id' },
        { accessor: 'packageLabel', title: 'Package Label' },
        { accessor: 'createdAt', title: 'CreatedAt' },
        { accessor: 'packageStatus', title: 'Package Status' },
        { accessor: 'assignPackage.postQty', title: 'Current Qty' },
        { accessor: 'assignPackage.cost', title: 'Cost' },
        // { accessor: 'ExpirationDate', title: 'Expiration Date' },
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
        setSearchPage(page)
        setSearchPageSize(pageSize)
    },[page, pageSize])

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
                    `fixed top-0  ${menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? 'left-[280px] w-[calc(100vw-780px)]' : 'left-[90px] w-[calc(100vw-590px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            } else {
                setTableClassName(
                    `fixed top-0 ${menu == 'horizontal' ? 'left-0 w-[calc(100vw)]' : menu == 'vertical' ? 'left-[280px] w-[calc(100vw-280px)]' : 'left-[90px] w-[calc(100vw-90px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-550px)]' : menu == 'vertical' ? 'w-[calc(100vw-793px)]' : 'w-[calc(100vw-620px)]'} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-70px)]' : menu == 'vertical' ? 'w-[calc(100vw-310px)]' : 'w-[calc(100vw-120px)]'} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow, menu]);

    // const handleHoldPackage = async () => {
    //     await holdPackageMutation.mutate(
    //         {
    //             input: {
    //                 id: packageDataById?.id || "",
    //             }
    //         },
    //         {
    //             onError(error) {
    //                 warnAlert("Pakcage Hold Failed");
    //             },
    //             onSuccess(data) {
    //                 successAlert("Package Hold Successfully");
    //             }
    //         }
    //     )
    // }
    const handleSearch = (param?: string) => {
        setSearchField(searchSelectValue);
        if(param){
            setSearchParam(param.trim());
        }else{
            setSearchParam(searchValue.trim());
        }
        setSearchPage(1);
    };

    const handleRealtimeSearch = useDebouncedCallback((param) => {
        setSearchParam(param.trim());
        setSearchField(searchSelectValue);
        setSearchPage(1);
    }, 500);

    const handleFinishPackage = (id: string) => {
        Swal.fire({
            icon: 'warning',
            title: 'Finish Package?',
            text: "Are you going to really finish this package?",
            showCancelButton: true,
            confirmButtonText: 'Finish',
            padding: '2em',
            customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then((result) => {
            if (result.value) {
                finishPackageMutation.mutate(
                    {
                        input: {
                            id: id,
                        },
                    },
                    {
                        onError(error) {
                            if (error) {
                                warnAlert(error.message);
                            } else {
                                warnAlert('Package Finish Failed');
                            }
                        },
                        onSuccess(data) {
                            successAlert('Package Finish Success');
                            getZeroMetrcQtyPackages.refetch()
                        },
                    }
                );
            }
        });
    };
    const handleFinishAllPackage = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Finish All Packages?',
            text: "Are you going to really finish All packages?",
            showCancelButton: true,
            confirmButtonText: 'Finish All',
            padding: '2em',
            customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then((result) => {
            if (result.value) {
                finishZeroPackageMutation.mutate(
                    {
                        dispensaryId: dispensaryId,
                    },
                    {
                        onError(error) {
                            if (error) {
                                warnAlert(error.message);
                            } else {
                                warnAlert('Package Finish Failed');
                            }
                        },
                        onSuccess(data) {
                            successAlert('All Packages Finished Successfully');
                            getZeroMetrcQtyPackages.refetch()
                        },
                    }
                );
            }
        });
    };

    return (
        <div className={`mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center !mb-3">
                <h5 className="text-lg font-semibold dark:text-white-dark">Finish Packages</h5>
                <div className={`absolute lg:flex items-center gap-2 lg:ltr:ml-auto rtl:mr-auto transition-all duration-500 ${isRightBarShow ? '!right-[508px]' : 'right-7'}`}>
                    {/* <Tippy content="Metrc Sync" placement="top">
                        <button
                            className="!flex items-center btn btn-primary border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-2 py-2 text-sm"
                            onClick={syncPackageData}
                        >
                            <MdOutlineSync className="text-xl mr-1" />
                            {"6"} days ago Synced
                        </button>
                    </Tippy> */}
                    <button
                            className="!flex items-center btn btn-primary border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-2 py-2 text-sm"
                            onClick={handleFinishAllPackage}
                        >
                            Finish All
                    </button>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <RefreshButton onClick={() => getZeroMetrcQtyPackages.refetch()} />
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
                        <ExportTable cols={cols} recordsData={PackageData} hideCols={hideCols} filename='finishPackage_table_data'/>
                    </div>
                    <div className="text-right flex justify-start items-center">
                        <select
                            onChange={(e) => {
                                setSearchSelectValue(e.target.value);
                                setSearchPage(1)
                            }}
                            id="currentDispensary"
                            className="flex-initial w-44 form-select text-white-dark rounded-r-none"
                            value={searchSelectValue}
                        >
                            <option value="assignPackage.product.name">Product Name</option>
                            <option value="packageLabel">Package Label</option>
                            <option value="metrcType">Metrc Type</option>
                            <option value="packageId">Metrc Id</option>
                        </select>
                        {searchSelectValue == 'metrcType' ? 
                        <select
                            onChange={(e) => {
                                setSearchPage(1)
                                handleSearch(e.target.value)
                            }}
                            id="currentDispensary"
                            className="w-44 form-select text-white-dark rounded-l-none"
                        >
                            <option value="All">All</option>
                            <option value="MJ">MJ</option>
                            <option value="NMJ">NMJ</option>
                        </select>
                        :<input type="text" className="form-input !rounded-none w-44" placeholder="Search..." value={searchValue} onChange={(e) => {
                            setSearchValue(e.target.value)
                            handleRealtimeSearch(e.target.value)
                        }} />}
                        <button
                            onClick={() => handleSearch()}
                            className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 py-3  font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                        >
                            <IoSearch />
                        </button>
                    </div>
                </div>
            </div>
            <div className="datatables w-full overflow-x-auto">
                <div className={`transition-transform duration-300`} ref={targetRef}>
                    <DataTable
                        highlightOnHover
                        className={`table-hover whitespace-nowrap data-table ${tableClassname}`}
                        fetching={getZeroMetrcQtyPackages.isLoading || getZeroMetrcQtyPackages.isFetching}
                        loaderBackgroundBlur={80}
                        customLoader={<TableLoading text="Loading Product Data..." />}
                        records={packageData1 ?? []}
                        columns={[
                            {
                                accessor: 'index',
                                title: '#',
                                width: 40,
                                render: (record) => (packageData1 ? (page - 1) * pageSize + packageData1.indexOf(record) + 1 : 0),
                            },
                            {
                                accessor: 'packageLabel',
                                title: 'Package Label',
                                sortable: true,
                                hidden: hideCols.includes('packageLabel'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { packageLabel, packageId } = row;
                                    return (packageId && Number(packageId) > 0) ? 
                                    <div className="flex items-center gap-2">
                                        <span className="">{packageLabel}</span>
                                        <span className="bg-success-light text-success dark:bg-success-dark-light text-xs p-1 rounded-md">MJ</span>
                                    </div> 
                                    : 
                                    <span className="">{packageLabel?.toString().toUpperCase().slice(-10)}</span>;
                                },
                            },
                            {
                                accessor: 'assignPackage.product.name',
                                title: 'Product',
                                sortable: true,
                                hidden: hideCols.includes('assignPackage.product.name'),
                            },
                            {
                                accessor: 'packageId',
                                title: 'Metrc Id',
                                sortable: true,
                                hidden: hideCols.includes('packageId'),
                            },
                            {
                                accessor: 'packageStatus',
                                title: 'Package Status',
                                sortable: true,
                                render: (record) => {
                                    if (!record) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { packageStatus } = record;

                                    return <PackageStatusBadge packageStatus={packageStatus} />;
                                },
                                hidden: hideCols.includes('packageStatus'),
                            },
                            {
                                accessor: 'Quantity',
                                title: 'Metrc Qty',
                                sortable: true,
                                // hidden: hideCols.includes('assignPackage.posQty'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { assignPackage, Quantity, packageId} = row;
                                    if(packageId && packageId > 0){
                                        return (
                                            <div>
                                                {Quantity} {assignPackage?.product?.productUnitOfMeasure}
                                            </div>
                                        );
                                    }else{
                                        return (
                                            <div>
                                                Non-MJ
                                            </div>
                                        );
                                    }
                                    
                                },
                            },
                            {
                                accessor: 'assignPackage.posQty',
                                title: 'Current Qty',
                                sortable: true,
                                hidden: hideCols.includes('assignPackage.posQty'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { assignPackage} = row;

                                    return (
                                        <div>
                                            {assignPackage?.posQty} {assignPackage?.product?.productUnitOfMeasure}
                                        </div>
                                    );
                                },
                            },
                            {
                                accessor: 'assignPackage.cost',
                                title: 'Cost',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { assignPackage} = row;

                                    return (
                                        <div>
                                            ${assignPackage?.cost}
                                        </div>
                                    );
                                },
                            },
                            {
                                accessor: 'createdAt',
                                title: 'CreatedAt',
                                sortable: true,
                                hidden: hideCols.includes('createdAt'),
                                render: (record) => {
                                    if (!record) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { createdAt } = record;

                                    return moment(createdAt).fromNow();
                                },
                            },
                            {
                                accessor: 'action',
                                title: 'Action',
                                sortable: false,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { id } = row;
                                    return (
                                        <button className="btn btn-sm btn-primary" onClick={() => handleFinishPackage(id)}>
                                            Finish
                                        </button>
                                    );
                                },
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
                            if (record == null) {
                                return null;
                            }
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
                            <div className="flex flex-col items-center px-3">
                                <div className="w-full text-xl font-semibold text-dark dark:text-white-dark py-2 text-left">Package Details</div>
                                {/* <Suspense fallback={<RightSideBarSkeletonLoading/>}> */}
                                <PackageCard packageData={packageDataById} isLoading={packageRowDataById.isLoading || packageRowDataById.isFetching} />
                                {/* </Suspense> */}
                            </div>
                        </PerfectScrollbar>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FinishPackageTable;
