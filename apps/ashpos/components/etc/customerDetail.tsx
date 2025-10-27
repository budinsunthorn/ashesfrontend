'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

import { FaSuitcaseMedical } from 'react-icons/fa6';
import { MdHistory, MdOutlineLoyalty } from 'react-icons/md';
import { AiFillProject } from "react-icons/ai";
import { IoLayersSharp } from 'react-icons/io5';
import SkeletonLoader from './skeletonLoader';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { truncateToTwoDecimals } from '@/lib/utils';

export default function CustomerProfile({ customerData }: any) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { organizationId, storeLinkName } = useParams();

    // console.log(customerData)
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const [currentPage, setCurrentPage] = useState(1);
    const [orderHistory, setOrderHistory] = useState<any>([]);

    const getCategoryStyle = (category: string) => {
        const styles = {
            'Small Flowers': 'bg-purple-500 text-white',
            Concentrate: 'bg-amber-500 text-white',
            Edible: 'bg-blue-500 text-white',
            Accessories: 'bg-gray-900 text-white',
            'Bulk Flower': 'bg-green-700 text-white',
        };
        return styles[category as keyof typeof styles] || 'bg-gray-500 text-white';
    };

    useEffect(() => {
        // console.log(currentPage)
        const newOrders: any = []; // Temporary array to hold new orders  

        for (let i = (currentPage - 1) * 5; i < currentPage * 5; i++) {
            if (customerData && customerData.Order && customerData.Order[i]) {
                newOrders.push(customerData.Order[i]); // Add the current order to the temporary array  
            }
        }

        // Update the state with the new orders  
        setOrderHistory(newOrders);


    }, [currentPage, customerData])

    const handleGotoLink = async (page: string, key: string, value: string) => {
        // Create a URLSearchParams object to properly format the query parameters
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

    const aggregateLoyaltyHistory = (order: any) => {
        if (!order.LoyaltyHistory || order.LoyaltyHistory.length === 0) {
            return { earned: 0, spent: 0 };
        }

        return order.LoyaltyHistory.reduce((acc: { earned: number, spent: number }, loyalty: any) => {
            if (loyalty.txType.toLowerCase() === 'earn') {
                acc.earned += Number(loyalty.value) || 0;
            } else if (loyalty.txType.toLowerCase() === 'spend') {
                acc.spent += Number(loyalty.value) || 0;
            }
            return acc;
        }, { earned: 0, spent: 0 });
    };

    const calculateTotalLoyaltyStats = () => {
        if (!customerData?.Order || customerData.Order.length === 0) {
            return { totalEarned: 0, totalSpent: 0 };
        }

        return customerData.Order.reduce((acc: { totalEarned: number, totalSpent: number }, order: any) => {
            const orderStats = aggregateLoyaltyHistory(order);
            acc.totalEarned += orderStats.earned;
            acc.totalSpent += orderStats.spent;
            return acc;
        }, { totalEarned: 0, totalSpent: 0 });
    };


    const loyaltyTotals = calculateTotalLoyaltyStats();

    console.log('orderHistory', orderHistory);
    console.log("customerData", customerData)


    const renderPagination = (currentPage: number, totalItems: number, itemsPerPage: number = 5) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

        // Calculate the range of pages to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Adjust start page if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        return (
            <div className="flex justify-center gap-1 mt-4">
                <button className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                    &laquo;
                </button>
                <button className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => { return prev == 1 ? 1 : prev - 1 })}>
                    &lsaquo;
                </button>
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                    <button key={page} className={`px-3 py-1 border rounded hover:bg-gray-100  dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer ${page === currentPage ? 'bg-gray-200 dark:bg-[#304772]' : ''}`} onClick={() => setCurrentPage(page)}>
                        {page}
                    </button>
                ))}
                <button className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => { return prev == totalPages ? prev : prev + 1 })}>
                    &rsaquo;
                </button>
                <button className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                    &raquo;
                </button>
            </div>
        );
    };
    return (
        <Suspense fallback={<SkeletonLoader />}>
            <div className="space-y-2 w-full">
                {/* Customer Details Section */}
                <div className="p-6 panel rounded-lg shadow">
                    <div className="flex justify-between items-center mb-6 border-b dark:border-[#17263c] pb-2">
                        <h2 className="text-xl font-semibold text-dark dark:text-white-dark">Customer Details</h2>
                        <div className={`w-2 h-2 rounded-full ${customerData?.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex">
                            <span className="w-64 text-dark dark:text-white-dark">Customer Type:</span>
                            <span className="text-dark dark:text-white-dark">{customerData?.isMedical ? 'Medical' : 'Non Medical'}</span>
                        </div>

                        <div className="flex">
                            <span className="w-64 text-dark dark:text-white-dark">Phone Number:</span>
                            <span className="text-dark dark:text-white-dark">{customerData?.phone}</span>
                        </div>

                        <div className="flex">
                            <span className="w-64 text-dark dark:text-white-dark">Birthday:</span>
                            <span className="text-dark dark:text-white-dark">{customerData?.birthday.toString().split("T")[0]}</span>
                        </div>

                        <div className="flex">
                            <span className="w-64 text-dark dark:text-white-dark">Drivers License:</span>
                            <span className="text-dark dark:text-white-dark">{customerData?.driverLicense}</span>
                        </div>

                        <div className="flex">
                            <span className="w-64 text-dark dark:text-white-dark">Drivers License Expiration Date:</span>
                            <span className="text-dark dark:text-white-dark">{customerData?.driverLicenseExpirationDate}</span>
                        </div>

                        <div className="flex">
                            <span className="w-64 text-dark dark:text-white-dark">Origin Store:</span>
                            <span className="text-dark dark:text-white-dark">{customerData?.originStore}</span>
                        </div>
                    </div>
                </div>

                {/* Loyalty Details Section */}
                <div className="p-6 panel rounded-lg shadow">
                    <div className="flex justify-between items-center mb-6 border-b dark:border-[#17263c] pb-2">
                        <div className="flex items-center gap-2">
                            <MdOutlineLoyalty className='text-dark dark:text-white-dark' />
                            <h2 className="text-xl font-semibold text-dark dark:text-white-dark">Loyalty Details</h2>
                        </div>
                        <button className="text-dark dark:text-white-dark hover:text-dark">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4 w-full">
                        <div className="flex justify-between">
                            <span className="w-64 text-dark dark:text-white-dark">Current Points:</span>
                            <span className="text-dark dark:text-white-dark">{parseInt(customerData?.loyaltyPoints)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="w-64 text-dark dark:text-white-dark">Total Points Earned:</span>
                            <span className="text-dark dark:text-white-dark">{parseInt(loyaltyTotals.totalEarned)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="w-64 text-dark dark:text-white-dark">Total Points Spent:</span>
                            <span className="text-dark dark:text-white-dark">{parseInt(loyaltyTotals.totalSpent)}</span>
                        </div>
                    </div>
                </div>

                {/* Medical Information Section */}
                <div className="p-6 panel rounded-lg shadow">
                    <div className="flex items-center gap-2 mb-6 border-b dark:border-[#17263c] pb-2">
                        <FaSuitcaseMedical className='text-dark dark:text-white-dark' />
                        <h2 className="text-xl font-semibold text-dark dark:text-white-dark">Medical Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <span className="w-64 text-dark dark:text-white-dark">Medical License #:</span>
                            <span className="text-dark dark:text-white-dark flex items-center gap-2">
                                {customerData?.medicalLicense}
                                {customerData?.isVerified && (
                                    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                                <button className="text-gray-400 hover:text-dark dark:text-white-dark">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </span>
                        </div>

                        <div className="flex">
                            <span className="w-64 text-dark dark:text-white-dark">License Expiration Date:</span>
                            <span className="text-dark dark:text-white-dark">{customerData?.medicalLicenseExpirationDate}</span>
                        </div>

                        {/* <div className="flex">
                        <span className="w-64 text-dark dark:text-white-dark">Is a Care Giver:</span>
                        <span className="text-dark dark:text-white-dark dark:text-white-dark">{customerData?.isCareGiver ? 'Yes' : 'No'}</span>
                    </div>

                    <div className="flex">
                        <span className="w-64 text-dark dark:text-white-dark">Patient Name:</span>
                        <span className="text-dark dark:text-white-dark dark:text-white-dark">{customerData?.patientName || 'No data available'}</span>
                    </div>

                    <div className="flex">
                        <span className="w-64 text-dark dark:text-white-dark">Patient License #:</span>
                        <span className="text-dark dark:text-white-dark dark:text-white-dark">{customerData?.patientLicenseNumber || 'No data available'}</span>
                    </div>

                    <div className="flex">
                        <span className="w-64 text-dark dark:text-white-dark">Has a Care Giver:</span>
                        <span className="text-dark dark:text-white-dark dark:text-white-dark">{customerData?.hasCareGiver ? 'Yes' : 'No'}</span>
                    </div> */}
                    </div>
                </div>

                <div className="space-y-6 max-w-3xl">
                    {/* Top Products Section */}
                    {/* <div className="panel rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-6 border-b dark:border-[#17263c] pb-2">
                        <IoLayersSharp className='text-dark dark:text-white-dark dark:text-white-dark'/>
                        <h2 className="text-xl font-semibold text-dark dark:text-white-dark dark:text-white-dark">Top Products</h2>
                    </div>

                    <div className="space-y-4">
                        {customerData?.products?.items.map((product : any, index : any) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-sm rounded-full ${getCategoryStyle(product.category)}`}>{product.category}</span>
                                    <a href={product.link} className="text-gray-600 hover:text-gray-900">
                                        {product.name}
                                    </a>
                                </div>
                                <span className="text-gray-600">{product.quantity}</span>
                            </div>
                        ))}
                    </div>

                    {renderPagination(customerData?.products?.currentPage, customerData?.products?.totalItems)}
                    <div className="text-sm text-dark dark:text-white-dark text-center mt-2">
                        Showing results {(customerData?.products?.currentPage - 1) * 5 + 1 || 0} through {Math.min(customerData?.products?.currentPage * 5, customerData?.products?.totalItems) || 0} of {customerData?.products?.totalItems}
                    </div>
                </div> */}

                    {/* Order History Section */}
                    <div className="panel rounded-lg shadow p-6">
                        <div className="flex items-center justify-between gap-2 mb-6 border-b dark:border-[#17263c] pb-2">
                            <div className='flex items-center justify-start'>
                                <MdHistory className='text-lg text-dark dark:text-white-dark mr-2' />
                                <h2 className="text-xl font-semibold text-dark dark:text-white-dark">Order History</h2>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    onClick={() => {
                                        // Prepare CSV data
                                        const headers = ['Date', 'OrderId', 'Loyalty Earned', 'Loyalty Spent', 'Amount'];
                                        const rows = customerData.Order?.map((order: any) => {
                                            const earned = order?.LoyaltyHistory[0]?.txType === 'earn' ? order?.LoyaltyHistory[0]?.value : 0;
                                            const spent = order?.LoyaltyHistory[0]?.txType === 'spent' ? order?.LoyaltyHistory[0]?.value : 0;
                                            return [
                                                order?.orderDate,
                                                '#' + order?.id,
                                                truncateToTwoDecimals(earned),
                                                truncateToTwoDecimals(spent),
                                                '$' + truncateToTwoDecimals(order.cashAmount + order.otherAmount)
                                            ];
                                        });
                                        let csvContent = headers.join(',') + '\n' +
                                            rows.map((row:any) => row.map((val: any) => `"${val}"`).join(',')).join('\n');

                                        // Download CSV
                                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                        const url = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', customerData?.name + '_order_history.csv');
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(url);
                                    }}
                                >
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Date</th>
                                        <th scope="col" className="px-6 py-3">Order</th>
                                        <th scope="col" className="px-6 py-3">Loyalty Earned/Spent</th>
                                        <th scope="col" className="px-6 py-3">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderHistory?.map((order: any, index: number) => (
                                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="px-6 py-4">{order?.orderDate}</td>
                                            <td className="px-6 py-4">
                                                <a
                                                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                    onClick={() => handleGotoLink("orders/orders", "id", order.id)}
                                                >
                                                    #{order.id}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {order?.LoyaltyHistory[0]?.txType === 'earn' ? order?.LoyaltyHistory[0]?.value : 0}
                                                {' / '}
                                                {order?.LoyaltyHistory[0]?.txType === 'spent' ? order?.LoyaltyHistory[0]?.value : 0}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                ${truncateToTwoDecimals(order.cashAmount + order.otherAmount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                        </div>

                        {renderPagination(currentPage, customerData?.Order?.length)}
                        <div className="text-sm text-dark dark:text-white-dark text-center mt-2">
                            Showing results {(currentPage - 1) * 5 + 1 || 0} through {Math.min(currentPage * 5, customerData?.Order?.length) || 0} of {customerData?.Order?.length}
                        </div>

                        <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-[#17263c]">
                            <span className="text-gray-600">{customerData?.Order?.length} Total Orders</span>
                            {/* <span className="text-gray-900 font-medium">Total Spent: ${customerData?.Order?.totalSpent.toFixed(2)}</span> */}
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
