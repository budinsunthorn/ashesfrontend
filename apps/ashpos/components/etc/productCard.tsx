"use client"
import { userDataSave } from '@/store/userData';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import React, { useEffect, useState } from 'react';
import { FaClock } from 'react-icons/fa6';
import PackageStatusBadge from './packageStatus';
import { FaBarcode } from "react-icons/fa6";
import CopyButton from './copyButton';
import { truncateToTwoDecimals } from '@/lib/utils';

export default function ProductCard({ packageData }: any) {
    const [hide, setHide] = useState(false);
    const currentDate = new Date().toISOString().split('T')[0];
    const {userData} = userDataSave();

    const [totalTerpenes, setTotalTerpenes] = useState("")
    
    useEffect(() => {
        let totalTerpenes = ""
        packageData?.TestResult?.map((item: any) => {
            if(item.testResultLevel <= 0) return;
            totalTerpenes += item.testTypeName + ' - ' + item.testResultLevel + ', ';
        })

        setTotalTerpenes(totalTerpenes)
    }, [packageData?.TestResult])
    
    // Function to calculate the number of days between two dates
    function calculateDaysBetweenDates(date1: string, date2: string): number {
        const startDate = new Date(date1);
        const endDate = new Date(date2);

        // Calculate the difference in milliseconds
        const differenceInMilliseconds = endDate.getTime() - startDate.getTime();

        // Convert milliseconds to days
        const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

        return differenceInDays;
    }

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    console.log("productData", packageData)
    return (
        <div className="bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full mx-auto my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b]">
            <div className="flex justify-between items-center mt-2 text-dark dark:text-white-dark px-2">
                <div className='flex justify-start items-center'>
                    <FaBarcode className='mr-2' />
                    <span className='text-base text-center font-semibold '>{packageData.packageLabel.slice(-10).toUpperCase()}</span>
                    <CopyButton 
                        text={packageData?.packageLabel.slice(-10).toUpperCase()}
                        className="ml-2"
                    />
                </div>
                <PackageStatusBadge packageStatus={packageData.packageStatus} />
            </div>
            <hr className="text-lg dark:border-[#1a1e3b] my-2" />
            <div className="p-3">
                {packageData?.assignPackage?.posQty == 0 ? null : (
                    <div>
                        <div className="flex flex-col justify-start text-center items-start mb-1">
                            <div className="flex items-center space-x-2">
                                {/* <span className="text-dark dark:text-white-dark">{packageData.productId}</span> */}
                                <button className="text-dark dark:text-white-dark font-semibold text-left">
                                    {packageData?.assignPackage?.posQty}
                                    {packageData.UnitOfMeasureAbbreviation}
                                    <span className="font-medium text-gray-600"> left</span>
                                </button>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-[#1c2942] rounded-full h-2.5 mb-2">
                            <div className="bg-theme_green h-2.5 rounded-full w-0" style={{ width: `${((packageData?.assignPackage?.posQty / packageData.originalQty) * 100)%101}%` }}></div>
                        </div>
                        <div className="flex justify-start items-center">
                            <FaClock className="text-dark dark:text-white-dark text-sm mr-1" />
                            <span className="text-sm text-dark dark:text-white-dark ">{calculateDaysBetweenDates(packageData.PackagedDate, currentDate)} days old</span>
                        </div>
                        <hr className="text-lg dark:border-[#1a1e3b] my-2" />
                    </div>
                )}
                {hide ? (
                    <div>
                        <div className="flex flex-col gap-4 mb-4">
                            <DetailItem label="Date Created:" value={convertPSTTimestampToTimezone(packageData.createdAt, userData.storeTimeZone)} show={true}/>
                            <DetailItem label="Activated At:" value={convertPSTTimestampToTimezone(packageData.updatedAt, userData.storeTimeZone)} show={true}/>
                            <DetailItem label="Metrc Tag:" value={packageData.packageLabel} show={packageData?.itemId != null && packageData?.itemId != undefined} isCopy={true}/>
                            <DetailItem label="Metrc:" value={packageData.packageId} show={packageData?.itemId != null && packageData?.itemId != undefined}/>
                            <DetailItem
                                label={`${packageData.itemQuantityType == 'WeightBased' ? 'Original Weight' : 'Original Qty:'}`}
                                value={`${packageData?.originalQty} ${packageData.itemQuantityType == 'WeightBased' ? 'Grams' : 'Items'}` }
                                show={true}
                            />
                            {/* <DetailItem
                                label={`${packageData.itemQuantityType == 'WeightBased' ? 'Current Weight' : 'Current Qty:'}`}
                                value={`${packageData.assignPackage.posQty} ${packageData.itemQuantityType == 'WeightBased' ? 'Grams' : 'Items'}`}
                                show={packageData?.itemId != null && packageData?.itemId != undefined}
                            /> */}
                            {/* <DetailItem label="Transfer:" value={`$${packageData.cost?.toFixed(2)}`} show={packageData?.itemId == null || packageData?.itemId == undefined}/> */}
                            <DetailItem label="Cost Per Item:" value={`$${truncateToTwoDecimals(packageData.assignPackage.cost)}`} show={true}/>
                            <DetailItem label="Total Cost:" value={`$${truncateToTwoDecimals(packageData.originalQty * packageData.assignPackage.cost)}`} show={true}/>
                            <DetailItem label="Metrc Name:" value={packageData.itemName} show={packageData?.itemId != null && packageData?.itemId != undefined}/>
                            <DetailItem label="Metrc Qty:" value={packageData.Quantity} show={packageData?.itemId != null && packageData?.itemId != undefined}/>
                            <DetailItem label="Metrc Unit Weight:" value={`${packageData?.originalQty} ${packageData.itemQuantityType == 'WeightBased' ? 'Grams' : 'Items'}`} show={packageData?.itemId != null && packageData?.itemId != undefined}/>
                            <DetailItem label="Metrc Source Category Name:" value={packageData.itemProductCategoryName} show={packageData?.itemId != null && packageData?.itemId != undefined}/>
                            <DetailItem label="Metrc Location:" value={packageData.LocationName} show={packageData?.itemId != null && packageData?.itemId != undefined}/>
                            <hr className='text-lg dark:border-[#1a1e3b] my-1'/>
                            <DetailItem label="Date Tested:" value={packageData?.TestResult && packageData?.TestResult[0]?.testPerformedDate} show={packageData?.itemId != null && packageData?.itemId != undefined} />
                            <DetailItem label="Total Terpenes:" value={totalTerpenes} show={packageData?.itemId != null && packageData?.itemId != undefined} />
                            
                        </div>
                        <hr className="text-lg dark:border-[#1a1e3b] my-2" />
                        {/* <div className="flex flex-col gap-4 mb-4">
                        <DetailItem label="Date Tested:" value={packageData.dateTested} />
                        <DetailItem label="THC:" value={`${packageData.thc}%`} />
                        <DetailItem label="THCA:" value={`${packageData.thca}%`} />
                        <DetailItem label="CBC:" value={`${packageData.cbc}%`} />
                        <DetailItem label="CBN:" value={`${packageData.cbn}%`} />
                        <DetailItem label="THCV:" value={`${packageData.thcv}%`} />
                        <DetailItem label="CBG:" value={`${packageData.cbg}%`} />
                    </div>

                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Total Terpenes:</h3>
                        <ul className="list-disc pl-5">
                            {packageData.totalTerpenes
                                ? packageData.totalTerpenes.map((terpene: any, index: any) => (
                                      <li key={index} className="text-sm">
                                          {terpene}
                                      </li>
                                  ))
                                : null}
                        </ul>
                    </div> 
                        <DetailItem label="Total Potential Psychoactive THC:" value={`${packageData.totalPotentialPsychoactiveThc}%`} />
                    */}
                    </div>
                ) : null}
                <div className="mt-2">
                    <button className="text-dark dark:text-white-dark hover:text-gray-800 dark:hover:text-gray-400 underline" onClick={() => setHide(!hide)}>
                        {hide ? 'Hide' : 'Show'} Details
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, show, isCopy = false }: { label: string; value: string | number, show: boolean, isCopy?: boolean }) {
    return (
        show ? <div className="flex justify-start">
            <span className="text-sm !font-varela_Round font-semibold text-dark dark:text-white-dark w-1/2">{label}</span>
            <span className="text-sm text-left w-1/2 flex justify-start items-center">
                {isCopy ? <CopyButton text={value.toString()} className="pr-1" /> : null}
                {value}
            </span>
        </div> : null
    );
}
