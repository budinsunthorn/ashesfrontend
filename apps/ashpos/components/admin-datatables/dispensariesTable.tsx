'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

import { useAllDispensariesByOrganizationIdQuery, useAllDispensariesQuery, useAllOrganizationsQuery, useDeleteDispensaryMutation, useDeleteOrganizationMutation } from '@/src/__generated__/operations';
import DispensaryRegisterModal from '../admin-modals/dispensaryRegisterModal';
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

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import ExportTable from '../etc/exportTable';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import { userDataSave } from '@/store/userData';
import TableLoading from '../etc/tableLoading';

type DispensaryType = 'MED' | 'MEDREC' | 'REC';
type RowDataType = {
    id: string;
    name: string;
    isActive: boolean;
    dispensaryType: DispensaryType;
    cannabisLicense: string;
    cannabisLicenseExpireDate: string;
    businessLicense: string;
    phone: string;
    email: string;
    storeTimeZone : string;
    locationAddress: string;
    locationCity: string;
    locationState: string;
    locationZipCode: string;
    createdAt: string;
    updatedAt: string;
};
type RowData = RowDataType[];

const DispensariesTable = () => {
    const queryClient = useQueryClient();

    const deleteDispensaryMutation = useDeleteDispensaryMutation();
    const {userData} = userDataSave();

    const [currentOrganizationId, setCurrentOrganizationId] = useState<string>('all');

    const allOrganizations = useAllOrganizationsQuery();
    const allDispensariesByOrganizationId = useAllDispensariesByOrganizationIdQuery({ organizationId: currentOrganizationId });

    const organizationData = allOrganizations.data?.allOrganizations;
    const dispensaryData = allDispensariesByOrganizationId.data?.allDispensariesByOrganizationId;

    const handleDeleteDispensary = async (id: string, name: string) => {
        await deleteDispensaryMutation.mutate(
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
                        return await queryClient.refetchQueries(['AllDispensariesByOrganizationId']);
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
                handleDeleteDispensary(id, name);
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
    const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(dispensaryData, 'name'));
    const [recordsData, setRecordsData] = useState(initialRecords.slice(0, pageSize));
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>(['createdAt', 'updatedAt', 'locationAddress', 'locationZipCode', 'storeTimeZone', 'cannabisLicenseExpireDate']);

    const [modalShow, setModalShow] = useState(false);
    const [modalMode, setModalMode] = useState('new');

    const [currentDispensary, setCurrentDispensary] = useState<RowDataType>({
        id: '',
        name: '',
        isActive: false,
        dispensaryType: 'MED',
        cannabisLicense: '',
        cannabisLicenseExpireDate: '',
        businessLicense: '',
        phone: '',
        email: '',
        locationAddress: '',
        storeTimeZone : '',
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
        if (dispensaryData) {
            //@ts-expect-error
            setInitialRecords(() => {
                return dispensaryData?.filter((item) => {
                    return (
                        item?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.dispensaryType?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.businessLicense?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.phone?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.email?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.locationAddress?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.locationCity?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.locationState?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.locationZipCode?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.storeTimeZone?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.createdAt.toString().includes(search.toLowerCase()) ||
                        item?.updatedAt.toString().includes(search.toLowerCase())
                    );
                });
            });
        }
    }, [search, dispensaryData]);
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

    const handleNewDispensary = () => {
        if (currentOrganizationId === 'all' || currentOrganizationId === null) {
            warnAlert('Please select Organization');
            return;
        } else {
            setModalMode('new');
            setModalShow(true);
            setCurrentDispensary({
                id: '',
                name: '',
                isActive: false,
                dispensaryType: 'MED',
                cannabisLicense: '',
                cannabisLicenseExpireDate: '',
                businessLicense: '',
                phone: '',
                email: '',
                storeTimeZone : 'PST',
                locationAddress: '',
                locationCity: '',
                locationState: 'Alaska',
                locationZipCode: '',
                createdAt: '',
                updatedAt: '',
            });
        }
    };

    const cols = [
        { accessor: 'name', title: 'Name' },
        { accessor: 'dispensaryType', title: 'Type' },
        { accessor: 'cannabisLicense', title: 'Cannabis License' },
        { accessor: 'cannabisLicenseExpireDate', title: 'Cannabis License Expire Date' },
        { accessor: 'businessLicense', title: 'Business License' },
        { accessor: 'phone', title: 'Phone' },
        { accessor: 'email', title: 'Email' },
        { accessor: 'locationAddress', title: 'Address' },
        { accessor: 'locationCity', title: 'City' },
        { accessor: 'locationState', title: 'State' },
        { accessor: 'storeTimeZone', title: 'TimeZone' },
        { accessor: 'locationZipCode', title: 'Zip Code' },
        { accessor: 'isActive', title: 'Active' },
        { accessor: 'createdAt', title: 'CreatedAt' },
        { accessor: 'updatedAt', title: 'UpdatedAt' },
    ];

    return (
        <div className={`panel mt-6 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="flex items-center">
                <h5 className="flex-initial w-32 text-sm font-semibold text-dark dark:text-white-dark">Organization:</h5>
                <select
                    onChange={(e) => {
                        setCurrentOrganizationId(e.target.value);
                    }}
                    id="currentOrganization"
                    className="flex-initial w-64 form-select text-dark dark:text-white-dark mt-1"
                    name="currentOrganization"
                    defaultValue="all"
                >
                    <option value="all">All Organizations</option>
                    {organizationData?.map((row) => {
                        return (
                            <option key={row?.id} value={row?.id}>
                                {row?.name}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-dark">Dispensaries</h5>
                <div className="lg:flex items-center gap-5 lg:ltr:ml-auto rtl:mr-auto">
                    <div>
                        <button type="button" onClick={handleNewDispensary} className="btn btn-primary rounded-full py-1.5 px-3 !text-sm">
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
                        <ExportTable cols={cols} recordsData={recordsData} hideCols={hideCols} filename='dispensary_table_data'/>
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
                    fetching={allOrganizations.isLoading || allOrganizations.isFetching}
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
                            accessor: 'name',
                            title: 'Name',
                            sortable: true,
                            hidden: hideCols.includes('name'),
                        },
                        {
                            accessor: 'dispensaryType',
                            title: 'Type',
                            sortable: true,
                            hidden: hideCols.includes('dispensaryType'),
                        },
                        {
                            accessor: 'cannabisLicense',
                            title: 'Cannabis License',
                            sortable: true,
                            hidden: hideCols.includes('cannabisLicense'),
                        },
                        {
                            accessor: 'cannabisLicenseExpireDate',
                            title: 'Cannabis License Expire Date',
                            sortable: true,
                            render: ({ cannabisLicenseExpireDate }) => <>{cannabisLicenseExpireDate ? new Date(cannabisLicenseExpireDate).toLocaleDateString('en-US') : ''}</>,
                            hidden: hideCols.includes('cannabisLicenseExpireDate'),
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
                            accessor: 'storeTimeZone',
                            title: 'TimeZone',
                            sortable: true,
                            hidden: hideCols.includes('storeTimeZone'),
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
                            render: ({
                                id,
                                name,
                                dispensaryType,
                                businessLicense,
                                cannabisLicense,
                                cannabisLicenseExpireDate,
                                email,
                                phone,
                                locationAddress,
                                locationCity,
                                locationState,
                                storeTimeZone,
                                locationZipCode,
                                isActive,
                                createdAt,
                                updatedAt,
                            }) => (
                                <div>
                                    <Tippy content="Edit">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModalMode('update');
                                                setCurrentDispensary({
                                                    id,
                                                    name,
                                                    dispensaryType,
                                                    businessLicense,
                                                    cannabisLicense,
                                                    cannabisLicenseExpireDate,
                                                    email,
                                                    phone,
                                                    locationAddress,
                                                    locationCity,
                                                    locationState,
                                                    storeTimeZone,
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
                    loaderBackgroundBlur={80}
                    customLoader={<TableLoading text="Loading Product Data..." />}
                />
            </div>
            <DispensaryRegisterModal setModalShow={setModalShow} modalShow={modalShow} modalMode={modalMode} currentDispensary={currentDispensary} currentOrganizationId={currentOrganizationId} />
        </div>
    );
};

export default DispensariesTable;
