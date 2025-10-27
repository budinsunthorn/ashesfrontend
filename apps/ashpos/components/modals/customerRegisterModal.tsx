'use client';
import IconX from '@/components/icon/icon-x';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import successAlert from '@/components/notification/successAlert';
import notification from '@/components/notification/notification';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import '@/styles/flatpickr-dark.css';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';

import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useUpdateCustomerMutation, useCreateCustomerMutation } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { isAction } from '@reduxjs/toolkit';
import warnAlert from '../notification/warnAlert';
import IDScannerButton from '../etc/idScanButton';
import IdScan from '../etc/idvc';
import BarcodeScanner from '../etc/barcodeScanner';

const CustomerRegisterModal = (props: any) => {
    const queryClient = useQueryClient();
    const [showIDscan,setShowIDScan] = useState(false);
    const createCustomerMutation = useCreateCustomerMutation();
    const updateCustomerMutation = useUpdateCustomerMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentUser, setCurrentUser] = useState(props.currentUser);
    const [dispensaryId, setDispensaryId] = useState(props.dispensaryId);
    const [isMedical, setIsMedical] = useState(props.currentUser?.isMedical);
    const [isActive, setIsActive] = useState(props.currentUser ? props.currentUser.isActive : true);
    const [MFType, setMFType] = useState(props.currentUser ? props.currentUser.MFType : 'MALE');
    const [customerStatus, setCustomerStatus] = useState(props.currentUser ? props.currentUser.status : 'MEDICALMEMBER');
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const [isTaxExempt, setIsTaxExempt] = useState(props.currentUser ? props.currentUser.isTaxExempt : false);
    const [loyaltyPoint, setLoyaltyPoint] = useState<number|null>(null)

    // console.log("Props", props)
    // console.log("isTaxExempt", isTaxExempt)
    useEffect(() => {
        setCurrentUser(props?.currentUser);
        setIsMedical(props.currentUser?.isMedical);
        setIsActive(props.currentUser ? props.currentUser.isActive : true);
        setIsTaxExempt(props.currentUser ? props.currentUser.isTaxExempt : false)
        setMFType(props.currentUser ? props.currentUser.MFType : 'MALE');
        setCustomerStatus(props.currentUser ? props.currentUser.status : 'MEDICALMEMBER');
    }, [props.modalMode, props.currentUser]);

    const handleCreateCustomer = async (currentCustomerInput: any) => {
        await createCustomerMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    name: currentCustomerInput.name,
                    MFType: MFType == "MALE" ? "MALE" : 'FEMALE',
                    birthday: currentUser.birthday,
                    email: currentUser.email,
                    phone: currentCustomerInput.phone,
                    isMedical: isMedical,
                    isActive: isActive,
                    status: customerStatus == "EMPLOYEE" ? "EMPLOYEE" : customerStatus == "MEDICALMEMBER" ? "MEDICALMEMBER" : "VETERAN" ,
                    driverLicense: currentUser.driverLicense.toUpperCase(),
                    driverLicenseExpirationDate: currentUser.driverLicenseExpirationDate,
                    medicalLicense: currentCustomerInput.medicalLicense.toUpperCase(),
                    medicalLicenseExpirationDate: currentUser.medicalLicenseExpirationDate,
                    isTaxExempt: isTaxExempt,
                    loyaltyPoints: currentUser.loyaltyPoints
                },
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
                    props.setModalShow(false);
                    successAlert(currentCustomerInput.name + ' has been created successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            }
        );
    };
    const handleUpdateUser = async (currentCustomerInput: any) => {
        await updateCustomerMutation.mutate(
            {
                input: {
                    id: currentUser.id,
                    name: currentCustomerInput.name,
                    MFType: MFType == "MALE" ? "MALE" : 'FEMALE',
                    birthday: currentUser.birthday,
                    email: currentUser.email,
                    phone: currentCustomerInput.phone,
                    isMedical: isMedical,
                    isActive: isActive,
                    status: customerStatus == "EMPLOYEE" ? "EMPLOYEE" : customerStatus == "MEDICALMEMBER" ? "MEDICALMEMBER" : "VETERAN" ,
                    driverLicense: currentUser.driverLicense.toUpperCase(),
                    driverLicenseExpirationDate: currentUser.driverLicenseExpirationDate,
                    medicalLicense: currentCustomerInput.medicalLicense.toUpperCase(),
                    medicalLicenseExpirationDate: currentUser.medicalLicenseExpirationDate,
                    isTaxExempt: isTaxExempt,
                    loyaltyPoints: currentUser.loyaltyPoints
                },
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
                    props.setModalShow(false);
                    successAlert(currentCustomerInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            }
        );
    };
    const submitForm = (currentCustomerInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateCustomer(currentCustomerInput) : handleUpdateUser(currentCustomerInput);
    };

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill name'),
        phone: Yup.string().required('Please fill phone'),
        medicalLicense: Yup.string().required('Please fill medical license'),
    });

    return (
        <div className="mb-5">
            <div className="flex justify-center gap-2">
                <div>
                    <Transition appear show={props.modalShow} as={Fragment}>
                        <Dialog as="div" open={props.modalShow} onClose={() => props.setModalShow(true)}>
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
                                        <Dialog.Panel className="panel relative my-8 w-4/5 max-w-5xl rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                            <div className="flex justify-between bg-[#fbfbfb] px-5 pt-3 dark:bg-[#121c2c] rounded-lg">
                                                <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New Customer' : 'Update Customer'}</h5>
                                                <button onClick={() => props.setModalShow(false)} type="button" className="text-dark hover:text-dark dark:text-white-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            {/* <div className={`absolute top-16 right-10 !z-[1000]`}>
                                               <button onClick={() => setShowIDScan(true)} type="button" className="btn btn-outline-primary">
                                                    Input from ID card
                                                </button>    
                                            </div> */}
                                            {/* {showIDscan ? <div className="w-full"><BarcodeScanner setShowIDScan={setShowIDScan}/></div> : null} */}
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                <Formik
                                                    initialValues={{
                                                        name: currentUser?.name,
                                                        phone: currentUser?.phone,
                                                        medicalLicense: currentUser?.medicalLicense,
                                                    }}
                                                    validationSchema={formSchema}
                                                    onSubmit={() => {
                                                        // props.modalMode === "new" ? handleCreateCustomer() : handleUpdateOrganization()
                                                    }}
                                                >
                                                    {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                        <Form className="space-y-5">
                                                            <div className="panel flex flex-col m-3 gap-3">
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center  border-b border-white-light pb-4 dark:border-[#1b2e4b]">
                                                                    <label htmlFor="isActive" className="lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Active
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isActive"
                                                                            defaultChecked={isActive}
                                                                            onChange={() => {
                                                                                setIsActive(!isActive);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div>
                                                               
                                                                <h5 className="text-lg font-semibold dark:text-white-dark w-full">Basic Info</h5>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.name ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="name" className="relative pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Name
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field
                                                                        id="name"
                                                                        name="name"
                                                                        type="text"
                                                                        placeholder="Enter name"
                                                                        className="form-input flex-1"
                                                                        // value={currentUser.name}
                                                                        // onChange={(e: any) => {
                                                                        //   setCurrentUser({ ...currentUser, name: e.target.value })
                                                                        // }
                                                                        // }
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6">
                                                                    <label className="pt-1 lg:text-right text-dark dark:text-white-dark rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">Gender</label>
                                                                    <div className="flex-1">
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="MFType"
                                                                                    className="form-radio"
                                                                                    value="MALE"
                                                                                    onChange={(e) => {
                                                                                        setMFType(e.target.value);
                                                                                    }}
                                                                                    checked={MFType === 'MALE' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Male</span>
                                                                            </label>
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="MFType"
                                                                                    className="form-radio"
                                                                                    value="FEMALE"
                                                                                    onChange={(e) => {
                                                                                        setMFType(e.target.value);
                                                                                    }}
                                                                                    checked={MFType === 'FEMALE' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Female</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 ${submitCount ? (!currentUser.birthday ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="birthday" className="relative pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Birthday
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Flatpickr
                                                                        id="birthday"
                                                                        value={currentUser?.birthday}
                                                                        options={{
                                                                            dateFormat: 'm/d/Y',
                                                                            position: isRtl ? 'auto right' : 'auto left',
                                                                        }}
                                                                        className="form-input flex-1"
                                                                        onChange={(date) => {
                                                                            setCurrentUser({ ...currentUser, birthday: date[0] });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 ${submitCount ? (errors.phone ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="phone" className="relative pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Phone
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field name="phone">
                                                                        {({ field }: FieldProps) => (
                                                                            <MaskedInput
                                                                                {...field}
                                                                                id="phone"
                                                                                type="text"
                                                                                placeholder="(___) ___-____"
                                                                                // value={currentUser?.phone}
                                                                                // onChange={(e: any) => {
                                                                                //     setCurrentUser({ ...currentUser, phone: e.target.value });
                                                                                // }}
                                                                                className="form-input flex-1"
                                                                                mask={['(', /[0-9]/, /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                                            />
                                                                        )}
                                                                    </Field>
                                                                    
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6">
                                                                    <label htmlFor="email" className="pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Email
                                                                    </label>
                                                                    <Field
                                                                        id="email"
                                                                        type="text"
                                                                        placeholder="Enter Customer Email"
                                                                        className="form-input flex-1"
                                                                        value={currentUser?.email}
                                                                        onChange={(e: any) => {
                                                                            setCurrentUser({ ...currentUser, email: e.target.value });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6">
                                                                    <label htmlFor="driverLicense" className="pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Driver License
                                                                    </label>
                                                                    <MaskedInput
                                                                        id="driverLicense"
                                                                        type="text"
                                                                        placeholder="Enter Driver License"
                                                                        className="form-input flex-1 uppercase"
                                                                        value={currentUser?.driverLicense}
                                                                        onChange={(e: any) => {
                                                                            setCurrentUser({ ...currentUser, driverLicense: e.target.value });
                                                                        }}
                                                                        mask={[/[A-z]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6">
                                                                    <label htmlFor="driverLicenseExpirationDate" className="pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Driver License Expire Date
                                                                    </label>
                                                                    <Flatpickr
                                                                        id="driverLicenseExpirationDate"
                                                                        value={currentUser?.driverLicenseExpirationDate}
                                                                        options={{
                                                                            dateFormat: 'm/d/Y',
                                                                            position: isRtl ? 'auto right' : 'auto left',
                                                                        }}
                                                                        className="form-input flex-1"
                                                                        onChange={(date) => {
                                                                            setCurrentUser({ ...currentUser, driverLicenseExpirationDate: date[0] });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6 border-b border-white-light pb-4 dark:border-[#1b2e4b]">
                                                                    <label htmlFor="Loaylty Point" className="pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Loaylty Point
                                                                    </label>
                                                                    <input type="text" className="form-input flex-1" value={currentUser?.loyaltyPoints} onChange={(e) => setCurrentUser({ ...currentUser, loyaltyPoints: Number(e.target.value)})}/>
                                                                </div>

                                                                <h5 className="text-lg font-semibold dark:text-white-dark">Status</h5>
                                                                <div className="flex flex-col sm:flex-row gap-6 border-b border-white-light pb-4 dark:border-[#1b2e4b]">
                                                                    <label className="pt-1 lg:text-right text-dark dark:text-white-dark rtl:ml-2 sm:w-1/4 sm:ltr:mr-2"></label>
                                                                    <div className="flex-1">
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="CustomerStatus"
                                                                                    className="form-radio"
                                                                                    value="MEDICALMEMBER"
                                                                                    onChange={(e) => {
                                                                                        setCustomerStatus(e.target.value);
                                                                                    }}
                                                                                    checked={customerStatus === 'MEDICALMEMBER' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Patient</span>
                                                                            </label>
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="CustomerStatus"
                                                                                    className="form-radio"
                                                                                    value="EMPLOYEE"
                                                                                    onChange={(e) => {
                                                                                        setCustomerStatus(e.target.value);
                                                                                    }}
                                                                                    checked={customerStatus === 'EMPLOYEE' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Employee</span>
                                                                            </label>
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="CustomerStatus"
                                                                                    className="form-radio"
                                                                                    value="VETERAN"
                                                                                    onChange={(e) => {
                                                                                        setCustomerStatus(e.target.value);
                                                                                    }}
                                                                                    checked={customerStatus === 'VETERAN' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Veteran</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <h5 className="text-lg font-semibold dark:text-white-dark">Tax</h5>
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center  border-b border-white-light pb-4 dark:border-[#1b2e4b]">
                                                                    <label htmlFor="isActive" className="lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Tax Exempt
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isTaxExempt"
                                                                            defaultChecked={isTaxExempt}
                                                                            onChange={() => {
                                                                                setIsTaxExempt(!isTaxExempt);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div>
                                                                {/* <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="isMedical" className="lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Status
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isMedical"
                                                                            disabled={true}
                                                                            defaultChecked={isMedical}
                                                                            onChange={() => {
                                                                                setIsMedical(!isMedical);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div> */}
                                                                <h5 className="text-lg font-semibold dark:text-white-dark">Medical Info</h5>
                                                                {isMedical ? 
                                                                <>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.medicalLicense ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="medicalLicense" className="pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Medical License
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field name="medicalLicense">
                                                                        {({ field }: FieldProps) => (
                                                                            <MaskedInput
                                                                                {...field}
                                                                                id="medicalLicense"
                                                                                type="text"
                                                                                placeholder="__-____-____-____-____-____-__"
                                                                                className="form-input flex-1 uppercase"
                                                                                mask={[
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    '-',
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    '-',
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    '-',
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    '-',
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    '-',
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                    '-',
                                                                                    /[0-z]/,
                                                                                    /[0-z]/,
                                                                                ]}
                                                                            />
                                                                        )}
                                                                    </Field>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6">
                                                                    <label htmlFor="medicalLicenseExpirationDate" className="pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Medical License Expire Date
                                                                    </label>
                                                                    <Flatpickr
                                                                        id="medicalLicenseExpirationDate"
                                                                        value={currentUser?.medicalLicenseExpirationDate}
                                                                        options={{
                                                                            dateFormat: 'm/d/Y',
                                                                            position: isRtl ? 'auto right' : 'auto left',
                                                                        }}
                                                                        className="form-input flex-1"
                                                                        onChange={(date) => {
                                                                            setCurrentUser({ ...currentUser, medicalLicenseExpirationDate: date[0] });
                                                                        }}
                                                                    />
                                                                </div>
                                                                </>
                                                                : null}
                                                                <div className="flex flex-col sm:flex-row justify-end ">
                                                                    <button onClick={() => props.setModalShow(false)} type="submit" className="mr-2 btn btn-outline-secondary w-20 !mt-6">
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            // if (props.modalMode === "new" ? ( Object.keys(touched).length !== 0 &&Object.keys(errors).length === 0) : (Object.keys(errors).length === 0)) {
                                                                            if (props.modalMode === "new" ? ( Object.keys(touched).length !== 0 &&Object.keys(errors).length === 0 && currentUser?.birthday) : (Object.keys(errors).length === 0)) {
                                                                                submitForm(values);
                                                                            } else {
                                                                            }
                                                                        }}
                                                                        type="submit"
                                                                        className="btn btn-primary w-20 !mt-6 "
                                                                        disabled={isSaveButtonDisabled}
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </Form>
                                                    )}
                                                </Formik>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                </div>
            </div>
        </div>
    );
};

export default CustomerRegisterModal;
