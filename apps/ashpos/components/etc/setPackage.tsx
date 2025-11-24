'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PackageTransfer from './packageTransfer';
import { useQueryClient } from '@tanstack/react-query';


import { usePackagesByDeliveryIdQuery, useCreateNonMjPackageMutation, useGetNonMjPackagesByTransferIdQuery  } from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
// Import Icon
import { RxDoubleArrowRight } from 'react-icons/rx';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';

function SetPackage({ deliverId, transferId, mtrTransferId, status, isMj }: any) {
    const queryClient = useQueryClient();
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const [isUpdate, setIsUpdate] = useState(false);

    // Fetch Data
    const packageRowData = usePackagesByDeliveryIdQuery({ deliveryId: deliverId });
    const packageDataByDelivery = packageRowData.data?.packagesByDeliveryId;
    const nonMjPackageRowData = useGetNonMjPackagesByTransferIdQuery({transferId : transferId});
    const nonMjPackageData = nonMjPackageRowData?.data?.getNonMjPackagesByTransferId;
    const [packageData, setPackageData] = useState<any>(packageDataByDelivery);
    const createNonMjPackageMutation = useCreateNonMjPackageMutation();

    // console.log("packageData", packageData);
    const refetchOrders = async () => {
        return await queryClient.refetchQueries(['PackagesByDeliveryId']);
    };

    // Generate 10 digists randome number
    function generateRandomNDigitNumber(n : number) {
        let randomNumber = '';
        for (let i = 0; i < n; i++) {
            randomNumber += Math.floor(Math.random() * 10); // Generates a digit between 0 and 9
        }
        return randomNumber;
    }

    useEffect(() => {
        if(isMj) {
            setPackageData(packageDataByDelivery);
        } else {
            setPackageData(nonMjPackageData);
        }
    }, [isMj, packageDataByDelivery, nonMjPackageData])


    const handleCreateNonMJTransfer = async () => {
        await createNonMjPackageMutation.mutate(
            {
                input : {
                    dispensaryId: dispensaryId,
                    transferId: transferId,
                }
            },
            {
                onError: (error) => {
                    warnAlert("Failed to Create Non MJ Package");
                },
                onSuccess: (data) => {
                    if(data) {
                        successAlert("New Non Mj Package Created!");
                        nonMjPackageRowData.refetch();
                    }
                }
            }
        )
    }
    useEffect(() => {
        if (isUpdate) {
            packageRowData.refetch();
            nonMjPackageRowData.refetch();
            setIsUpdate(false);
        }
    }, [isUpdate]);
    return (
        <div>
            <div className="dark:bg-[#060818] px-3">
                <div className="mx-auto mb-3 bg-white dark:bg-[#0f1727] shadow-lg rounded-lg overflow-hidden">
                    {/* <div className="bg-theme_green text-white text-center py-1 text-base font-semibold">Accepted</div> */}
                    <div
                        className={`p-2 rounded-t-md border-gray-200 text-center dark:border-[#1a1e3b] font-bold ${
                            status == 'ACCEPTED'
                                ? 'bg-theme_green text-white dark:text-green-900'
                                : status == 'PENDING'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-dark text-gray-100 dark:text-gray-800'
                        }`}
                    >
                        {status}
                    </div>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-dark dark:text-white-dark text-center mb-2">
                            <span className="text-gray-600">
                                {packageData && packageData.length > 0 ? 'Incoming Transfer from ' + packageData[0]?.package?.ItemFromFacilityName || '' + ' ( ' + packageData[0]?.package?.ItemFromFacilityLicenseNumber || '' + ' )' : 'There is no package.'}
                            </span>
                        </h2>
                        {isMj ? <div className="text-center text-dark dark:text-white-dark !mt-0">Metrc Transfer ID: {mtrTransferId}</div> : null}
                        {/* <div className="flex flex-col space-y-2 text-sm text-gray-600 mb-3">
                            <div className="text-center !mt-0">Imported by GrowFlow {transferData.importedDate}</div>
                            <div className="text-center !mt-0">Last Synced {transferData.lastSyncedDate}</div>
                            <div className="text-center !mt-0">Accepted & Completed {transferData.acceptedDate}</div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                            <div className="flex-1 h-32 p-3 border-[1px] border-gray-200 dark:border-[#1a1e3b]">
                                <h3 className="font-semibold mb-2">Transfer From</h3>
                                <p>{transferData.fromCompany}</p>
                                <p>Lic# {transferData.fromLicense}</p>
                            </div>
                            <div className="flex justify-center items-center">
                                <RxDoubleArrowRight className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1 h-32 p-3 border-[1px] border-gray-200 dark:border-[#1a1e3b]">
                                <h3 className="font-semibold mb-2">Transfer To</h3>
                                <p>{transferData.toCompany}</p>
                                <p>Lic# {transferData.toLicense}</p>
                                <p>{transferData.toPhone}</p>
                                <p>{transferData.toAddress}</p>
                                <p>
                                    {transferData.toCity}, {transferData.toState} {transferData.toZip}
                                </p>
                            </div>
                        </div> */}
                    </div>
                </div>
                {packageData?.map((data : any, key : any) => (
                    <PackageTransfer key={key} packageData={data} setIsUpdate={setIsUpdate} transferId={transferId} isMj={isMj}/>
                ))}
                { isMj ? null :
                <div className="w-full flex justify-center py-2"><button className='btn btn-outline-primary mx-auto my-2' onClick={() =>  handleCreateNonMJTransfer()}> + Add Package</button></div>}
            </div>
        </div>
    );
}

export default SetPackage;
