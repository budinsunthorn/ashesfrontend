'use client';
import IconX from '@/components/icon/icon-x';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import successAlert from '@/components/notification/successAlert';
import notification from '@/components/notification/notification';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';
import { IRootState } from '@/store';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CirclePicker } from 'react-color';

import { useUpdateDiscountMutation, useCreateDiscountMutation } from '@/src/__generated__/operations';
import { DiscountType } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { isAction } from '@reduxjs/toolkit';
import { BackColors } from '@/store/colors';
import warnAlert from '../notification/warnAlert';
import CirclePickerWrapper from '../etc/colorPickerWrapper';
import { discountOptions } from '@/utils/variables';

const DiscountModal = (props: any) => {
    const queryClient = useQueryClient();
    const createDiscountMutation = useCreateDiscountMutation();
    const updateDiscountMutation = useUpdateDiscountMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentDiscount, setCurrentDiscount] = useState(props.currentDiscount);
    const [dispensaryId, setDispensaryId] = useState(props.dispensaryId);
    const [applyDurationSet, setApplyDurationSet] = useState(props.currentDiscount.applyDurationSet);
    const [isAdminPin, setIsAdminPin] = useState(props.currentDiscount.isAdminPin);
    const [isActive, setIsActive] = useState(props.currentDiscount.isActive);
    const [discountType, setDiscountType] = useState<DiscountType>(props.currentDiscount.type);
    const [applyTarget, setApplyTarget] = useState(props.currentDiscount.applyTarget);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType)

    const [enterAmountFlag, setEnterAmountFlag] = useState(false);
    const [limitAmountFlag, setLimitAmountFlag] = useState(true);
    // const [limitAmount, setLimitAmount] = useState(0);


    useEffect(() => {
        setCurrentDiscount(props.currentDiscount);
        setApplyDurationSet(props.currentDiscount.applyDurationSet);
        setIsAdminPin(props.currentDiscount.isAdminPin);
        setIsActive(props.currentDiscount.isActive);
        setDiscountType(props.currentDiscount.type);
        setApplyTarget(props.currentDiscount.applyTarget);
    }, [props.modalMode, props.currentDiscount]);

    const handleCreateDiscount = async (currentDiscountInput: any) => {
        await createDiscountMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    applyTarget: applyTarget,
                    name: currentDiscountInput.name,
                    type: discountType as DiscountType,
                    applyDurationSet: applyDurationSet,
                    applyTo: currentDiscount.applyTo,
                    applyFrom: currentDiscount.applyFrom,
                    discountPercent: +currentDiscountInput.discountPercent,
                    color: currentDiscount.color,
                    isAdminPin: isAdminPin,
                    isActive: isActive,
                    isEnterManualAmount: enterAmountFlag,
                    isLimitManualAmount: limitAmountFlag,
                    manualDiscountLimitPercent: +currentDiscountInput.discountPercent,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllDiscountsByDispensaryId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentDiscountInput.name + ' has been created successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const handleUpdateDiscount = async (currentDiscountInput: any) => {
        await updateDiscountMutation.mutate(
            {
                input: {
                    id: currentDiscount.id,
                    applyTarget: applyTarget,
                    name: currentDiscountInput.name,
                    type: discountType,
                    applyDurationSet: applyDurationSet,
                    applyTo: currentDiscount.applyTo,
                    applyFrom: currentDiscount.applyFrom,
                    discountPercent: +currentDiscountInput.discountPercent,
                    color: currentDiscount.color,
                    isAdminPin: isAdminPin,
                    isActive: isActive,
                    isEnterManualAmount: enterAmountFlag,
                    isLimitManualAmount: limitAmountFlag,
                    manualDiscountLimitPercent: +currentDiscountInput.discountPercent,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllDiscountsByDispensaryId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentDiscountInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const submitForm = (currentDiscountInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateDiscount(currentDiscountInput) : handleUpdateDiscount(currentDiscountInput);
    };

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the discount name'),
        discountPercent: Yup.string().required('Please fill the discount percent'),
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
                                        <Dialog.Panel className="panel my-8 w-4/5 max-w-5xl rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                            <div className="flex justify-between bg-[#fbfbfb] px-5 pt-3 dark:bg-[#121c2c] rounded-lg">
                                                <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New Discount' : 'Update Discount'}</h5>
                                                <button onClick={() => props.setModalShow(false)} type="button" className="text-dark hover:text-dark dark:text-white-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                <Formik
                                                    initialValues={{
                                                        name: currentDiscount.name,
                                                        discountPercent: (currentDiscount.discountPercent || ""),
                                                    }}
                                                    validationSchema={formSchema}
                                                    onSubmit={() => {
                                                        // props.modalMode === "new" ? handleCreateDiscount() : handleUpdateOrganization()
                                                    }}
                                                >
                                                    {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                        <Form className="space-y-5">
                                                            <div className="panel flex flex-col m-3 gap-3">
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-white-light pb-4 dark:border-[#1b2e4b]">
                                                                    <label htmlFor="isActive" className="lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
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
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.name ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="name" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Name
                                                                        <span className="text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field
                                                                        id="name"
                                                                        name="name"
                                                                        type="text"
                                                                        placeholder="Enter Discount Name"
                                                                        className="form-input flex-1"
                                                                        // value={currentDiscount.name}
                                                                        // onChange={(e: any) => {
                                                                        //   setCurrentDiscount({ ...currentDiscount, name: e.target.value })
                                                                        // }
                                                                        // }
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="isAdminPin" className="lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Enter Amount at Register
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isAdminPin"
                                                                            defaultChecked={enterAmountFlag}
                                                                            onChange={() => {
                                                                                setEnterAmountFlag(!enterAmountFlag);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div>
                                                                {enterAmountFlag ? 
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="isAdminPin" className="lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Limit Manual Discount Amounts
                                                                        
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isAdminPin"
                                                                            defaultChecked={limitAmountFlag}
                                                                            onChange={() => {
                                                                                setLimitAmountFlag(!limitAmountFlag);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div>      
                                                                : 
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                                    <label htmlFor="storeTimeZone" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Discount Type
                                                                        <span className="text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <select
                                                                        onChange={(e) => {
                                                                            setDiscountType(e.target.value as DiscountType);
                                                                        }}
                                                                        id="locationState"
                                                                        className="flex-initial w-64 form-select mt-1"
                                                                        placeholder='select the timezone'
                                                                        name="locationState"
                                                                        defaultValue={discountType}
                                                                    >
                                                                        <option value='' className='text-dark dark:text-white-dark'>select the discount type</option>
                                                                        {discountOptions.map(option => (
                                                                            <option key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                            ))}
                                                                    </select>

                                                                </div>
                                                                }
                                                                {enterAmountFlag && limitAmountFlag ? 
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.discountPercent ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="discountPercent" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Manual Discount Limit Percentage
                                                                        <span className="text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <div className="flex">
                                                                        <Field
                                                                            id="discountPercent"
                                                                            name="discountPercent"
                                                                            type="number"
                                                                            placeholder="Enter Discount Percent"
                                                                            className="form-input flex-1 ltr:rounded-l-md ltr:rounded-r-none rtl:rounded-l-none rtl:rounded-r-md"
                                                                            // value={limitAmount}
                                                                            // onChange={(e: any) => {
                                                                            //   setLimitAmount(Number(e.target.value))
                                                                            // }}
                                                                        />
                                                                        <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                            %
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                : null}
                                                                {/* <div className="flex flex-col sm:flex-row gap-6 border-b border-white-light pb-4 dark:border-[#1b2e4b]">
                                                                    <label className="pt-1 lg:text-right text-dark dark:text-white-dark  rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">Type</label>
                                                                    <div className="flex-1">
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="discountType"
                                                                                    className="form-radio"
                                                                                    value="STANDARD"
                                                                                    onChange={(e) => {
                                                                                        setDiscountType(e.target.value);
                                                                                    }}
                                                                                    checked={discountType === 'STANDARD' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Standard</span>
                                                                            </label>
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="discountType"
                                                                                    className="form-radio"
                                                                                    value="OTHER"
                                                                                    onChange={(e) => {
                                                                                        setLoyaltyType(e.target.value);
                                                                                    }}
                                                                                    checked={discountType === 'OTHER' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Other</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div> */}

                                                                {/* <h5 className="text-lg font-semibold dark:text-white-dark">Apply</h5>
                                                                <div className="flex flex-col sm:flex-row gap-6">
                                                                    <label className="pt-1 lg:text-right text-dark dark:text-white-dark  rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">Apply To</label>
                                                                    <div className="flex-1">
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="CustomerStatus"
                                                                                    className="form-radio"
                                                                                    value="MEDICALMEMBER"
                                                                                    onChange={(e) => {
                                                                                        setApplyTarget(e.target.value);
                                                                                    }}
                                                                                    checked={applyTarget === 'MEDICALMEMBER' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Medical Member</span>
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
                                                                                        setApplyTarget(e.target.value);
                                                                                    }}
                                                                                    checked={applyTarget === 'EMPLOYEE' ? true : false}
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
                                                                                        setApplyTarget(e.target.value);
                                                                                    }}
                                                                                    checked={applyTarget === 'VETERAN' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Veteran</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div> */}
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="isApply" className="lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                    Discount Duration
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isApply"
                                                                            defaultChecked={applyDurationSet}
                                                                            onChange={() => {
                                                                                setApplyDurationSet(!applyDurationSet);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row ${applyDurationSet ? '' : 'hidden'}`}>
                                                                    <label className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2"></label>
                                                                    <div className="flex gap-1">
                                                                        <label className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">From</label>
                                                                        <Flatpickr
                                                                            id="applyFrom"
                                                                            value={currentDiscount.applyFrom}
                                                                            options={{
                                                                                dateFormat: 'm/d/Y',
                                                                                position: isRtl ? 'auto right' : 'auto left',
                                                                            }}
                                                                            className="form-input"
                                                                            onChange={(date) => {
                                                                                setCurrentDiscount({ ...currentDiscount, applyFrom: date[0] });
                                                                            }}
                                                                        />
                                                                        <label className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">To</label>
                                                                        <Flatpickr
                                                                            id="applyTo"
                                                                            value={currentDiscount.applyTo}
                                                                            options={{
                                                                                dateFormat: 'm/d/Y',
                                                                                position: isRtl ? 'auto right' : 'auto left',
                                                                            }}
                                                                            className="form-input"
                                                                            onChange={(date) => {
                                                                                setCurrentDiscount({ ...currentDiscount, applyTo: date[0] });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.discountPercent ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="discountPercent" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Discount Percent
                                                                    </label>
                                                                    <div className="flex">
                                                                        <Field
                                                                            id="discountPercent"
                                                                            name="discountPercent"
                                                                            type="number"
                                                                            // value={0}
                                                                            placeholder="Enter Discount Percent"
                                                                            className="form-input flex-1 ltr:rounded-l-md ltr:rounded-r-none rtl:rounded-l-none rtl:rounded-r-md"
                                                                            // value={currentDiscount.discountPercent}
                                                                            // onChange={(e: any) => {
                                                                            //   setCurrentDiscount({ ...currentDiscount, discountPercent: e.target.value })
                                                                            // }}
                                                                        />
                                                                        <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                            %
                                                                        </div>
                                                                    </div>
                                                                </div> */}
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center border-t border-white-light pt-4 dark:border-[#1b2e4b]">
                                                                    <label htmlFor="isAdminPin" className="lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Require Admin Pin Code
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isAdminPin"
                                                                            defaultChecked={isAdminPin}
                                                                            onChange={() => {
                                                                                setIsAdminPin(!isAdminPin);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6 border-t border-white-light pt-4 dark:border-[#1b2e4b]">
                                                                    <label htmlFor="color" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Color
                                                                    </label>
                                                                    <CirclePickerWrapper
                                                                        color={currentDiscount.color}
                                                                        colors={BackColors}
                                                                        onChange={(e: any) => {
                                                                            setCurrentDiscount({ ...currentDiscount, color: e.hex });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row justify-end ">
                                                                    <button onClick={() => props.setModalShow(false)} type="submit" className="mr-2 btn btn-outline-secondary w-20 !mt-6">
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (props.modalMode === "new" ? ( Object.keys(touched).length !== 0 &&Object.keys(errors).length === 0) : (Object.keys(errors).length === 0)) {
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

export default DiscountModal;
