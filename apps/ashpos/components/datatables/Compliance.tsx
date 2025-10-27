'use client';

import React, { useState, useEffect } from 'react';
import { useGetPurchaseLimitByDispensaryIdQuery, useSetPurchaseLimitByDispensaryIdMutation, UnitOfMeasure, LimitWeight, PurchaseLimitMethod, PurchaseLimitType } from '@/src/__generated__/operations';
// import { UnitOfMeasure } from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
import successAlert from '../notification/successAlert';
import errorAlert from '../notification/errorAlert';

import { unitOfMeasureOptions } from '@/utils/variables';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

// Define the type for PurchaseLimit objects
interface PurchaseLimit {
    dispensaryId : string;
    purchaseLimitType: PurchaseLimitType;
    purchaseLimitAmount: number;
    purchaseLimitMethod: PurchaseLimitMethod;
    limitUnit: UnitOfMeasure;
    limitWeight: LimitWeight;
}

export default function Compliance() {

    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);

    // Query
    const purchaseLimitRowData = useGetPurchaseLimitByDispensaryIdQuery({dispensaryId : dispensaryId});
    const purchaseLimitData = purchaseLimitRowData.data?.getPurchaseLimitByDispensaryId;
    console.log("purchaseLimitData", purchaseLimitData);


    // Mutation
    const setPurchaseLimitByDispensaryIdMutation = useSetPurchaseLimitByDispensaryIdMutation();
    
    const [purchaseLimit, setPurchaseLimit] = useState<PurchaseLimit[]>(
    [
        {dispensaryId: dispensaryId, purchaseLimitType: "Flower", purchaseLimitAmount: 0, purchaseLimitMethod : "transaction", limitUnit : 'ea' , limitWeight: 'unitWeight'},
        {dispensaryId: dispensaryId, purchaseLimitType: "Edible", purchaseLimitAmount: 0, purchaseLimitMethod : "transaction", limitUnit : 'ea', limitWeight: 'unitWeight'},
        {dispensaryId: dispensaryId, purchaseLimitType: "LiquidEdible", purchaseLimitAmount: 0, purchaseLimitMethod : "transaction", limitUnit : 'ea', limitWeight: 'unitWeight'},
        {dispensaryId: dispensaryId, purchaseLimitType: "Concentrate", purchaseLimitAmount: 0, purchaseLimitMethod : "transaction", limitUnit : 'ea', limitWeight: 'unitWeight'},
        {dispensaryId: dispensaryId, purchaseLimitType: "Topical", purchaseLimitAmount: 0, purchaseLimitMethod : "transaction", limitUnit : 'ea', limitWeight: 'unitWeight'},
        {dispensaryId: dispensaryId, purchaseLimitType: "Seed", purchaseLimitAmount: 0, purchaseLimitMethod : "transaction", limitUnit : 'ea', limitWeight: 'unitWeight'},
        {dispensaryId: dispensaryId, purchaseLimitType: "Clone", purchaseLimitAmount: 0, purchaseLimitMethod : "transaction", limitUnit : 'ea', limitWeight: 'unitWeight'},

    ]);
    
    useEffect(() => {
        if (purchaseLimitData) {
            const updatedPurchaseLimit = purchaseLimitData.map((item: any) => ({
                dispensaryId: dispensaryId,
                purchaseLimitType: item.purchaseLimitType as PurchaseLimitType,
                purchaseLimitAmount: item.purchaseLimitAmount,
                purchaseLimitMethod: item.purchaseLimitMethod as PurchaseLimitMethod,
                limitUnit: item.limitUnit as UnitOfMeasure,
                limitWeight: item.limitWeight as LimitWeight,
            }));

            // Merge with initial state to preserve all product types
            const mergedData = purchaseLimit.map(initialItem => {
                const backendItem = updatedPurchaseLimit.find(bItem => 
                bItem.purchaseLimitType === initialItem.purchaseLimitType
                );
                return backendItem ? backendItem : initialItem;
            });

            setPurchaseLimit(mergedData);
        }
    },[purchaseLimitData]);

    const handleSavePurchaseLimit = async () => {
        await setPurchaseLimitByDispensaryIdMutation.mutate(
            {
                input : purchaseLimit
            },
            {
                onSuccess: (data : any) => {
                    successAlert("Purchase Limit Updated Successfully");
                    purchaseLimitRowData.refetch();
                },
                onError: (error : any) => {
                    errorAlert("Error updating purchase limit:");
                },
            }
        )
    };


    // Function to handle changes in the form
    // const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    //     const { name, value } = event.target;
    //     const updatedPurchaseLimit = [...purchaseLimit];
    //     if (name === 'purchaseLimitAmount') {
    //         updatedPurchaseLimit[index][name] = Number(value);
    //     } else {
    //         updatedPurchaseLimit[index][name] = value;
    //     }
    //     setPurchaseLimit(updatedPurchaseLimit);
    // };

    // Helper function to update state

    return (
        <div className={`${panelType == 'plain' ? 'plain-panel' : 'panel'} w-full mx-auto p-6`}>
            <h2 className="text-xl font-semibold mb-6 text-dark dark:text-white-dark">Medical Purchase Limits</h2>
            <div className="space-y-4">
                {/* Flower Row */}
                {/* <div className="grid grid-cols-[2fr,1fr,1fr,2fr] gap-4 items-center">
                    <label className="text-sm font-medium text-dark dark:text-white-dark">
                        Flower <span className="text-red-500">*</span>
                    </label>
                    <input type="number" value={flower.value} onChange={(e) => updateState(setFlower, 'value', e.target.value)} className="form-input" />
                    <select value={flower.unit} onChange={(e) => updateState(setFlower, 'unit', e.target.value)} className="form-input">
                        <option>Grams</option>
                    </select>
                    <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                            <input type="radio" name="flower-weight" checked={flower.weightType === 'unit'} onChange={() => updateState(setFlower, 'weightType', 'unit')} className="form-radio" />
                            <span className="text-sm text-dark dark:text-white-dark">Unit Weight</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="radio" name="flower-weight" checked={flower.weightType === 'net'} onChange={() => updateState(setFlower, 'weightType', 'net')} className="form-radio" />
                            <span className="text-sm text-dark dark:text-white-dark">Net Weight</span>
                        </label>
                    </div>
                </div> */}

                <div className="space-y-4">
                    {purchaseLimit.map((item, index) => (
                        <div key={index} className="flex justify-start items-center">
                            <label className="text-sm font-medium text-dark dark:text-white-dark w-48 text-right mr-5">
                                {item.purchaseLimitType} <span className="text-red-500">*</span>
                            </label>
                        <div className='flex mx-3'>
                        {/* Amount Input */}
                            <input
                                type="number"
                                value={item.purchaseLimitAmount}
                                onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 0;
                                const updated = purchaseLimit.map((it, i) => 
                                    i === index ? {...it, purchaseLimitAmount: newValue} : it
                                );
                                setPurchaseLimit(updated);
                                }}
                                className="form-input no-spinner rounded-r-none min-w-40"
                            />
                            
                            {/* Unit Select */}
                            <div className="relative w-40">
                                <select
                                    value={item.limitUnit}
                                    onChange={(e) => {
                                        const updated = purchaseLimit.map((it, i) =>
                                            i === index ? { ...it, limitUnit: e.target.value as UnitOfMeasure } : it
                                        );
                                        setPurchaseLimit(updated);
                                    }}
                                    className="form-input rounded-l-none pr-8"
                                >
                                    {unitOfMeasureOptions.map((option, key) => (
                                        <option key={key} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                                        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                        {/* Weight Type Radio Buttons */}
                        <div className="flex space-x-4 mx-5">
                            <label className="flex items-center space-x-2 mx-3">
                            <input
                                type="radio"
                                name={`${index}-weight`}
                                checked={item.limitWeight === 'unitWeight'}
                                onChange={() => {
                                const updated = purchaseLimit.map((it, i) => 
                                    i === index ? {...it, limitWeight: 'unitWeight' as LimitWeight} : it
                                );
                                setPurchaseLimit(updated);
                                }}
                                className="form-radio"
                            />
                            <span className="text-sm text-dark dark:text-white-dark">Unit Weight</span>
                            </label>
                            <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name={`${index}-weight`}
                                checked={item.limitWeight === 'netWeight'}
                                onChange={() => {
                                const updated = purchaseLimit.map((it, i) => 
                                    i === index ? {...it, limitWeight: 'netWeight' as LimitWeight} : it
                                );
                                setPurchaseLimit(updated);
                                }}
                                className="form-radio"
                            />
                            <span className="text-sm text-dark dark:text-white-dark">Net Weight</span>
                            </label>
                        </div>
                        </div>
                    ))}
                    </div>
            </div>
            <hr className='w-full border-[1px] my-3 dark:!border-dark text-white-dark'/>
            <div className='flex justify-end items-center mt-2'>
                <button className='btn btn-outline-primary' onClick={handleSavePurchaseLimit}>Save</button>
            </div>
        </div>
    );
}
