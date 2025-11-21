'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

import {
    useAllDispensariesByOrganizationIdQuery,
    useAllDispensariesQuery,
    useAllOrganizationsQuery,
    useAllUsersByDispensaryIdQuery,
    useDeleteDispensaryMutation,
    useDeleteUserMutation,
    UserType,
    useImportSuppliersMutation,
    useSyncMetrcItemCategoryMutation,
    useSyncAdjustmentReasonsMutation,
    useSyncMetrcIncomingTransferMutation,
    useImportMetrcPackageOriginalQuantityMutation,
    useImportMetrcPackageMutation,
    useSyncDeliveryPackagesMutation
} from '@/src/__generated__/operations';
import UserRegisterModal from '../admin-modals/userRegisterModal';
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
import { userTypeTitles, userTypeColor } from '@/store/userTypeTitles';
import { userDataSave } from '@/store/userData';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import ExportTable from '../etc/exportTable';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import { useAtom } from 'jotai';
import { spinnerAtom } from '@/store/spinnerStatus';

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

const ImportMetrc = () => {
    const queryClient = useQueryClient();

    const deleteUserMutation = useDeleteUserMutation();
    const {userData} = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const userId = userData.userId;

    console.log("userData", userData);

    const [currentOrganizationId, setCurrentOrganizationId] = useState<string>('');
    const [currentDispensaryId, setCurrentDispensaryId] = useState<string>('');
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
    const [spinnerStatus, setSpinnerStatus] = useAtom(spinnerAtom);

    const allOrganizations = useAllOrganizationsQuery();
    const allDispensariesByOrganizationId = useAllDispensariesByOrganizationIdQuery({ organizationId: currentOrganizationId });
    const allUsersByDispensaryId = useAllUsersByDispensaryIdQuery({ dispensaryId: currentDispensaryId });

    const organizationData = allOrganizations.data?.allOrganizations;
    const dispensaryData = allDispensariesByOrganizationId.data?.allDispensariesByOrganizationId;
    const userDataByDispensary = allUsersByDispensaryId.data?.allUsersByDispensaryId;

    // Mutation
    const importSupplierMutation = useImportSuppliersMutation();
    const syncMetrcItemCategoryMutation = useSyncMetrcItemCategoryMutation();
    const syncAdjustmentReasonsMutation = useSyncAdjustmentReasonsMutation();
    const syncMetrcIncomingTransferMutation = useSyncMetrcIncomingTransferMutation();

    const importMetrcPackageMutation = useImportMetrcPackageMutation();
    const importMetrcPackageOriginalQuantityMutation = useImportMetrcPackageOriginalQuantityMutation();
    const syncDeliveryPackagesMutation = useSyncDeliveryPackagesMutation();
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
            },
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
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType)
    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    //@ts-expect-error
    const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(userDataByDispensary, 'name'));
    const [recordsData, setRecordsData] = useState(initialRecords);
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
        if (userDataByDispensary) {
            //@ts-expect-error
            setInitialRecords(() => {
                return userDataByDispensary?.filter((item) => {
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
    }, [search, userDataByDispensary]);
    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    // useEffect(() => {
    // 	setCurrentDispensaryId(0)
    // },[currentOrganizationId])
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


    const handleImportSupplier = async () => {
        if(!currentOrganizationId || currentOrganizationId == '') {
            warnAlert("Select Organization");
            return
        }
        setSpinnerStatus({
            isLoading: true,
            text: 'Importing Supplier Data...',
        });
        await importSupplierMutation.mutate(
            {
                input: {
                    organizationId: currentOrganizationId,
                }
            },
            {
                onError: (error) => {
                    warnAlert("Error importing supplier");
                    setSpinnerStatus({});
                },
                onSuccess: (data) => {
                    successAlert("Supplier imported successfully");
                    setSpinnerStatus({});
                }   
            }
        );
    }

    const handleImportCategory = async () => {
        if(!currentDispensaryId || currentDispensaryId == '') {
            warnAlert("Select Dispensary");
            return
        }
        setSpinnerStatus({
            isLoading: true,
            text: 'Importing Category Data...',
        });
        await syncMetrcItemCategoryMutation.mutate(
            {
                input: {
                    dispensaryId: currentDispensaryId,
                }
            },
            {
                onError: (error) => {
                    warnAlert("Error importing category");
                    setSpinnerStatus({});
                },
                onSuccess: (data) => {
                    successAlert("Category imported successfully");
                    setSpinnerStatus({});
                }   
            }
        );
        await syncAdjustmentReasonsMutation.mutate(
            {
                input: {
                    dispensaryId: currentDispensaryId,
                }
            },
            {
                onError: (error) => {
                    warnAlert("Error importing category");
                    setSpinnerStatus({});
                },
                onSuccess: (data) => {
                    successAlert("Category imported successfully");
                    setSpinnerStatus({});
                }   
            }
        );
    }

    const handleImportTransfer = async () => {
        if(!currentDispensaryId || currentDispensaryId == '') {
            warnAlert("Select Dispensary");
            return
        }
        setSpinnerStatus({
            isLoading: true,
            text: 'Importing Transfer Data...',
        });
        await syncMetrcIncomingTransferMutation.mutate(
            {
                input: {
                    dispensaryId: currentDispensaryId,
                    userId: userId
                }   
            },
            {
                onError: (error) => {
                    warnAlert("Error importing transfer");
                    setSpinnerStatus({});
                },
                onSuccess: (data) => {
                    successAlert("Transfer imported successfully");
                    setSpinnerStatus({});
                }
            }
        );
    }

    const handleImportPackage = async () => {
        if(!currentDispensaryId || currentDispensaryId == '') {
            warnAlert("Select Dispensary");
            return
        }
        setSpinnerStatus({
            isLoading: true,
            text: 'Importing Package Data...',
        });
        await importMetrcPackageMutation.mutate(
            {
                input: {
                    dispensaryId: currentDispensaryId,
                    userId: userId,
                }
            },
            {
                onError: (error) => {
                    warnAlert("Error importing Metrc package");
                    setSpinnerStatus({});
                },
                onSuccess: (data) => {
                    successAlert("Active Package imported successfully");
                    setSpinnerStatus({});
                }
            }
        );
    }
    const handleImportPackageOriginalQuantity = async () => {
        if(!currentDispensaryId || currentDispensaryId == '') {
            warnAlert("Select Dispensary");
            return
        }
        setSpinnerStatus({
            isLoading: true,
            text: 'Importing Original Quantity Data...',
        });
        await importMetrcPackageOriginalQuantityMutation.mutate(
            {
                input: {
                    dispensaryId: currentDispensaryId,
                }
            },
            {
                onError: (error) => {
                    warnAlert("Error importing Original Quantity");
                    setSpinnerStatus({});
                },
                onSuccess: (data) => {
                    successAlert("Metrc Package Original Quantity imported successfully");
                    setSpinnerStatus({});
                }
            }
        );

    }

    const handleImportDelivery = () => {
        if(!currentDispensaryId || currentDispensaryId == '') {
            warnAlert("Select Dispensary");
            return
        }
        setSpinnerStatus({
            isLoading: true,
            text: 'Importing Delivery Data...',
        });
        syncDeliveryPackagesMutation.mutate(
            {
                input: {
                    dispensaryId: currentDispensaryId,
                }
            },
            {
                onError: (error) => {
                    warnAlert("Error importing delivery");
                    setSpinnerStatus({});
                },
                onSuccess: (data) => {
                    successAlert("Delivery Data imported successfully");
                    setSpinnerStatus({});
                }
            }
        );
    }

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
        <div className={`panel mt-6 pt-2 ${panelType == "plain" ? "plain-panel" : ""}`}>
            <div className="lg:flex gap-6">
                <div className="flex items-center">
                    <h5 className="flex-initial w-32 text-sm font-semibold dark:text-white-dark">Organization:</h5>
                    <select
                        onChange={(e) => {
                            setCurrentOrganizationId(e.target.value);
                            setCurrentDispensaryId('');
                        }}
                        id="currentOrganization"
                        className="flex-initial w-64 form-select text-white-dark mt-1"
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
                <div className="flex items-center">
                    <h5 className="flex-initial w-32 text-sm font-semibold dark:text-white-dark">Dispensary:</h5>
                    <select
                        onChange={(e) => {
                            setCurrentDispensaryId(e.target.value);
                        }}
                        id="currentDispensary"
                        className="flex-initial w-64 form-select text-white-dark mt-1"
                        name="currentDispensary"
                        defaultValue="all"
                    >
                        <option value="all">All Dispensaries</option>
                        {dispensaryData?.map((row) => {
                            return (
                                <option key={row?.id} value={row?.id}>
                                    {row?.name}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>
            <div className='flex flex-col justify-start items-center mx-auto mt-5'>
                <button className='mt-4 btn btn-outline-primary' onClick={() => handleImportCategory()}>Import Category, Adjustment Reasons</button>
                <button className='mt-4 btn btn-outline-primary' onClick={() => handleImportPackage()}>Import Package</button>
                <button className='mt-4 btn btn-outline-primary' onClick={() => handleImportTransfer()}>Import Transfer</button>
                <button className='mt-4 btn btn-outline-primary' onClick={() => handleImportSupplier()}>Import Supplier</button>
                <button className='mt-4 btn btn-outline-primary' onClick={() => handleImportPackageOriginalQuantity()}>Import Package Original Quantity</button>
                {/* <button className='mt-4 btn btn-outline-primary' onClick={() => handleImportDelivery()}>Import Delivery</button> */}
            </div>
            <UserRegisterModal setModalShow={setModalShow} modalShow={modalShow} modalMode={modalMode} currentDispensaryId={currentDispensaryId} currentUser={currentUser} />
        </div>
    );
};

export default ImportMetrc;
