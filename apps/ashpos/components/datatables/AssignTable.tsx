'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import sortBy from 'lodash/sortBy';
import { useAtom } from 'jotai';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { spinnerAtom } from '@/store/spinnerStatus';
import { useDebouncedCallback } from 'use-debounce';

import {
    useAllPackagesByDispensaryIdQuery,
    usePackagesByDispensaryIdAndStatusQuery,
    useGetProductRowsByNameSearchQuery,
    useMetrcConnectUpdateMutation,
    useImportMetrcPackageMutation,
    useAssignPackageToProductMutation,
} from '@/src/__generated__/operations';
// import PackageRegisterModal from '../modals/PackageRegisterModal';
import { useQueryClient } from '@tanstack/react-query';

import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns } from 'react-icons/bs';
import IconPlus from '@/components/icon/icon-plus';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrashLines from '@/components/icon/icon-trash-lines';

// import PackageCategory from '../etc/PackageCategory';

import Swal from 'sweetalert2';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import { userDataSave } from '@/store/userData';
import { DeepPartial } from '@/store/deepPartialType';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import PerfectScrollbar from 'react-perfect-scrollbar';

import * as generatedTypes from '@/src/__generated__/operations';
import ExportTable from '../etc/exportTable';
import { GrConnect } from 'react-icons/gr';
import { TbPlugConnected } from 'react-icons/tb';
import { MdOutlineSync } from 'react-icons/md';

import CustomSelect from '../etc/customeSelect';
import { assign } from 'lodash';
import TableLoading from '../etc/tableLoading';
import { truncateToTwoDecimals } from '@/lib/utils';

import { Store } from 'react-notifications-component';

type RowDataType = generatedTypes.Package;
type RowData = RowDataType[] | null;

const AssignTable = () => {
    const queryClient = useQueryClient();

    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;
    const [productAssignModal, setProductAssignModal] = useState(false);
    const [searchParam, setSearchParam] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [currentPackage, setCurrentPackage] = useState({
        packageId: '',
        packageLabel: '',
        packageName: '',
        quantity: '',
    });
    const [currentProduct, setCurrentProduct] = useState<any>({});
    const [quantity, setQuantity] = useState(0);
    const [costPerUnit, setCostPerUnit] = useState(0);
    const [showProduct, setShowProduct] = useState(true);
    const [spinnerStatus, setSpinnerStatus] = useAtom(spinnerAtom);

    const assignPackage = useAssignPackageToProductMutation();
    const importPackageMutation = useImportMetrcPackageMutation();
    const allPackagesByDispensaryId = usePackagesByDispensaryIdAndStatusQuery({ dispensaryId: dispensaryId, status: 'PENDING' });
    const PackageData = allPackagesByDispensaryId.data?.packagesByDispensaryIdAndStatus;
    const allProductsByDispensaryId = useGetProductRowsByNameSearchQuery({ dispensaryId: dispensaryId, searchQuery: searchParam });
    const productData = allProductsByDispensaryId.data?.getProductRowsByNameSearch;

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });
    const [hideCols, setHideCols] = useState<any>([]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const recordsData = React.useMemo(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        const tempData = PackageData ? [...sortBy(PackageData, sortStatus.columnAccessor).slice(from, to)] : [];
        if (sortStatus.direction === 'desc') tempData.reverse();
        return tempData;
    }, [PackageData, page, pageSize, sortStatus]);

    React.useEffect(() => {
        setPage(1);
    }, [sortStatus]);

    // useEffect(() => {
    //     const from = (page - 1) * pageSize;
    //     const to = from + pageSize;
    //     if (initialRecords) setRecordsData([...initialRecords.slice(from, to)]);
    // }, [page, pageSize, initialRecords]);

    // useEffect(() => {
    //     const data = sortBy(initialRecords, sortStatus.columnAccessor);
    //     setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    //     setPage(1);
    // }, [sortStatus]);
    const handleSearch = useDebouncedCallback((param) => {
        setSearchParam(param.trim());
    }, 500);
    
    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const syncPackageData = async () => {
        setSpinnerStatus({
            isLoading: true,
            text: 'Package Data Synchronizing...',
        });
        await importPackageMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    userId: userId,
                },
            },
            {
                onError(error) {
                    setSpinnerStatus({});
                    warnAlert('Synchronization failed');
                },
                onSuccess(data) {
                    setSpinnerStatus({});
                    if (data.importMetrcPackage?.count || data.importMetrcPackage?.count == 0 ? data.importMetrcPackage?.count >= 0 : false) successAlert(data.importMetrcPackage?.count + ' Packages added');
                    else warnAlert('Synchronization failed');
                },
                onSettled() {
                    // setIsSaveButtonDisabled(false);
                },
            }
        );
    };
    const handleAssignPackage = async () => {
        await assignPackage.mutate(
            {
                input: {
                    cost: Number(truncateToTwoDecimals(costPerUnit)),
                    dispensaryId: dispensaryId,
                    productId: currentProduct.id,
                    quantity: Number(truncateToTwoDecimals(quantity)),
                    userId: userId,
                    packageLabel: currentPackage.packageLabel,
                    // metrcTransferId: 0,
                    transferId: currentPackage.packageId,
                },
            },
            {
                onError(error) {
                    setSpinnerStatus({});
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    // successAlert('Package Assign Success.');
                    Store.addNotification({
                        title: "Success",
                        message: `Package Assign Success!`,
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
                },
                onSettled() {
                    // setIsSaveButtonDisabled(false);
                },
            }
        );
    };

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };
    const cols = [
        { accessor: 'itemName', title: 'Metrc Name' },
        { accessor: 'itemProductCategoryName', title: 'Metrc Category Name' },
        { accessor: 'itemProductCategoryType', title: 'Metrc Category Type' },
        { accessor: 'Quantity', title: 'Metrc Qty' },
        { accessor: 'Label', title: 'Metrc Tag' },
        { accessor: 'itemStrainName', title: 'Metrc Strain Name' },
        { accessor: 'packageId', title: 'Metrc ID' },
        { accessor: 'UnitOfMeasureAbbreviation', title: 'Unit Of Measure Abbreviation' },
        { accessor: 'action', title: 'Action' },
    ];

    return (
        <div className={`panel mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-dark">Assign Packages</h5>
                <div className="lg:flex items-center gap-5 lg:ltr:ml-auto rtl:mr-auto">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                        <button className="btn btn-primary" onClick={syncPackageData}>
                            <MdOutlineSync className="text-lg mr-2" />
                            Sync
                        </button>
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
                        <ExportTable cols={cols} recordsData={recordsData} hideCols={hideCols} filename='assign_table_data'/>
                    </div>
                    <div className="text-right">
                        <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <div className="datatables">
                <DataTable
                    highlightOnHover
                    className="table-hover whitespace-nowrap"
                    records={recordsData ?? []}
                    fetching={allPackagesByDispensaryId.isLoading || allPackagesByDispensaryId.isFetching}
                    columns={[
                        {
                            accessor: 'index',
                            title: '#',
                            width: 40,
                            render: (record) => (recordsData ? recordsData.indexOf(record) + 1 : 0),
                        },
                        {
                            accessor: 'id',
                            title: 'ID',
                            sortable: true,
                            hidden: true,
                        },
                        {
                            accessor: 'itemName',
                            title: 'Metrc Name',
                            sortable: true,
                            hidden: hideCols.includes('itemName'),
                        },
                        {
                            accessor: 'itemProductCategoryName',
                            title: 'Metrc Category Name',
                            sortable: true,
                            hidden: hideCols.includes('itemProductCategoryName'),
                        },
                        {
                            accessor: 'itemProductCategoryType',
                            title: 'Metrc Category Type',
                            sortable: true,
                            hidden: hideCols.includes('itemProductCategoryType'),
                        },
                        {
                            accessor: 'Quantity',
                            title: 'Metrc Qty',
                            sortable: true,
                            render: ({ UnitOfMeasureAbbreviation, Quantity }: any) => (
                                <div>
                                    {Quantity} {UnitOfMeasureAbbreviation === 'g' ? 'g' : 'Items'}
                                </div>
                            ),
                            hidden: hideCols.includes('Quantity'),
                        },
                        {
                            accessor: 'Label',
                            title: 'Metrc Tag',
                            sortable: true,
                            hidden: hideCols.includes('Label'),
                        },
                        {
                            accessor: 'itemStrainName',
                            title: 'Metrc Strain Name',
                            sortable: true,
                            hidden: hideCols.includes('itemStrainName'),
                        },
                        {
                            accessor: 'packageId',
                            title: 'Metrc ID',
                            sortable: true,
                            hidden: hideCols.includes('packageId'),
                        },
                        {
                            accessor: 'action',
                            title: 'Assign',
                            sortable: false,
                            hidden: hideCols.includes('action'),
                            render: ({ id, itemName, Label, Quantity, UnitOfMeasureAbbreviation, packageLabel }: any) => (
                                <div>
                                    <Tippy content="Assign">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setProductAssignModal(true);
                                                setShowProduct(true);
                                                setCurrentPackage({
                                                    packageId: Label || '',
                                                    packageLabel: packageLabel,
                                                    packageName: itemName || '',
                                                    quantity: Quantity + ' ' + (UnitOfMeasureAbbreviation === 'g' ? 'g' : 'Items'),
                                                });
                                            }}
                                        >
                                            <GrConnect />
                                        </button>
                                    </Tippy>
                                </div>
                            ),
                        },
                    ]}
                    loaderBackgroundBlur={80}
                    customLoader={<TableLoading text="Loading Product Data..." />}
                    totalRecords={PackageData?.length ?? 0}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
            <div className="mb-5">
                <Transition appear show={productAssignModal} as={Fragment}>
                    <Dialog as="div" open={productAssignModal} onClose={() => setProductAssignModal(true)}>
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
                                    <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-dark dark:text-white-dark">
                                        <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                            <div className="font-bold text-lg">
                                                <div>
                                                    {currentPackage.packageId} <span className="text-[#4361ee]">{currentPackage.quantity}</span>
                                                </div>
                                                <div className="text-dark dark:text-white-dark">{currentPackage.packageName}</div>
                                            </div>
                                            <button type="button" onClick={() => setProductAssignModal(false)} className="text-dark dark:text-white-dark hover:text-dark"></button>
                                            <hr></hr>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex flex-col items-center">
                                                <div className="w-full mb-3">
                                                    <label htmlFor="product">Product</label>
                                                    <div className="relative border-[1] border-gray-300 rounded-md">
                                                        <input
                                                            type="text"
                                                            value={searchValue}
                                                            placeholder="Select a product"
                                                            className="peer w-full form-input"
                                                            onChange={(e) => {
                                                                handleSearch(e.target.value);
                                                                setSearchValue(e.target.value);
                                                            }}
                                                            onFocus={() => setShowProduct(true)}
                                                        ></input>
                                                        {!showProduct ? null : (
                                                            <div className="absolute top-[100%] left-0 w-full border-[1px] border-gray-200 h-[200px] flex-col items-center hidden peer-focus:block hover:block dark:border-[#1d2c46]">
                                                                <PerfectScrollbar className="overflow-y-auto">
                                                                    {productData?.map((item, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="w-full flex justify-between items-center bg-white shadow-md shadow-gray-200  px-2 py-2 cursor-pointer hover:bg-gray-100 dark:bg-[#121c2c] dark:hover:bg-[#18253a]  dark:shadow-[#11161d]"
                                                                            onClick={() => {
                                                                                setCurrentProduct(item);
                                                                                setSearchValue(item?.name || '');
                                                                                setShowProduct(false);
                                                                            }}
                                                                        >
                                                                            <span>{item?.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </PerfectScrollbar>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-full mb-3">
                                                    <label htmlFor="Quantity">Quantity</label>
                                                    <input id="Quantity" type="text" placeholder="Quantity" className="form-input" onChange={(e) => setQuantity(Number(e.target.value))} />
                                                </div>
                                                <div className="mb-5 w-full">
                                                    <label htmlFor="costPerUnit">Cost per Unit</label>
                                                    <div className="flex">
                                                        <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                            $
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Cost per Unit"
                                                            className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                                                            onChange={(e) => setCostPerUnit(Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" onClick={() => setProductAssignModal(false)} className="mr-2 btn btn-secondary">
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProductAssignModal(false);
                                                        handleAssignPackage();
                                                    }}
                                                    className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                                >
                                                    Assign
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

export default AssignTable;
