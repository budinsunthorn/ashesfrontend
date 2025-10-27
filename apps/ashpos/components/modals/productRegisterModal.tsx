'use client';
import IconX from '@/components/icon/icon-x';
import successAlert from '@/components/notification/successAlert';
import 'flatpickr/dist/flatpickr.css';
import warnAlert from '../notification/warnAlert';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';

import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Select from 'react-select';
import { useCreateProductMutation, useUpdateProductMutation, useAllSuppliersByOrganizationIdQuery, UnitOfMeasure, ProductUnitOfMeasure, useAllItemCategoriesByDispensaryIdQuery } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { userDataSave } from '@/store/userData';
import SearchableSelect from '../etc/searchableSelect';
import CustomSelect from '../etc/customeSelect';

const ProductRegisterModal = (props: any) => {
    const queryClient = useQueryClient();

    const { userData } = userDataSave();
    const organizationId = userData.organizationId;
    const allSuppliersByOrganizationId = useAllSuppliersByOrganizationIdQuery({ organizationId: organizationId });
    const supplierData = allSuppliersByOrganizationId.data?.allSuppliersByOrganizationId;
    let supplierOptions: any = [];
    const unitOfMeasureList: UnitOfMeasure[] = ['ea', 'g', 'mg', 'oz'];  
    const [unitOfMeasure, setUnitOfMeasure] = useState<ProductUnitOfMeasure>('ea')

    // Data fetch
        const allItemCategoriesByDispensaryId = useAllItemCategoriesByDispensaryIdQuery({ dispensaryId: props.dispensaryId });
        const itemCategories = allItemCategoriesByDispensaryId.data?.allItemCategoriesByDispensaryId;


    if (supplierData && Array.isArray(supplierData)) {
        supplierData.map((category: any) => {
            supplierOptions.push({ value: category.id, label: category.name + ' (' + category.businessLicense + ')' });
            return null; // Make sure to return a value in the map function
        });
    } else {
        //console.error("itemCategories is not defined or is not an array");
    }
    const createProductMutation = useCreateProductMutation();
    const updateProductMutation = useUpdateProductMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(props.currentProduct);
    const [supplierId, setSupplierId] = useState(props.currentProduct.supplierId);
    const [customOptions, setCustomOptions] = useState<any>([])
    const [currentCategory, setCurrentCategory] = useState(props.currentProduct?.itemCategory?.name)
    // const [applyUnitWeight, setApplyUnitWeight] = useState(false)
    console.log("currentProduct", currentProduct);
    console.log("currentCategory", currentCategory);


    useEffect(() => {
        setCurrentProduct(props.currentProduct);
        setSupplierId(props.currentProduct.supplierId);
        setCurrentCategory(props.currentProduct?.itemCategory?.name);
    }, [props.modalMode, props.currentProduct]);

    const getSupplierObject = (id: any) => {
        let selectedSupplier: any;
        supplierOptions.forEach((element: any) => {
            element.value === id ? (selectedSupplier = element) : null;
        });
        return selectedSupplier;
    };
    const handleCreateProduct = async (currentProductInput: any) => {
        if (supplierId === '') {
            warnAlert('Please select a supplier');
            setIsSaveButtonDisabled(false);
            return;
        }
        if (currentProduct.itemCategoryId === '') {
            warnAlert('Please select a category');
            setIsSaveButtonDisabled(false);
            return;
        }
        console.log("currentProduct.unitOfUnitWegith", currentProduct.unitOfUnitWegith)
        if((currentProduct.unitWeight > 0 && (currentProduct.unitOfUnitWeight == '' || currentProduct.unitOfUnitWeight == undefined || currentProduct.unitOfUnitWeight == null)) || (currentProduct.netWeight > 0 && (currentProduct.unitOfNetWeight == '' || currentProduct.unitOfNetWeight == undefined || currentProduct.unitOfNetWeight == null))) {
            warnAlert('Select the unit');
            setIsSaveButtonDisabled(false)
            return;
        }
        await createProductMutation.mutate(
            {
                input: {
                    dispensaryId: props.dispensaryId,
                    userId: props.userId,
                    supplierId: supplierId,
                    itemCategoryId: currentProduct.itemCategoryId,
                    name: currentProductInput.name,
                    sku: currentProductInput.sku,
                    upc: currentProductInput.upc,
                    price: +currentProductInput.price,
                    productUnitOfMeasure: currentProduct.productUnitOfMeasure,
                    unitOfNetWeight: currentProduct.unitOfNetWeight ? currentProduct.unitOfNetWeight : null,
                    unitOfUnitWeight: currentProduct.unitOfUnitWeight ? currentProduct.unitOfUnitWeight : null,
                    unitWeight: +currentProductInput.unitWeight,
                    netWeight: +currentProductInput.netWeight,
                    isApplyUnitWeight: currentProduct.isApplyUnitWeight
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
                        return await queryClient.refetchQueries(['AllProductsByDispensaryIdWithPages']);
                    };
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentProductInput.name + ' has been created successfully!');
                    setIsSaveButtonDisabled(false);
                },
                onSettled() {
                },
            },
        );
    };
    const handleUpdateProduct = async (currentProductInput: any) => {
        if (supplierId === '') {
            warnAlert('Please select a supplier');
            setIsSaveButtonDisabled(false);
            return;
        }
        if (currentProduct.itemCategoryId === '') {
            warnAlert('Please select a category');
            setIsSaveButtonDisabled(false);
            return;
        }
        if((currentProduct.unitWeight > 0 && (currentProduct.unitOfUnitWeight == '' || currentProduct.unitOfUnitWeight == undefined || currentProduct.unitOfUnitWeight == null)) || (currentProduct.netWeight > 0 && (currentProduct.unitOfNetWeight == '' || currentProduct.unitOfNetWeight == undefined || currentProduct.unitOfNetWeight == null))) {
            warnAlert('Select the unit');
            setIsSaveButtonDisabled(false);
            return;
        }
        await updateProductMutation.mutate(
            {
                input: {
                    id: currentProduct.id,
                    supplierId: supplierId,
                    itemCategoryId: currentProduct.itemCategoryId,
                    name: currentProductInput.name,
                    sku: currentProductInput.sku,
                    upc: currentProductInput.upc,
                    price: +currentProductInput.price,
                    productUnitOfMeasure: currentProduct.productUnitOfMeasure,
                    unitOfNetWeight: currentProduct.unitOfNetWeight ? currentProduct.unitOfNetWeight : null,
                    unitOfUnitWeight: currentProduct.unitOfUnitWeight ? currentProduct.unitOfUnitWeight : null, 
                    unitWeight: currentProduct.unitWeight,
                    netWeight: currentProduct.netWeight,
                    isApplyUnitWeight: currentProduct.isApplyUnitWeight
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
                        return await queryClient.refetchQueries(['AllProductsByDispensaryIdWithPages']);
                    };
                    setIsSaveButtonDisabled(false);
                    refetch();
                    props.setModalShow(false);
                    successAlert(currentProductInput.name + ' has been updated successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };

    
    const handleSupplierSelect = (supplier: any | null | undefined) => {
        setSupplierId(supplier.value);
    };
    const submitForm = (currentProductInput: any) => {
        setIsSaveButtonDisabled(true);
        props.modalMode === 'new' ? handleCreateProduct(currentProductInput) : handleUpdateProduct(currentProductInput);
    };

    useEffect(() => {
        let categoryOption: any[] = [];
        itemCategories?.map((item: any) => {
            categoryOption.push({ value: item?.id, label: item?.name });
        });
        setCustomOptions(categoryOption);
    },[itemCategories])

    const handleUpdateCurrentProduct = (id: any) => {
        console.log("handleUpdateCurrentProduct", id)
        setCurrentProduct({ ...currentProduct, itemCategoryId: id });

        const matched = customOptions.find((item: any) => item.value === id);
        const name = matched?.label || '';
        console.log("matched", matched)
        setCurrentCategory(name);
    }

    const formSchema = Yup.object().shape({
        name: Yup.string().required('Please fill the Product Name'),
        // sku: Yup.string().optional(),
        // upc: Yup.string().optional(),
        price: Yup.string().required('Please fill the price'),
        // unitWeight: Yup.string().required('Please fill the unitWeight'),
        // netWeight: Yup.string().required('Please fill the netWeight'),
        // metrcPackage: Yup.string().optional(),
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
                            <div className="fixed inset-0 z-[999] bg-[black]/60 overflow-auto ">
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
                                                <h5 className="text-lg font-bold">{props.modalMode === 'new' ? 'New Product' : 'Update Product'}</h5>
                                                <button onClick={() => props.setModalShow(false)} type="button" className="text-dark hover:text-dark dark:text-white-dark">
                                                    <IconX />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                                <Formik
                                                    initialValues={{
                                                        name: currentProduct.name,
                                                        // sku: currentProduct.sku,
                                                        // upc: currentProduct.upc,
                                                        price: currentProduct.price,
                                                        unitWeight: currentProduct.unitWeight,
                                                        netWeight: currentProduct.netWeight,
                                                        // metrcPackage: currentProduct.metrcPackage,
                                                    }}
                                                    validationSchema={formSchema}
                                                    onSubmit={() => {}}
                                                >
                                                    {({ errors, submitCount, touched, values, handleChange, handleBlur }) => (
                                                        <Form className="space-y-5">
                                                            <div className="panel flex flex-col m-3 gap-2">
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center w-full`}>
                                                                    <label className="relative pt-1 lg:text-right text-dark dark:text-white-dark rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Supplier
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <SearchableSelect
                                                                        onChange={handleSupplierSelect}
                                                                        value={getSupplierObject(supplierId)}
                                                                        className={`w-full min-w-[400px]  ${submitCount ? (!supplierId ? 'has-error' : '') : ''}`}
                                                                        placeholder="Select a supplier"
                                                                        options={supplierOptions}
                                                                        isSearchable={true}
                                                                    />
                                                                </div>

                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center w-full border-b border-white-light pb-4 dark:border-[#1b2e4b]`}>
                                                                    <label htmlFor="locationState" className="relative pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Category
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <div className={`min-w-[500px] mt-1 ${submitCount ? (!currentProduct.itemCategoryId ? '!border-[#e7515a] !bg-[#e7515a14] ' : '') : ''}`}>
                                                                    <CustomSelect
                                                                        options={customOptions}
                                                                        onChange={handleUpdateCurrentProduct}
                                                                        currentOption={currentCategory}
                                                                        showingSearch={false}
                                                                        showingText='Select a category'
                                                                        disabled={false}
                                                                    /></div>
                                                                    {/* <select
                                                                        onChange={(e) => {
                                                                            setCurrentProduct({ ...currentProduct, itemCategoryId: e.target.value });
                                                                        }}
                                                                        id="itemCategoryId"
                                                                        className={`form-select mt-1 w-[250px] border-[1px] ${submitCount ? (!currentProduct.itemCategoryId ? '!border-[#e7515a] !bg-[#e7515a14] ' : '') : ''}`}
                                                                        name="itemCategoryId"
                                                                        value={currentProduct.itemCategoryId}
                                                                    >
                                                                        <option key={'0'} value="" className='dark:bg-black dark:text-white-dark'>
                                                                            Choose a category ...
                                                                        </option>
                                                                        {props.itemCategories?.map((row: any) => {
                                                                            return (
                                                                                <option key={row.id} value={row.id} className='dark:bg-black dark:text-white-dark'>
                                                                                    {row.name}
                                                                                </option>
                                                                            );
                                                                        })}
                                                                    </select> */}
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center ${submitCount ? (errors.name ? 'has-error' : '') : ''}`}>
                                                                    <label htmlFor="name" className="relative pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Name
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <Field
                                                                        id="name"
                                                                        name="name"
                                                                        type="text"
                                                                        // placeholder="Enter Product Name"
                                                                        className="form-input flex-1"
                                                                    />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                                    <label htmlFor="sku" className="pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        SKU
                                                                    </label>
                                                                    <Field
                                                                        id="sku"
                                                                        name="sku"
                                                                        type="text"
                                                                        // placeholder="Enter SKU"
                                                                        className="form-input flex-1"
                                                                    />
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                                    <label htmlFor="upc" className="pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        UPC
                                                                    </label>
                                                                    <Field
                                                                        id="upc"
                                                                        name="upc"
                                                                        type="text"
                                                                        // placeholder="Enter UPC"
                                                                        className="form-input flex-1"
                                                                    />
                                                                </div>
                                                                <div
                                                                    className={`flex flex-col sm:flex-row gap-6 items-center border-b border-white-light pb-4 dark:border-[#1b2e4b] ${submitCount ? (errors.price ? 'has-error' : '') : ''}`}
                                                                >
                                                                    <label htmlFor="price" className="relative pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Price
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <div className="flex">
                                                                        <Field
                                                                            id="price"
                                                                            name="price"
                                                                            type="number"
                                                                            // value={0}
                                                                            placeholder="Enter Price"
                                                                            className="form-input flex-1 ltr:rounded-l-md ltr:rounded-r-none rtl:rounded-l-none rtl:rounded-r-md no-spinner"
                                                                        />
                                                                        <div className="flex items-center justify-center border border-white-light bg-[#eee] px-3 font-semibold ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0 dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                            $
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                                    <label htmlFor="unitOfMeasure" className="pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Unit of Measure
                                                                    </label>
                                                                    <div className='flex justify-start items-center'>
                                                                        <div className="mr-2">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="productUnitOfMeasure"
                                                                                    className="form-radio"
                                                                                    value="ea"
                                                                                    onChange={(e) => {
                                                                                        setCurrentProduct({ ...currentProduct, productUnitOfMeasure: 'ea' as UnitOfMeasure});
                                                                                    }}
                                                                                    checked={currentProduct.productUnitOfMeasure == 'ea' ? true : false}
                                                                                />
                                                                                <span className="text-white-dark">Each</span>
                                                                            </label>
                                                                        </div>
                                                                        <div className="">
                                                                            <label className="mt-1 inline-flex cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="productUnitOfMeasure"
                                                                                    className="form-radio"
                                                                                    value="g"
                                                                                    onChange={(e) => {
                                                                                        setCurrentProduct({ ...currentProduct, productUnitOfMeasure: e.target.value as UnitOfMeasure});
                                                                                    }}
                                                                                    checked={currentProduct.productUnitOfMeasure == 'g'}
                                                                                />
                                                                                <span className="text-white-dark">Grams</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {currentProduct.productUnitOfMeasure == "ea" ?
                                                                <>
                                                                <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                                    <label htmlFor="unitWeight" className="relative pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Unit Weight
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <div className='flex justify-start'>
                                                                    <input
                                                                        id="unitWeight"
                                                                        name="unitWeight"
                                                                        type="number"
                                                                        value={currentProduct.unitWeight}
                                                                        onChange={(e) => setCurrentProduct({...currentProduct, unitWeight: Number(e.target.value)})}
                                                                        className="form-input flex-1 rounded-r-none no-spinner"
                                                                        />
                                                                    <div className={`${currentProduct.unitWeight > 0 && currentProduct.unitOfUnitWeight == ""  ? "has-error" : ""}`}>
                                                                        <select
                                                                            onChange={(e) => {
                                                                                setCurrentProduct({ ...currentProduct, unitOfUnitWeight: e.target.value as UnitOfMeasure});
                                                                            }}
                                                                            id="unitOfMeasure"
                                                                            className={`flex-initial w-48 form-select rounded-l-none `}
                                                                            name="unitOfMeasure"
                                                                            value={currentProduct.unitOfUnitWeight}
                                                                        >
                                                                            <option key={'0'} value="" className='dark:bg-black dark:text-white-dark'>
                                                                                Choose a unit ...
                                                                            </option>
                                                                            {unitOfMeasureList?.map((item: any, key) => {
                                                                                return (
                                                                                    <option key={key + 1} value={item}>
                                                                                        {item}
                                                                                    </option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                    </div>
                                                                    </div>

                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                                    <label htmlFor="locationZipCode" className="pt-1 text-dark dark:text-white-dark lg:text-right mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Apply Unit Weight
                                                                    </label>
                                                                    <label className="w-9 h-6 relative cursor-pointer mb-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="peer absolute w-full h-full opacity-0 z-10 focus:ring-0 focus:outline-none cursor-pointer"
                                                                            id="custom_switch_checkbox1"
                                                                            checked={currentProduct.isApplyUnitWeight}
                                                                            onChange={(e: any) => {
                                                                                setCurrentProduct({ ...currentProduct, isApplyUnitWeight: e.target.checked });
                                                                            }}
                                                                        />
                                                                        <span className="rounded-full border border-[#adb5bd] bg-white peer-checked:bg-primary peer-checked:border-primary dark:bg-dark block h-full before:absolute ltr:before:left-0.5 rtl:before:right-0.5 ltr:peer-checked:before:left-3.5 rtl:peer-checked:before:right-3.5 peer-checked:before:bg-white before:bg-[#adb5bd] dark:before:bg-white-dark before:bottom-[2px] before:w-5 before:h-5 before:rounded-full before:transition-all before:duration-300"></span>
                                                                    </label>
                                                                </div>
                                                                <div
                                                                    className={`flex flex-col sm:flex-row gap-6 items-center border-b border-white-light pb-4 dark:border-[#1b2e4b] ${submitCount ? (currentProduct.netWeight == 0 ? 'has-error' : '') : ''}`}
                                                                >
                                                                    <label htmlFor="netWeight" className="relative pt-1 lg:text-right text-dark dark:text-white-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Net Weight
                                                                        <span className="absolute -right-3 text-sm text-red-500 ml-2">*</span>
                                                                    </label>
                                                                    <div className='flex justify-start items-center'>

                                                                    <input
                                                                        id="netWeight"
                                                                        name="netWeight"
                                                                        type="number"
                                                                        value={currentProduct.netWeight}
                                                                        onChange={(e) => setCurrentProduct({...currentProduct, netWeight: Number(e.target.value)})}
                                                                        className="form-input flex-1 rounded-r-none no-spinner"
                                                                        />
                                                                    <div className={`${currentProduct.netWeight > 0 && currentProduct.unitOfNetWeight == ""  ? "has-error" : ""}`}>
                                                                        <select
                                                                            onChange={(e) => {
                                                                                setCurrentProduct({ ...currentProduct, unitOfNetWeight: e.target.value as UnitOfMeasure});
                                                                            }}
                                                                            id="unitOfMeasure"
                                                                            className="flex-initial w-48 form-select rounded-l-none"
                                                                            name="unitOfMeasure"
                                                                            value={currentProduct.unitOfNetWeight}
                                                                        >
                                                                            <option key={'0'} value="" className='dark:bg-black dark:text-white-dark'>
                                                                                Choose a unit ...
                                                                            </option>
                                                                            {unitOfMeasureList?.map((item: any, key) => {
                                                                                if(item == 'ea') return null
                                                                                return (
                                                                                    <option key={key + 1} value={item}>
                                                                                        {item}
                                                                                    </option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                    </div>
                                                                    </div>
                                                                </div>
                                                                </> : null}
                                                                {/* <div className={`flex flex-col sm:flex-row gap-6 items-center`}>
                                                                    <label htmlFor="metrcPackage" className="pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                                                        Metrc Package
                                                                    </label>
                                                                    <Field
                                                                        id="metrcPackage"
                                                                        name="metrcPackage"
                                                                        type="text"
                                                                        // placeholder="Enter Metrc Package"
                                                                        className="form-input flex-1"
                                                                    />
                                                                </div> */}
                                                                <div className="flex flex-col sm:flex-row justify-end ">
                                                                    <button onClick={() => props.setModalShow(false)} type="submit" className="mr-2 btn btn-outline-secondary w-20 !mt-6 ">
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (props.modalMode === "new" ? ( Object.keys(touched).length !== 0 && Object.keys(errors).length === 0 && supplierId && currentProduct.itemCategoryId) : (Object.keys(errors).length === 0)) {
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

export default ProductRegisterModal;
