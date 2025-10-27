'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

import { useAllTaxSettingByDispensaryIdQuery, useDeleteTaxSettingMutation } from '@/src/__generated__/operations';
import TaxSettingModal from '@/components/modals/taxSettingModal';
import { useQueryClient } from '@tanstack/react-query';

import Swal from 'sweetalert2';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns } from 'react-icons/bs';
import IconPlus from '@/components/icon/icon-plus';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import warnAlert from '../notification/warnAlert';
import { userDataSave } from '@/store/userData';
import ProductCategory from '../etc/productCategory';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import ExportTable from '../etc/exportTable';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import TableLoading from '../etc/tableLoading';
type ProductCategory = {
    value: string;
    label: string;
    color: string;
};

type RowDataType = {
    id: string;
    name: string;
    rate: number;
    categories: Array<ProductCategory>;
    compoundTaxes: Array<string>;
    isExcludeFromRecreational: boolean;
    isExcludeFromTaxExempt: boolean;
    applyTo: string;
    createdAt: string;
    updatedAt: string;
};
type RowData = RowDataType[];

const applyToTax = (applyTo: string) => {
    switch (applyTo) {
        case 'ALL':
            return 'All Products';
        case 'MJ':
            return 'MJ Products';
        case 'NMJ':
            return 'Non-MJ Products';
        default:
            return '-';
    }
};

const spanColor = 'blue';
const TaxSettingTable = () => {
    const queryClient = useQueryClient();
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;

    const deleteTaxSettingMutation = useDeleteTaxSettingMutation();

    const allTaxSettingByDispensaryId = useAllTaxSettingByDispensaryIdQuery({ dispensaryId: dispensaryId });

    const taxSettingData = allTaxSettingByDispensaryId.data?.allTaxSettingByDispensaryId;

    const handleDeleteTaxSetting = async (id: string, name: string) => {
        await deleteTaxSettingMutation.mutate(
            {
                id: id,
                dispensaryId: dispensaryId
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllTaxSettingByDispensaryId']);
                    };
                    refetch();
                    Swal.fire({ title: 'Deleted!', text: name + ' has been deleted.', icon: 'success', customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white' });
                },
                onSettled() {},
            }
        );
    };

    const deleteAlert = async (id: string, name: string) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then((result) => {
            if (result.value) {
                handleDeleteTaxSetting(id, name);
            } else {
            }
        });
    };

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    //@ts-expect-error
    const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(taxSettingData, 'name'));
    const [recordsData, setRecordsData] = useState(initialRecords.slice(0, pageSize));
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>(['createdAt', 'updatedAt', 'locationAddress']);

    const [modalShow, setModalShow] = useState(false);
    const [modalMode, setModalMode] = useState('new');

    const [currentTaxSetting, setCurrentTaxSetting] = useState<RowDataType>({
        id: '',
        name: '',
        rate: 0,
        categories: [],
        applyTo: 'ALL',
        compoundTaxes: [],
        isExcludeFromRecreational: false,
        isExcludeFromTaxExempt: false,
        createdAt: '',
        updatedAt: '',
    });

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        if (initialRecords) setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        if (taxSettingData) {
            //@ts-expect-error
            setInitialRecords(() => {
                return taxSettingData?.filter((item) => {
                    return (
                        item?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.rate?.toString().includes(search.toLowerCase()) ||
                        item?.applyTo?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.createdAt.toString().includes(search.toLowerCase()) ||
                        item?.updatedAt.toString().includes(search.toLowerCase())
                    );
                });
            });
        }
    }, [search, taxSettingData]);
    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
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

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const handleNewTaxSetting = () => {
        setModalMode('new');
        setModalShow(true);
        setCurrentTaxSetting({
            id: '',
            name: '',
            rate: 0,
            categories: [],
            compoundTaxes: [],
            isExcludeFromRecreational: false,
            isExcludeFromTaxExempt: false,
            applyTo: 'ALL',
            createdAt: '',
            updatedAt: '',
        });
    };

    const cols = [
        { accessor: 'name', title: 'Name' },
        { accessor: 'rate', title: 'Rate(%)' },
        { accessor: 'applyTo', title: 'Apply To' },
        { accessor: 'createdAt', title: 'CreatedAt' },
        { accessor: 'updatedAt', title: 'UpdatedAt' },
    ];

    return (
        <div className={`panel mt-6 !pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-dark">Tax</h5>
                <div className="lg:flex items-center gap-5 lg:ltr:ml-auto rtl:mr-auto">
                    <div>
                        <button type="button" onClick={handleNewTaxSetting} className="btn btn-primary rounded-full py-1.5 px-3 !text-sm">
                            <IconPlus className="h-5 w-5 shrink-0 ltr:mr-1.5 rtl:ml-1.5" />
                            New
                        </button>
                    </div>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
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
                                                            defaultValue={col.accessor}
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
                        <ExportTable cols={cols} recordsData={recordsData} hideCols={hideCols} filename='taxSetting_table_data'/>
                    </div>
                    <div className="text-right">
                        <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="datatables">
                <DataTable
                    className="table-hover whitespace-nowrap"
                    records={recordsData ?? []}
                    fetching={allTaxSettingByDispensaryId.isLoading || allTaxSettingByDispensaryId.isFetching}
                    loaderBackgroundBlur={80}
                    customLoader={<TableLoading text="Loading Product Data..." />}
                    columns={[
                        {
                            accessor: 'index',
                            title: '#',
                            width: 40,
                            render: (record) => (initialRecords ? initialRecords.indexOf(record) + 1 : 0),
                        },
                        {
                            accessor: 'id',
                            title: 'ID',
                            sortable: true,
                            hidden: true,
                        },
                        {
                            accessor: 'name',
                            title: 'Name',
                            sortable: true,
                            hidden: hideCols.includes('name'),
                        },
                        {
                            accessor: 'rate',
                            title: 'Rate(%)',
                            sortable: true,
                            hidden: hideCols.includes('rate'),
                        },
                        {
                            accessor: 'applyTo',
                            title: 'Apply To',
                            sortable: true,
                            hidden: hideCols.includes('applyTo'),
                            render: ({ applyTo, categories }) =>
                                applyTo === 'CATEGORY' ? (
                                    // <div className= 'text-blue-800 dark:text-blue-300'>
                                    // 	{categories.map((option, index) => (<span key = {index} className="ml-1 mr-2 bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{option.label}</span>))}
                                    // </div>
                                    <div className="flex items-center">
                                        {categories.map((option, index) => (
                                            <ProductCategory key={index} name={option.label} color={option.color} />
                                        ))}
                                    </div>
                                ) : (
                                    // <div className="flex items-center">
                                    // <div className="btn text-white h-5 text-xs border-none" style={{ backgroundColor: itemCategory.color }}>
                                    // 	{itemCategory.name}
                                    // </div>
                                    // </div>
                                    <span>{applyToTax(applyTo)}</span>
                                ),
                            // <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">{applyToTax(applyTo)}</span>,
                        },
                        {
                            accessor: 'createdAt',
                            title: 'Created At',
                            sortable: true,
                            render: ({ createdAt }) => <div>{convertPSTTimestampToTimezone(createdAt, userData.storeTimeZone)}</div>,
                            hidden: hideCols.includes('createdAt'),
                        },
                        {
                            accessor: 'updatedAt',
                            title: 'Updated At',
                            sortable: true,
                            render: ({ updatedAt }) => <div>{convertPSTTimestampToTimezone(updatedAt, userData.storeTimeZone)}</div>,
                            hidden: hideCols.includes('updatedAt'),
                        },
                        {
                            accessor: 'action',
                            title: 'Action',
                            sortable: false,
                            render: ({ id, name, rate, categories, compoundTaxes, isExcludeFromRecreational, isExcludeFromTaxExempt, applyTo, createdAt, updatedAt }) => (
                                <div>
                                    <Tippy content="Edit">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModalMode('update');
                                                setCurrentTaxSetting({ id, name, rate, categories,compoundTaxes, isExcludeFromRecreational, isExcludeFromTaxExempt, applyTo, createdAt, updatedAt });
                                                setModalShow(true);
                                            }}
                                        >
                                            <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                        </button>
                                    </Tippy>
                                    <Tippy content="Delete">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                deleteAlert(id, name);
                                            }}
                                        >
                                            <IconTrashLines />
                                        </button>
                                    </Tippy>
                                </div>
                            ),
                        },
                    ]}
                    highlightOnHover
                    totalRecords={initialRecords?.length ?? 0}
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
            <TaxSettingModal setModalShow={setModalShow} modalShow={modalShow} modalMode={modalMode} currentTaxSetting={currentTaxSetting} dispensaryId={dispensaryId} />
        </div>
    );
};

export default TaxSettingTable;
