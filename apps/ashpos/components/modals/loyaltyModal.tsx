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

import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CirclePicker } from 'react-color';

import { useUpdateLoyaltyMutation, useCreateLoyaltyMutation } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { isAction } from '@reduxjs/toolkit';
import { BackColors } from '@/store/colors';
import warnAlert from '../notification/warnAlert';
import CirclePickerWrapper from '../etc/colorPickerWrapper';

const LoyaltyModal = (props: any) => {
    const queryClient = useQueryClient();
    const createLoyaltyMutation = useCreateLoyaltyMutation();
    const updateLoyaltyMutation = useUpdateLoyaltyMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentLoyalty, setCurrentLoyalty] = useState(props.currentLoyalty);
    const [dispensaryId, setDispensaryId] = useState(props.dispensaryId);
    const [applyDurationSet, setApplyDurationSet] = useState(props.currentLoyalty.applyDurationSet);
    const [isAdminPin, setIsAdminPin] = useState(props.currentLoyalty.isAdminPin);
    const [isActive, setIsActive] = useState(props.currentLoyalty.isActive);
    const [loyaltyType, setLoyaltyType] = useState(props.currentLoyalty.type);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType)

    useEffect(() => {
        setCurrentLoyalty(props.currentLoyalty);
        setApplyDurationSet(props.currentLoyalty.applyDurationSet);
        setIsAdminPin(props.currentLoyalty.isAdminPin);
        setIsActive(props.currentLoyalty.isActive);
        setLoyaltyType(props.currentLoyalty.type);
    }, [props.modalMode, props.currentLoyalty]);

    const handleCreateLoyalty = async (currentLoyaltyInput: any) => {
        await createLoyaltyMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    name: currentLoyaltyInput.name,
                    type: loyaltyType,
                    applyDurationSet: applyDurationSet,
                    applyTo: currentLoyalty.applyTo,
                    applyFrom: currentLoyalty.applyFrom,
                    pointWorth: currentLoyaltyInput.pointWorth,
                    color: currentLoyalty.color,
                    isAdminPin: isAdminPin,
                    isActive: isActive,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllLoyaltiesByDispensaryId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentLoyaltyInput.name + ' has been created successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const handleUpdateLoyalty = async (currentLoyaltyInput: any) => {
        await updateLoyaltyMutation.mutate(
            {
                input: {
                    id: currentLoyalty.id,
                    name: currentLoyaltyInput.name,
                    type: loyaltyType,
                    applyDurationSet: applyDurationSet,
                    applyTo: currentLoyalty.applyTo,
                    applyFrom: currentLoyalty.applyFrom,
                    pointWorth: currentLoyaltyInput.pointWorth,
                    color: currentLoyalty.color,
                    isAdminPin: isAdminPin,
                    isActive: isActive,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllLoyaltiesByDispensaryId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentLoyaltyInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const submitForm = (currentLoyaltyInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateLoyalty(currentLoyaltyInput) : handleUpdateLoyalty(currentLoyaltyInput);
    };

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the loyalty name'),
        pointWorth: Yup.string().required('Please fill the organization point worth'),
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
                                                <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New Loyalty' : 'Update Loyalty'}</h5>
                                                <button onClick={() => props.setModalShow(false)} type="button" className="text-dark hover:text-dark dark:text-white-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                <Formik
                                                    initialValues={{
                                                        name: currentLoyalty.name,
                                                        pointWorth: currentLoyalty.pointWorth,
                                                    }}
                                                    validationSchema={formSchema}
                                                    onSubmit={() => {
                                                        // props.modalMode === "new" ? handleCreateLoyalty() : handleUpdateOrganization()
                                                    }}
                                                >
                                                    {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                        <Form className="space-y-5">
                                                            <div className="panel flex flex-col m-3 gap-3">
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-white-light pb-4 dark:border-[#1b2e4b]">
                                                                    <label htmlFor="isActive" className="lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
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
                                                                    <label htmlFor="name" className="relative pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Name
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field
                                                                        id="name"
                                                                        name="name"
                                                                        type="text"
                                                                        placeholder="Enter Loyalty Name"
                                                                        className="form-input flex-1"
                                                                        // value={currentLoyalty.name}
                                                                        // onChange={(e: any) => {
                                                                        //   setCurrentLoyalty({ ...currentLoyalty, name: e.target.value })
                                                                        // }
                                                                        // }
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6">
                                                                    <label className="pt-1 lg:text-right text-dark  rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">Type</label>
                                                                    <div className="flex-1">
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="loyaltyType"
                                                                                    className="form-radio"
                                                                                    value="MANUAL"
                                                                                    onChange={(e) => {
                                                                                        setLoyaltyType(e.target.value);
                                                                                    }}
                                                                                    checked={loyaltyType === 'MANUAL' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Manual</span>
                                                                            </label>
                                                                        </div>
                                                                        {/* <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="loyaltyType"
                                                                                    className="form-radio"
                                                                                    value="OTHER"
                                                                                    onChange={(e) => {
                                                                                        setLoyaltyType(e.target.value);
                                                                                    }}
                                                                                    checked={loyaltyType === 'OTHER' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Other</span>
                                                                            </label>
                                                                        </div> */}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="isSetDuration" className="lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Loyalty Duration
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isSetDuration"
                                                                            defaultChecked={applyDurationSet}
                                                                            onChange={() => {
                                                                                setApplyDurationSet(!applyDurationSet);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row ${applyDurationSet ? '' : 'hidden'}`}>
                                                                    <label className="pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2"></label>
                                                                    <div className="flex gap-1">
                                                                        <label className="pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">From</label>
                                                                        <Flatpickr
                                                                            id="applyFrom"
                                                                            value={currentLoyalty.applyFrom}
                                                                            options={{
                                                                                dateFormat: 'm/d/Y',
                                                                                position: isRtl ? 'auto right' : 'auto left',
                                                                            }}
                                                                            className="form-input"
                                                                            onChange={(date) => {
                                                                                setCurrentLoyalty({ ...currentLoyalty, applyFrom: date[0] });
                                                                            }}
                                                                        />
                                                                        <label className="pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">To</label>
                                                                        <Flatpickr
                                                                            id="applyTo"
                                                                            value={currentLoyalty.applyTo}
                                                                            options={{
                                                                                dateFormat: 'm/d/Y',
                                                                                position: isRtl ? 'auto right' : 'auto left',
                                                                            }}
                                                                            className="form-input"
                                                                            onChange={(date) => {
                                                                                setCurrentLoyalty({ ...currentLoyalty, applyTo: date[0] });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.pointWorth ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="pointWorth" className="relative pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Individual Point Value
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>                                                                    </label>
                                                                    <div className="flex">
                                                                        <Field
                                                                            id="pointWorth"
                                                                            name="pointWorth"
                                                                            type="number"
                                                                            placeholder="Enter Point Worth"
                                                                            className="form-input flex-1 ltr:rounded-l-md ltr:rounded-r-none rtl:rounded-l-none rtl:rounded-r-md"
                                                                            // value={currentLoyalty.pointWorth}
                                                                            // onChange={(e: any) => {
                                                                            //   setCurrentLoyalty({ ...currentLoyalty, pointWorth: e.target.value })
                                                                            // }}
                                                                        />
                                                                        <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                            $
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center border-t border-white-light pt-4 dark:border-[#1b2e4b]">
                                                                    <label htmlFor="isAdminPin" className="lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Pin Code
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
                                                                    <label htmlFor="color" className="pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Color
                                                                    </label>
                                                                    <CirclePickerWrapper
                                                                        color={currentLoyalty.color}
                                                                        colors={BackColors}
                                                                        onChange={(e: any) => {
                                                                            setCurrentLoyalty({ ...currentLoyalty, color: e.hex });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row justify-end ">
                                                                    <button onClick={() => props.setModalShow(false)} type="submit" className="mr-2 btn btn-outline-secondary w-20 !mt-6 ">
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

export default LoyaltyModal;
