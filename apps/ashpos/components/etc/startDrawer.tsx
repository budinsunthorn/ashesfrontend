import React, { useState, useEffect, Fragment, useMemo, useRef } from 'react';
import { useAtom } from 'jotai';
import Marquee from "react-fast-marquee";

import Dropdown from '@/components/dropdown';
import { Dialog, Transition, Tab } from '@headlessui/react';
import warnAlert from '../notification/warnAlert';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { TiArrowSortedDown } from 'react-icons/ti';
import { RxCross1 } from 'react-icons/rx';
import { FaRegMoneyBillAlt, FaUser } from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';
import { GoArrowSwitch } from 'react-icons/go';
import { FaCashRegister } from 'react-icons/fa';
import { BsCashCoin } from 'react-icons/bs';
import moment from 'moment';
import { currentDrawerAtom } from '@/store/currentDrawer';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { userDataSave } from '@/store/userData';
import { orderListUpdated } from '@/store/orderListUpdated';

import {
    useStartDrawerMutation,
    useEndDrawerMutation,
    useCurrentDrawerByUserIdQuery,
    useSetUsingRegisterMutation,
    useUsingDrawerByDispensaryIdAndUserIdQuery,
    useCreateMoneyDropMutation,
    useUsingDrawersByDispensaryIdQuery,
    useGetEditOrderCountByDrawerIdQuery,
    useBulkCancelOrderByDrawerIdMutation,
    useDrawerInfoByDrawerIdQuery,
    useDrawerReportByDrawerIdQuery
} from '@/src/__generated__/operations';
import { forEach } from 'lodash';
import successAlert from '../notification/successAlert';
import { error } from 'console';
import OrderStatusBadge from './OrderStatusBadge';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency, truncateToTwoDecimals } from '@/lib/utils';
import DrawerPrint from '../Print/drawerPrint';
import MoneyDropPrint from '../Print/moneyDropPrint';
interface RegisterLabelType {
    [key: string]: string;
}

interface UsingRegister {
    id: string | undefined;
    name: string | undefined;
}

const StartDrawer = () => {
    const { userData } = userDataSave();
    const userId = userData.userId;
    const dispensaryId = userData.dispensaryId;
    const startDrawerMutation = useStartDrawerMutation();
    const endDrawerMutation = useEndDrawerMutation();
    const setUsingRegisterMutation = useSetUsingRegisterMutation();
    const [modal1, setModal1] = useState(false);
    const [endDrawModal, setendDrawModal] = useState(false);
    const [moneyDropModal, setMoneyDropModal] = useState(false);
    const [registerId, setRegisterId] = useState('');
    const [startAmount, setStartAmount] = useState(0);
    const [note, setNote] = useState('');
    const [moneyDropData, setMoneyDropData] = useState({
        drop_type: 'IN', // drop type: IN/OUT
        amount: 0,
        reason: '',
    });
    const [showError, setShowError] = useState(false)
    const [, setCurrentDrawer] = useAtom(currentDrawerAtom);
    const [orderListUpdate, setOrderListUpdate] = useAtom(orderListUpdated);

    const drawerPrintRef = useRef<{ callLocalFunction: () => void }>(null);
    const moneyDropPrintButtonRef = useRef<HTMLDivElement>(null);

    const [endDrawerPrintFlag, setEndDrawerPrintFlag] = useState(false)

    const registerLabel: RegisterLabelType = {
        'register-1': 'Register 1',
        'register-2': 'Register 2',
        'register-3': 'Register 3',
        'register-4': 'Register 4',
    };

    const [cashSales, setCashSales] = useState(0);
    
    const queryClient = useQueryClient();
    const drawerReportContentRef = useRef<HTMLDivElement>(null);

    
    const [currentRegister, setCurrentRegister] = useState<UsingRegister>();
    const createMoneyDrop = useCreateMoneyDropMutation();
    const currentDrawer = useCurrentDrawerByUserIdQuery({ userId: userId });
    const currentDrawerByUserId = currentDrawer?.data?.currentDrawerByUserId;
    const usingDrawer: any = useUsingDrawerByDispensaryIdAndUserIdQuery({ dispensaryId: dispensaryId, userId: userId });
    const usingDrawerData = usingDrawer.data?.usingDrawerByDispensaryIdAndUserId ?? { id: "", name: "",};

    const drawersData = useUsingDrawersByDispensaryIdQuery({dispensaryId : dispensaryId});
    const drawers = drawersData.data?.usingDrawersByDispensaryId ?? [];

    const editOrderCountsData  = useGetEditOrderCountByDrawerIdQuery({drawerId: currentRegister?.id || ""});
    const editOrderCounts = editOrderCountsData.data?.getEditOrderCountByDrawerId?.count;

    const drawerInfoByIdRowdata = useDrawerInfoByDrawerIdQuery({ drawerId: usingDrawerData?.id || '' });
    const drawerInfoById = drawerInfoByIdRowdata.data?.drawerInfoByDrawerId;

    const drawerReportByDrawerId = useDrawerReportByDrawerIdQuery({ drawerId: currentRegister?.id || '' });
    const drawerReportData = drawerReportByDrawerId.data?.drawerReportByDrawerId;

    // console.log("drawerReportData", drawerReportData)

    // Mutation  
    const bulkCancelMutation = useBulkCancelOrderByDrawerIdMutation();

    // const initialRegisterState: UsingRegister = {
    //     id: usingDrawerData?.id,
    //     name: usingDrawerData?.register,
    // };
    // const initialRegisterState: UsingRegister = {
    //     id: "",
    //     name: "",
    // };

    useEffect(() => {

        const refetchDrawersData = async () => {
            await drawersData.refetch();
        }

        const intervalId = setInterval(refetchDrawersData, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);


    useEffect(() => {
        // console.log("useeffect")
        if (usingDrawerData?.id !== '') {
            setCurrentRegister({
                id: usingDrawerData.id,
                name: usingDrawerData.register,
            });
        }
    }, [usingDrawerData]);


    useEffect(() => {
        setCurrentDrawer(currentRegister);
    }, [currentRegister]);


    const handleBulkCancel = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Bulk Cancel?',
            text: 'Are you going to cancel all orders?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await bulkCancelMutation.mutate(
                    {
                        drawerId: currentRegister?.id || '',
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            successAlert('Order Canceled Successfully!');
                            setOrderListUpdate(!orderListUpdate)
                            editOrderCountsData.refetch();

                        },
                    }
                );
            }
        });
    }
    const handleStartDrawer = async (startDrawerFormData: any) => {
        await startDrawerMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    userId: userId,
                    startAmount: +startDrawerFormData.amount,
                    note: note,
                    status: 'PENDING',
                    register: registerId,
                    isUsing: true,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    setCurrentRegister({
                        id: data?.startDrawer?.id,
                        name: data?.startDrawer?.register,
                    });

                    // if (!data) return;
                    
                    currentDrawer.refetch();
                    usingDrawer.refetch();
                },
                onSettled() {
                    // setIsSaveButtonDisabled(false);
                },
            }
        );
    };
    const handleEndDrawer = async (formData: any) => {
        setEndDrawerPrintFlag(false)
        await endDrawerMutation.mutate(
            {
                input: {
                    userId: userId,
                    totalDeposite: formData.deposit_amount - 0,
                    comment: note,
                    endAmount: formData.left_amount - 0,
                    id: currentRegister?.id ?? '',
                    isUsing: true,
                    status: 'PENDING',
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    // if (!data) return;
                    if (data.endDrawer?.register) successAlert(registerLabel[data.endDrawer?.register]  +  ` ended`);
                    
                    if (drawerPrintRef.current) {
                        drawerPrintRef.current.callLocalFunction();
                    }
                    currentDrawer.refetch();
                    // successAlert(currentDispensaryInput.name + ' has been created successfully!');
                },
                onSettled() {
                },
            }
        );
    };
    const handleSwitchRegister = async (id: any) => {
        await setUsingRegisterMutation.mutate(
            {
                input: {
                    id: id,
                    userId: userId
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    setCurrentRegister({
                        id: data.setUsingRegister?.id || '',
                        name: data.setUsingRegister?.register || '',
                    });
                    if (!data) return;
                    
                    usingDrawer.refetch();
                    // successAlert(currentDispensaryInput.name + ' has been created successfully!');
                },
                onSettled() {
                    // setIsSaveButtonDisabled(false);
                },
            }
        );
    };
    const handleDropMoney = async (dropData: any) => {
        setShowError(true)

        await createMoneyDrop.mutate(
            {
                input: {
                    amount: moneyDropData.amount,
                    drawerId: currentRegister?.id || '',
                    dropType: moneyDropData.drop_type == 'IN' ? 'IN' : 'OUT',
                    reason: moneyDropData.reason,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    // if (!data) return;
                    // const refetch = async () => {
                    //     return await queryClient.refetchQueries(['AllDispensariesByOrganizationId']);
                    // };
                    // refetch();
                    // setMoneyDropPrintData({
                    //     drop_type: dropData.drop_type == 'IN' ? 'IN' : 'OUT', 
                    //     drop_amount:  +dropData.drop_amount,
                    //     drop_reason: dropData.reason,
                    //     current_drawer: registerLabel[registerId],
                    // })
                    moneyDropPrintButtonRef?.current?.click()
                    setMoneyDropData({
                        drop_type: 'IN', // drop type: IN/OUT
                        amount: 0,
                        reason: '',
                    })
                    successAlert('Drop Money Success.');
                },
                onSettled() {
                    // setIsSaveButtonDisabled(false);
                },
            }
        );
    };

    // const refetch = async () => {
    //     return await queryClient.refetchQueries(['UsingDrawerByDispensaryIdAndUserId']);
    // };

    const startDrawSchema = Yup.object().shape({
        amount: Yup.number().required('Please fill amount'),
    });

    const endDrawSchema = Yup.object().shape({
        deposit_amount: Yup.number().required('Please fill amount'),
        left_amount: Yup.number().required('Please fill amount'),
    });

    const moneyDropSchema = Yup.object({
        drop_type: Yup.string().required(""),
        drop_amount: Yup.number().required('Please fill amount'),
        reason: Yup.string().required('Please fill reason'),
    });

    return (
        <div>
            <div className="dropdown shrink-0">
                <Dropdown
                    offset={[0, 8]}
                    placement={`bottom-start`}
                    btnClassName="relative block"
                    button={
                        <span
                            className={`group border-b-[1px] dark:bg-inherit border-gray-300 dark:border-[#506690] rounded-sm px-10 py-2 text-xl text-center text-gray-600 dark:text-[#506690] font-bold flex items-center mr-2`}
                            onClick={() => {
                                usingDrawer.refetch();
                            }}
                        >
                            {/* <FaRegArrowAltCircleLeft className="text-lg font-bold text-[#4361ee] mr-2 group-hover:text-white" /> */}
                            <FaCashRegister className="mr-3 text-dark dark:text-white-dark" />
                            {currentRegister?.name ? registerLabel[currentRegister?.name] : 'Start Drawer'}
                            <TiArrowSortedDown className="ml-3 mr-0" />
                            {/* <FaCartArrowDown className="text-lg font-bold text-[#4361ee] ml-2 group-hover:text-white" /> */}
                        </span>
                    }
                >
                    {currentRegister?.id == '' || currentRegister?.id == undefined ? (
                        <ul className="absolute divide-y !py-0 text-dark dark:text-white-dark dark:divide-white/10 w-56 shadow-lg shadow-gray-300 dark:shadow-gray-900">
                            <li onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-[#1e2e4c]">
                                    <h4 className="text-lg text-nowrap text-center">Select Register</h4>
                                </div>
                            </li>
                            {Object.entries(registerLabel).map(([key, value]) => {
                                const item = drawers?.filter((item : any) => item?.register == key)[0];
                                return (
                                <li key={key} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        className="text-base group flex justify-between items-center"
                                        onClick={() => {
                                            if (item?.status == 'PENDING' &&  userId != item?.user?.id) {
                                                warnAlert(`The Drawer is in use by ${item?.user?.name}.`);
                                                return;
                                            }
                                            setRegisterId(key);
                                            setModal1(true);
                                        }}
                                    >
                                            <div className="group flex justify-start items-center">
                                                {/* <GoArrowSwitch className="text-xl mr-3" /> */}
                                                <FaCashRegister className="mr-3 text-dark dark:text-white-dark group-hover:text-primary" />
                                                <span className="text-base text-nowrap mr-2">{value}</span>
                                            </div>
                                            {item?.status === 'PENDING' ? (
                                                <span className="badge flex justify-start items-center bg-info-light text-info dark:bg-info-dark-light w-20">
                                                    <FaUser className="mr-1 text-info" />
                                                    <Marquee direction="left" speed={10} pauseOnHover={true}>
                                                    &nbsp;{` ${item?.user?.name} `}  &nbsp;
                                                        {/* I am a software engineer. */}
                                                    </Marquee>
                                                </span>
                                                ) : null}
                                  
                                    </button>
                                </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <ul className="divide-y !py-0 text-dark dark:text-white-dark text-center dark:divide-white/10 !shadow-xl shadow-gray-500 dark:shadow-gray-900">
                            <li className="flex justify-between items-center !border-0 px-3 py-2">
                                <span className="text-base text-nowrap mr-2">Drawer Started:</span>
                                <span className="text-lg font-bold text-dark dark:text-white-dark text-nowrap">{moment(usingDrawerData?.startedAt).fromNow()}</span>
                            </li>
                            <li className="flex justify-between items-center !border-0 px-3 py-2">
                                <span className="text-base text-nowrap mr-2">Cash Balance</span>
                                <span className="text-lg font-bold text-dark dark:text-white-dark  text-nowrap">{formatCurrency(usingDrawerData?.cashBalance)}</span>
                            </li>
                            <li className="flex justify-between items-center !border-0 px-3 py-2 ">
                                <span className="text-base text-nowrap mr-2"># Orders:</span>
                                <span className="text-lg font-bold text-dark dark:text-white-dark  text-nowrap">{usingDrawerData?.numberOfOrders}</span>
                            </li>
                            <hr />
                            <li className="flex justify-between items-center px-3 py-2">
                                <div className="text-lg text-dark dark:text-white-dark font-bold">Manage Drawer</div>
                            </li>
                            <li
                                className="flex justify-start items-center !border-0 px-3 py-2 cursor-pointer hover:bg-white-light/90 hover:text-primary dark:hover:bg-dark/60"
                                onClick={() => setMoneyDropModal(true)}
                            >
                                <FaRegMoneyBillAlt className="text-xl mr-3" />
                                <span className="text-base text-nowrap mr-2">Money Drop</span>
                            </li>
                            <li
                                className="flex justify-start items-center !border-0 px-3 py-2 cursor-pointer hover:bg-white-light/90 hover:text-primary dark:hover:bg-dark/60"
                                onClick={() => {
                                    setendDrawModal(true);
                                    editOrderCountsData.refetch();
                                    drawerInfoByIdRowdata.refetch();
                                    drawerReportByDrawerId.refetch();
                                    setRegisterId(currentRegister?.name || '');
                                }}
                            >
                                <TbLogout className="text-xl mr-3" />
                                <span className="text-base text-nowrap mr-2">End Drawer</span>
                            </li>
                            <li className="flex justify-between items-center px-3 py-2">
                                <div className="text-lg text-dark dark:text-white-dark font-bold">Switch Register</div>
                            </li>
                            {Object.entries(registerLabel).map(([key, value]) => {
                                const item = drawers?.filter((item : any) => item?.register == key)[0];
                                if (currentRegister?.name == item?.register) return null;
                                return (
                                    <li
                                        key={key}
                                        className="flex justify-between items-center !border-0 px-3 py-2 cursor-pointer hover:bg-white-light/90 hover:text-primary dark:hover:bg-dark/60"
                                        onClick={() => {
                                            if(item?.status == 'PENDING' && userId != item?.user?.id) {
                                                warnAlert(`The Drawer is in use by ${item?.user.name}`);
                                                return;
                                            }
                                            if (item?.status == 'PENDING') handleSwitchRegister(item.id);
                                            else {
                                                setRegisterId(key);
                                                setModal1(true);
                                            }
                                        }}
                                    >
                                        <div className="group flex justify-start items-center">
                                            {/* <GoArrowSwitch className="text-xl mr-3" /> */}
                                            <FaCashRegister className="mr-3 text-dark dark:text-white-dark group-hover:text-primary" />
                                            <span className="text-base text-nowrap mr-2">{value}</span>
                                        </div>
                                        {item?.status == 'PENDING' ? <span className="badge flex justify-start items-center bg-info-light text-info dark:bg-info-dark-light w-20"><FaUser className='mr-1 text-info'/> 
                                                <Marquee direction="left" speed={10} pauseOnHover={true}>
                                                    &nbsp; {item?.user?.name} &nbsp;
                                                     {/* I am a software engineer. */}
                                                </Marquee>
                                        </span> : ''}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Dropdown>
            </div>
            <DrawerPrint className='hidden' drawerId={currentRegister?.id || ''} text={''} ref={drawerPrintRef} />
            <MoneyDropPrint className='hidden' data={moneyDropData} current_drawer={registerLabel[registerId]} printButtonRef={moneyDropPrintButtonRef}/>
            <Transition appear show={modal1} as={Fragment}>
                <Dialog as="div" open={modal1} onClose={() => setModal1(true)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-4 py-2">
                                        <div className="flex items-center text-lg font-bold">
                                            <FaCashRegister className="mr-3 text-dark dark:text-white-dark" />
                                            Start Drawer on {registerLabel[registerId]}
                                        </div>
                                        <button type="button" className="text-dark dark:text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <RxCross1 />
                                        </button>
                                    </div>
                                    <hr />
                                    <Formik
                                        initialValues={{
                                            amount: '',
                                        }}
                                        validationSchema={startDrawSchema}
                                        onSubmit={() => {
                                            // props.modalMode === "new" ? handleCreateCustomer() : handleUpdateOrganization()
                                        }}
                                    >
                                        {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                            <Form>
                                                <div className="p-5">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-full flex justify-between items-center py-2">
                                                            <div className="text-left text-base mr-3 text-nowrap">
                                                                Start Amount
                                                                <span className="text-sm text-red-500 ml-2">*</span>
                                                            </div>

                                                            <div className={`w-full flex ${submitCount ? (errors.amount ? 'has-error' : '') : ''}`}>
                                                                <div
                                                                    className={`bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] ${
                                                                        submitCount ? (errors.amount ? 'has-error' : '') : ''
                                                                    }`}
                                                                >
                                                                    $
                                                                </div>
                                                                {/* <input
                                                                    type="text"
                                                                    name="amount"
                                                                    placeholder="start amount"
                                                                    className="w-full form-input ltr:rounded-l-none rtl:rounded-r-none"
                                                                    onChange={(e) => setStartAmount(Number(e.target.value))}
                                                                /> */}
                                                                <Field
                                                                    id="amount"
                                                                    name="amount"
                                                                    type="text"
                                                                    placeholder="start amount"
                                                                    className="w-full form-input ltr:rounded-l-none rtl:rounded-r-none "
                                                                />
                                                                {/* <ErrorMessage name='amount' component="div"/> */}
                                                            </div>
                                                        </div>
                                                        <div className="w-full flex justify-between items-start py-2">
                                                            <div className="text-left text-base mr-3">Note</div>
                                                            <textarea rows={4} name="note" className="w-full form-textarea" onChange={(e) => setNote(e.target.value)}></textarea>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end items-center mt-8">
                                                        <button type="button" className="btn btn-outline-secondary mr-2" onClick={() => setModal1(false)}>
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary ltr:ml-2 rtl:mr-2"
                                                            onClick={() => {
                                                                if (Object.keys(touched).length !== 0 && Object.keys(errors).length === 0) {
                                                                    handleStartDrawer(values);
                                                                    setModal1(false);
                                                                } else {
                                                                }
                                                                // handleStartDrawer();
                                                            }}
                                                        >
                                                            Start Drawer
                                                        </button>
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={endDrawModal} as={Fragment}>
                <Dialog as="div" open={endDrawModal} onClose={() => setendDrawModal(true)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-4 py-2">
                                        <div className="flex items-center text-lg font-bold">
                                            <FaCashRegister className="mr-3 text-dark group-hover:text-primary" />
                                            End Drawer on {registerLabel[registerId]}
                                        </div>
                                        <button type="button" className="text-dark hover:text-dark dark:text-white-dark" onClick={() => {
                                            setendDrawModal(false);
                                        }}>
                                            <RxCross1 />
                                        </button>
                                    </div>
                                    <hr />
                                    {editOrderCounts && editOrderCounts > 0 ? <div className="flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light">
                                        <span className="ltr:pr-2 rtl:pl-2">
                                            There are <span className="text-xl font-bold">{editOrderCounts}</span> orders on <OrderStatusBadge status={'EDIT'} className='mx-1 !text-[14px]'/> status. Are you going to bulk cancel them?
                                        </span>
                                        <button type="button" className="btn btn-outline-warning ltr:ml-auto rtl:mr-auto hover:opacity-80" onClick={() => handleBulkCancel()}>
                                            Bulk Cancel
                                        </button>
                                    </div>: null}
                                    <Formik
                                        initialValues={{
                                            deposit_amount: '',
                                            left_amount: '',
                                        }}
                                        validationSchema={endDrawSchema}
                                        onSubmit={() => {
                                            // props.modalMode === "new" ? handleCreateCustomer() : handleUpdateOrganization()
                                        }}
                                    >
                                        {({ errors, submitCount, touched, values }) => (
                                            <Form>
                                                <div className="p-5">
                                                    <div className="flex flex-col items-start">
                                                        <div className="flex justify-start items-center py-2 w-full">
                                                            <div className="text-base text-left mr-3 font-bold w-1/3">Starting Balance:</div>
                                                            <div className="text-base">${drawerInfoById?.startingBalance}</div>
                                                        </div>
                                                        <div className="flex justify-start items-center py-2 w-full">
                                                            <div className="text-base text-left mr-3 font-bold w-1/3">Incoming Drops:</div>
                                                            <div className="text-base">${drawerInfoById?.incomingDrops}</div>
                                                        </div>
                                                        <div className="flex justify-start items-center py-2 w-full">
                                                            <div className="text-base text-left mr-3 font-bold w-1/3">Outgoing Drops:</div>
                                                            <div className="text-base">${drawerInfoById?.outgoingDrops}</div>
                                                        </div>
                                                        <div className="flex justify-start items-center py-2 w-full">
                                                            <div className="text-base text-left mr-3 font-bold w-1/3">Cash Sales:</div>
                                                            <div className="text-base">${drawerInfoById?.cashSales}</div>
                                                        </div>
                                                        <div className="flex justify-start items-center py-2 w-full">
                                                            <div className="text-base text-left mr-3 font-bold w-1/3">Change Due:</div>
                                                            <div className="text-base">${drawerInfoById?.changeDue}</div>
                                                        </div>
                                                        <div className="flex justify-start items-center py-2 w-full">
                                                            <div className="text-base text-left mr-3 font-bold w-1/3">Credit/Debit/Other Sales:</div>
                                                            <div className="text-base">${drawerInfoById?.otherSales}</div>
                                                        </div>
                                                        <div className="flex justify-start items-center py-2 w-full">
                                                            <div className="text-base text-left mr-3 font-bold w-1/3">Expected Cash In Drawer:</div>
                                                            <div className="text-base">${drawerInfoById?.expectedCash}</div>
                                                        </div>
                                                        <div className="w-full flex justify-between items-center py-2">
                                                            <div className="text-left text-base mr-3 text-nowrap">
                                                                Total Deposit Amount
                                                                <span className="text-sm text-red-500 ml-2">*</span>
                                                            </div>

                                                            <div className={`w-full flex ${submitCount ? (errors.deposit_amount ? 'has-error' : '') : ''}`}>
                                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                    $
                                                                </div>
                                                                {/* <input
                                                                    type="text"
                                                                    placeholder="Total Deposit Amount"
                                                                    className="w-full form-input ltr:rounded-l-none rtl:rounded-r-none"
                                                                    onChange={(e) => setCashSales(Number(e.target.value))}
                                                                /> */}
                                                                <Field
                                                                    id="deposit"
                                                                    name="deposit_amount"
                                                                    type="text"
                                                                    placeholder="Total Deposit Amount"
                                                                    className="w-full form-input ltr:rounded-l-none rtl:rounded-r-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="w-full flex justify-between items-center py-2">
                                                            <div className="text-left text-base mr-3 text-nowrap">
                                                                Amount Left In Drawer
                                                                <span className="text-sm text-red-500 ml-2">*</span>
                                                            </div>

                                                            <div className={`w-full flex ${submitCount ? (errors.left_amount ? 'has-error' : '') : ''}`}>
                                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                    $
                                                                </div>
                                                                {/* <input
                                                                    type="text"
                                                                    placeholder="Amount Left In Drawer"
                                                                    className="w-full form-input ltr:rounded-l-none rtl:rounded-r-none"
                                                                    onChange={(e) => setStartAmount(Number(e.target.value))}
                                                                /> */}
                                                                <Field
                                                                    id="left_amount"
                                                                    name="left_amount"
                                                                    type="text"
                                                                    placeholder="Amount Left In Drawer"
                                                                    className="w-full form-input ltr:rounded-l-none rtl:rounded-r-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="w-full flex justify-between items-center py-2">
                                                            <div className="text-left text-base mr-3 text-nowrap">Comment</div>

                                                            <div className="w-full flex">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Comment"
                                                                    className="w-full form-input ltr:rounded-l-none rtl:rounded-r-none"
                                                                    onChange={(e) => setNote(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end items-center mt-8">
                                                        <button type="button" className="btn btn-outline-secondary mr-2" onClick={() => setendDrawModal(false)}>
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary ltr:ml-2 rtl:mr-2"
                                                            onClick={() => {
                                                                if (Object.keys(touched).length !== 0 && Object.keys(errors).length === 0) {
                                                                    setendDrawModal(false);
                                                                    handleEndDrawer(values);
                                                                } else {
                                                                }
                                                            }}
                                                        >
                                                            End Drawer
                                                        </button>
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={moneyDropModal} as={Fragment}>
                <Dialog as="div" open={moneyDropModal} onClose={() => setMoneyDropModal(true)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-4 py-2">
                                        <div className="flex items-center text-lg font-bold ">
                                            <BsCashCoin className="mr-3 text-dark group-hover:text-primary" />
                                            Money Drop
                                        </div>
                                        <button type="button" className="text-dark hover:text-dark dark:text-white-dark" onClick={() => setMoneyDropModal(false)}>
                                            <RxCross1 />
                                        </button>
                                    </div>
                                    <hr />
                                    <Formik
                                        initialValues={{
                                            drop_type: "IN",
                                            drop_amount: null,
                                            reason: null,
                                        }}
                                        validationSchema={moneyDropSchema}
                                        onSubmit={() => {
                                            // props.modalMode === "new" ? handleCreateCustomer() : handleUpdateOrganization()
                                        }}
                                    >
                                        {({ errors, submitCount, touched, values }) => (
                                            <Form>
                                                <div className="p-5">
                                                    <div className="flex  flex-col items-start">
                                                        <div className="w-full flex justify-start items-center">
                                                            <div className=" w-[205] text-left text-base mr-3 text-nowrap">
                                                                Drop Type
                                                                <span className="text-sm text-red-500 ml-2">*</span>
                                                            </div>
                                                            <label className="inline-flex mr-3">
                                                                <input
                                                                type="radio"
                                                                name="Drop_type"
                                                                className="form-radio peer text-success"
                                                                checked={moneyDropData.drop_type == 'IN'}
                                                                onChange={() => setMoneyDropData({ ...moneyDropData, drop_type: 'IN' })}
                                                            />
                                                                {/* <Field name="drop_type" type="radio" value="IN" className="form-radio peer text-success" /> */}
                                                                <span className="peer-checked:text-success text-nowrap">Drop In</span>
                                                            </label>

                                                            <label className="inline-flex">
                                                                <input
                                                                type="radio"
                                                                name="Drop_type"
                                                                checked={moneyDropData.drop_type == "OUT"}
                                                                className="form-radio text-warning peer"

                                                                onChange={() => setMoneyDropData({ ...moneyDropData, drop_type: 'OUT' })}
                                                            />
                                                                {/* <Field name="drop_type" type="radio" value="OUT" className="form-radio peer text-warning peer" /> */}
                                                                <span className="peer-checked:text-warning text-nowrap">Drop Out</span>
                                                            </label>
                                                        </div>
                                                        <div className={`w-full flex justify-between items-center py-2 `}>
                                                            <div className="text-left text-base mr-3 text-nowrap">
                                                                Drop Amount
                                                                <span className="text-sm text-red-500 ml-2">*</span>
                                                            </div>
                                                            <div className={`w-full flex ${submitCount ? (moneyDropData.amount ? 'has-error' : '') : ''}`}>
                                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                    $
                                                                </div>
                                                                <input type="number" step="0.01" className="form-input" value={moneyDropData.amount}  onChange={(e) => setMoneyDropData({ ...moneyDropData, amount: Number(e.target.value) })}/>
                                                                {/* <Field
                                                                    id="drop_amount"
                                                                    name="drop_amount"
                                                                    type="text"
                                                                    placeholder="Drop amount"
                                                                    className="w-full form-input ltr:rounded-l-none rtl:rounded-r-none"
                                                                /> */}
                                                            </div>
                                                        </div>
                                                        <div className={`w-full flex justify-between items-start py-2 ${submitCount ? (moneyDropData.reason ? 'has-error' : '') : ''}`}>
                                                            <div className="text-left text-base mr-3 text-nowrap">
                                                                Drop Reason
                                                                <span className="text-sm text-red-500 ml-2">*</span>
                                                            </div>
                                                            <textarea rows={4} className="w-full form-textarea" value={moneyDropData.reason} onChange={(e) => setMoneyDropData({ ...moneyDropData, reason: e.target.value })}></textarea>
                                                            {/* <Field id="reason" name="reason" as="textarea" className="w-full form-textarea"/> */}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end items-center mt-8">
                                                        <button type="button" className="btn btn-outline-secondary mr-2" onClick={() => setMoneyDropModal(false)}>
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary ltr:ml-2 rtl:mr-2"
                                                            onClick={() => {
                                                                // if (Object.keys(touched).length !== 0 && Object.keys(errors).length == 0) {
                                                                    handleDropMoney(values);
                                                                    setMoneyDropModal(false);
                                                                // } else {
                                                                // }
                                                            }}
                                                        >
                                                            Drop
                                                        </button>
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default StartDrawer;
