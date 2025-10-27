'use client';
import IconX from '@/components/icon/icon-x';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import successAlert from '@/components/notification/successAlert';
import notification from '@/components/notification/notification';
import { stateOfUsaData } from '@/store/stateOfUsa';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';
import { IRootState } from '@/store';

import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';

import { useCreateDispensaryMutation, useUpdateDispensaryMutation } from '@/src/__generated__/operations';
import { StateType, Timezones } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import warnAlert from '../notification/warnAlert';


type timeZoneItem = {
    value : Timezones,
    displayName : string

}
const DispensaryRegisterModal = (props: any) => {
    const queryClient = useQueryClient();
    const createDispensaryMutation = useCreateDispensaryMutation();
    const updateDispensaryMutation = useUpdateDispensaryMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentDispensary, setCurrentDispensary] = useState(props.currentDispensary);
    const [dispensaryType, setDispensaryType] = useState(props.currentDispensary.dispensaryType);
    const [isActive, setIsActive] = useState(props.currentDispensary.isActive);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType)

    const Timezones: timeZoneItem[] = [
        { value: "AKST", displayName: "Alaska Standard Time" },
        { value: "CST", displayName: "Central Standard Time" },
        { value: "EST", displayName: "Eastern Standard Time" },
        { value: "HAST", displayName: "Hawaii-Aleutian Standard Time" },
        { value: "MST", displayName: "Mountain Standard Time" },
        { value: "PST", displayName: "Pacific Standard Time" }
      ]

    useEffect(() => {
        setCurrentDispensary(props.currentDispensary);
        setDispensaryType(props.currentDispensary.dispensaryType);
        setIsActive(props.currentDispensary.isActive);
    }, [props.modalMode, props.currentDispensary]);

    const handleCreateOrganization = async (currentDispensaryInput: any) => {
        if (props.currentOrganizationId === 0) {
            notification('warning', 'Please select an organization.');
            return;
        }
        await createDispensaryMutation.mutate(
            {
                input: {
                    name: currentDispensaryInput.name,
                    dispensaryType: dispensaryType,
                    cannabisLicense: currentDispensaryInput.cannabisLicense?.toUpperCase(),
                    cannabisLicenseExpireDate: currentDispensary.cannabisLicenseExpireDate,
                    businessLicense: currentDispensary.businessLicense?.toUpperCase(),
                    organizationId: props.currentOrganizationId,
                    phone: currentDispensaryInput.phone,
                    email: currentDispensaryInput.email,
                    locationAddress: currentDispensaryInput.locationAddress,
                    locationCity: currentDispensaryInput.locationCity,
                    locationState: currentDispensary.locationState,
                    storeTimeZone: currentDispensary.storeTimeZone,
                    locationZipCode: currentDispensaryInput.locationZipCode,
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
                        return await queryClient.refetchQueries(['AllDispensariesByOrganizationId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentDispensaryInput.name + ' has been created successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const handleUpdateDispensary = async (currentDispensaryInput: any) => {
        await updateDispensaryMutation.mutate(
            {
                input: {
                    id: currentDispensary.id,
                    name: currentDispensaryInput.name,
                    dispensaryType: dispensaryType,
                    cannabisLicense: currentDispensary.cannabisLicense.toUpperCase(),
                    cannabisLicenseExpireDate: currentDispensary.cannabisLicenseExpireDate,
                    businessLicense: currentDispensary.businessLicense?.toUpperCase(),
                    phone: currentDispensaryInput.phone,
                    email: currentDispensaryInput.email,
                    locationAddress: currentDispensaryInput.locationAddress,
                    locationCity: currentDispensaryInput.locationCity,
                    locationState: currentDispensary.locationState,
                    storeTimeZone : currentDispensary.storeTimeZone,
                    locationZipCode: currentDispensaryInput.locationZipCode,
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
                        return await queryClient.refetchQueries(['AllDispensariesByOrganizationId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentDispensaryInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const submitForm = (currentDispensaryInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateOrganization(currentDispensaryInput) : handleUpdateDispensary(currentDispensaryInput);
    };

    const formSchema = Yup.object().shape({
        cannabisLicense: Yup.string().required('Please fill the cannabis license'),
        name: Yup.string().required('Please fill the name'),
        phone: Yup.string().required('Please fill the phone'),
        email: Yup.string().email('Invalid email').required('Please fill the email'),
        locationAddress: Yup.string().required('Please fill the locationAddress'),
        locationCity: Yup.string().required('Please fill the locationCity'),
        locationState: Yup.string().required('Please fill the locationState'),
        locationZipCode: Yup.string().required('Please fill the locationZipCode'),
        // cannabisLicenseExpireDate: Yup.string().required('Please fill the cannabisLicenseExpireDate'),
    });

    return (
        <div className="mb-5">
            <Transition appear show={props.modalShow} as={Fragment}>
                <Dialog as="div" open={props.modalShow} onClose={() => props.setModalShow(true)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                <Dialog.Panel className="panel my-8 w-4/5 max-w-5xl rounded-lg border-0 p-0  text-dark dark:text-white-dark">
                                    <div className="flex justify-between bg-[#fbfbfb] px-5 pt-3 dark:bg-[#121c2c] rounded-lg">
                                        <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New Dispensary' : 'Update Dispensary'}</h5>
                                        <button onClick={() => props.setModalShow(false)} type="button" className="text-dark dark:text-white-dark hover:text-dark">
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                        <Formik
                                            initialValues={{
                                                name: currentDispensary.name,
                                                cannabisLicense: currentDispensary.cannabisLicense,
                                                // cannabisLicenseExpireDate: currentDispensary.cannabisLicenseExpireDate,
                                                phone: currentDispensary.phone,
                                                email: currentDispensary.email,
                                                locationAddress: currentDispensary.locationAddress,
                                                locationCity: currentDispensary.locationCity,
                                                locationState: currentDispensary.locationState,
                                                locationZipCode: currentDispensary.locationZipCode,
                                            }}
                                            validationSchema={formSchema}
                                            onSubmit={() => {
                                                // props.modalMode === "new" ? handleCreateOrganization() : handleUpdateOrganization()
                                            }}
                                        >
                                            {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                <Form className="space-y-5">
                                                    <div className="panel flex flex-col m-3 gap-2">
                                                        <h5 className="text-lg font-semibold dark:text-white-dark">Details </h5>
                                                        <div className="flex flex-col sm:flex-row gap-6 items-center">
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
                                                            <label htmlFor="name" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                Store Name
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            <Field id="name" name="name" type="text" placeholder="Enter Store Name" className="form-input flex-1" />
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-6">
                                                            <label className="pt-1 lg:text-right text-dark dark:text-white-dark  rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">Store Type</label>
                                                            <div className="flex-1">
                                                                <div className="mb-2">
                                                                    <label className="mt-1 inline-flex cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name="dispensaryType"
                                                                            className="form-radio"
                                                                            value="MED"
                                                                            onChange={(e) => {
                                                                                setDispensaryType(e.target.value);
                                                                            }}
                                                                            checked={dispensaryType === 'MED' ? true : false}
                                                                        />
                                                                        <span className="text-white-dark">Medical</span>
                                                                    </label>
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label className="mt-1 inline-flex cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name="dispensaryType"
                                                                            className="form-radio"
                                                                            value="REC"
                                                                            onChange={(e) => {
                                                                                setDispensaryType(e.target.value);
                                                                            }}
                                                                            checked={dispensaryType === 'REC' ? true : false}
                                                                        />
                                                                        <span className="text-white-dark">Recreational</span>
                                                                    </label>
                                                                </div>
                                                                <div>
                                                                    <label className="mt-1 inline-flex">
                                                                        <input
                                                                            type="radio"
                                                                            name="dispensaryType"
                                                                            className="form-radio"
                                                                            value="MEDREC"
                                                                            onChange={(e) => {
                                                                                setDispensaryType(e.target.value);
                                                                            }}
                                                                            checked={dispensaryType === 'MEDREC' ? true : false}
                                                                        />
                                                                        <span className="text-white-dark">Med/Rec</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.cannabisLicense ? 'has-error' : '') : ''}`}>
                                                            <label htmlFor="cannabisLicense" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                Cannabis License
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            {/* <Field name="cannabisLicense">
                                                                {({ field }: FieldProps) => (
                                                                    <MaskedInput
                                                                        {...field}
                                                                        id="cannabisLicense"
                                                                        type="text"
                                                                        placeholder="____-____-____"
                                                                        className="form-input flex-1 uppercase"
                                                                        mask={[/[0-z]/, /[0-z]/, /[0-z]/, /[0-z]/, '-', /[0-z]/, /[0-z]/, /[0-z]/, /[0-z]/, '-', /[0-z]/, /[0-z]/, /[0-z]/, /[0-z]/]}
                                                                    />
                                                                )}
                                                            </Field> */}
                                                            <Field
                                                                id="cannabisLicense"
                                                                name="cannabisLicense"
                                                                placeholder="Enter Cannabis License"
                                                                className="form-input flex-1"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-6">
                                                            <label htmlFor="medicalLicenseExpirationDate" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                Cannabis License Expire Date
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            <Flatpickr
                                                                id="cannabisLicenseExpireDate"
                                                                value={currentDispensary.cannabisLicenseExpireDate}
                                                                options={{
                                                                    dateFormat: 'm/d/Y',
                                                                    position: isRtl ? 'auto right' : 'auto left',
                                                                }}
                                                                className={`form-input flex-1 ${submitCount && !currentDispensary.cannabisLicenseExpireDate ? "!border-[#e7515a] !bg-[#e7515a14] " : ""}`}
                                                                onChange={(date) => {
                                                                    setCurrentDispensary({ ...currentDispensary, cannabisLicenseExpireDate: date[0] });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                            <label htmlFor="businessLicense" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                Business License
                                                            </label>
                                                            <Field
                                                                id="businessLicense"
                                                                type="text"
                                                                placeholder="Enter Business License"
                                                                className="form-input flex-1 uppercase"
                                                                value={currentDispensary.businessLicense}
                                                                onChange={(e: any) => {
                                                                    setCurrentDispensary({ ...currentDispensary, businessLicense: e.target.value });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className={`flex flex-col sm:flex-row gap-6 items-center  ${submitCount ? (errors.phone ? 'has-error' : '') : ''}`}>
                                                            <label htmlFor="phone" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                Phone
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            {/* <MaskedInput
                                                                id="phone"
                                                                type="text"
                                                                placeholder="(___) ___-____"
                                                                value={currentDispensary.phone}
                                                                onChange={(e: any) => {
                                                                    setCurrentDispensary({ ...currentDispensary, phone: e.target.value });
                                                                }}
                                                                className="form-input flex-1"
                                                                mask={['(', /[0-9]/, /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                            /> */}
                                                            <Field name="phone">
                                                                {({ field }: FieldProps) => (
                                                                    <MaskedInput
                                                                        {...field}
                                                                        id="phone"
                                                                        type="text"
                                                                        placeholder="(___) ___-____"
                                                                        className="form-input flex-1"
                                                                        mask={['(', /[0-9]/, /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                                    />
                                                                )}
                                                            </Field>
                                                            {/* <Field
                                                                id="phone"
                                                                type="text"
                                                                placeholder="Enter Phone Number"
                                                                className="form-input flex-1"
                                                                value={currentDispensary.phone}
                                                                onChange={(e: any) => {
                                                                setCurrentDispensary({ ...currentDispensary, phone: e.target.value })
                                                                }}
                                                            /> */}
                                                        </div> 
                                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.email ? 'has-error' : '') : ''}`}>
                                                            <label htmlFor="email" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                Email
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            <Field
                                                                id="email"
                                                                name="email"
                                                                placeholder="Enter Store Email"
                                                                className="form-input flex-1"
                                                                // value={currentDispensary.email}
                                                                // onChange={(e: any) => {
                                                                //     setCurrentDispensary({ ...currentDispensary, email: e.target.value });
                                                                // }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="panel flex flex-col m-3 gap-2">
                                                        <h5 className="text-lg font-semibold dark:text-white-dark">Location</h5>
                                                        <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                            <label htmlFor="storeTimeZone" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                Store TimeZone
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            <select
                                                                onChange={(e) => {
                                                                    setCurrentDispensary({ ...currentDispensary, storeTimeZone: e.target.value });
                                                                }}
                                                                id="locationState"
                                                                className="flex-initial w-64 form-select mt-1"
                                                                placeholder='select the timezone'
                                                                name="locationState"
                                                                defaultValue={currentDispensary.storeTimeZone}
                                                            >
                                                                {/* <option value='' className='text-dark dark:text-white-dark'>select the timezone</option> */}
                                                                {Timezones?.map((row) => {
                                                                    return (
                                                                        <option key={row.value} value={row.value}>
                                                                            {row.displayName}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>

                                                        </div>
                                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.locationAddress ? 'has-error' : '') : ''}`}>
                                                            <label htmlFor="locationAddress" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                Address
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            <Field
                                                                id="locationAddress"
                                                                name="locationAddress"
                                                                type="text"
                                                                placeholder="Enter Store Address"
                                                                className="form-input flex-1"
                                                                // value={currentDispensary.locationAddress}
                                                                // onChange={(e: any) => {
                                                                //     setCurrentDispensary({ ...currentDispensary, locationAddress: e.target.value });
                                                                // }}
                                                            />
                                                        </div>
                                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.locationCity ? 'has-error' : '') : ''}`}>
                                                            <label htmlFor="locationCity" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                City
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            <Field
                                                                id="locationCity"
                                                                name="locationCity"
                                                                type="text"
                                                                placeholder="Enter City"
                                                                className="form-input flex-1"
                                                                // value={currentDispensary.locationCity}
                                                                // onChange={(e: any) => {
                                                                //     setCurrentDispensary({ ...currentDispensary, locationCity: e.target.value });
                                                                // }}
                                                            />
                                                        </div>
                                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.locationState ? 'has-error' : '') : ''}`}>
                                                            <label htmlFor="locationState" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                State
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            <select
                                                                onChange={(e) => {
                                                                    setCurrentDispensary({ ...currentDispensary, locationState: e.target.value });
                                                                }}
                                                                id="locationState"
                                                                className={`flex-initial w-64 form-select mt-1`}
                                                                name="locationState"
                                                                placeholder='select the state'
                                                                value={currentDispensary.locationState}
                                                            >
                                                                {/* <option value='' className='text-dark dark:text-white-dark'>select the state</option> */}
                                                                {stateOfUsaData?.map((row) => {
                                                                    return (
                                                                        <option key={row.value} value={row.value}>
                                                                            {row?.label}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                            {/* <Field
                                                                    id="locationState"
                                                                    type="text"
                                                                    placeholder="Enter State"
                                                                    className="form-input flex-1"
                                                                    value={currentDispensary.locationState}
                                                                    onChange={(e: any) => {
                                                                    setCurrentDispensary({ ...currentDispensary, locationState: e.target.value })
                                                                    }}
                                                                /> */}
                                                        </div>
                                                        <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.locationZipCode ? 'has-error' : '') : ''}`}>
                                                            <label htmlFor="locationZipCode" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                Zip Code
                                                                <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                            </label>
                                                            <Field name="locationZipCode">
                                                                {({ field }: FieldProps) => (
                                                                    <MaskedInput
                                                                        {...field}
                                                                        id="locationZipCode"
                                                                        type="text"
                                                                        placeholder="Enter Zip Code"
                                                                        className="form-input flex-1"
                                                                        mask={[/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                                    />
                                                                )}
                                                            </Field>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row justify-end ">
                                                            <button onClick={() => props.setModalShow(false)} type="submit" className="mr-2 btn btn-outline-secondary w-20 !mt-6 ">
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    console.log("save button", currentDispensary.cannabisLicenseExpireDate, props.modalMode)
                                                                    console.log("errors", errors)
                                                                    if (props.modalMode === "new" ? ( Object.keys(touched).length !== 0 && Object.keys(errors).length === 0 && currentDispensary.cannabisLicenseExpireDate) : (Object.keys(errors).length === 0)) {
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
    );
};

export default DispensaryRegisterModal;
