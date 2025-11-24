'use client';

// Import third party library
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, useRef, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import dropdown from '@/components/dropdown';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import Swal from 'sweetalert2';
import Dropdown from '@/components/dropdown';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import warnAlert from '../notification/warnAlert';
import { useQueryClient } from '@tanstack/react-query';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Barcode from 'react-barcode';
import { Transition, Dialog } from '@headlessui/react';

// Import customized components
import CustomerRegisterModal from '../modals/customerRegisterModal';
import ExportTable from '../etc/exportTable';
import RefreshButton from '../etc/refreshButton';
import CustomerProfile from '../etc/customerDetail';
import successAlert from '../notification/successAlert';
import BirthdayAlert from '../etc/birthdayAlert';

// Import Helper Functions
import { convertPSTTimestampToTimezone } from '@/utils/datetime';

// Import Icon
import { BsColumns, BsThreeDots } from 'react-icons/bs';
import { userDataSave } from '@/store/userData';
import { FaArrowRightFromBracket, FaChartLine, FaPersonCirclePlus, FaPlus, FaTrash } from 'react-icons/fa6';
import { FaCheckCircle, FaEdit, FaRegTimesCircle, FaSave, FaTimes, FaUser } from 'react-icons/fa';
import { SlBasket } from 'react-icons/sl';

// Import Graph Query
import {
    useDeleteCustomerMutation,
    useCustomerQuery,
    useUpdateCustomerNoteByCustomerIdMutation,
    useAllCustomerQueueByDispensaryIdQuery,
    useCheckIsCustomerInQueueQuery,
    useCreateOrderMutation,
    useDeleteCustomerQueueMutation,
    useUpdateCustomerByOrderIdMutation,
    useDeleteCustomerQueueByCustomerIdMutation,
    useCurrentDrawerByUserIdQuery,
    useUsingDrawersByDispensaryIdQuery,
    useCreateCustomerQueueMutation
} from '@/src/__generated__/operations';

// Import jotai atom
import { ActiveSidebarItemAtom } from '@/store/activeSidebarItem';
import { MdOutlineAccessTime } from 'react-icons/md';
import { LuUsers } from 'react-icons/lu';
import BarcodeScanner from '../etc/barcodeScanner';
import IconX from '../icon/icon-x';
import TableLoading from '../etc/tableLoading';

type customerType = {
    name: String;
};

interface RegisterLabelType {
    [key: string]: string;
}

type RowDataType = {
    createdAt?: string; // Date when the record was created
    customer?: customerType | undefined; // Customer name or identifier
    checkedIn: string | undefined;
    customerId?: string | undefined; // Unique identifier for the customer
    dispensaryId?: string | undefined; // Unique identifier for the dispensary
    id?: string | undefined; // Unique identifier for the record
    updatedAt?: string | undefined; // Date when the record was last updated
    userId?: string | undefined; // Unique identifier for the user
};

type RowData = RowDataType[];

const CustomerQueueTable = () => {
    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;
    const queryClient = useQueryClient();
    const [customerId, setCustomerId] = useState('');
    const [customerQueueId, setCustomerQueueId] = useState('');
    const [customerNote, setCustomerNote] = useState('');
    const [birthdayShow, setBirthdayShow] = useState(false);
    const router = useRouter();
    const [activeSidebarItem, setActiveSidebarItem] = useAtom(ActiveSidebarItemAtom);
    const [averageWaitingTime, setAverageWaitingTime] = useState("0");
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [barCodeFromScanner, setBarCodeFromScanner] = useState('');
    const barcodeScanSaveBtn  = useRef<HTMLButtonElement>(null);
    const createCustomerManuallyBtn  = useRef<HTMLDivElement>(null);

    // for right side bar
    const [isAtTop, setIsAtTop] = useState(false);
    const [firstViewed, setFirstViewed] = useState(false);
    const [isRightBarShow, setIsRightBarShow] = useState(true);
    const [selectedRow, setSelectedRow] = useState(0);
    const [tableClassname, setTableClassName] = useState('w-full');
    const targetRef = useRef<HTMLTableElement | null>(null);
    const [isCheckIn, setIsCheckIn] = useState(false);
    const [isCreateOrderButtonDisabled, setIsCreateOrderButtonDisabled] = useState(false);
    const [isSelectCustomer, setIsSelectCustomer] = useState(false);


    const registerLabel: RegisterLabelType = {
        'register-1': 'Register 1',
        'register-2': 'Register 2',
        'register-3': 'Register 3',
        'register-4': 'Register 4',
    };

    // Fetch data
    const allCustomerQueueByDispensaryId = useAllCustomerQueueByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const customerQueueData = allCustomerQueueByDispensaryId.data?.allCustomerQueueByDispensaryId;
    const customerById = useCustomerQuery({ id: customerId });
    const customerDataById = customerById.data?.customer;
    const isCustomerInQueue = useCheckIsCustomerInQueueQuery({ customerId: customerId });
    const currentDrawer = useUsingDrawersByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const currentDrawerByUserId = currentDrawer?.data?.usingDrawersByDispensaryId;

    // Mutation
    const customerNoteMutation = useUpdateCustomerNoteByCustomerIdMutation();
    const deleteCustomerMutation = useDeleteCustomerMutation();
    const deleteCustomerQueueMutation = useDeleteCustomerQueueByCustomerIdMutation();
    const createOrderMutation = useCreateOrderMutation();
    const updateCustomerByOrderIdMudation = useUpdateCustomerByOrderIdMutation();
    const createCustomerQueueMutation = useCreateCustomerQueueMutation();

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const menu = useSelector((state: IRootState) => state.themeConfig.menu);
    const darkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);

    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    //@ts-expect-error
    const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(customerQueueData, 'name'));
    const [recordsData, setRecordsData] = useState(initialRecords?.slice(0, pageSize));
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>(['customerId', 'dispensaryId', 'id', 'userId', 'createdAt', 'updatedAt']);

    const [modalShow, setModalShow] = useState(false);


    // Function to calculate average waiting time
    function calculateAverageWaitingTime() {
        const now = new Date();
        let totalWaitingTime = 0;

        // Calculate total waiting time in milliseconds
        // console.log("calculateAverageWaitingTime");
        if(customerQueueData != undefined && customerQueueData?.length > 0) {

            customerQueueData?.forEach((customer : any) => {
                const createdDate = new Date(customer.createdAt);
                const waitingTime = now.getTime() - createdDate.getTime(); // in milliseconds
                // console.log("waitingTime", waitingTime);
                totalWaitingTime += waitingTime;
            });

            // Calculate average waiting time
            const averageWaitingTime = totalWaitingTime / customerQueueData?.length;

            // Convert average waiting time to minutes
            setAverageWaitingTime((averageWaitingTime / (1000 * 60)).toFixed(0)); // return in minutes
                            
        }
    }

    // function calculateCheckedInTime() {
    //     const today = new Date().toDateString();
    //     const updatedRecords = customerQueueData?.map((item) => {
    //         // Calculate the days between today and the item's createdAt
    //         const daysBetween = moment(item?.createdAt).fromNow();

    //         // Create a new object with the additional property
    //         return {
    //             ...item, // Spread the existing item properties
    //             checkedIn: daysBetween, // Add the new property
    //         };
    //     });

    //     // Update the initialRecords state with the updated records
    //     setRecordsData(updatedRecords || []);
    //     console.log("updatedRecords", updatedRecords);
    // }
    useEffect(() => {
        const button = barcodeScanSaveBtn.current;  

        const handleKeyPress = (e : any) => {  
            if (e.key === 'Enter') {  
                handleCreateCustomerQueue(barCodeFromScanner);  
            }  
        };    
        if (button) { 
            button.addEventListener('keydown', handleKeyPress);  
        }
        return () => {  
            if (button) {  
                button.removeEventListener('keydown', handleKeyPress);  
            }  
        };
        
    },[barcodeScanSaveBtn.current])

    // useEffect(() => {
    //     const button = createCustomerManuallyBtn.current;  


    //     const handleKeyPress = (e : KeyboardEvent) => {  
    //         if (e.key === 'Enter') {  
    //             e.preventDefault();     
    //             handleCreateCustomerQueue(barcode);  
    //         }  
    //     };    
    //     if (button) { 
    //         button.addEventListener('keydown', handleKeyPress);  
    //     }
    //     return () => {  
    //         if (button) {  
    //             button.removeEventListener('keydown', handleKeyPress);  
    //         }  
    //     };
        
    // },[createCustomerManuallyBtn.current])

    useEffect(() => {
        // console.log("customerQueueData", customerQueueData);
        calculateAverageWaitingTime();
        // calculateCheckedInTime();
        const myInterval = setInterval(calculateAverageWaitingTime, 60000);
        // const myInterval2 = setInterval(calculateCheckedInTime, 60000);
        return () => clearInterval(myInterval);
    },[customerQueueData, activeSidebarItem])

    useEffect(() => {
        // set Active Sidebar Item
        setActiveSidebarItem('queue');
        const intervalId = setInterval(() => {
            allCustomerQueueByDispensaryId.refetch();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        setIsCheckIn(false);
        setBirthdayShow(false);
    }, [customerId]);

    useEffect(() => {
        if (isTodayBirthday()) setBirthdayShow(true);
    }, [customerDataById]);

    function isTodayBirthday() {
        const birthday = new Date(customerDataById?.birthday || '');
        const today = new Date();

        return today.getDate() === birthday.getDate() && today.getMonth() === birthday.getMonth();
    }

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

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        if (initialRecords) setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        if(barCodeFromScanner != "")
        setShowBarcodeModal(true);
    }, [barCodeFromScanner])

    // const handleCustomerNote = async () => {
    //     console.log("handleCustomer")
    //     await customerNoteMutation.mutate(
    //         {
    //             input : {
    //                 customerId: customerId,
    //                 note: customerNote
    //             }
    //         },
    //         {
    //             onError(error) {
    //                 warnAlert(error.message);
    //             },
    //             onSuccess(data) {
    //                 if (!data) return;
    //                 successAlert("Customer Note Updated!")
    //             },
    //             onSettled() {},
    //         }
    //     );
    // }

    const handleBarcodeScanner = async (input: any) => {
        setBarCodeFromScanner(input)
        setBarcode(input);
    };

    const handleCreateCustomerQueue = async (input : string) => {
        
        await createCustomerQueueMutation.mutate(
            {
                input : {
                    customerId: input,
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
                    allCustomerQueueByDispensaryId.refetch();
                    // Swal.fire({ title: 'Success!', text: 'Customer has added to queue!', icon: 'success', customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white' });
                },
                onSettled() {},
            }
        );
    }

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

    // useEffect(() => {
    //     if (customerQueueData) {
    //         //@ts-expect-error
    //         setInitialRecords(() => {
    //             return customerQueueData?.filter((item) => {
    //                 return (
    //                     item?.name?.toLowerCase().includes(search.toLowerCase()) ||
    //                     item?.MFType?.toLowerCase().includes(search.toLowerCase()) ||
    //                     item?.birthday?.toLowerCase().includes(search.toLowerCase()) ||
    //                     item?.phone?.toLowerCase().includes(search.toLowerCase()) ||
    //                     item?.email?.toLowerCase().includes(search.toLowerCase()) ||
    //                     item?.driverLicense?.toLowerCase().includes(search.toLowerCase()) ||
    //                     item?.driverLicenseExpirationDate?.toLowerCase().includes(search.toLowerCase()) ||
    //                     item?.medicalLicense?.toLowerCase().includes(search.toLowerCase()) ||
    //                     item?.medicalLicenseExpirationDate?.toLowerCase().includes(search.toLowerCase()) ||
    //                     item?.createdAt.toString().includes(search.toLowerCase()) ||
    //                     item?.updatedAt.toString().includes(search.toLowerCase())
    //                 );
    //             });
    //         });
    //     }
    // }, [search, customerQueueData]);

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
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
                    successAlert('Customer deleted successfully!');
                    allCustomerQueueByDispensaryId.refetch();
                    setIsSelectCustomer(false);
                    // Swal.fire({ title: 'Deleted!', text: 'Customer deleted successfully!', icon: 'success', customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white' });
                },
                onSettled() {},
            }
        );
    };

    // For the right side bar
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

    const handleUpdateCustomer = async (orderNumber: any) => {
        await updateCustomerByOrderIdMudation.mutate(
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
                    setActiveSidebarItem('cashier');
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
                onSettled() {},
            }
        );
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
                    `fixed top-0  ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw-500px)]' : menu == 'vertical' ? 'left-[280px] w-[calc(100vw-780px)]' : 'left-[90px] w-[calc(100vw-590px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            } else {
                setTableClassName(
                    `fixed top-0 ${
                        menu == 'horizontal' ? 'left-0 w-[calc(100vw)]' : menu == 'vertical' ? 'left-[280px] w-[calc(100vw-280px)]' : 'left-[90px] w-[calc(100vw-90px)]'
                    } -translate-x-[20px] h-[100vh] z-[100] bounceInUp1 duration-500`
                );
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-550px)]' : menu == 'vertical' ? 'w-[calc(100vw-810px)]' : 'w-[calc(100vw-620px)]'} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == 'horizontal' ? 'w-[calc(100vw-30px)]' : menu == 'vertical' ? 'w-[calc(100vw-330px)]' : 'w-[calc(100vw-100px)]'} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow]);

    const cols = [
        { accessor: 'createdAt', title: 'Created At' },
        { accessor: 'customer.name', title: 'Name' },
        { accessor: 'checkedIn', title: 'Checked In' },
        { accessor: 'customerId', title: 'Customer ID' },
        { accessor: 'dispensaryId', title: 'Dispensary ID' },
        { accessor: 'id', title: 'ID' },
        { accessor: 'updatedAt', title: 'Updated At' },
        { accessor: 'userId', title: 'User ID' },
    ];

    const handleEnterPress = (event : any) => {
        if (event.key === 'Enter') {
          event.preventDefault(); // Prevent form submission if inside a form
          handleCreateCustomerQueue(barcode);
        }
      };

    return (
        <div className="flex flex-col gap-4">
            <div className='absolute flex justify-end items-center right-[518px]'>
                {/* <span className='mx-2 text-dark dark:text-white-dark'>Input Barcode : </span>
                <div className="flex">
                    <input type='text' placeholder='Input Barcode' className='form-input rounded-r-none text-dark dark:text-white-dark' value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={handleEnterPress}/>
                    <div tabIndex={0} className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] cursor-pointer" onClick={() => handleCreateCustomerQueue(barcode)}>
                        <FaPersonCirclePlus className='text-xl text-info hover:scale-110' />
                    </div>
                </div> */}
                {/* <BarcodeScanner handleBarcodeScanner={handleBarcodeScanner}/> */}
            </div>
            <div className={`panel pt-2 mt-10 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
                <div className="my-2 lg:flex flex-col gap-5 md:sm:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-dark">Customer Queue</h5>
                    <div className={`absolute lg:flex mb-2 items-center gap-2 ltr:ml-auto rtl:mr-auto  ${isRightBarShow ? '!right-[508px]' : 'right-7'}`}>
                        {/* <div>
                            <button type="button" onClick={handleNewUser} className="btn btn-primary rounded-full">
                                <IconPlus className="h-5 w-5 shrink-0 ltr:mr-1.5 rtl:ml-1.5" />
                                New Customer
                            </button>
                        </div> */}
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <RefreshButton onClick={() => allCustomerQueueByDispensaryId.refetch()} />
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
                            <ExportTable cols={cols} recordsData={initialRecords} hideCols={hideCols} filename='customerQueue_table_data'/>
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
                            fetching={allCustomerQueueByDispensaryId.isLoading || allCustomerQueueByDispensaryId.isFetching}
                            loaderBackgroundBlur={80}
                            customLoader={<TableLoading text="Loading Product Data..." />}
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
                                    accessor: 'customer.name',
                                    title: 'Customer',
                                    sortable: true,
                                    hidden: hideCols.includes('customer'),
                                },
                                {
                                    accessor: 'checkedIn',
                                    title: 'Checked In',
                                    sortable: true,
                                    render: (item) => <div>{moment(item?.createdAt).fromNow()}</div>,
                                    hidden: hideCols.includes('checkedIn'),
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
                                    accessor: 'customerId',
                                    title: 'Customer ID',
                                    sortable: true,
                                    hidden: hideCols.includes('customerId'),
                                },
                                {
                                    accessor: 'dispensaryId',
                                    title: 'Dispensary ID',
                                    sortable: true,
                                    hidden: hideCols.includes('dispensaryId'),
                                },
                                {
                                    accessor: 'userId',
                                    title: 'User ID',
                                    sortable: true,
                                    hidden: hideCols.includes('userId'),
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
                                if (record == null) {
                                    return null;
                                }
                                // setPackageId(record.id);
                                setCustomerId(record?.customerId || '');
                                setCustomerQueueId(record?.id || '');
                                setSelectedRow(index);
                                // setIsRightBarShow(true);
                                setIsSelectCustomer(true);
                            }}
                        />
                    </div>
                    <div className={`fixed bottom-0 z-[99] transition-all duration-500 h-full right-0 bg-white ${isRightBarShow ? 'w-[500px]' : 'w-0'}`}>
                        {isSelectCustomer ? (
                            <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                                <PerfectScrollbar>
                                    <div className="py-2 flex justify-end items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                                        {/* <button
                                        type="button"
                                        className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                        onClick={() => setIsRightBarShow(false)}
                                    >
                                        <FaArrowRightFromBracket className="m-auto text-2xl" />
                                    </button> */}
                                        <div className="flex justify-between items-center pr-1">
                                            <button className="btn btn-outline-dark flex justify-between items-center mr-2" onClick={() => handleDeleteCustomerQueue()}>
                                                <FaRegTimesCircle className="mr-1" />
                                                From Queue
                                            </button>
                                            <button
                                                className="btn btn-outline-primary flex justify-between items-center mr-2"
                                                disabled={isCreateOrderButtonDisabled}
                                                onClick={() => handleCreateOrderFromCutomer()}
                                            >
                                                <SlBasket className="mr-1" />
                                                Start Order
                                            </button>

                                            <div className="dropdown">
                                                <Dropdown
                                                    btnClassName="p-[10px] mr-2 border-[1px] border-gray-200 bg-white dark:bg-[#1c2942] dark:border-black-dark-light rounded-md"
                                                    button={
                                                        <>
                                                            <BsThreeDots />
                                                        </>
                                                    }
                                                >
                                                    <ul className="!min-w-[170px] absolute -right-0">
                                                        <li>
                                                            <button type="button" className="flex justify-start items-center">
                                                                Move to Top of Queue
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button type="button" className="flex justify-start items-center">
                                                                <FaEdit className="mr-2" />
                                                                Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button type="button" className="flex justify-start items-center">
                                                                <FaChartLine className="mr-2" />
                                                                Activity
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button type="button" className="flex justify-start items-center text-danger hover:!text-red-600">
                                                                <FaTrash className="mr-2" />
                                                                Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center px-3 py-1">
                                        {birthdayShow ? <BirthdayAlert name={customerDataById?.name || ''} setBirthdayShow={setBirthdayShow} /> : null}
                                        <div className="w-full text-xl font-semibold text-dark dark:text-white-dark py-2 text-left">{customerDataById?.name}</div>
                                        {/* <div className="w-full flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light">
                                            <span className="ltr:pr-2 rtl:pl-2">
                                                <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong>Currently at Register 4 with Skylar Zaitshik in store Highway Cannabis.
                                            </span>
                                            <button type="button" className="ltr:ml-auto rtl:mr-auto hover:opacity-80">
                                                <FaTimes />
                                            </button>
                                        </div> */}
                                        <textarea
                                            rows={4}
                                            placeholder="Notes"
                                            className="form-textarea ltr:rounded-l-none rtl:rounded-r-none my-2 text-dark dark:text-white-dark"
                                            onChange={(e) => setCustomerNote(e.target.value)}
                                            value={customerNote || customerDataById?.note}
                                        ></textarea>
                                        <CustomerProfile customerData={customerDataById} />
                                    </div>
                                </PerfectScrollbar>
                            </div>
                        ) : (
                            <div className="min-h-screen bg-gray-100 dark:bg-[#060818] border-gray-300 border-l-2 dark:border-[#1a1e3b] p-6">
                                <div className="max-w-2xl mx-auto space-y-4">
                                    <h1 className="text-xl font-semibold mb-6 text-dark dark:text-white-dark">Customer Queue Details</h1>

                                    {/* In-Store Section */}
                                    <div>
                                        <div className="flex justify-start items-center bg-theme_green rounded-t-md text-white dark:text-theme_green-dark p-3 text-xl">
                                            <LuUsers className="mr-2" />
                                            In-Store:
                                        </div>
                                        <div className="flex justify-start items-end bg-white dark:bg-black rounded-b-md p-4 shadow-sm">
                                            <span className="mr-2 text-3xl font-bold text-theme_green">{recordsData?.length}</span>
                                            <span className='p-1'>Customers</span>
                                        </div>
                                    </div>

                                    {/* Average Wait Time Section */}
                                    <div>
                                        <div className="flex justify-start items-center bg-theme_green rounded-t-md text-white dark:text-theme_green-dark p-3 text-xl">
                                            <MdOutlineAccessTime className="mr-2" />
                                            Average Wait Time:
                                        </div>
                                        <div className="flex justify-start items-end bg-white dark:bg-black rounded-b-md p-4 shadow-sm">
                                            <span className='text-3xl font-bold mr-2 text-theme_green'>{averageWaitingTime}</span>
                                            <span className='p-1'>minutes</span>
                                        </div>
                                    </div>

                                    {/* Register Status Section */}
                                    <div className="panel">
                                        <h2 className="text-dark dark:text-white-dark font-bold mb-4">REGISTER STATUS</h2>
                                        <div className="space-y-3">
                                            {Object.entries(registerLabel).map(([key, value]) => {
                                                const item = currentDrawer?.data?.usingDrawersByDispensaryId?.filter((item) => item?.register == key)[0];
                                                if(item === undefined) return;
                                                return (
                                                    <div key={key} className="flex justify-between items-center p-4 bg-gray-100 dark:bg-[#1c2942] rounded-lg transition-colors">
                                                        
                                                        <div className='flex justify-start items-center'>
                                                            <span className='text-gray-800 dark:text-inherit font-medium mr-2'>{value}</span>
                                                            <span className='badge flex justify-start items-center bg-info-light text-info dark:bg-info-dark-light'><FaUser className='text-info mr-1 text-[10px]' />{`${item?.user.name}`}</span>    
                                                            
                                                        </div>
                                                        <span className="inline-flex items-center px-3 py-1
                                                            rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                                                        <span className="w-2 h-2 mr-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                                            Available
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* <div className="p-6 space-y-4">
                                        {registers.map((register) => (
                                            <div
                                            key={register.id}
                                            className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors"
                                            >
                                            <span className="text-gray-800 dark:text-gray-200 font-medium">
                                                {register.label}
                                            </span>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                                                <span className="w-2 h-2 mr-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                                Available
                                            </span>
                                            </div>
                                        ))}
                                    </div> */}
                                </div>
                            </div>
                            
                        )}
                    </div>
                </div>
                <Transition appear show={showBarcodeModal} as={Fragment}>
                        <Dialog as="div" open={showBarcodeModal} onClose={() => setShowBarcodeModal(true)}>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
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
                                        <Dialog.Panel className="panel relative my-8 w-2/5 max-w-5xl rounded-lg border-0 p-0 text-dark dark:text-white-dark">
                                            <div className="flex justify-between bg-[#fbfbfb] px-5 pt-3 dark:bg-[#121c2c] rounded-lg">
                                                <h5 className="text-lg font-bold">Barcode Scan Result</h5>
                                                <button onClick={() => setShowBarcodeModal(false)} type="button" className="text-dark hover:text-dark dark:text-white-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            <div className={`w-full flex flex-col items-center justify-center py-6`}>
                                                <div className='text-center py-2'>Customer Id : {barCodeFromScanner}</div>
                                                <Barcode value={barCodeFromScanner}/>   
                                            </div>
                                            {/* {showIDscan ? <div className="w-full"><BarcodeScanner setShowIDScan={setShowIDScan}/></div> : null} */}
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg p-5">
                                                <div className="flex flex-col sm:flex-row justify-end ">
                                                    <button onClick={() => setShowBarcodeModal(false)} className="mr-2 btn btn-outline-secondary w-20 !mt-6">
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleCreateCustomerQueue(barCodeFromScanner);
                                                        }}
                                                        className="btn btn-primary w-20 !mt-6 "
                                                        disabled={barcode == ""}
                                                        ref={barcodeScanSaveBtn}
                                                    >
                                                        Save
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

export default CustomerQueueTable;
