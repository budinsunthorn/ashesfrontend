'use client';

// Import Third-Party library
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import dropdown from '@/components/dropdown';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import Dropdown from '@/components/dropdown';
import notification from '@/components/notification/notification';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import moment from 'moment';

// Import Custom Components
import CustomerRegisterModal from '../modals/customerRegisterModal';
import warnAlert from '../notification/warnAlert';
import ExportTable from '../etc/exportTable';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import RefreshButton from '../etc/refreshButton';
import CustomerProfile from '../etc/customerDetail';
import successAlert from '../notification/successAlert';
import BirthdayAlert from '../etc/birthdayAlert';

// Import Store
import { userDataSave } from '@/store/userData';
import { ActiveSidebarItemAtom } from '@/store/activeSidebarItem';
import { customerStatusArray, mfTypeArray } from '@/utils/variables';

// Import Icons
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns, BsThreeDots } from 'react-icons/bs';
import IconPlus from '@/components/icon/icon-plus';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { FaArrowRightFromBracket, FaChartLine, FaPlus, FaTrash } from 'react-icons/fa6';
import { FaCheckCircle, FaEdit, FaRegTimesCircle, FaTimes } from 'react-icons/fa';
import { SlBasket } from 'react-icons/sl';


// Import Graph Query
import { useAllCustomersByDispensaryIdQuery, useDeleteCustomerMutation, MfType, CustomerStatus, useCustomerQuery, useUpdateCustomerNoteByCustomerIdMutation, useCreateCustomerQueueMutation, useDeleteCustomerQueueMutation, useCheckIsCustomerInQueueQuery, useCreateOrderMutation, useUpdateCustomerByOrderIdMutation, useDeleteCustomerQueueByCustomerIdMutation } from '@/src/__generated__/operations';
import { useAtom } from 'jotai';
import TableLoading from '../etc/tableLoading';


type RowDataType = {
    id: string;
    name: string;
    MFType: MfType;
    birthday: string;
    email: string;
    phone: string;
    isActive: boolean;
    driverLicense: string;
    driverLicenseExpirationDate: string;
    isMedical: boolean;
    isTaxExempt: boolean;
    loyaltyPoints: number;
    status: CustomerStatus;
    medicalLicense: string;
    medicalLicenseExpirationDate: string;
    createdAt: string;
    updatedAt: string;
};
type RowData = RowDataType[];

const CustomersTable = () => {
    const { userData } = userDataSave();

    const dispensaryId = userData.dispensaryId;
    const userId = userData.userId;

    const queryClient = useQueryClient();
    const [customerId, setCustomerId] = useState("")
    const [customerNote, setCustomerNote] = useState("");
    const [birthdayShow, setBirthdayShow] = useState(false);
    const [isCreateOrderButtonDisabled, setIsCreateOrderButtonDisabled] = useState(false)
    const [, setActiveSidebarItem] = useAtom(ActiveSidebarItemAtom)
    const router = useRouter(); 
    const searchParams = useSearchParams();

    // for right side bar
    const [isAtTop, setIsAtTop] = useState(false);
    const [firstViewed, setFirstViewed] = useState(false);
    const [isRightBarShow, setIsRightBarShow] = useState(false);
    const [selectedRow, setSelectedRow] = useState(0);
    const [tableClassname, setTableClassName] = useState('w-full');
    const targetRef = useRef<HTMLTableElement | null>(null);


    const [currentUser, setCurrentUser] = useState<RowDataType>({
        id: '',
        name: '',
        MFType: 'MALE',
        birthday: '',
        email: '',
        phone: '',
        isActive: false,
        driverLicense: '',
        driverLicenseExpirationDate: '',
        isMedical: true,
        isTaxExempt: false,
        loyaltyPoints: 0,
        status: 'MEDICALMEMBER',
        medicalLicense: '',
        medicalLicenseExpirationDate: '',
        createdAt: '',
        updatedAt: '',
    });

    const allCustomersByDispensaryId = useAllCustomersByDispensaryIdQuery({ dispensaryId: dispensaryId });

    const customerData = allCustomersByDispensaryId.data?.allCustomersByDispensaryId;

    const customerById = useCustomerQuery({id: customerId})
    const customerDataById = customerById.data?.customer
    const checkIsCustomerInQueue = useCheckIsCustomerInQueueQuery({customerId: customerId})
    const isCustomerInQueue = checkIsCustomerInQueue.data?.checkIsCustomerInQueue;

    // Mutation
    const customerNoteMutation = useUpdateCustomerNoteByCustomerIdMutation();
    const deleteCustomerMutation = useDeleteCustomerMutation();
    const createCustomerQueueMutation = useCreateCustomerQueueMutation();
    const deleteCustomerQueueMutation = useDeleteCustomerQueueByCustomerIdMutation();
    const createOrderMutation = useCreateOrderMutation();
    const updateCustomerByOrderIdMutation = useUpdateCustomerByOrderIdMutation();

    useEffect(() => {
        setCustomerNote("")
        setBirthdayShow(false);
    }, [customerId])

    useEffect(() => {
        // console.log("cusomerDataByID", customerDataById)
        if(isTodayBirthday())
            setBirthdayShow(true);
    },[customerDataById])


    const updateSearchParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        router.push(`?${params.toString()}`) // or use replace() to avoid history stacking
    }

    const handleRowClick = (record: any, index: any) => {
        if (record == null) {
            return null;
        }
        // setPackageId(record.id);
        setCustomerId(record.id)
        setSelectedRow(index);
        setIsRightBarShow(true);
        updateSearchParams('customerId', record.id)
    }

    const handleCustomerNote = async () => {
        console.log("handleCustomer")
        await customerNoteMutation.mutate(
            {
                input : {
                    customerId: customerId,
                    note: customerNote
                }
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    // successAlert("Customer Note Updated!")
                },
                onSettled() {},
            }
        );
    }

    function isTodayBirthday() {  

        const birthday = new Date(customerDataById?.birthday || '');  
        const today = new Date();  
    
        return today.getDate() === birthday.getDate() &&   
               today.getMonth() === birthday.getMonth();  
    }  

    const handleCreateCustomerQueue = async () => {
        await createCustomerQueueMutation.mutate(
            {
                input : {
                    customerId: customerId,
                    dispensaryId: dispensaryId,
                    userId: userId,
                }
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    successAlert("Customer has added to queue!")
                    checkIsCustomerInQueue.refetch();
                    // Swal.fire({ title: 'Success!', text: 'Customer has added to queue!', icon: 'success', customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white' });
                },
                onSettled() {},
            }
        );
    };
    const handleDeleteCustomerQueue = async () => {
        await deleteCustomerQueueMutation.mutate(
            {
                customerId: customerId,
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    // customerById.refetch();
                    checkIsCustomerInQueue.refetch();
                    successAlert("Customer deleted successfully!")
                    // Swal.fire({ title: 'Deleted!', text: 'Customer deleted successfully!', icon: 'success', customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white' });
                },
                onSettled() {},
            }
        );
    };
    const handleDeleteUser = async (id: string, name: string) => {
        await deleteCustomerMutation.mutate(
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
                        return await queryClient.refetchQueries(['AllCustomersByDispensaryId']);
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
    const menu = useSelector((state: IRootState) => state.themeConfig.menu);
    const darkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);
    const sidebar = useSelector((state: IRootState) => state.themeConfig.sidebar);

    console.log("menu ----------->", menu)
    console.log("sidebar ----------->", sidebar)


    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    //@ts-expect-error
    const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(customerData, 'name'));
    const [recordsData, setRecordsData] = useState(initialRecords?.slice(0, pageSize));
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>(['driverLicense', 'driverLicenseExpirationDate', 'medicalLicense', 'medicalLicenseExpirationDate', 'createdAt', 'updatedAt']);

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
        if (customerData) {
            //@ts-expect-error
            setInitialRecords(() => {
                return customerData?.filter((item) => {
                    return (
                        item?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.MFType?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.birthday?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.phone?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.email?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.driverLicense?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.driverLicenseExpirationDate?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.medicalLicense?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.medicalLicenseExpirationDate?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.createdAt.toString().includes(search.toLowerCase()) ||
                        item?.updatedAt.toString().includes(search.toLowerCase())
                    );
                });
            });
        }
    }, [search, customerData]);
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
            name: '',
            MFType: 'MALE',
            birthday: '',
            email: '',
            phone: '',
            isActive: false,
            driverLicense: '',
            driverLicenseExpirationDate: '',
            isMedical: true,
            isTaxExempt: false,
            loyaltyPoints: 0,
            medicalLicense: '',
            medicalLicenseExpirationDate: '',
            status: 'MEDICALMEMBER',
            createdAt: '',
            updatedAt: '',
        });
    };

    const handleUpdateCustomer = async (orderNumber: any) => {

        await updateCustomerByOrderIdMutation.mutate(
            {
                input: {
                    orderId: orderNumber,
                    customerId: customerId,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                    setIsCreateOrderButtonDisabled(false);
                },
                onSuccess(data) {
                    if (!data) return;
                    setActiveSidebarItem("cashier");
                    router.push(`/sales/cashier?orderId=${orderNumber}`); 
                    setIsCreateOrderButtonDisabled(false);

                },
                onSettled() {},
            }
        );
    };

    const handleCreateOrderFromCutomer = async () => {
        setIsCreateOrderButtonDisabled(true);

        const orderDate = moment(new Date()).format('YYYY-MM-DD');
        await createOrderMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    userId: userData.userId,
                    status: 'EDIT',
                    orderDate: orderDate,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                    setIsCreateOrderButtonDisabled(false);
                },
                onSuccess(data) {
                    if (!data) return;
                    handleUpdateCustomer(data.createOrder?.id);
                },
                onSettled() {
                },
            }
        );
    }

    const cols = [
        { accessor: 'name', title: 'Name' },
        { accessor: 'MFType', title: 'Sex' },
        { accessor: 'birthday', title: 'Birthday' },
        { accessor: 'email', title: 'Email' },
        { accessor: 'phone', title: 'Phone' },
        { accessor: 'isMedical', title: 'Type' },
        { accessor: 'driverLicense', title: 'Driver License' },
        { accessor: 'driverLicenseExpirationDate', title: 'Driver License Expire Date' },
        { accessor: 'medicalLicense', title: 'Med License' },
        { accessor: 'medicalLicenseExpirationDate', title: 'Med License Expire Date' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'isActive', title: 'Active' },
        { accessor: 'createdAt', title: 'CreatedAt' },
        { accessor: 'updatedAt', title: 'UpdatedAt' },
    ];

    // For the right side bar
    
    const checkPositionWindow = () => {
        setFirstViewed(false);
        if (targetRef.current) {
            const dataTable = targetRef.current.getElementsByClassName('data-table');
            const rect = dataTable[0]?.getBoundingClientRect();
            // Check if the top of the element is at or near zero
            if (rect?.top <= 50) {
                setIsAtTop(true);
            } else if (rect?.top <= -10) {
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
                    `fixed top-0 z-[99]  ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? sidebar == true ? "left-[280px] w-[calc(100vw-580px)]" : 'left-[280px] w-[calc(100vw-780px)]' : 'left-[90px] w-[calc(100vw-590px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            } else {
                setTableClassName(
                    `fixed top-0 z-[99] ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw)]' : menu == 'vertical' ? 'left-[280px] w-[calc(100vw-280px)]' : 'left-[90px] w-[calc(100vw-90px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-575px)]' : menu == 'vertical' ? sidebar == true ? "w-[calc(100vw-570px)]" : 'w-[calc(100vw-830px)]' : 'w-[calc(100vw-620px)]'} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-90px)]' : menu == 'vertical' ? sidebar == true ? "w-[calc(100vw-80px)]" : 'w-[calc(100vw-340px)]' : 'w-[calc(100vw-100px)]'} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow, sidebar, menu]);


    return (
        <div className={`panel mt-6 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 lg:flex flex-col gap-5 md:sm:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-dark">Customers</h5>
                <div className={`absolute lg:flex mb-2 items-center gap-2 ltr:ml-auto rtl:mr-auto  ${isRightBarShow? "!right-[508px]" :"right-7"}`}>
                    <div>
                        <button type="button" onClick={handleNewUser} className="btn btn-primary rounded-full py-1.5 px-3 !text-sm">
                            <IconPlus className="h-5 w-5 shrink-0 ltr:mr-1.5 rtl:ml-1.5" />
                            New
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <RefreshButton onClick={() => allCustomersByDispensaryId.refetch()}/>
                    <Tippy content="Columns" placement="top">
                        <div className="dropdown">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                button={
                                    <>
                                        {/*  {/* <span className="ltr:mr-1 rtl:ml-1">Columns</span>
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
                        <ExportTable cols={cols} recordsData={customerData} hideCols={hideCols} filename='customer_table_data'/>
                    </div>
                    <div className="text-right">
                        <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="datatables">
                <div className={`transition-transform duration-300`} ref={targetRef}>
                    <DataTable
                        className={`table-hover whitespace-nowrap ${tableClassname}`}
                        records={recordsData ?? []}
                        fetching={allCustomersByDispensaryId.isLoading || allCustomersByDispensaryId.isFetching}
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
                                accessor: 'MFType',
                                title: 'Sex',
                                sortable: true,
                                render: ({ MFType }) => <>{mfTypeArray[MFType]}</>,
                                hidden: hideCols.includes('MFType'),
                            },
                            {
                                accessor: 'birthday',
                                title: 'Birthday',
                                sortable: true,
                                render: ({ birthday }) => <>{new Date(birthday).toLocaleDateString('en-US')}</>,
                                hidden: hideCols.includes('birthday'),
                            },
                            {
                                accessor: 'email',
                                title: 'Email',
                                sortable: true,
                                hidden: hideCols.includes('email'),
                            },
                            {
                                accessor: 'phone',
                                title: 'Phone',
                                sortable: true,
                                hidden: hideCols.includes('phone'),
                            },
                            {
                                accessor: 'isMedical',
                                title: 'Type',
                                sortable: true,
                                render: ({ isMedical }) => (
                                    <span
                                        className={`${
                                            isMedical === false
                                                ? 'bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300'
                                                : 'bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300'
                                        } `}
                                    >
                                        {isMedical === false ? 'Recreational' : 'Medical'}
                                    </span>
                                ),
                                hidden: hideCols.includes('isMedical'),
                            },
                            {
                                accessor: 'medicalLicense',
                                title: 'Med License',
                                sortable: true,
                                hidden: hideCols.includes('medicalLicense'),
                            },
                            {
                                accessor: 'medicalLicenseExpirationDate',
                                title: 'Med License Expire Date',
                                sortable: true,
                                render: ({ medicalLicenseExpirationDate }) => <>{new Date(medicalLicenseExpirationDate).toLocaleDateString('en-US')}</>,
                                hidden: hideCols.includes('medicalLicenseExpirationDate'),
                            },
                            {
                                accessor: 'driverLicense',
                                title: 'Driver License',
                                sortable: true,
                                hidden: hideCols.includes('driverLicense'),
                            },
                            {
                                accessor: 'driverLicenseExpirationDate',
                                title: 'Driver License Expire Date',
                                sortable: true,
                                render: ({ driverLicenseExpirationDate }) => <>{new Date(driverLicenseExpirationDate).toLocaleDateString('en-US')}</>,
                                hidden: hideCols.includes('driverLicenseExpirationDate'),
                            },
                            {
                                accessor: 'status',
                                title: 'Status',
                                sortable: true,
                                hidden: hideCols.includes('status'),
                                render: ({ status }) => <div>{customerStatusArray[status]}</div>
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
                                    MFType,
                                    birthday,
                                    email,
                                    phone,
                                    isActive,
                                    driverLicense,
                                    driverLicenseExpirationDate,
                                    status,
                                    isMedical,
                                    isTaxExempt,
                                    loyaltyPoints,
                                    medicalLicense,
                                    medicalLicenseExpirationDate,
                                    createdAt,
                                    updatedAt,
                                }) => (
                                    <div>
                                        <Tippy content="Edit">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setModalMode('update');
                                                    setCurrentUser({
                                                        id,
                                                        name,
                                                        MFType,
                                                        birthday,
                                                        email,
                                                        phone,
                                                        isActive,
                                                        driverLicense,
                                                        driverLicenseExpirationDate,
                                                        status,
                                                        isMedical,
                                                        isTaxExempt,
                                                        loyaltyPoints,
                                                        medicalLicense,
                                                        medicalLicenseExpirationDate,
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
                            <div className="py-2 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                                <button
                                    type="button"
                                    className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                    onClick={() => setIsRightBarShow(false)}
                                >
                                    <FaArrowRightFromBracket className="m-auto text-2xl" />
                                </button>
                                <div className='flex justify-between items-center pr-1'>
                                    {isCustomerInQueue?.count ? 
                                    <>
                                    <button className='btn btn-outline-dark flex justify-between items-center mr-2' onClick={() => handleDeleteCustomerQueue()}>
                                        <FaRegTimesCircle className='mr-1'/>
                                        From Queue
                                    </button>
                                    
                                    <button className='btn btn-outline-primary flex justify-between items-center mr-2'  disabled={isCreateOrderButtonDisabled} onClick={() => handleCreateOrderFromCutomer()}>
                                        <SlBasket className='mr-1'/>
                                        Start Order
                                    </button>
                                    </>
                                    :
                                    <button className='btn btn-outline-primary flex justify-between items-center mr-2' onClick={() => {
                                        handleCreateCustomerQueue();
                                    }}>
                                        <FaCheckCircle className='mr-1'/>
                                        Check In
                                    </button>  
                                    }
                                    <div className="dropdown">
                                        <Dropdown
                                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                            btnClassName="p-[10px] mr-2 border-[1px] border-gray-200 bg-white dark:bg-[#1c2942] dark:border-black-dark-light rounded-md"
                                            button={
                                                <>
                                                   <BsThreeDots />
                                                </>
                                            }
                                        >
                                        <ul className="!min-w-[170px] absolute -right-0">
                                            <li>
                                                <button type="button" className='flex justify-start items-center'>
                                                    Move to Top of Queue
                                                </button>
                                            </li>
                                            {/* <li>
                                                <button type="button" className='flex justify-start items-center'>
                                                    <FaEdit className='mr-2'/>
                                                    Edit
                                                </button>
                                            </li>
                                            <li>
                                                <button type="button" className='flex justify-start items-center'>
                                                    <FaChartLine className='mr-2'/>
                                                    Activity
                                                </button>
                                            </li>
                                            <li>
                                                <button type="button" className='flex justify-start items-center text-danger hover:!text-red-600'>
                                                    <FaTrash className='mr-2'/>
                                                    Delete
                                                </button>
                                            </li> */}
                                        </ul>
                                        </Dropdown>
                                    </div>
                                </div>

                            </div>
                            <div className="flex flex-col items-center px-3 py-1">
                                {birthdayShow ? <BirthdayAlert name={customerDataById?.name || ""} setBirthdayShow={setBirthdayShow}/> : null}
                                <div className="w-full text-xl font-semibold text-dark dark:text-white-dark py-2 text-left">{customerDataById?.name}</div>
                                {/* <div className="w-full flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light">
                                    <span className="ltr:pr-2 rtl:pl-2">
                                        <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong>Currently at Register 4 with Skylar Zaitshik in store Highway Cannabis.
                                    </span>
                                    <button type="button" className="ltr:ml-auto rtl:mr-auto hover:opacity-80">
                                        <FaTimes/>
                                    </button>
                                </div>  */} 
                                <textarea rows={4} placeholder='Notes' className="form-textarea ltr:rounded-l-none rtl:rounded-r-none my-2 text-dark dark:text-white-dark" onChange={(e) => setCustomerNote(e.target.value)} onBlur={handleCustomerNote} value={customerNote || customerDataById?.note}></textarea>
                                <CustomerProfile customerData={customerDataById}/>
                            </div>
                        </PerfectScrollbar>
                    </div>
                </div>
            </div>

            <CustomerRegisterModal setModalShow={setModalShow} modalShow={modalShow} modalMode={modalMode} dispensaryId={dispensaryId} currentUser={currentUser} />
        </div>
    );
};

export default CustomersTable;
