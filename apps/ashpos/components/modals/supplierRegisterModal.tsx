'use client';
import IconX from '@/components/icon/icon-x';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import successAlert from '@/components/notification/successAlert';
import notification from '@/components/notification/notification';
import { stateOfUsaData } from '@/store/stateOfUsa';
import { supplierTypeList } from '@/store/supplierType';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';

import { Formik, Form, Field, FieldProps } from 'formik';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import warnAlert from '@/components/notification/warnAlert';
import { useCreateSupplierMutation, useUpdateSupplierMutation } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { userDataSave } from '@/store/userData';

const SupplierRegisterModal = (props: any) => {
    const queryClient = useQueryClient();

    const createSupplierMutation = useCreateSupplierMutation();
    const updateSupplierMutation = useUpdateSupplierMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(props.currentSupplier);
    const [isActive, setIsActive] = useState(props.currentSupplier.isActive);

    // console.log("currentSupplier", currentSupplier)
    useEffect(() => {
        setCurrentSupplier(props.currentSupplier);
        setIsActive(props.currentSupplier.isActive);
    }, [props.modalMode, props.currentSupplier]);

    const handleCreateSupplier = async (currentSupplyInput: any) => {
        if (props.currentOrganizationId === '') {
            notification('warning', 'Please select an organization.');
            return;
        }
        await createSupplierMutation.mutate(
            {
                input: {
                    name: currentSupplyInput.name,
                    supplierType: currentSupplier.supplierType,
                    businessLicense: currentSupplyInput.businessLicense.toUpperCase(),
                    UBI: currentSupplier.UBI,
                    organizationId: props.currentOrganizationId,
                    phone: currentSupplyInput.phone,
                    email: currentSupplyInput.email,
                    locationAddress: currentSupplyInput.locationAddress,
                    locationCity: currentSupplyInput.locationCity,
                    locationState: currentSupplier.locationState,
                    locationZipCode: currentSupplyInput.locationZipCode,
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
                        return await queryClient.refetchQueries(['AllSuppliersByOrganizationId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentSupplyInput.name + ' has been created successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const handleUpdateSupplier = async (currentSupplyInput: any) => {
        if(currentSupplier.locationState == '' || currentSupplier.locationState == null || currentSupplier.supplierType == '' || currentSupplier.supplierType == null) {
            setIsSaveButtonDisabled(false);
            notification('warning', 'Please fill all required fields.');
            return;
        }
        await updateSupplierMutation.mutate(
            {
                input: {
                    id: currentSupplier.id,
                    name: currentSupplyInput.name,
                    supplierType: currentSupplier.supplierType,
                    businessLicense: currentSupplyInput.businessLicense.toUpperCase(),
                    UBI: currentSupplier.UBI,
                    phone: currentSupplyInput.phone,
                    email: currentSupplyInput.email,
                    locationAddress: currentSupplyInput.locationAddress,
                    locationCity: currentSupplyInput.locationCity,
                    locationState: currentSupplier.locationState,
                    locationZipCode: currentSupplyInput.locationZipCode,
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
                        return await queryClient.refetchQueries(['AllSuppliersByOrganizationId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentSupplyInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const submitForm = (currentSupplyInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateSupplier(currentSupplyInput) : handleUpdateSupplier(currentSupplyInput);
    };

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the Supplier Name'),
        businessLicense: Yup.string().required('Please fill the Business License'),
        phone: Yup.string().required('Please fill medical license'),
        email: Yup.string().required('Please fill email'),
        // supplierType: Yup.string().required("Please fill supplier type"),
        // UBI: Yup.string().required('Please fill the UBI'),
        // phone: Yup.string().required('Please fill the UBI'),
        // email: Yup.string().email('Invalid email').required('Please fill the UBI'),
        // locationAddress: Yup.string().required('Please fill the locationAddress'),
        // locationCity: Yup.string().required('Please fill the locationCity'),
        // locationState: Yup.string().required('Please fill the locationState'),
        // locationZipCode: Yup.string().required('Please fill the locationZipCode'),
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
                                                <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New Supplier' : 'Update Supplier'}</h5>
                                                <button onClick={() => props.setModalShow(false)} type="button" className="text-dark dark:text-white-dark hover:text-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                <Formik
                                                    initialValues={{
                                                        name: currentSupplier.name,
                                                        businessLicense: currentSupplier.businessLicense,
                                                        // UBI: currentSupplier.UBI,
                                                        phone: currentSupplier.phone,
                                                        email: currentSupplier.email,
                                                        // locationAddress: currentSupplier.locationAddress,
                                                        // locationCity: currentSupplier.locationCity,
                                                        // locationState: currentSupplier.locationState,
                                                        // locationZipCode: currentSupplier.locationZipCode,
                                                    }}
                                                    validationSchema={formSchema}
                                                    onSubmit={() => {}}
                                                >
                                                    {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                        <Form className="space-y-5">
                                                            <div className="panel flex flex-col m-3 gap-2">
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
                                                                <h5 className="text-lg font-semibold dark:text-white-dark">Basic Info</h5>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.name ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="name" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Name
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field id="name" name="name" type="text" placeholder="Enter Supplier Name" className="form-input flex-1" />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${currentSupplier.supplierType == '' || currentSupplier.supplierType == null ? 'has-error' : ''}`}>
                                                                    <label htmlFor="supplierType" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Type
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <select
                                                                        onChange={(e) => {
                                                                            setCurrentSupplier({ ...currentSupplier, supplierType: e.target.value });
                                                                        }}
                                                                        id="supplierType"
                                                                        className="flex-initial w-64 form-select mt-1"
                                                                        name="supplierType"
                                                                        value={currentSupplier.supplierType}
                                                                    >
                                                                        {supplierTypeList.map((supplier) => (
                                                                            <option key={supplier.value} value={supplier.value}>
                                                                                {supplier.text}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.businessLicense ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="businessLicense" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Business License
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field
                                                                        id="businessLicense"
                                                                        name="businessLicense"
                                                                        type="text"
                                                                        placeholder="Enter Business License"
                                                                        className="form-input flex-1 uppercase"
                                                                    />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                                    <label htmlFor="UBI" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        UBI
                                                                    </label>
                                                                    <Field
                                                                        id="UBI"
                                                                        name="UBI"
                                                                        type="text"
                                                                        placeholder="Enter UBI"
                                                                        className="form-input flex-1"
                                                                        value={currentSupplier.UBI}
                                                                        onChange={(e: any) => {
                                                                            setCurrentSupplier({ ...currentSupplier, UBI: e.target.value });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.phone ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="phone" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
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
                                                                                className="form-input flex-1"
                                                                                mask={['(', /[0-9]/, /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                                            />
                                                                        )}
                                                                    </Field>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.email ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="email" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Email
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field id="email" name="email" type="email" placeholder="Enter Supplier Email" className="form-input flex-1" />
                                                                </div>
                                                            </div>
                                                            <div className="panel flex flex-col m-3 gap-2">
                                                                <h5 className="text-lg font-semibold dark:text-white-dark">Location</h5>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                                    <label htmlFor="locationAddress" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Address
                                                                    </label>
                                                                    <Field id="locationAddress" name="locationAddress" type="text" placeholder="Enter Store Address" className="form-input flex-1" />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center `}>
                                                                    <label htmlFor="locationCity" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        City
                                                                    </label>
                                                                    <Field id="locationCity" name="locationCity" type="text" placeholder="Enter City" className="form-input flex-1" />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${currentSupplier.locationState == '' || currentSupplier.locationState == null ? 'has-error' : ''}`}>
                                                                    <label htmlFor="locationState" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        State
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <select
                                                                        onChange={(e) => {
                                                                            setCurrentSupplier({ ...currentSupplier, locationState: e.target.value });
                                                                        }}
                                                                        id="locationState"
                                                                        className="flex-initial w-64 form-select mt-1"
                                                                        name="locationState"
                                                                        value={currentSupplier.locationState}
                                                                    >
                                                                        {stateOfUsaData?.map((row) => {
                                                                            return (
                                                                                <option key={row.value} value={row.value}>
                                                                                    {row.label}
                                                                                </option>
                                                                            );
                                                                        })}
                                                                    </select>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                                    <label htmlFor="locationZipCode" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Zip Code
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

export default SupplierRegisterModal;
