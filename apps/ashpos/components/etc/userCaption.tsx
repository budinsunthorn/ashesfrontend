import React from 'react';
import CustomerType from './customerType';
import IconCircleCheck from '../icon/icon-circle-check';
import IconXCircle from '../icon/icon-x-circle';
import Moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { truncateToTwoDecimals } from '@/lib/utils';

const UserCaption = ({ orderData, isAgeVerified, dispensaryData }: {orderData: any, isAgeVerified: boolean, dispensaryData: any;}) => {

    function formatDate(timestamp:any) {  
        // Create a new Date object from the timestamp  
        const date = new Date(timestamp);  
    
        // Extract the year, month, and day  
        const year = date.getFullYear();  
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based  
        const day = String(date.getDate()).padStart(2, '0');  
    
        // Return the formatted date  
        return `${year}-${month}-${day}`;  
    }
    return (
        <PerfectScrollbar>
            <div  className="flex flex-col h-[400px] justify-between items-start text-gray-700 dark:text-gray-400">
                <table className="!border-0 overflow-y-auto">
                    <tbody className='overflow-y-auto'>
                        <tr className='!border-0'>
                            <td className="flex justify-start items-center text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">
                                <div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>
                                Loyalty Points:
                            </td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">
                                {truncateToTwoDecimals(orderData?.customer?.loyaltyPoints)}
                            </td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Active:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">
                                <div className={`flex w-3 h-3 rounded-full mx-1 ${orderData?.customer?.isActive ? 'bg-theme_green ' : 'bg-red-400 '}`}></div>
                            </td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Type:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">
                                <CustomerType isMedical={orderData?.customer?.isMedical} />
                            </td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Name:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.name}</td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Gender:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.MFType}</td>
                        </tr>
                        <tr className='!border-0'>   
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center w-full"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Birthday:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-0 !px-0">
                                <div className='flex justify-start items-center'>
                                {orderData?.customer?.birthday ? formatDate(orderData?.customer?.birthday) : ''}
                                {isAgeVerified ? (
                                    <>
                                        <button type="button" className="group/span relative text-theme_green ml-2">
                                            <IconCircleCheck />
                                            <span className="absolute -top-[170%] -left-[150%] rounded-md p-2 bg-white text-gray-600 dark:bg-[#1b2e4b] dark:text-gray-400 border-[1px] border-gray-200 dark:border-gray-400 text-nowrap hidden group-hover/span:block">
                                                Age is over {dispensaryData?.customerAgeLimit ? dispensaryData?.customerAgeLimit : 18}
                                            </span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button type="button" className="group/span relative text-red-500 ml-2 font-bold">
                                            <IconXCircle />
                                            <span className="absolute -top-[170%] -left-[150%] rounded-md p-2 bg-white text-gray-600 dark:bg-[#1b2e4b] dark:text-gray-400 border-[1px] border-gray-200 dark:border-gray-400 text-nowrap hidden group-hover/span:block">
                                                Age is under {dispensaryData?.customerAgeLimit ? dispensaryData?.customerAgeLimit : 18}
                                            </span>
                                        </button>
                                    </>
                                )}
                                </div>
                            </td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Email:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.email}</td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Phone:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.phone}</td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>DriverLicense:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.driverLicense}</td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Driver License Expire Date:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">
                                {orderData?.customer?.driverLicenseExpirationDate ? Moment(orderData?.customer?.driverLicenseExpirationDate).format('YYYY-MM-DD') : ''}
                            </td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>MedicalLicense:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.medicalLicense}</td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Medical License Expire Date:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">
                                {orderData?.customer?.medicalLicenseExpirationDate ? Moment(orderData?.customer?.medicalLicenseExpirationDate).format('YYYY-MM-DD') : ''}
                            </td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Status:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.status}</td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Tax Exempt:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.isTaxExempt ? "Yes" : "No"}</td>
                        </tr>
                        <tr className='!border-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Created At:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.createdAt ? Moment(orderData?.customer?.createdAt).format('YYYY-MM-DD') : ''}</td>
                        </tr>
                        <tr className='!border-b-0'>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0 flex justify-start items-center"><div className='bg-secondary w-1.5 h-1.5 rounded-full mr-3'></div>Updated At:</td>
                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 !px-0">{orderData?.customer?.updatedAt ? Moment(orderData?.customer?.updatedAt).format('YYYY-MM-DD') : ''}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </PerfectScrollbar>
    );
};

export default UserCaption;
