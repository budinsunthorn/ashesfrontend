'use client';
import IconX from '@/components/icon/icon-x';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import successAlert from '@/components/notification/successAlert';
import notification from '@/components/notification/notification';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';

import { Formik, Form, Field } from 'formik';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';

import { useUpdateAdminMutation, useCreateAdminMutation } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { isAction } from '@reduxjs/toolkit';
import warnAlert from '../notification/warnAlert';

const AdminRegisterModal = (props: any) => {
    const queryClient = useQueryClient();
    const createUserMutation = useCreateAdminMutation();
    const updateUserMutation = useUpdateAdminMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentUser, setCurrentUser] = useState(props.currentUser);
    const [userType, setUserType] = useState('SUPER_ADMIN_MANAGER_USER');
    const [isOrganizationAdmin, setIsOrganizationAdmin] = useState(props.currentUser.isOrganizationAdmin);
    const [isDispensaryAdmin, setIsDispensaryAdmin] = useState(props.currentUser.isDispensaryAdmin);
    const [isActive, setIsActive] = useState(props.currentUser.isActive);

    useEffect(() => {
        setCurrentUser(props.currentUser);
        setUserType(props.currentUser.userType);
        setIsDispensaryAdmin(props.currentUser.isDispensaryAdmin);
        setIsOrganizationAdmin(props.currentUser.isOrganizationAdmin);
        setIsActive(props.currentUser.isActive);
    }, [props.modalMode, props.currentUser]);

    const handleCreateUser = async (currentUserInput: any) => {
        await createUserMutation.mutate(
            {
                input: {
                    name: currentUserInput.name,
                    userType: 'SUPER_ADMIN_MANAGER_USER',
                    phone: '',
                    email: currentUserInput.email,
                    password: currentUserInput.email,
                    dispensaryId: '',
                    isOrganizationAdmin: true,
                    isDispensaryAdmin: true,
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
                        return await queryClient.refetchQueries(['Admins']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentUserInput.name + ' has been created successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const handleUpdateUser = async (currentUserInput: any) => {
        await updateUserMutation.mutate(
            {
                input: {
                    id: props.currentUser.id,
                    name: currentUserInput.name,
                    userType: 'SUPER_ADMIN_MANAGER_USER',
                    phone: currentUserInput.phone,
                    email: currentUserInput.email,
                    dispensaryId: '',
                    isOrganizationAdmin: true,
                    isDispensaryAdmin: true,
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
                        return await queryClient.refetchQueries(['Admins']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentUserInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const submitForm = (currentUserInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateUser(currentUserInput) : handleUpdateUser(currentUserInput);
    };

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the user name'),
        email: Yup.string().email('Invalid email').required('Please fill the user email'),
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
                                        <Dialog.Panel className="panel my-8 w-4/5 max-w-5xl rounded-lg border-0 p-0 text-dark dark:text-white-dark">
                                            <div className="flex justify-between bg-[#fbfbfb] px-5 pt-3 dark:bg-[#121c2c] rounded-lg">
                                                <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New User' : 'Update User'}</h5>
                                                <button onClick={() => props.setModalShow(false)} type="button" className="text-dark dark:text-white-dark hover:text-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                <Formik
                                                    initialValues={{
                                                        name: currentUser.name,
                                                        email: currentUser.email,
                                                    }}
                                                    validationSchema={formSchema}
                                                    onSubmit={() => {
                                                        // props.modalMode === "new" ? handleCreateUser() : handleUpdateOrganization()
                                                    }}
                                                >
                                                    {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                        <Form className="space-y-5">
                                                            <div className="panel flex flex-col m-3 gap-3">
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
                                                                        Name
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field id="name" name="name" type="text" placeholder="Enter User Name" className="form-input flex-1" />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.email ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="email" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Email
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field id="email" name="email" type="text" placeholder="Enter User Email" className="form-input flex-1" />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6">
                                                                    <label htmlFor="phone" className="pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Phone
                                                                    </label>
                                                                    <MaskedInput
                                                                        id="phone"
                                                                        type="text"
                                                                        placeholder="(___) ___-____"
                                                                        value={currentUser.phone}
                                                                        onChange={(e: any) => {
                                                                            setCurrentUser({ ...currentUser, phone: e.target.value });
                                                                        }}
                                                                        className="form-input flex-1"
                                                                        mask={['(', /[0-9]/, /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row justify-end ">
                                                                    <button onClick={() => props.setModalShow(false)} type="submit" className="btn btn-outline-secondary w-20 mr-2 !mt-6 ">
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
                                                                        className="btn btn-primary w-20 !mt-6"
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

export default AdminRegisterModal;
