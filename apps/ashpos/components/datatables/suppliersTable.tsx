'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

import { useAllOrganizationsQuery, useDeleteSupplierMutation, useAllSuppliersByOrganizationIdQuery } from '@/src/__generated__/operations';
import SupplierRegisterModal from '../modals/supplierRegisterModal';
import { useQueryClient } from '@tanstack/react-query';

import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns } from 'react-icons/bs';
import IconPlus from '@/components/icon/icon-plus';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrashLines from '@/components/icon/icon-trash-lines';

import Swal from 'sweetalert2';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import { userDataSave } from '@/store/userData';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import ExportTable from '../etc/exportTable';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import RefreshButton from '../etc/refreshButton';
import TableLoading from '../etc/tableLoading';

type RowDataType = {
    id: string;
    name: string;
    isActive: boolean;
    supplierType: string;
    businessLicense: string;
    UBI: string;
    phone: string;
    email: string;
    locationAddress: string;
    locationCity: string;
    locationState: string;
    locationZipCode: string;
    createdAt: string;
    updatedAt: string;
};
type RowData = RowDataType[];

const SuppliersTable = () => {
    const queryClient = useQueryClient();

    const { userData } = userDataSave();
    const organizationId = userData.organizationId;
    const deleteSupplierMutation = useDeleteSupplierMutation();

    const [currentOrganizationId, setCurrentOrganizationId] = useState<string>(organizationId);

    const allSuppliersByOrganizationId = useAllSuppliersByOrganizationIdQuery({ organizationId: currentOrganizationId });

    const supplierData = allSuppliersByOrganizationId.data?.allSuppliersByOrganizationId;

    const handleDeleteSupplier = async (id: string, name: string) => {
        await deleteSupplierMutation.mutate(
            {
                id: id,
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllSuppliersByOrganizationId']);
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
                handleDeleteSupplier(id, name);
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
    const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(supplierData, 'name'));
    const [recordsData, setRecordsData] = useState(initialRecords.slice(0, pageSize));
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>(['createdAt', 'updatedAt', 'locationAddress']);

    const [modalShow, setModalShow] = useState(false);
    const [modalMode, setModalMode] = useState('new');

    const [currentSupplier, setCurrentSupplier] = useState<RowDataType>({
        id: '',
        name: '',
        isActive: false,
        supplierType: '',
        businessLicense: '',
        UBI: '',
        phone: '',
        email: '',
        locationAddress: '',
        locationCity: '',
        locationState: '',
        locationZipCode: '',
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
        if (supplierData) {
            //@ts-expect-error
            setInitialRecords(() => {
                return supplierData?.filter((item) => {
                    return (
                        item?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.supplierType?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.UBI?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.businessLicense?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.phone?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.email?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.locationAddress?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.locationCity?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.locationState?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.locationZipCode?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.createdAt.toString().includes(search.toLowerCase()) ||
                        item?.updatedAt.toString().includes(search.toLowerCase())
                    );
                });
            });
        }
    }, [search, supplierData]);
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

    const handleNewSupplier = () => {
        if (currentOrganizationId === '' || currentOrganizationId === null) {
            warnAlert('Please select Organization');
            return;
        } else {
            setModalMode('new');
            setModalShow(true);
            setCurrentSupplier({
                id: '',
                name: '',
                isActive: false,
                supplierType: 'Other',
                businessLicense: '',
                UBI: '',
                phone: '',
                email: '',
                locationAddress: '',
                locationCity: '',
                locationState: 'OK',
                locationZipCode: '',
                createdAt: '',
                updatedAt: '',
            });
        }
    };

    const cols = [
        { accessor: 'name', title: 'Name' },
        { accessor: 'supplierType', title: 'Type' },
        { accessor: 'UBI', title: 'UBI' },
        { accessor: 'businessLicense', title: 'Business License' },
        { accessor: 'phone', title: 'Phone' },
        { accessor: 'email', title: 'Email' },
        { accessor: 'locationAddress', title: 'Address' },
        { accessor: 'locationCity', title: 'City' },
        { accessor: 'locationState', title: 'State' },
        { accessor: 'locationZipCode', title: 'Zip Code' },
        { accessor: 'createdAt', title: 'CreatedAt' },
        { accessor: 'updatedAt', title: 'UpdatedAt' },
    ];

    return (
        <div className={`panel mt-6 !pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-dark">Suppliers</h5>
                <div className="lg:flex items-center gap-2 lg:ltr:ml-auto rtl:mr-auto">
                    <div>
                        <button type="button" onClick={handleNewSupplier} className="btn btn-primary rounded-full py-1.5 px-3 !text-sm">
                            <IconPlus className="h-5 w-5 shrink-0 ltr:mr-1.5 rtl:ml-1.5" />
                            New
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <RefreshButton onClick={() => allSuppliersByOrganizationId.refetch()}/>
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
                        <ExportTable cols={cols} recordsData={supplierData} hideCols={hideCols} filename='suppliers_table_data'/>
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
                    fetching={allSuppliersByOrganizationId.isLoading || allSuppliersByOrganizationId.isFetching}
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
                            accessor: 'supplierType',
                            title: 'Type',
                            sortable: true,
                            hidden: hideCols.includes('supplierType'),
                        },
                        {
                            accessor: 'UBI',
                            title: 'UBI',
                            sortable: true,
                            hidden: hideCols.includes('UBI'),
                        },
                        {
                            accessor: 'businessLicense',
                            title: 'Business License',
                            sortable: true,
                            hidden: hideCols.includes('businessLicense'),
                        },
                        {
                            accessor: 'organizationId',
                            title: 'organizationId',
                            sortable: true,
                            hidden: true,
                        },
                        {
                            accessor: 'phone',
                            title: 'Phone',
                            sortable: true,
                            hidden: hideCols.includes('phone'),
                        },
                        {
                            accessor: 'email',
                            title: 'Email',
                            sortable: true,
                            hidden: hideCols.includes('email'),
                        },
                        {
                            accessor: 'locationAddress',
                            title: 'Address',
                            sortable: true,
                            hidden: hideCols.includes('locationAddress'),
                        },
                        {
                            accessor: 'locationCity',
                            title: 'City',
                            sortable: true,
                            hidden: hideCols.includes('locationCity'),
                        },
                        {
                            accessor: 'locationState',
                            title: 'State',
                            sortable: true,
                            hidden: hideCols.includes('locationState'),
                        },
                        {
                            accessor: 'locationZipCode',
                            title: 'Zip Code',
                            sortable: true,
                            hidden: hideCols.includes('locationZipCode'),
                        },
                        {
                            accessor: 'isActive',
                            title: 'Active',
                            sortable: true,
                            hidden: hideCols.includes('isActive'),
                            render: ({ isActive }) => <div className={`flex w-3 h-3 rounded-full ${isActive ? 'bg-theme_green ' : 'bg-red-400 '}`}></div>,
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
                            render: ({ id, name, supplierType, UBI, businessLicense, email, phone, locationAddress, locationCity, locationState, locationZipCode, isActive, createdAt, updatedAt }) => (
                                <div>
                                    <Tippy content="Edit">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModalMode('update');
                                                setCurrentSupplier({
                                                    id,
                                                    name,
                                                    supplierType,
                                                    UBI,
                                                    businessLicense,
                                                    email,
                                                    phone,
                                                    locationAddress,
                                                    locationCity,
                                                    locationState,
                                                    locationZipCode,
                                                    isActive,
                                                    createdAt,
                                                    updatedAt,
                                                });
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
                    totalRecords={supplierData?.length ?? 0}
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
            <SupplierRegisterModal setModalShow={setModalShow} modalShow={modalShow} modalMode={modalMode} currentSupplier={currentSupplier} currentOrganizationId={currentOrganizationId} />
        </div>
    );
};

export default SuppliersTable;
