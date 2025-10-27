'use client';
import { useEffect, useRef, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from '@/components/etc/customeSelect';
import { DataTable } from 'mantine-datatable';
import moment from 'moment';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { useAtom } from 'jotai';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Barcode from 'react-barcode';
import { Transition, Dialog } from '@headlessui/react';
import { useDebouncedCallback } from 'use-debounce';

// Custom Component
import warnAlert from '@/components/notification/warnAlert';
import successAlert from '@/components/notification/successAlert';
import PerfectScrollbar from 'react-perfect-scrollbar';

// API
import { useAllCustomerQueueByDispensaryIdQuery, useAllCustomersByDispensaryIdQuery, useCheckIsCustomerInQueueQuery, useCreateCustomerQueueMutation, useCustomerQuery, useDeleteCustomerQueueByCustomerIdMutation, useAllCustomersByDispensaryIdAndNameAndLicenseSearchQuery } from '@/src/__generated__/operations';

// Store
import { userDataSave } from '@/store/userData';
import { IRootState } from '@/store';
import { customerIdAtom } from '@/store/customerId';

// Icons
import { FaCheck, FaSave, FaTrash, FaUsers } from 'react-icons/fa';
import { TfiTrash } from "react-icons/tfi";
import IconX from '@/components/icon/icon-x';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';
import { FaPersonCirclePlus } from 'react-icons/fa6';
import { RiUserReceived2Fill } from 'react-icons/ri';
import BarcodeScanner from '@/components/etc/barcodeScanner';
import { BiBarcodeReader } from 'react-icons/bi';
import CustomUserSelect from '@/components/etc/customeUserSelect';

const CustomerQueueSidebar = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();

    const {userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const userId = userData.userId;
    const [customerId, setCustomerId] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [barCodeFromScanner, setBarCodeFromScanner] = useState('');
    const barcodeScanSaveBtn  = useRef<HTMLButtonElement>(null);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [modalShow, setModalShow] = useState(false);
    const MySwal = withReactContent(Swal);

    const [autoFocus, setAutoFocus] = useState(false);
    
    let customerOptions : any = [];

    // Atom
    const [customerIdStore, setCustomerIdStore] = useAtom(customerIdAtom);

    // Fetch data   
    const customerDataById = useCustomerQuery({ id: customerId });
    const customerById = customerDataById.data?.customer;

    const allCustomersByDispensaryId = useAllCustomersByDispensaryIdAndNameAndLicenseSearchQuery({ dispensaryId: dispensaryId, searchQuery: searchQuery });
    const customerData = allCustomersByDispensaryId.data?.allCustomersByDispensaryIdAndNameAndLicenseSearch;

    // const checkIsCustomerInQueue = useCheckIsCustomerInQueueQuery({customerId: customerId})
    // const isCustomerInQueue = checkIsCustomerInQueue.data?.checkIsCustomerInQueue;

    const allCustomerQueueByDispensaryId = useAllCustomerQueueByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const customerQueueData = allCustomerQueueByDispensaryId.data?.allCustomerQueueByDispensaryId;

    // Mutatin
    const createCustomerQueueMutation = useCreateCustomerQueueMutation();
    const deleteCustomerQueueMutation = useDeleteCustomerQueueByCustomerIdMutation();


    if (customerData && Array.isArray(customerData)) {
        // customerOptions.push({ value: '', label: 'Select customer' });
        customerData.map((category: any) => {
            customerOptions.push({ value: category.id, label: category.name + ' (' + category.medicalLicense + ')', name: category.name, isMedical: category.isMedical });
            return null; // Make sure to return a value in the map function
        });
    }


    const [showCustomizer, setShowCustomizer] = useState(false);

    // useEffect(() => {
    //     if (barCodeFromScanner) {
    //         setShowBarcodeModal(true);
    //     }
    // },[barCodeFromScanner])

    // useEffect(() => {
    //     const button = barcodeScanSaveBtn.current;  

    //     const handleKeyPress = (e : any) => {  
    //         if (e.key === 'Enter') {  
    //             handleCreateCustomerQueue(barCodeFromScanner);  
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
        
    // },[barcodeScanSaveBtn.current])

    useEffect(() => {
        if(showCustomizer){
            allCustomerQueueByDispensaryId.refetch();
            setRefreshFlag(!refreshFlag)
        }
        setAutoFocus(!autoFocus);
    },[showCustomizer])
    
    const handleUpdateCustomer = (customerId : any) => {
        // console.log('customerId', customerId);
        setCustomerId(customerId);
    }

    // console.log('customerData', customerData);
    const showBottomAlert = (text:any) => {
        MySwal.fire({
            title: text,
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            showCloseButton: true,
        });
    };

    // const handleBarcodeScanner = async (input: any) => {
    //     setBarCodeFromScanner(input)
    //     setBarcode(input);
    // };

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

    const handleAddCustomer = async () => {
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
                    // warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    // successAlert("Customer has added to queue!")
                    showBottomAlert("Customer has added to queue!");
                    allCustomerQueueByDispensaryId.refetch();
                    // Swal.fire({ title: 'Success!', text: 'Customer has added to queue!', icon: 'success', customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white' });
                },
                onSettled() {},
            }
        );
    };

    const handleEnterPress = (event : any) => {
        if (event.key === 'Enter') {
          event.preventDefault(); // Prevent form submission if inside a form
          handleCreateCustomerQueue(barcode);
        }
    };

    const handleSelectCustomer = (id : any) => {
        setSelectedCustomerId(id);
        setCustomerIdStore(id);
        setShowCustomizer(false);
    }

    const handleDeleteCustomerQueue = async (id: any) => {
        await deleteCustomerQueueMutation.mutate(
            {
                customerId: id,
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    // successAlert('Customer deleted successfully!');
                    allCustomerQueueByDispensaryId.refetch();
                    // Swal.fire({ title: 'Deleted!', text: 'Customer deleted successfully!', icon: 'success', customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white' });
                },
                onSettled() {},
            }
        );
    };

    const handleSearch = useDebouncedCallback((param) => {
        setSearchQuery(param);
    }, 500);

    const handleOnsearch = (searchParam: string) => {
        setSearchQuery(searchParam);
    }
    return (
        <div>
            <div className={`${(showCustomizer && '!block') || ''} fixed inset-0 z-[101] hidden bg-[black]/60 px-4 transition-[display]`} onClick={() => setShowCustomizer(false)}></div>
            <nav
                className={`${
                    (showCustomizer && 'ltr:!right-0 rtl:!left-0') || ''
                } fixed bottom-0 top-0 z-[101] w-full max-w-[400px] bg-white shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-300 ltr:-right-[400px] rtl:-left-[400px] dark:bg-black`}
            >
                <button
                    type="button"
                    className="absolute bottom-0 top-0 my-auto -translate-y-7 flex h-10 w-12 cursor-pointer items-center justify-center bg-primary text-primary-light ltr:-left-12 ltr:rounded-bl-full ltr:rounded-tl-full rtl:-right-12 rtl:rounded-br-full rtl:rounded-tr-full"
                    onClick={() => setShowCustomizer(!showCustomizer)}
                >
                    <FaUsers className="h-5 w-5" />
                </button>
                <div className="h-full flex-col justify-between items-center overflow-hidden"> 
                    <div className="relative text-center pt-4 pb-2 px-4 bg-success-light text-success dark:bg-success-dark-light">
                        {/* <button type="button" className="absolute top-1/2 -translate-y-1/2 right-4 opacity-30 hover:opacity-100 ltr:right-0 rtl:left-0 dark:text-white" onClick={() => setShowCustomizer(false)}>
                            <IconX className="h-5 w-5" />
                        </button> */}
                        <FaUsers className='absolute top-1/2 -translate-y-1/2 left-4 !h-10 text-4xl mr-2'/>
                        <div className="mb-1 text-xl font-bold"><span className='text-3xl font-bold mx-2'>{customerQueueData?.length}</span> Customers in Queue</div>
                        {/* <p className="text-white-dark">Set preferences that will be cookied for your live preview demonstration.</p> */}
                    </div>
                    <hr className='dark:border-[#1b2e4b]'/>
                    <div className='absolute px-4 my-2 flex justify-end items-center right-[-229px]'>
                        {/*  <span className='mr-2 text-nowrap text-dark dark:text-white-dark'>
                            <BiBarcodeReader className="mx-2 text-success text-4xl" />
                        </span>
                        <div className="flex">
                            <input type='text' placeholder='Input Barcode' className='form-input rounded-r-none min-w-44 text-dark dark:text-white-dark' value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={handleEnterPress}/>
                            <div tabIndex={0} className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] cursor-pointer" onClick={() => handleCreateCustomerQueue(barcode)}>
                                <FaPersonCirclePlus className='text-xl text-info' />
                            </div>
                        </div>*/}
                        {/* <BarcodeScanner handleBarcodeScanner={handleBarcodeScanner} refreshFlag={showCustomizer}/> */}
                    </div> 
                    <div className='flex justify-start items-center my-4 px-4 text-dark'>
                        {/* <FaUsers className='text-2xl text-primary mr-2'/>  */}
                        <CustomUserSelect
                            options={customerOptions}
                            onChange={handleUpdateCustomer}
                            currentOption={customerById?.name || ""}
                            setModalShow={setModalShow}
                            onSearch={handleSearch}
                            autoFocus={true}
                            disabled={false}
                            isAddCustomerIcon={false}
                            searchDisplayText='Search by Customer Id, Name, Medical License'
                            isSelectOpen={showCustomizer}
                        />
                        {customerById?.name == null || customerById?.name == undefined ? null 
                        :
                        <Tippy content="Add to queue" placement='top'> 
                            <span><FaPersonCirclePlus className='text-3xl text-info hover:text-[#72bdfa] ml-3 cursor-pointer' onClick={()  => handleAddCustomer()}/></span>
                        </Tippy>    
                        }
                    </div>
                
                    {/* <div className="datatables">
                        <div className={`transition-transform duration-300`}>
                            <DataTable
                                className={`table-hover whitespace-nowrap`}
                                records={customerQueueData ?? []}
                                columns={[
                                    {
                                        accessor: 'index',
                                        title: '#',
                                        width: 40,
                                        render: (record) => (customerQueueData ? customerQueueData.indexOf(record) + 1 : 0),
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
                                    },
                                    {
                                        accessor: 'checkedIn',
                                        title: 'Checked In',
                                        sortable: true,
                                        render: (item) => <div>{moment(item?.createdAt).fromNow()}</div>,
                                    },
                                    
                                ]}
                                highlightOnHover
                                totalRecords={customerQueueData?.length ?? 0}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={(p) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={setPageSize}
                                minHeight={200}
                                // paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                onRowClick={(record, index) => {
                                }}
                            />
                        </div>
                    </div> */}
                    {/* {customerQueueData?.length && customerQueueData?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center my-2">
                            <FaCheck className="h-5 w-5 text-success cursor-pointer" onClick={() => handleSelectCustomer(item?.id)}/>
                            <div className="flex justify-between items-center text-dark px-4 w-full">
                                <span>{item?.customer.name}</span>
                                <span className='ml-2'>{moment(item?.createdAt).fromNow()}</span>
                            </div>
                            <FaTrash className="h-5 w-5 text-danger cursor-pointer" onClick={() => handleDeleteCustomer(item?.id)}/>
                        </div>
                    ))}  */}
                        
                    {/* Customer List */}
                    <div className='h-[80%]'>
                        <PerfectScrollbar className=''>
                            <div className="divide-y h-full">
                                {customerQueueData && customerQueueData?.length > 0 && customerQueueData?.map((customer, key) => (
                                <div key={key} className='relative hover:bg-gray-50 dark:hover:bg-black-dark-light group transition-colors dark:border-black-medium'>
                                    <div
                                        key={customer?.id}
                                        className="flex items-center justify-between p-4 cursor-pointer"
                                        onClick={() => handleSelectCustomer(customer?.customerId)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <button
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                                ${
                                                    selectedCustomerId == customer?.customerId
                                                    ? "bg-theme_green text-white"
                                                    : "bg-gray-100 dark:bg-[#1c2942] text-gray-400 hover:bg-green-100 hover:text-theme_green"
                                                }`}
                                            >
                                                {/* <IoCheckmarkDoneOutline size={16} /> */}
                                                <Tippy content="Start Order" placement="top">
                                                    <span><RiUserReceived2Fill size={16} /></span>
                                                </Tippy>
                                            </button>
                                            <div>
                                                <h3 className="font-medium text-gray-800 dark:text-gray-400">{customer?.customer.name}</h3>
                                                <p className="text-sm text-dark">{moment(customer?.createdAt).fromNow()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                    onClick={() => handleDeleteCustomerQueue(customer?.customerId)}
                                    className="absolute top-1/2 -translate-y-1/2 right-5 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-[#1c2942] transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Tippy content="Remove from Queue" placement="top">
                                            <span><TfiTrash size={16} /></span>
                                        </Tippy>
                                    </button>
                                </div>
                                ))}
                            </div>
                        </PerfectScrollbar>
                    </div>
                    {/* Empty State */}
                    {(customerQueueData && customerQueueData?.length === 0 ) ?
                        <div className="p-8 text-center text-dark">
                            <p>No customers in the queue</p>
                        </div>
                    : null}
                </div>
            </nav>
            {/* <Transition appear show={showBarcodeModal && showCustomizer && barCodeFromScanner != ""} as={Fragment}>
                    <Dialog as="div" open={showBarcodeModal && showCustomizer && barCodeFromScanner != ""} onClose={() => setShowBarcodeModal(true)}>
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
                                    <Dialog.Panel className="panel relative my-8 w-2/5 max-w-5xl rounded-lg border-0 p-0 text-black dark:text-white-dark">
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
                </Transition> */}
        </div>
    );
};

export default CustomerQueueSidebar
