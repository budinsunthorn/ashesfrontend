"use client"
import React, { useEffect, useState } from 'react';
import { FaClock } from 'react-icons/fa6';
import { userDataSave } from '@/store/userData';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import PackageStatusBadge from './packageStatus';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { FaBarcode } from 'react-icons/fa';
import CopyButton from './copyButton';
import { truncateToTwoDecimals } from '@/lib/utils';
export default function ProductPackageCard({ packageData, isLoading, isMj }: any) {
    const [hide, setHide] = useState(false);
    const currentDate = new Date().toISOString().split('T')[0];
    const {userData} = userDataSave();
    const { organizationId, storeLinkName } = useParams();
    const router = useRouter()

    const [totalTerpenes, setTotalTerpenes] = useState("")
    
    // Function to calculate the number of days between two dates
    function calculateDaysBetweenDates(date1: string, date2: string): string {
        const startDate = new Date(date1);
        const endDate = new Date(date2);

        // Calculate the difference in milliseconds
        const differenceInMilliseconds = endDate.getTime() - startDate.getTime();

        // Convert milliseconds to days
        const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

        return differenceInDays.toFixed(0);
    }

    useEffect(() => {
        let totalTerpenes = ""
        packageData?.TestResult?.map((item: any) => {
            if(item.testResultLevel <= 0) return;
            totalTerpenes += item.testTypeName + ' - ' + item.testResultLevel + ', ';
        })

        setTotalTerpenes(totalTerpenes)
    }, [packageData?.TestResult])

    const handleGotoLink = (page: string, key: string, value: string) => {
        // Create a URLSearchParams object to properly format the query parameters
        // console.log('key:', key);
        const searchParams = new URLSearchParams();
        searchParams.append(key, value);
        // console.log('searchParams', searchParams.toString());
        
        // Construct the full URL dynamically
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ashespos.ai';
        const fullUrl = `${baseUrl}/org/${organizationId}/${storeLinkName}/${page}?${searchParams.toString()}`;
        
        // Check if we're in an Electron environment
        const isElectron = typeof window !== 'undefined' && 
            (window as any).process && 
            (window as any).process.type;
        
        if (isElectron) {
            // In Electron, use the shell module to open external links
            // This will open in the default browser
            if (window.require) {
                const { shell } = window.require('electron');
                shell.openExternal(fullUrl);
            }
        } else {
            // In web browser, open in new tab
            window.open(fullUrl, '_blank', 'noopener,noreferrer');
        }
    };
    
    return (
        <div className={`bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full mx-auto my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b] ${(isMj && packageData?.package?.assignPackage) || (!isMj && packageData?.assignPackage) ? '' : '!border-danger !border-2'}`}>
            {isLoading ? 
            <div className="flex justify-center items-center py-2 px-3">
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
            </div>
            : 
            <div className="flex justify-between items-center text-base text-center font-semibold mt-2 text-dark dark:text-white-dark px-2">
                <span className=''>{isMj ? packageData?.package?.itemName : packageData?.product?.name}</span>
                <div className='flex justify-end items-center'>
                    {(isMj && packageData.package?.assignPackage) || (!isMj && packageData?.assignPackage) ? null : 
                    <div className="flex justify-start items-center">
                        <span className="badge text-warning bg-warning-light dark:bg-warning-dark mr-2">Incomplete</span>
                    </div>
                    }
                {<PackageStatusBadge packageStatus={isMj ? packageData?.package?.packageStatus : packageData?.packageStatus} />}
                </div>
            </div>}

            <hr className="text-lg dark:border-[#1a1e3b] my-2" />
            <div className="p-3">
                {packageData.package?.itemId == null && packageData.assignPackage == null? "New Empty Package" : (
                    <div>
                        <div className="flex flex-col justify-start text-center items-start mb-1">
                            <div className="w-full flex justify-between items-center space-x-2">
                                {/* <span className="text-dark dark:text-white-dark">{packageData.productId}</span> */}
                                <button className="text-dark dark:text-white-dark font-semibold text-left">
                                    {isMj ?  packageData.package?.Quantity : packageData?.assignPackage?.posQty}
                                    {isMj ? packageData.package?.UnitOfMeasureAbbreviation : packageData?.UnitOfMeasureAbbreviation || ' Items'} 
                                    <span className="font-medium text-gray-600"> left</span>
                                </button>
                                <div className="flex justify-start items-center text-md font-gray-500"><FaBarcode className='mr-1'/>{isMj ? packageData?.packageLabel?.slice(-10).toUpperCase() : packageData?.id?.slice(-10).toUpperCase()}
                                    <CopyButton 
                                        text={isMj ? packageData?.packageLabel?.slice(-10).toUpperCase() : packageData?.id?.slice(-10).toUpperCase()}
                                        className="ml-1"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-[#1c2942] rounded-full h-2.5 mb-2">
                        {isMj ? 
                        <div className="bg-theme_green h-2.5 rounded-full w-0" style={{ width: `${(packageData.package?.Quantity / packageData.package?.originalQty) * 100}%` }}></div>
                        : <div className="bg-theme_green h-2.5 rounded-full w-0" style={{ width: `${((packageData?.assignPackage?.posQty) / packageData?.originalQty) * 100}%` }}></div>}
                        </div>
                        <div className="flex justify-start items-center">
                            <FaClock className="text-dark dark:text-white-dark text-sm mr-1" />
                            {isMj ? 
                            // <span className="text-sm text-dark dark:text-white-dark ">{moment(packageData.package?.PackagedDate).fromNow()}</span>
                            // : <span className="text-sm text-dark dark:text-white-dark ">{moment(packageData.createdAt).fromNow()}</span>}
                            <span className="text-sm text-dark dark:text-white-dark ">{calculateDaysBetweenDates(packageData.package?.ReceivedDateTime, Date())} days old</span>
                            : <span className="text-sm text-dark dark:text-white-dark ">{calculateDaysBetweenDates(packageData.createdAt, Date())} days old</span>}
                        </div>
                        <hr className="text-lg dark:border-[#1a1e3b] my-2" />
                    </div>
                )}
                {(packageData.package?.itemId != null || packageData.assignPackage != null) && hide ? (
                    <div>
                        <div className="flex flex-col gap-4 mb-4">
                            {(isMj && packageData.package?.assignPackage) || (!isMj && packageData?.assignPackage) ? 
                            <LinkItem
                                page="product/product"
                                label="Product"
                                paramKey="productId"
                                value={isMj ? packageData?.package?.assignPackage?.product?.name : packageData?.product?.name}
                                param={isMj ? packageData?.package?.assignPackage?.productId : packageData?.assignPackage?.productId}
                                handleGotoLink={handleGotoLink}

                            /> : <div className="flex justify-start">
                                    <span className="text-sm !font-varela_Round font-semibold text-dark dark:text-white-dark w-1/2">Product</span>
                                    <div className="flex justify-start items-center w-1/2">
                                        <span className="badge text-warning bg-warning-light dark:bg-warning-dark">Incomplete</span>
                                    </div>
                                </div>}
                            <DetailItem label="Date Created:" value={packageData?.createdAt} show={packageData?.package?.itemId == null || packageData?.package?.itemId == undefined} />
                            <DetailItem label="Date Created:" value={packageData?.package?.PackagedDate} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined} />
                            <DetailItem label="Activated At:" value={convertPSTTimestampToTimezone(packageData.package?.ReceivedDateTime, userData.storeTimeZone) } show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>
                            <DetailItem label="Metrc Tag:" value={packageData?.packageLabel} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>
                            <DetailItem label="Metrc:" value={packageData?.packageId} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>
                            <DetailItem
                                label={`${packageData.package?.itemQuantityType == 'WeightBased' ? 'Original Weight' : 'Original Qty:'}`}
                                value={`${packageData?.package?.originalQty} ${packageData.package?.itemQuantityType == 'WeightBased' ? 'Grams' : 'Items'}`}
                                show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}
                            />
                            <DetailItem
                                label={`${packageData.package?.itemQuantityType == 'WeightBased' ? 'Current Weight' : 'Current Qty:'}`}
                                value={`${packageData.package?.Quantity} ${packageData.package?.itemQuantityType == 'WeightBased' ? 'Grams' : 'Items'}`}
                                show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}
                            />
                            <DetailItem label="Original Quantity:" value={`$${truncateToTwoDecimals(packageData.originalQty)}`} show={packageData?.package?.itemId == null || packageData?.package?.itemId == undefined}/>
                            <DetailItem label="Cost Per Item:" value={`$${truncateToTwoDecimals(packageData?.assignPackage?.cost)}`} show={packageData?.package?.itemId == null || packageData?.package?.itemId == undefined}/>
                            <DetailItem label="Total Cost:" value={`$${truncateToTwoDecimals(packageData?.originalQty * packageData.assignPackage?.cost)}`} show={packageData?.package?.itemId == null || packageData?.package?.itemId == undefined}/>


                            <DetailItem label="Cost Per Item:" value={`$${truncateToTwoDecimals(packageData.package?.assignPackage?.cost)}`} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>
                            <DetailItem label="Total Cost:" value={`$${truncateToTwoDecimals(packageData.package?.originalQty * packageData.package?.assignPackage?.cost)}`} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>

                            
                            <DetailItem label="Metrc Name:" value={packageData.package?.itemName} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>
                            <DetailItem label="Metrc Qty:" value={packageData.package?.Quantity} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>
                            <DetailItem label="Metrc Unit Weight:" value={packageData.package?.UnitOfMeasureAbbreviation} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>
                            <DetailItem label="Metrc Source Category Name:" value={packageData.package?.itemProductCategoryName} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>
                            <DetailItem label="Metrc Location:" value={packageData.package?.LocationName} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined}/>
                            <hr className='text-lg dark:border-[#1a1e3b] my-1'/>
                            <DetailItem label="Date Tested:" value={packageData?.TestResult && packageData?.TestResult[0]?.testPerformedDate} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined} />
                            <DetailItem label="Total Terpenes:" value={totalTerpenes} show={packageData?.package?.itemId != null && packageData?.package?.itemId != undefined} />
                            
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
                {(packageData.package?.itemId != null || packageData.assignPackage != null) ? <div className="mt-6">
                    <button className="text-dark dark:text-white-dark hover:text-gray-800 dark:hover:text-gray-400 underline" onClick={() => setHide(!hide)}>
                        {hide ? 'Hide' : 'Show'} Details
                    </button>
                </div> : null}
            </div>
        </div>
    );
}

function DetailItem({ label, value, show }: { label: string; value: string | number, show: boolean }) {
    return (
        show ? <div className="flex justify-start">
            <span className="text-sm !font-varela_Round font-semibold text-dark dark:text-white-dark w-1/2">{label}</span>
            <span className="text-sm text-left w-1/2">{value == null ? "" : value}</span>
        </div>
        : null
    );
}


function LinkItem({
    page,
    label,
    paramKey,
    param,
    value,
    handleGotoLink,
}: {
    page: string;
    label: string;
    paramKey: string;
    param: string;
    value: string;
    handleGotoLink: (page: string, paramKey: string, value: string) => void;
}) {

    
    return (
        <div className="flex justify-start">
            <span className="text-sm !font-varela_Round font-semibold text-dark dark:text-white-dark w-1/2">{label}</span>
            <a className="text-sm text-left text-dark dark:text-white-dark font-bold cursor-pointer underline w-1/2" onClick={() => handleGotoLink(page, paramKey, param)}>
                {value == null ? '' : value}
            </a>
        </div>
    );
}