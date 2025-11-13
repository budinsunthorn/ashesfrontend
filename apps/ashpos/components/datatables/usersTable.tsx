'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

import { useAllUsersByDispensaryIdQuery, useDeleteUserMutation, UserType } from '@/src/__generated__/operations';
import UserRegisterModal from '../modals/userRegisterModal';
import { useQueryClient } from '@tanstack/react-query';

import Swal from 'sweetalert2';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns } from 'react-icons/bs';
import IconPlus from '@/components/icon/icon-plus';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import notification from '@/components/notification/notification';
import { userDataSave } from '@/store/userData';
import { userTypeTitles, userTypeColor } from '@/store/userTypeTitles';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import warnAlert from '../notification/warnAlert';
import ExportTable from '../etc/exportTable';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import TableLoading from '../etc/tableLoading';

type RowDataType = {
    id: string;
    userType: UserType;
    email: string;
    name: string;
    phone: string;
    isEmailVerified: boolean;
    isActive: boolean;
    isOrganizationAdmin: boolean;
    isDispensaryAdmin: boolean;
    createdAt: string;
    updatedAt: string;
};
type RowData = RowDataType[];

const UsersTable = () => {
    const { userData } = userDataSave();

    const dispensaryId = userData.dispensaryId;

    const queryClient = useQueryClient();

    const deleteUserMutation = useDeleteUserMutation();

    const [currentUser, setCurrentUser] = useState<RowDataType>({
        id: '',
        userType: 'USER',
        email: '',
        name: '',
        phone: '',
        isEmailVerified: false,
        isActive: false,
        isOrganizationAdmin: false,
        isDispensaryAdmin: false,
        createdAt: '',
        updatedAt: '',
    });

    const allUsersByDispensaryId = useAllUsersByDispensaryIdQuery({ dispensaryId: dispensaryId });

    const usersData = allUsersByDispensaryId.data?.allUsersByDispensaryId;

    const handleDeleteUser = async (id: string, name: string) => {
        await deleteUserMutation.mutate(
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
                        return await queryClient.refetchQueries(['AllUsersByDispensaryId']);
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
                handleDeleteUser(id, name);
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
    const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(usersData, 'name'));
    const [recordsData, setRecordsData] = useState(initialRecords.slice(0, pageSize));
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>(['createdAt', 'updatedAt']);

    const [modalShow, setModalShow] = useState(false);
    const [modalMode, setModalMode] = useState('new');

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        if (initialRecords) setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        if (usersData) {
            //@ts-expect-error
            setInitialRecords(() => {
                return usersData?.filter((item) => {
                    return (
                        item?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.userType?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.phone?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.email?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.createdAt.toString().includes(search.toLowerCase()) ||
                        item?.updatedAt.toString().includes(search.toLowerCase())
                    );
                });
            });
        }
    }, [search, usersData]);
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

    const handleNewUser = () => {
        setModalMode('new');
        setModalShow(true);
        setCurrentUser({
            id: '',
            userType: 'USER',
            email: '',
            name: '',
            phone: '',
            isEmailVerified: false,
            isActive: false,
            isOrganizationAdmin: false,
            isDispensaryAdmin: false,
            createdAt: '',
            updatedAt: '',
        });
    };

    const cols = [
        { accessor: 'name', title: 'Name' },
        { accessor: 'userType', title: 'Type' },
        { accessor: 'phone', title: 'Phone' },
        { accessor: 'email', title: 'Email' },
        { accessor: 'isOrganizationAdmin', title: 'Org.Admin' },
        { accessor: 'isDispensaryAdmin', title: 'Dis.Admin' },
        { accessor: 'isActive', title: 'Active' },
        { accessor: 'createdAt', title: 'CreatedAt' },
        { accessor: 'updatedAt', title: 'UpdatedAt' },
    ];

    return (
        <div className={`panel mt-6 !pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 lg:flex flex-col gap-5 md:sm:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-dark">Users</h5>
                <div className="lg:flex items-center gap-5 ltr:ml-auto rtl:mr-auto">
                    <div>
                        <button type="button" onClick={handleNewUser} className="btn btn-primary rounded-full py-1.5 px-3 !text-sm">
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
                        <ExportTable cols={cols} recordsData={recordsData} hideCols={hideCols} filename='users_table_data'/>
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
                    fetching={allUsersByDispensaryId.isLoading || allUsersByDispensaryId.isFetching}
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
                            accessor: 'userType',
                            title: 'Type',
                            sortable: true,
                            render: ({ userType }) => (
                                <span
                                    className={`rounded bg-${userTypeColor(userType)}-100 text-${userTypeColor(userType)}-800 text-xs font-medium me-2 px-2.5 py-0.5 dark:bg-${userTypeColor(
                                        userType
                                    )}-900 dark:text-${userTypeColor(userType)}-300 ltr:ml-2 rtl:ml-2`}
                                >
                                    {userTypeTitles(userType)}
                                </span>
                            ),
                            hidden: hideCols.includes('userType'),
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
                            render: ({ isEmailVerified, email }) => (
                                <div className="flex gap-2 items-center">
                                    <div className={`flex w-2 h-2 rounded-full ${isEmailVerified ? 'bg-theme_green ' : 'bg-red-600 '}`}></div>
                                    <div className="flex">{email}</div>
                                </div>
                            ),
                        },
                        {
                            accessor: 'isEmailVerified',
                            title: 'Email Verification',
                            sortable: true,
                            hidden: true,
                        },
                        // {
                        //     accessor: 'isOrganizationAdmin',
                        //     title: 'Field-1',
                        //     sortable: true,
                        //     hidden: true,
                        //     render: ({ isOrganizationAdmin }) => (
                        //         <span
                        //             className={`${
                        //                 isOrganizationAdmin
                        //                     ? 'bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300'
                        //                     : 'bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300'
                        //             } `}
                        //         >
                        //             {isOrganizationAdmin ? 'yes' : 'no'}
                        //         </span>
                        //     ),
                        // },
                        // {
                        //     accessor: 'isDispensaryAdmin',
                        //     title: 'Field-2',
                        //     sortable: true,
                        //     hidden: true,
                        //     render: ({ isDispensaryAdmin }) => (
                        //         <span
                        //             className={`${
                        //                 isDispensaryAdmin
                        //                     ? 'bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300'
                        //                     : 'bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300'
                        //             } `}
                        //         >
                        //             {isDispensaryAdmin ? 'yes' : 'no'}
                        //         </span>
                        //     ),
                        // },
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
                            render: ({ id, name, userType, email, phone, isActive, isOrganizationAdmin, isDispensaryAdmin, isEmailVerified, createdAt, updatedAt }) => (
                                <div>
                                    <Tippy content="Edit">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModalMode('update');
                                                setCurrentUser({ id, name, userType, email, phone, isActive, isOrganizationAdmin, isDispensaryAdmin, isEmailVerified, createdAt, updatedAt });
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
            <UserRegisterModal setModalShow={setModalShow} modalShow={modalShow} modalMode={modalMode} dispensaryId={dispensaryId} currentUser={currentUser} />
        </div>
    );
};

export default UsersTable;
