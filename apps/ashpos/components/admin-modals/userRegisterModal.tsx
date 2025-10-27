'use client';
import IconX from '@/components/icon/icon-x';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import successAlert from '@/components/notification/successAlert';
import notification from '@/components/notification/notification';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';

import { Formik, Form, Field, FieldProps } from 'formik';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';

import { useUpdateUserMutation, useCreateUserMutation } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { isAction } from '@reduxjs/toolkit';
import warnAlert from '../notification/warnAlert';

const UserRegisterModal = (props: any) => {
    const queryClient = useQueryClient();
    const createUserMutation = useCreateUserMutation();
    const updateUserMutation = useUpdateUserMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentUser, setCurrentUser] = useState(props.currentUser);
    const [userType, setUserType] = useState(props.currentUser.userType);
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
        if (props.currentDispensaryId === 0) {
            notification('warning', 'Please select an organization and dispensary.');
            return;
        }
        await createUserMutation.mutate(
            {
                input: {
                    name: currentUserInput.name,
                    userType: userType,
                    phone: currentUserInput.phone,
                    email: currentUserInput.email,
                    password: currentUserInput.email,
                    dispensaryId: props.currentDispensaryId,
                    isOrganizationAdmin: isOrganizationAdmin,
                    isDispensaryAdmin: isDispensaryAdmin,
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
                        return await queryClient.refetchQueries(['AllUsersByDispensaryId']);
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
                    userType: userType,
                    phone: currentUserInput.phone,
                    email: currentUserInput.email,
                    dispensaryId: props.currentDispensaryId,
                    isOrganizationAdmin: isOrganizationAdmin,
                    isDispensaryAdmin: isDispensaryAdmin,
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
                        return await queryClient.refetchQueries(['AllUsersByDispensaryId']);
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
        phone: Yup.string().required('Please fill the phone'),

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
                                                        phone: currentUser.phone,
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
                                                                    <Field
                                                                        id="name"
                                                                        name="name"
                                                                        type="text"
                                                                        placeholder="Enter User Name"
                                                                        className="form-input flex-1"
                                                                        // value={currentUser.name}
                                                                        // onChange={(e: any) => {
                                                                        //   setCurrentUser({ ...currentUser, name: e.target.value })
                                                                        // }
                                                                        // }
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6">
                                                                    <label className="pt-1 lg:text-right text-dark dark:text-white-dark  rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">Type</label>
                                                                    <div className="flex-1">
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="userType"
                                                                                    className="form-radio"
                                                                                    value="USER"
                                                                                    onChange={(e) => {
                                                                                        setUserType(e.target.value);
                                                                                    }}
                                                                                    checked={userType === 'USER' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Budtender</span>
                                                                            </label>
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="userType"
                                                                                    className="form-radio"
                                                                                    value="MANAGER_USER"
                                                                                    onChange={(e) => {
                                                                                        setUserType(e.target.value);
                                                                                    }}
                                                                                    checked={userType === 'MANAGER_USER' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Store Manager</span>
                                                                            </label>
                                                                        </div>
                                                                        <div className="mb-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="userType"
                                                                                    className="form-radio"
                                                                                    value="ADMIN_MANAGER_USER"
                                                                                    onChange={(e) => {
                                                                                        setUserType(e.target.value);
                                                                                    }}
                                                                                    checked={userType === 'ADMIN_MANAGER_USER' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Org Manager</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.email ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="email" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Email
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field
                                                                        id="email"
                                                                        name="email"
                                                                        type="text"
                                                                        placeholder="Enter User Email"
                                                                        className="form-input flex-1"
                                                                        // value={currentUser.email}
                                                                        // onChange={(e: any) => {
                                                                        //   setCurrentUser({ ...currentUser, email: e.target.value })
                                                                        // }}
                                                                    />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 ${submitCount ? (errors.phone ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="phone" className="relative pt-1 lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Phone
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field name="phone">
                                                                        {({ field }: FieldProps) => (
                                                                            <MaskedInput
                                                                                {...field}
                                                                                id="phone"
                                                                                name='phone'
                                                                                type="text"
                                                                                placeholder="(___) ___-____"
                                                                                className="form-input flex-1"
                                                                                mask={['(', /[0-9]/, /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/]}
                                                                            />
                                                                        )}
                                                                    </Field>
                                                                </div>
                                                                {/* <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="isOrganizationAdmin" className="lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Field-1
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isOrganizationAdmin"
                                                                            defaultChecked={isOrganizationAdmin}
                                                                            onChange={() => {
                                                                                setIsOrganizationAdmin(!isOrganizationAdmin);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="isDispensaryAdmin" className="lg:text-right text-dark dark:text-white-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Field-2
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isDispensaryAdmin"
                                                                            defaultChecked={isDispensaryAdmin}
                                                                            onChange={() => {
                                                                                setIsDispensaryAdmin(!isDispensaryAdmin);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div> */}
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

export default UserRegisterModal;
