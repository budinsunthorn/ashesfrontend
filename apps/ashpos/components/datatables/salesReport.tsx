'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';
import { useSalesIndexReportQuery, useSalesDetailReportQuery, useSalesTaxReportQuery} from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
import { formatCurrency, truncateToTwoDecimals } from '@/lib/utils';
import { formatDate } from '@/utils/datetime';
import SalesReportSkeleton from '../skeletons/paymentSkeleton';
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

function SalesReport() {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const [statusForFilter, setStatusForFilter] = useState('yesterday');
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const [startDay, setStartDay] = useState<Date>(yesterday);
    const [endDay, setEndDay] = useState<Date>(yesterday);

    // console.log("startDay", startDay)
    // const [salesIndexData, setSalesIndexData] = useState<any>()
    const [dateParam, setDateParam] = useState({
        dateFrom: formatDate(startDay),
        dateTo: formatDate(endDay),
    });

    const [totalTaxAmount, setTotalTaxAmount] = useState(0)
    const salesIndexRowData = useSalesIndexReportQuery({ dispensaryId: dispensaryId, dateFrom: dateParam.dateFrom, dateTo: dateParam.dateTo });
    const salesIndexData = salesIndexRowData.data?.salesIndexReport;
    // console.log("salesIndexData", salesIndexData)

    const salesDetailReportData = useSalesDetailReportQuery({ dispensaryId: dispensaryId, dateFrom: dateParam.dateFrom, dateTo: dateParam.dateTo })
    const salesDetailData = salesDetailReportData.data?.salesDetailReport;
    // console.log("salseDetailData", salesDetailData)

    const salesTaxReport = useSalesTaxReportQuery({ dispensaryId: dispensaryId, dateFrom: dateParam.dateFrom, dateTo: dateParam.dateTo })
    const salesTaxReportData = salesTaxReport.data?.salesTaxReport
    // console.log("salesTaxReportData", salesTaxReportData)

    const reportData: any = {
        "grossProfit": {
          "mj": 322.21,
          "nMj": 22.16,
          "total": 344.38
        },
        "cost": {
          "mj": 218.14,
          "nMj": 9.53,
          "total": 227.67
        },
        "grossSales": {
          "mj": 540.35,
          "nMj": 31.69,
          "total": 572.04
        },
        "discounts": {
          "mj": 601.05,
          "nMj": 5.12,
          "total": 606.17
        },
        "netSales": {
          "mj": 4585.94,
          "nMj": 26.57,
          "total": 4612.51
        },
        "cannabisTax" : {
            "total" : 304.64,
        },
        "salesTax" : {
            "total" : 467.71,
        },
        "totalTax" : {
            "total" : 772.35
        }
      };
      const salesData: any = [
       {
            "category" : "Edible",
          "netMJSales": 805.77,
          "netNonMJSales": 505.77,
          "netSales": 1307.57,
          "grossSales": 1508.77,
          "grossProfit": 354.15,
          "weight": 38,
          "items": 1
        },
        {
            "category" : "Bulk Flower",
          "netMJSales": 367.50,
          "netNonMJSales": 707.50,
          "netSales": 1075.00,
          "grossSales": 1075.00,
          "grossProfit": 40.9,
          "weight": 32,
          "items": 1
        },
        {
            "category" : "Small Bulk Flower",
          "netMJSales": 41.02,
          "netNonMJSales": 1002.81,
          "netSales": 1043.83,
          "grossSales": 1043.83,
          "grossProfit": 112.56,
          "weight": 50,
          "items": 1
        },
        {
            "category" : "Concentrate",
          "netMJSales": 587.03,
          "netNonMJSales": 587.53,
          "netSales": 1174.56,
          "grossSales": 1387.55,
          "grossProfit": 144,
          "weight": 97,
          "items": 1
        },
        {
            "category" : "Preroll",
          "netMJSales": 200.85,
          "netNonMJSales": 292.95,
          "netSales": 493.80,
          "grossSales": 522.67,
          "grossProfit": 91.47,
          "weight": 150,
          "items": 1
        },
        {
            "category" : "Infused Pre Roll",
          "netMJSales": 103.84,
          "netNonMJSales": 143.50,
          "netSales": 247.34,
          "grossSales": 247.34,
          "grossProfit": 143.34,
          "weight": 25,
          "items": 1
        },
        {
            "category" : "Tincture",
          "netMJSales": 24.45,
          "netNonMJSales": 24.45,
          "netSales": 48.90,
          "grossSales": 48.90,
          "grossProfit": 19.55,
          "weight": 1,
          "items": 1
        },
        {
            "category" : "Accessories",
          "netMJSales": 4303.65,
          "netNonMJSales": 22.47,
          "netSales": 4326.12,
          "grossSales": 4326.12,
          "grossProfit": 22.47,
          "weight": 272,
          "items": 1
        }
    ];

    const getSalesIndexData = () => {
        setDateParam({ dateFrom: formatDate(startDay), dateTo: formatDate(endDay) });
    };
    useEffect(() => {
        if (statusForFilter == 'yesterday') {
            setStartDay(today);
            setEndDay(today);
        } else if (statusForFilter == 'today') {
            setStartDay(yesterday);
            setEndDay(yesterday);
        }
    }, [statusForFilter]);

    useEffect(() => {
        const taxAmount = salesTaxReportData?.reduce((acc, taxData) => {
            acc += Number(truncateToTwoDecimals(taxData?.taxAmount || 0))
            return acc
        }, 0)

        setTotalTaxAmount(taxAmount || 0)
    }, [salesTaxReportData])

    const renderRow = (label: string, data: { mj: number; nMj?: number; total?: number } | undefined, isNegative = false) => (
        <tr className="border-b">
            <td className="py-2 px-4 text-dark dark:text-white-dark dark:bg-[#101728] !font-varela_Round font-semibold">{label}</td>
            <td className={`py-2 px-4 text-dark dark:text-white-dark text-lg text-right dark:bg-[#101728] ${isNegative ? 'text-danger' : ''}`}>{data?.mj !== undefined ? formatCurrency(data?.mj) : '0'}</td>
            <td className={`py-2 px-4 text-dark dark:text-white-dark text-lg text-right dark:bg-[#101728] ${isNegative ? 'text-danger' : ''}`}>{data?.nMj !== undefined ? formatCurrency(data?.nMj) : '0'}</td>
            <td className={`py-2 px-4 text-dark dark:text-white-dark text-lg text-right dark:bg-[#101728] ${isNegative ? 'text-danger' : ''}`}>{data?.total !== undefined ? formatCurrency(data?.total) : '0'}</td>
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
                        onClick={() => {
                            setStatusForFilter((prev) => (prev == '' || prev != 'yesterday' ? 'yesterday' : ''));
                            getSalesIndexData();
                        }}
                    >
                        Yesterday
                    </button>
                    <button
                        type="button"
                        className={`btn btn-outline-primary ltr:rounded-none rtl:rounded-none ${
                            statusForFilter == 'today' ? '!bg-primary text-white' : ''
                        }`}
                        onClick={() => {
                            setStatusForFilter((prev) => (prev == '' || prev != 'today' ? 'today' : ''));
                            getSalesIndexData();
                        }}
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
                                value={startDay ? startDay : today}
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
                                value={endDay ? endDay : today}
                                options={{
                                    dateFormat: 'Y-m-d',
                                    position: 'auto left',
                                }}
                                className="h-full form-input w-[120px] flex-1"
                                onChange={(date) => {
                                    setEndDay(date[0])
                                    // refetchOrders()
                                }}
                            />
                            <button className="btn btn-primary mx-2" onClick={getSalesIndexData}>
                                Submit
                            </button>
                        </div>
                    )}
                </div>
                <hr className="my-2 text-lg text-dark dark:text-white-dark w-full dark:border-[#253b5c]" />
                {salesIndexRowData.isLoading || salesDetailReportData.isFetching ? <SalesReportSkeleton /> : (
                <div className="w-full">
                    <div className="w-full">
                        <div className="text-xl text-dark dark:text-white-dark font-semibold">Sales Report</div>
                        <div className="w-1/2 flex flex-col">
                            <DetailItem label="Store:" value={salesIndexData?.storeName} />
                            <DetailItem label="Date Created:" value={salesIndexData?.dateCreated.replace(/-/g, '/')} />
                            <DetailItem label="Date Range:" value={salesIndexData?.dateFrom.replace(/-/g, '/') + ' ~ ' + salesIndexData?.dateTo.replace(/-/g, '/')} />
                            <DetailItem label="License Number:" value={salesIndexData?.cannabisLicense} />
                            <DetailItem label="Total Orders:" value={salesIndexData?.totalOrders} />
                        </div>
                    </div>
                    <div className="overflow-x-auto mt-3 w-full">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 text-left"></th>
                                    <th className="py-2 px-4 text-right">Marijuana</th>
                                    <th className="py-2 px-4 text-right">Non-Marijuana</th>
                                    <th className="py-2 px-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* {renderRow('Cost of Goods', reportData?.costOfGoods)} */}
                                {renderRow('Gross Sales', salesDetailData?.grossSales)}
                                {renderRow('Discounts', salesDetailData?.discounts, true)}
                                {renderRow('Returns', salesDetailData?.returns, true)}
                                {renderRow('Net Sales', salesDetailData?.netSales)}
                                {renderRow('Cost of Goods', salesDetailData?.cost)}
                                {renderRow('Gross Profit', salesDetailData?.grossProfit)}
                                {/* {renderRow('Medical Sales', reportData?.medicalSales)} */}
                                {/* {renderRow('Subtotal w/o Medical', reportData?.subtotalWoMedical)} */}
                                {/* {renderRow('Tax Exempt Sales', reportData?.taxExemptSales)} */}
                                {/* {renderRow('Subtotal w/o Tax Exempt', reportData?.subtotalWoTaxExempt)} */}
                            </tbody>
                        </table>

                        <table className="min-w-full bg-white mt-4">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 text-left">Tax</th>
                                    <th className="py-2 px-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="dark:bg-[#101728]">
                                {salesTaxReportData && salesTaxReportData?.length > 0 ? salesTaxReportData?.map((data) => 
                                <tr className="border-b">
                                    <td className="py-2 px-4">{data?.taxName} - {data?.taxPercent}%</td>
                                    <td className="py-2 px-4 text-right text-lg">{formatCurrency(data?.taxAmount || 0)}</td>
                                </tr>
                                ) : null}
                                
                                {/* <tr className="border-b">
                                    <td className="py-2 px-4">Sales Tax - VERIFY - 10.75%</td>
                                    <td className="py-2 px-4 text-right">${formatCurrency(salesTaxReportData?.taxAmount || 0)}</td>
                                </tr>*/}
                                <tr className="border-b font-bold">
                                    <td className="py-2 px-4">TOTAL</td>
                                    <td className="py-2 px-4 text-right text-lg">{formatCurrency(totalTaxAmount)}</td>
                                </tr> 
                            </tbody>
                        </table>

                        {/* <table className="min-w-full bg-white mt-4">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 text-left !font-varela_Round font-semibold">Sales By Tax Status</th>
                                    <th className="py-2 px-4 text-right !font-varela_Round font-semibold">Excempt</th>
                                    <th className="py-2 px-4 text-right !font-varela_Round font-semibold">Taxable</th>
                                    <th className="py-2 px-4 text-right !font-varela_Round font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody className="dark:bg-[#101728]">
                                <tr className="border-b">
                                    <td className="py-2 px-4 flex items-center">
                                        Cash
                                        <QuestionMarkCircleIcon className="w-4 h-4 ml-2 text-gray-400" />
                                    </td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(0)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(0)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(0)}</td>
                                </tr>
                            </tbody>
                        </table> */}

                        {/* <p className="mt-4 text-xs text-dark dark:text-white-dark">* Indicates that there are returns included in this report for orders that were completed outside of the report date range.</p> */}
                    </div>
                </div>)}
                {/* <div className="overflow-x-auto w-full my-3">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 text-left">Category</th>
                                <th className="py-2 px-4 text-right">Net MJ Sales</th>
                                <th className="py-2 px-4 text-right">Net Non-MJ Sales</th>
                                <th className="py-2 px-4 text-right">Net Sales</th>
                                <th className="py-2 px-4 text-right">Gross Sales</th>
                                <th className="py-2 px-4 text-right">Gross Profit</th>
                                <th className="py-2 px-4 text-right">Weight</th>
                                <th className="py-2 px-4 text-right">Items</th>
                            </tr>
                        </thead>
                        <tbody className="dark:bg-[#101728]">
                            {salesData &&
                                salesData.map((category: any, index: any) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2 px-4">{category.category}</td>
                                        <td className="py-2 px-4 text-right">{formatCurrency(category.netMJSales)}</td>
                                        <td className="py-2 px-4 text-right">{formatCurrency(category.netNonMJSales)}</td>
                                        <td className="py-2 px-4 text-right">{formatCurrency(category.netSales)}</td>
                                        <td className="py-2 px-4 text-right">{formatCurrency(category.grossSales)}</td>
                                        <td className="py-2 px-4 text-right">{formatCurrency(category.grossProfit)}</td>
                                        <td className="py-2 px-4 text-right">{category.weight}</td>
                                        <td className="py-2 px-4 text-right">{category.items}</td>
                                    </tr>
                                ))}
                            <tr className="bg-gray-100 font-bold dark:bg-[#101728]">
                                <td className="py-2 px-4">Total</td>
                                <td className="py-2 px-4 text-right">{formatCurrency(totals.netMJSales)}</td>
                                <td className="py-2 px-4 text-right">{formatCurrency(totals.netNonMJSales)}</td>
                                <td className="py-2 px-4 text-right">{formatCurrency(totals.netSales)}</td>
                                <td className="py-2 px-4 text-right">{formatCurrency(totals.grossSales)}</td>
                                <td className="py-2 px-4 text-right">{formatCurrency(totals.grossProfit)}</td>
                                <td className="py-2 px-4 text-right">-</td>
                                <td className="py-2 px-4 text-right">{totals.items}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="mt-2 flex justify-end items-center">
                        <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Sales By Category</span>
                    </div>
                </div> */}
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

export default SalesReport;
