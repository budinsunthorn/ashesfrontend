'use client';
import IconX from '@/components/icon/icon-x';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import successAlert from '@/components/notification/successAlert';
import notification from '@/components/notification/notification';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';
import { BackColors } from '@/store/colors';

import { Formik, Form, Field } from 'formik';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import { CirclePicker } from 'react-color';
import Select from 'react-select';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';

import { useCreateItemCategoryMutation, useUpdateItemCategoryMutation, useMetrcItemCategoryByDispensaryIdQuery } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import warnAlert from '../notification/warnAlert';
import SearchableSelect from '../etc/searchableSelect';
import {purchaseLimitOptions} from '@/utils/variables';
import { Nothing_You_Could_Do } from 'next/font/google';

const ItemCategoryRegisterModal = (props: any) => {
    const queryClient = useQueryClient();
    const createItemCategoryMutation = useCreateItemCategoryMutation();
    const updateItemCategoryMutation = useUpdateItemCategoryMutation();
    const metrcItemCategoryByDispensaryId = useMetrcItemCategoryByDispensaryIdQuery({ dispensaryId: props.dispensaryId });
    let metrcItemCategoryData = [];
    metrcItemCategoryData = metrcItemCategoryByDispensaryId.data?.metrcItemCategoryByDispensaryId ?? [];
    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentItemCategory, setCurrentItemCategory] = useState(props.currentItemCategory);
    const [metrcCategory, setMetrcCategory] = useState(props.metrcCategory);
    const [isContainMj, setIsContainMj] = useState(props.currentItemCategory.containMj);
    const [purchaseLimitOption, setPurchaseLimitOption] = useState(props.currentItemCategory.purchaseLimitType)

    useEffect(() => {
        setCurrentItemCategory(props.currentItemCategory);
        setIsContainMj(props.currentItemCategory.containMj);
        setMetrcCategory(props.currentItemCategory.metrcCategory);
        setPurchaseLimitOption(props.currentItemCategory.purchaseLimitType)
    }, [props.modalMode, props.currentItemCategory]);

    const handleCreateItemCategory = async (currentCategoryInput: any) => {
        await createItemCategoryMutation.mutate(
            {
                input: {
                    color: currentItemCategory.color,
                    name: currentCategoryInput.name,
                    containMj: isContainMj,
                    dispensaryId: props.dispensaryId,
                    metrcCategory: isContainMj ? metrcCategory : null,
                    purchaseLimitType: isContainMj ? purchaseLimitOption : null,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllItemCategoriesByDispensaryId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentCategoryInput.name + ' has been created successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const handleUpdateItemCategory = async (currentCategoryInput: any) => {
        await updateItemCategoryMutation.mutate(
            {
                input: {
                    id: currentItemCategory.id,
                    name: currentCategoryInput.name,
                    color: currentItemCategory.color,
                    containMj: isContainMj,
                    metrcCategory: isContainMj ? metrcCategory : null,
                    purchaseLimitType: isContainMj ? purchaseLimitOption : null,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllItemCategoriesByDispensaryId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentCategoryInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };
    const submitForm = (currentCategoryInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateItemCategory(currentCategoryInput) : handleUpdateItemCategory(currentCategoryInput);
    };

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the category name'),
    });

    const metrcCategoryOptions = metrcItemCategoryData.map((option) => {
        return {
            value: option?.Name,
            label: option?.Name,
        };
    });

    const getMetrcCategoryObject = (id: any) => {
        let selectedMetrcCategory: any;
        metrcCategoryOptions.forEach((element: any) => {
            element.value === id ? (selectedMetrcCategory = element) : null;
        });
        return selectedMetrcCategory;
    };

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
                                                <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New Category' : 'Update Category'}</h5>
                                                <button onClick={() => props.setModalShow(false)} type="button" className="text-dark hover:text-dark dark:text-white-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                <Formik
                                                    initialValues={{
                                                        name: currentItemCategory.name,
                                                    }}
                                                    validationSchema={formSchema}
                                                    onSubmit={() => {
                                                        // props.modalMode === "new" ? handleCreateItemCategory() : handleUpdateOrganization()
                                                    }}
                                                >
                                                    {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                        <Form className="space-y-5">
                                                            <div className="panel flex flex-col m-3 gap-2">
                                                                <h5 className="text-lg font-semibold dark:text-white-dark">Details </h5>

                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.name ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="name" className="relative pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Category Name
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field id="name" name="name" type="text" placeholder="Enter Category Name" className="form-input flex-1" />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="isContainMj" className="lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Contains MJ
                                                                    </label>
                                                                    <label className="relative h-6 w-12 mt-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                                                            id="isContainMj"
                                                                            defaultChecked={isContainMj}
                                                                            onChange={() => {
                                                                                setIsContainMj(!isContainMj);
                                                                            }}
                                                                        />
                                                                        <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                                                    </label>
                                                                </div>
                                                                {isContainMj === true ? (
                                                                    <div className="flex flex-col sm:flex-row gap-6 items-center pb-4 w-full">
                                                                        <label className="relative pt-1 lg:text-right text-dark  rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                            Metrc Type
                                                                            <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                        </label>
                                                                        <SearchableSelect
                                                                            onChange={(e: any) => {
                                                                                setMetrcCategory(e.value);
                                                                            }}
                                                                            value={getMetrcCategoryObject(metrcCategory)}
                                                                            className={`w-full min-w-[400px] ${submitCount ? (!metrcCategory ? 'has-error' : '') : ''}`}
                                                                            placeholder="Select Metrc category"
                                                                            options={metrcCategoryOptions}
                                                                            isSearchable={true}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    ''
                                                                )}
                                                                

                                                                {isContainMj == true ? <div className="flex flex-col sm:flex-row gap-6 items-center pb-4 w-full">
                                                                    <label className="relative pt-1 lg:text-right text-dark  rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Purchase Limit Type
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <select className='form-select flex-1' onChange={(e) => setPurchaseLimitOption(e.target.value)} value={purchaseLimitOption}>
                                                                        <option>Select the Purchase Limit Type</option>
                                                                        {purchaseLimitOptions?.map((option: any, index: number) => (
                                                                            <option key={index} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div> : null}
                                                                <div className="flex flex-col sm:flex-row gap-6 border-t border-white-light pt-8 dark:border-[#1b2e4b]">
                                                                    <label htmlFor="color" className="pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Color
                                                                    </label>
                                                                    <CirclePicker
                                                                        color={currentItemCategory.color}
                                                                        colors={BackColors}
                                                                        onChange={(e: any) => {
                                                                            setCurrentItemCategory({ ...currentItemCategory, color: e.hex });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row justify-end ">
                                                                    <button onClick={() => props.setModalShow(false)} type="submit" className="mr-2 btn btn-outline-secondary w-20 !mt-6 ">
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (props.modalMode === "new" ? ( Object.keys(touched).length !== 0 &&Object.keys(errors).length === 0 && (isContainMj ? metrcCategory : true)) : (Object.keys(errors).length === 0)) {
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

export default ItemCategoryRegisterModal;
