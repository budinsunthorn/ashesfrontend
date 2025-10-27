'use client';
import IconX from '@/components/icon/icon-x';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import successAlert from '@/components/notification/successAlert';
import { Formik, Form, Field, FieldProps } from 'formik';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';

import { useCreateOrganizationMutation, useUpdateOrganizationMutation } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import warnAlert from '../notification/warnAlert';

const OrganizationRegisterModal = (props: any) => {
    const queryClient = useQueryClient();
    const createOrganizationMutation = useCreateOrganizationMutation();
    const updateOrganizationMutation = useUpdateOrganizationMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentOrganization, setCurrentOrganization] = useState(props.currentOrganization);

    useEffect(() => {
        setCurrentOrganization(props.currentOrganization);
    }, [props.modalMode, props.currentOrganization]);

    const handleCreateOrganization = async (currentOrganizationInput: any) => {
        await createOrganizationMutation.mutate(
            {
                input: {
                    name: currentOrganizationInput.name,
                    phone: currentOrganizationInput.phone,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllOrganizations']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentOrganizationInput.name + ' has been created successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const handleUpdateOrganization = async (currentOrganizationInput: any) => {
        await updateOrganizationMutation.mutate(
            {
                input: {
                    id: currentOrganization.id,
                    name: currentOrganizationInput.name,
                    phone: currentOrganizationInput.phone,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllOrganizations']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentOrganizationInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const submitForm = (currentOrganizationInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateOrganization(currentOrganizationInput) : handleUpdateOrganization(currentOrganizationInput);
    };

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the organization name'),
        phone: Yup.string().required('Please fill the organization phone number'),
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
                                <div className="fixed inset-0" />
                            </Transition.Child>
                            <div className="fixed inset-0 z-[999] bg-[black]/60  overflow-auto">
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
                                        <Dialog.Panel className="panel my-8 w-full max-w-5xl overflow-hidden rounded-lg border-0 p-0 text-dark dark:text-white-dark">
                                            <div className="flex justify-between bg-[#fbfbfb] px-5 pt-3 dark:bg-[#121c2c] rounded-lg">
                                                <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New Organization' : 'Update Organization'}</h5>
                                                <button onClick={() => props.setModalShow(false)} type="button" className="text-dark dark:text-white-dark hover:text-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                <Formik
                                                    initialValues={{
                                                        name: currentOrganization.name,
                                                        phone: currentOrganization.phone,
                                                    }}
                                                    validationSchema={formSchema}
                                                    onSubmit={() => {
                                                        // props.modalMode === "new" ? handleCreateOrganization() : handleUpdateOrganization()
                                                    }}
                                                >
                                                    {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                        <Form className="space-y-5">
                                                            <div className="panel flex flex-col m-3 gap-3">
                                                                <h5 className="text-lg font-semibold dark:text-white-dark">Details </h5>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.name ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="name" className="relative pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Name
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <div className="w-full">
                                                                        <Field id="name" name="name" type="text" placeholder="Enter Organization Name" className="form-input flex-1" />
                                                                    </div>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.phone ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="phone" className="relative pt-1 lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Phone
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <div className="w-full">
                                                                        <Field name="phone">
                                                                            {({ field }: FieldProps) => (
                                                                                <MaskedInput
                                                                                    {...field}
                                                                                    id="phone"
                                                                                    type="text"
                                                                                    placeholder="(___) ___-____"
                                                                                    className="form-input flex-1"
                                                                                    mask={[
                                                                                        '(',
                                                                                        /[0-9]/,
                                                                                        /[0-9]/,
                                                                                        /[0-9]/,
                                                                                        ')',
                                                                                        ' ',
                                                                                        /[0-9]/,
                                                                                        /[0-9]/,
                                                                                        /[0-9]/,
                                                                                        '-',
                                                                                        /[0-9]/,
                                                                                        /[0-9]/,
                                                                                        /[0-9]/,
                                                                                        /[0-9]/,
                                                                                    ]}
                                                                                />
                                                                            )}
                                                                        </Field>
                                                                    </div>
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

export default OrganizationRegisterModal;
