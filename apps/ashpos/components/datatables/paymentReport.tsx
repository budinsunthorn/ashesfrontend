'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';
import { start } from 'repl';
import { useSalesIndexReportQuery, usePaymentCashReportQuery } from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
import { formatCurrency, truncateToTwoDecimals } from '@/lib/utils';
import { formatDate } from '@/utils/datetime';
import PaymentSkeleton from '../skeletons/paymentSkeleton';
interface CategorySales {
    category: string;
    netMJSales: number;
    netNonMJSales: number;
    netSales: number;
    grossSales: number;
    grossProfit: number;
    weight: string;
    items: number;
}

function PaymentReport() {

    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const [statusForFilter, setStatusForFilter] = useState('yesterday');
    const currentDate = new Date()
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const [startDay, setStartDay] = useState(yesterday);
    const [endDay, setEndDay] = useState(yesterday);
    // const [salesIndexData, setSalesIndexData] = useState<any>()

    const [dateParam, setDateParam] = useState({
        dateFrom: formatDate(startDay), 
        dateTo: formatDate(endDay)
    })
    const salesIndexRowData = useSalesIndexReportQuery({dispensaryId: dispensaryId, 
        dateFrom: dateParam.dateFrom, 
        dateTo: dateParam.dateTo
    });

    const salesIndexData = salesIndexRowData.data?.salesIndexReport
    
    const paymentReportRowData = usePaymentCashReportQuery({dispensaryId: dispensaryId, 
        dateFrom: dateParam.dateFrom, 
        dateTo: dateParam.dateTo
    });
    const paymentReportData = paymentReportRowData.data?.paymentCashReport;
    const salesData: any = [];
    
    const getSalesIndexData = () => {
        setDateParam({ dateFrom: formatDate(startDay), dateTo: formatDate(endDay)})
    }

    
    useEffect(() => {
        if(statusForFilter == "yesterday"){
            setStartDay(currentDate);
            setEndDay(currentDate);
        } else if(statusForFilter == "today"){
            setStartDay(yesterday);
            setEndDay(yesterday);
        }
    },[statusForFilter])

    const renderRow = (label: string, value: any , isNegative = false) => (
        <tr className="border-b">
            <td className="py-2 px-4 dark:bg-[#101728] !font-varela_Round font-semibold">{label}</td>
            <td className={`py-2 px-4 text-right dark:bg-[#101728] ${isNegative ? 'text-red-500' : ''}`}>{value !== undefined ? formatCurrency(value) : '-'}</td>
        </tr>
    );
    const calculateTotals = () => {
        return (
            salesData &&
            salesData.reduce(
                (acc: any, curr: any) => ({
                    netMJSales: (acc.netMJSales || 0) + (curr.netMJSales || 0),
                    netNonMJSales: (acc.netNonMJSales || 0) + (curr.netNonMJSales || 0),
                    netSales: (acc.netSales || 0) + (curr.netSales || 0),
                    grossSales: (acc.grossSales || 0) + (curr.grossSales || 0),
                    grossProfit: (acc.grossProfit || 0) + (curr.grossProfit || 0),
                    items: (acc.items || 0) + (curr.items || 0),
                }),
                {} as Partial<CategorySales>
            )
        );
    };

    const totals = calculateTotals();
    return (
        <div className="bg-[#fafafa] rounded-lg">
            <div className="w-full flex flex-col justify-between items-start bg-white dark:bg-[#0f1727] p-5 rounded-md">
                <div className="relative inline-flex align-middle mb-2">
                    <button
                        type="button"
                        className={`btn btn-outline-primary ltr:rounded-r-none rtl:rounded-l-none ${
                            statusForFilter == 'yesterday' ? '!bg-primary text-white' : ''
                        }`}
                        onClick={() => {setStatusForFilter((prev) => (prev == '' || prev != 'yesterday' ? 'yesterday' : '')); getSalesIndexData() }}
                    >
                        Yesterday
                    </button>
                    <button
                        type="button"
                        className={`btn btn-outline-primary ltr:rounded-none rtl:rounded-none ${
                            statusForFilter == 'today' ? '!bg-primary text-white' : ''
                        }`}
                        onClick={() => {setStatusForFilter((prev) => (prev == '' || prev != 'today' ? 'today' : '')); getSalesIndexData()}}
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        className={`btn btn-outline-primary ltr:rounded-l-none rtl:rounded-r-none ${
                            statusForFilter == 'custom' ? '!bg-primary text-white' : ''
                        }`}
                        onClick={() => setStatusForFilter((prev) => (prev == '' || prev != 'custom' ? 'custom' : ''))}
                    >
                        Custom
                    </button>
                    {statusForFilter == 'custom' && (
                        <div className="flex justify-center items-center ml-3">
                            <Flatpickr
                                id="currentDate"
                                value={startDay ? startDay : currentDate}
                                options={{
                                    dateFormat: 'Y-m-d',
                                    position: 'auto left',
                                }}
                                className="h-full form-input w-[120px] flex-1 mr-2"
                                onChange={(date) => {
                                    setStartDay(date[0]);
                                    // refetchOrders()
                                }}
                            />
                            <Flatpickr
                                id="currentDate"
                                value={endDay ? endDay : currentDate}
                                options={{
                                    dateFormat: 'Y-m-d',
                                    position: 'auto left',
                                }}
                                className="h-full form-input w-[120px] flex-1"
                                onChange={(date) => {
                                    setEndDay(date[0]);
                                    // refetchOrders()
                                }}
                            />
                            <button className="btn btn-primary mx-2" onClick={getSalesIndexData}>Submit</button>
                        </div>
                    )}
                </div>
                <hr className="my-2 text-lg text-dark dark:text-white-dark w-full dark:border-[#253b5c]" />
                {paymentReportRowData.isLoading || salesIndexRowData.isFetching ? <PaymentSkeleton /> : (
                    <>
                <div className="w-full">
                    <div className="text-xl text-dark dark:text-white-dark font-semibold">Payment Report</div>
                    <div className="w-1/2 flex flex-col">
                        <DetailItem label="Store:" value={salesIndexData?.storeName} />
                        <DetailItem label="Date Created:" value={salesIndexData?.dateCreated.replace(/-/g, '/')} />
                        <DetailItem label="Date Range:" value={salesIndexData?.dateFrom.replace(/-/g, '/') + " ~ " + salesIndexData?.dateTo.replace(/-/g, '/')} />
                        <DetailItem label="License Number:" value={salesIndexData?.cannabisLicense} />
                    </div>
                </div>
                <div className="overflow-x-auto mt-3 w-full">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 text-left">Payments Type</th>
                                <th className="py-2 px-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {renderRow('Cost of Goods', paymentReportData?.costOfGoods)} */}
                            {renderRow('Cash', paymentReportData?.cash)}
                            {renderRow('Cash as Change', paymentReportData?.changeDue)}
                            {renderRow('Cash for Returns', paymentReportData?.returns)}
                        </tbody>
                    </table>
                </div>
                </>
                )}
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string | number | undefined }) {
    return (
        <div className="flex justify-start">
            <span className="text-sm !font-varela_Round font-semibold text-dark dark:text-white-dark w-1/2 p-1">{label}</span>
            <span className="text-sm text-left p-1">{value == null ? '' : value}</span>
        </div>
    );
}

export default PaymentReport;
