import React, { useState } from 'react';
import { FaClock } from 'react-icons/fa6';

import { convertPSTTimestampToTimezone } from '@/utils/datetime';

import { userDataSave } from '@/store/userData';
interface RegisterLabelType {
    [key: string]: string;
}

export default function OrderCard({ orderData, isLoading }: any) {
    const [hide, setHide] = useState(false);
    const currentDate = new Date().toISOString().split('T')[0];
    const {userData} = userDataSave();

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

    console.log("orderData----------->", orderData)

    const registerLabel: RegisterLabelType = {
        'register-1': 'Register 1',
        'register-2': 'Register 2',
        'register-3': 'Register 3',
        'register-4': 'Register 4',
    };

    const formatDate = (isoDateString: any) => {
        const date = new Date(isoDateString);

        // Get components of the date
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        // Get hours and minutes
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');

        // Determine AM/PM suffix
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? hours : 12; // The hour '0' should be '12'

        // Format the date
        return `${month}/${day}/${year} - ${hours}:${minutes} ${ampm}`;
    };
    return (
        <div className="bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full mx-auto my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b]">
            <div className="w-full bg-white dark:bg-[#0f1727] rounded-md border-[1px] border-gray-50  dark:border-[#1a1e3b] shadow-sm shadow-gray-200 dark:shadow-[#0a0b0f]">
                {isLoading ? 
                <div className="flex justify-center items-center py-2 px-3">
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                </div>
                : <div
                    className={`p-2 rounded-t-md font-bold ${
                        orderData?.status == 'EDIT'
                            ? 'bg-info-light text-info dark:bg-info-dark-light '
                            : orderData?.status == 'HOLD'
                            ? 'bg-warning-light text-warning dark:bg-warning-dark-light'
                            : orderData?.status == 'PAID'
                            ? 'bg-success-light text-success border-theme_green dark:bg-success-dark-light'
                            : 'bg-dark text-white dark:bg-gray-500 dark:border-gray-500 dark:text-gray-800'
                    }`}
                >
                    {orderData?.status}
                </div>}
                <div className="p-3 border-b-gray-200 border-b-[1px] dark:border-[#1a1e3b] text-lg text-dark dark:text-white-dark font-semibold  dark:text-inherit">Order Details</div>
                <div className="p-3 flex flex-col dark:text-inherit">
                    <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Type:</div>
                        <div className={`text-left badge ${orderData?.orderType == 'SALE' ? 'badge-outline-success' : 'badge-outline-warning'}`}>{orderData?.orderType}</div>
                    </div>
                    <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Order Date:</div>
                        <div className="w-[50%] text-left">{convertPSTTimestampToTimezone(orderData?.updatedAt, userData.storeTimeZone)}</div>
                    </div>
                    {/* <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Completed At:</div>
                        <div className="w-[50%] text-left">{convertPSTTimestampToTimezone(orderData?.updatedAt, userData.storeTimeZone)}</div>
                    </div> */}
                    <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Customer:</div>
                        <div className="w-[50%] text-left">{orderData?.customer?.name}</div>
                    </div>
                    <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Store:</div>
                        <div className="w-[50%] text-left">{orderData?.dispensary?.name}</div>
                    </div>
                    <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Customer Type:</div>
                        <div className="w-[50%] text-left">{orderData?.customer?.isMedical == true ? 'Medical' : 'Not Medical'}</div>
                    </div>
                    <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Register:</div>
                        <div className="w-[50%] text-left">{registerLabel[orderData?.drawer?.register]}</div>
                    </div>
                    <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Bud Tender:</div>
                        <div className="w-[50%] text-left">{orderData?.user?.name}</div>
                    </div>
                    {orderData?.status == 'VOID' ? (
                        <>
                            <div className="flex justify-start items-center my-[6px] text-md">
                                <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Voided At:</div>
                                <div className="w-[50%] text-left">{convertPSTTimestampToTimezone(orderData?.voidedAt, userData.storeTimeZone)}</div>
                            </div>
                            <div className="flex justify-start items-center my-[6px] text-md">
                                <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Void Reason:</div>
                                <div className="w-[50%] text-left">{orderData?.voidReason}</div>
                            </div>
                        </>
                    ) : null}
                    <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Reported to Metrc:</div>
                        {orderData?.isReportedToMetrc == true ? 
                        <span className='badge bg-success-light text-success dark:bg-success-dark-light'>REPORTED</span> 
                        : 
                        <span className='badge bg-warning-light text-warning dark:bg-warning-dark-light'>UNREPORTED</span> }
                    </div>
                    <div className="flex justify-start items-center my-[6px] text-md">
                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Metrc ID:</div>
                        <div className="w-[50%] text-left">{orderData?.metrcId}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex justify-start">
            <span className="text-sm !font-varela_Round font-semibold w-1/2">{label}</span>
            <span className="text-sm text-left w-1/2">{value == null ? '' : value}</span>
        </div>
    );
}
