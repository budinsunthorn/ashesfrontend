'use client';
import IconX from '@/components/icon/icon-x';
import successAlert from '@/components/notification/successAlert';
import 'flatpickr/dist/flatpickr.css';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Select from 'react-select';
import { useCreateTaxSettingMutation, useUpdateTaxSettingMutation, useAllItemCategoriesByDispensaryIdQuery, useAllTaxSettingByDispensaryIdQuery } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import warnAlert from '../notification/warnAlert';
import SearchableSelect from '../etc/searchableSelect';
import { BiCaretRight } from 'react-icons/bi';
import { FaCaretDown, FaCaretRight } from 'react-icons/fa6';
import { userDataSave } from '@/store/userData';

const TaxSettingModal = (props: any) => {
    const queryClient = useQueryClient();
    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentTaxSetting, setCurrentTaxSetting] = useState(props.currentTaxSetting);
    const [categories, setCategories] = useState(props.currentTaxSetting.categories);
    const [dispensaryId, setDispensaryId] = useState(props.dispensaryId);
    const [showTaxes, setShowTaxes] = useState(false);
    const [excludeFromRecreational, setExcludeFromRecreational] = useState(false);
    const [excludeForExempt, setExcludeForExempt] = useState(false);
    const [compoundTaxes, setCompoundTaxes] = useState<Array<string>>([]);

    const allItemCategoriesByDispensaryId = useAllItemCategoriesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const itemCategories = allItemCategoriesByDispensaryId.data?.allItemCategoriesByDispensaryId;
    const allTax = useAllTaxSettingByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const allTaxData = allTax.data?.allTaxSettingByDispensaryId;

    const createTaxSettingMutation = useCreateTaxSettingMutation();
    const updateTaxSettingMutation = useUpdateTaxSettingMutation();

    let categoryOptions: any = [];

    if (itemCategories && Array.isArray(itemCategories)) {
        itemCategories.map((category: any) => {
            categoryOptions.push({ value: category.id, label: category.name, color: category.color });
            return null; // Make sure to return a value in the map function
        });
    } else {
    }
    useEffect(() => {
        allTax.refetch();
        setCurrentTaxSetting(props.currentTaxSetting);
        setCategories(props.currentTaxSetting.categories);
        setDispensaryId(props.dispensaryId);
        setCompoundTaxes(props.currentTaxSetting.compoundTaxes);
        setExcludeForExempt(props.currentTaxSetting.isExcludeFromTaxExempt)
        setExcludeFromRecreational(props.currentTaxSetting.isExcludeFromRecreational)
    }, [props.modalMode, props.currentTaxSetting]);

    const handleCreateTaxSetting = async (currentTaxInput: any) => {
        if (currentTaxSetting.applyTo === 'CATEGORY' && categories.length === 0) {
            warnAlert('Select Product Categories');
            return;
        }
        await createTaxSettingMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    name: currentTaxInput.name,
                    rate: +currentTaxInput.rate,
                    categories: categories,
                    applyTo: currentTaxSetting.applyTo,
                    compoundTaxes: compoundTaxes,
                    isExcludeFromRecreational: excludeFromRecreational,
                    isExcludeFromTaxExempt: excludeForExempt,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllTaxSettingByDispensaryId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentTaxInput.name + ' has been created successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            }
        );
    };
    const handleUpdateTaxSetting = async (currentTaxInput: any) => {
        if (currentTaxSetting.applyTo === 'CATEGORY' && categories.length === 0) {
            warnAlert('Select Product Categories');
            setIsSaveButtonDisabled(false);
            return;
        }
        await updateTaxSettingMutation.mutate(
            {
                input: {
                    id: currentTaxSetting.id,
                    dispensaryId: dispensaryId,
                    name: currentTaxInput.name,
                    rate: +currentTaxInput.rate,
                    categories: categories,
                    applyTo: currentTaxSetting.applyTo,
                    compoundTaxes: compoundTaxes,
                    isExcludeFromRecreational: excludeFromRecreational,
                    isExcludeFromTaxExempt: excludeForExempt,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                    setIsSaveButtonDisabled(false);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['AllTaxSettingByDispensaryId']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentTaxInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            }
        );
    };
    const submitForm = (currentTaxInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateTaxSetting(currentTaxInput) : handleUpdateTaxSetting(currentTaxInput);
    };

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the tax name'),
        rate: Yup.string().required('Please fill the tax rate'),
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
                                                <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New Tax' : 'Update Tax'}</h5>
                                                <button onClick={() => props.setModalShow(false)} type="button" className="text-dark dark:text-white-dark hover:text-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                <Formik
                                                    initialValues={{
                                                        name: currentTaxSetting.name,
                                                        rate: currentTaxSetting.rate,
                                                    }}
                                                    validationSchema={formSchema}
                                                    onSubmit={() => {
                                                        // props.modalMode === "new" ? handleCreateTaxSetting() : handleUpdateOrganization()
                                                    }}
                                                >
                                                    {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                        <Form className="space-y-5">
                                                            <div className="panel flex flex-col m-3 gap-2">
                                                                {/* <h5 className="text-lg font-semibold dark:text-white-light">Details </h5> */}
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.name ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="name" className="relative pt-1 lg:text-right text-gray-500  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Tax Name
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field id="name" name="name" type="text" placeholder="Enter Tax Name" className="form-input flex-1" />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.rate ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="rate" className="relative pt-1 lg:text-right text-gray-500  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Tax Rate
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <div className="flex">
                                                                        <Field
                                                                            id="rate"
                                                                            name="rate"
                                                                            type="number"
                                                                            // defaultValue={0}
                                                                            placeholder="Enter Tax Rate"
                                                                            className="form-input flex-1 ltr:rounded-l-md ltr:rounded-r-none rtl:rounded-l-none rtl:rounded-r-md"
                                                                        />
                                                                        <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                            %
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="applyTo" className="pt-1 lg:text-right text-gray-500  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Apply To
                                                                    </label>
                                                                    <select
                                                                        onChange={(e) => {
                                                                            setCurrentTaxSetting({ ...currentTaxSetting, applyTo: e.target.value });
                                                                        }}
                                                                        id="applyTo"
                                                                        className="flex-initial w-64 form-select mt-1"
                                                                        name="locationState"
                                                                        defaultValue={currentTaxSetting.applyTo}
                                                                    >
                                                                        <option key="ALL" value="ALL">
                                                                            All Products
                                                                        </option>
                                                                        <option key="MJ" value="MJ">
                                                                            MJ Products
                                                                        </option>
                                                                        <option key="NMJ" value="NMJ">
                                                                            Non-MJ Products
                                                                        </option>
                                                                        {/* <option key="CATEGORY" value="CATEGORY">
                                                                            Specifc Categories
                                                                        </option> */}
                                                                    </select>
                                                                </div>
                                                                {currentTaxSetting.applyTo === 'CATEGORY' ? (
                                                                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                        <label className="pt-1 lg:text-right text-gray-500  rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">Product Categories</label>
                                                                        <SearchableSelect
                                                                            onChange={setCategories}
                                                                            value={categories}
                                                                            className="w-full"
                                                                            placeholder="Select Product Categories"
                                                                            options={categoryOptions}
                                                                            isMulti={true}
                                                                            isSearchable={true}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    ''
                                                                )}
                                                                <div className="flex sm:flex-row gap-6 items-start">
                                                                    <label className="pt-1 lg:text-right text-gray-500  rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">Compound Taxation</label>
                                                                    <div className="flex flex-col justify-start items-start mt-1" >
                                                                        <div className="flex justify-start items-center cursor-pointer" onClick={() => setShowTaxes(!showTaxes)}>
                                                                            {showTaxes ? <FaCaretRight className='ml-2'/> : <FaCaretDown className='ml-2'/>}
                                                                            Included Taxes
                                                                        </div>
                                                                    
                                                                    {showTaxes
                                                                        ? allTaxData?.map((tax, index) => (
                                                                              <div key={index} className="flex justify-between items-center ml-3 mt-1">
                                                                                  <input
                                                                                      type="checkbox"
                                                                                      className="peer form-checkbox focus:ring-0 focus:outline-none cursor-pointer mr-2"
                                                                                      id="custom_switch_checkbox1"
                                                                                      checked={compoundTaxes?.length > 0 ? compoundTaxes?.includes(tax?.id || "") : false}
                                                                                      disabled={tax?.id == currentTaxSetting.id}
                                                                                      onChange={() => {
                                                                                            
                                                                                                setCompoundTaxes(compoundTaxes?.includes(tax?.id || "") ? compoundTaxes.filter((item) => item != tax?.id ) : [...compoundTaxes, tax?.id || ""]);
                                                                                            

                                                                                        }
                                                                                      }
                                                                                  />

                                                                                  <span className='peer-disabled:text-gray-400 peer-disabled:dark:text-gray-600'>{tax?.name}</span>
                                                                              </div>
                                                                          ))
                                                                        : null}
                                                                    </div>
                                                                </div>
                                                                <hr className="my-5" />
                                                                <div className="flex flex-col gap-6 items-center">
                                                                    <div className="w-full">
                                                                        <label htmlFor="" className="pt-1 text-left text-gray-500 w-1/4 sm:ltr:mr-2 text-npwrap">
                                                                            Customer Exclusions
                                                                        </label>
                                                                    </div>
                                                                    <div className="flex justify-between items-center w-1/2">
                                                                        <div className="text-md text-gray-500 text-nowrap">Exclude from Recreational Customers</div>
                                                                        <label className="w-12 h-6 relative">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                                                id="custom_switch_checkbox1"
                                                                                checked={excludeFromRecreational}
                                                                                onChange={() => setExcludeFromRecreational(!excludeFromRecreational)}
                                                                            />
                                                                            <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="flex justify-between items-center w-1/2">
                                                                        <div className="text-md text-gray-500 text-nowrap">Exclude for Tax Exempt Customers</div>
                                                                        <label className="w-12 h-6 relative">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                                                id="custom_switch_checkbox1"
                                                                                checked={excludeForExempt}
                                                                                onChange={() => setExcludeForExempt(!excludeForExempt)}
                                                                            />
                                                                            <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <hr className="my-5" />
                                                                <div className="flex flex-col sm:flex-row justify-end ">
                                                                    <button onClick={() => props.setModalShow(false)} type="submit" className="mr-2 btn btn-outline-secondary w-20">
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
                                                                        className="btn btn-primary w-20"
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

export default TaxSettingModal;
