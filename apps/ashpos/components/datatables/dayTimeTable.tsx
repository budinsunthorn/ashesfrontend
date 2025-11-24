'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';

import { IRootState } from '@/store';
import MetricsTable from '../etc/metricsTable';
import LoadingSkeleton from '../etc/loadingSkeleton';
import { useInsightSummaryReportByHourQuery, useInsightSummaryReportByDayOfWeekAndHourQuery } from '@/src/__generated__/operations';
import { formatDate } from '@/utils/datetime';
import { userDataSave } from '@/store/userData';

import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';
import ProductCategory from '../etc/productCategory';

interface HourlyData {
    hour: number;
    hourLabel: string;
    totalAmount: number;
    totalDiscountedAmount: number;
    totalLoyaltyAmount: number;
    totalCostAmount: number;
    netSales: number;
    grossMargin: number;
    [key: string]: string | number; // Add index signature for dynamic access
}

interface DayTimeTableRow {
    hour: string; // "2 AM", "11 AM", or "SUM"
    Sun: number;
    Mon: number;
    Tue: number;
    Wed: number;
    Thu: number;
    Fri: number;
    Sat: number;
    SUM: number;
}

interface Column {
    accessor: keyof HourlyData;
    title: string;
}

const DayTimeTable = () => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const {userData} = userDataSave();
    const dispensaryId = userData?.dispensaryId;
    const [dayAndTimeTableData, setDayAndTimeTableData] = useState<any[]>([]);

    const [statusForFilter, setStatusForFilter] = useState('yesterday');
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const [startDay, setStartDay] = useState(yesterday);
    const [endDay, setEndDay] = useState(yesterday);
    // const [salesIndexData, setSalesIndexData] = useState<any>()
    const [dateParam, setDateParam] = useState({
        dateFrom: formatDate(startDay),
        dateTo: formatDate(endDay),
    });

    const reportByHourRowData = useInsightSummaryReportByHourQuery({
        dispensaryId: dispensaryId,
        dateFrom: dateParam.dateFrom,
        dateTo: dateParam.dateTo,
    });
    const reportByHourData = reportByHourRowData.data?.insightSummaryReportByHour;

    const reportByDayOfWeekAndHourRowData = useInsightSummaryReportByDayOfWeekAndHourQuery({
        dispensaryId: dispensaryId,
        dateFrom: dateParam.dateFrom,
        dateTo: dateParam.dateTo,
    });
    const reportByDayOfWeekAndHourData = reportByDayOfWeekAndHourRowData.data?.insightSummaryReportByDayOfWeekAndHour;
    // console.log("reportByDayOfWeekAndHourData", reportByDayOfWeekAndHourData);

    useEffect(() => {
        if (reportByDayOfWeekAndHourData) {
            const tableDataMap: { [key: string]: DayTimeTableRow } = {};
            const totalDailySums: Omit<DayTimeTableRow, 'hour'> = {
                Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, SUM: 0
            };

            const dayNameToKey: { [key: string]: keyof Omit<DayTimeTableRow, 'hour'> } = {
                "Sunday": "Sun",
                "Monday": "Mon",
                "Tuesday": "Tue",
                "Wednesday": "Wed",
                "Thursday": "Thu",
                "Friday": "Fri",
                "Saturday": "Sat"
            };

            // Initialize all possible hours (0-23) for rows
            for (let i = 0; i < 24; i++) {
                const hourLabel = `${i === 0 ? 12 : i > 12 ? i - 12 : i} ${i < 12 ? 'AM' : 'PM'}`;
                tableDataMap[hourLabel] = {
                    hour: hourLabel,
                    Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, SUM: 0
                };
            }

            reportByDayOfWeekAndHourData.forEach((item: any) => {
                const hourLabel = item.hourLabel;
                const dayName = item.dayName;
                const orderCount = item.orderCount;

                const dayKey = dayNameToKey[dayName];
                if (tableDataMap[hourLabel] && dayKey) {
                    tableDataMap[hourLabel][dayKey] += orderCount;
                }

                // Update row sum for the current hour
                tableDataMap[hourLabel].SUM += orderCount;

                // Update overall daily sums
                if (dayKey) {
                    totalDailySums[dayKey] += orderCount;
                }
                totalDailySums.SUM += orderCount;
            });

            // Convert map to array and sort by hour
            const sortedTableData = Object.values(tableDataMap).sort((a, b) => {
                const parseHour = (label: string) => {
                    if (label === 'SUM') return Infinity; // 'SUM' row goes last
                    const [time, period] = label.split(' ');
                    let hour = parseInt(time);
                    if (period === 'PM' && hour !== 12) hour += 12;
                    if (period === 'AM' && hour === 12) hour = 0; // 12 AM is 0 hour
                    return hour;
                };
                return parseHour(a.hour) - parseHour(b.hour);
            });

            // Filter out hours with all zero counts, but keep SUM row
            const filteredTableData = sortedTableData.filter(row => row.SUM > 0 || row.hour === 'SUM');

            // Add the SUM row
            // sortedTableData.push({ hour: 'SUM', ...totalDailySums });

            // console.log("transformed table data", filteredTableData);
            setDayAndTimeTableData(filteredTableData);
        }
    }, [reportByDayOfWeekAndHourData]);

    // console.log("reportByHourData", reportByHourData);

    useEffect(() => {
        if (statusForFilter == 'yesterday') {
            setStartDay(today);
            setEndDay(today);
        } else if (statusForFilter == 'today') {
            setStartDay(yesterday);
            setEndDay(yesterday);
        }
    }, [statusForFilter]);

    const getSummaryByHourData = () => {
        setDateParam({ dateFrom: formatDate(startDay), dateTo: formatDate(endDay) });
    };

    const getColumnMax = (accessor: string): number => {
        return Math.max(...(reportByHourData || []).map((row: HourlyData | null) => {
          if (!row) return 0;
          const value = row[accessor];
          return typeof value === 'number' ? value : 0;
        }));
    };
    const getColumnMin = (accessor: string): number => {
        return Math.min(...(reportByHourData || []).map((row: HourlyData | null) => {
          if (!row) return 0;
          const value = row[accessor];
          return typeof value === 'number' ? value : 0;
        }));
    };
    
    const getPercentage = (value: number, accessor: string): number => {
        const max = getColumnMax(accessor);
        const min = getColumnMin(accessor);
        // If all values are 0, return 0
        if (max === 0 && min === 0) return 0;
        return (Number(value + Math.abs(min * 2 )) / (max + Math.abs(min * 2))) * 100;
    };

    const formatValue = (value: number): string => {
        return value.toFixed(2);
    };

    const cols: Column[] = [
        { accessor: 'hourLabel', title: 'Hour' },
        { accessor: 'netSales', title: 'Net Sales' },
        { accessor: 'grossMargin', title: 'Gross Margin' },
        // { accessor: 'hour', title: 'Hour' },
        // { accessor: 'totalAmount', title: 'Total Amount' },
        // { accessor: 'totalCostAmount', title: 'Total Cost Amount' },
        // { accessor: 'totalDiscountedAmount', title: 'Total Discounted Amount' },
        // { accessor: 'totalLoyaltyAmount', title: 'Total Loyalty Amount' },
    ];

    return (
        <div className={`panel mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            {/* <div className="flex justify-start items-center my-3">
                <select
                    onChange={(e) => {
                        setDay(e.target.value);
                    }}
                    id="day"
                    className="flex-initial w-44 form-select text-white-dark mr-3"
                >
                    <option value="itemName">Select Day</option>
                </select>
                <select
                    onChange={(e) => {
                        setDay(e.target.value);
                    }}
                    id="day"
                    className="flex-initial w-44 form-select text-white-dark mr-3"
                >
                    <option value="itemName">Select store</option>
                </select>
                <button className="btn btn-primary py-1.5 px-3 !text-sm">Go</button>
            </div> */}
            <div className="flex justify-start items-center mb-3">
            <button
                    type="button"
                    className={`btn btn-outline-primary ltr:rounded-r-none rtl:rounded-l-none ${
                        statusForFilter == 'yesterday' ? '!bg-primary text-white' : ''
                    }`}
                    onClick={() => {
                        setStatusForFilter((prev) => (prev == '' || prev != 'yesterday' ? 'yesterday' : ''));
                        getSummaryByHourData();
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
                        getSummaryByHourData();
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
                            className="h-full form-input flex-1 mr-2 w-[120px] p-3"
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
                            className="h-full form-input flex-1 w-[120px] p-3"
                            onChange={(date) => {
                                setEndDay(date[0]);
                                // refetchOrders()
                            }}
                        />
                        <button className="btn btn-primary mx-2 block" onClick={getSummaryByHourData}>
                            Submit
                        </button>
                    </div>
                )}
                </div>
                <div className="w-full overflow-x-auto">
                    <h1 className="text-xl font-bold mb-4">Day Of Hour</h1>
                    <table className="w-full border-collapse table-hover">
                        <thead>
                        <tr className="bg-gray-100">
                            {cols.map((column) => (
                            <th key={column.accessor} className="p-2 text-left font-semibold">
                                {column.title}
                            </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {reportByHourData && reportByHourData.length > 0 ? reportByHourData?.map((row: HourlyData | null, rowIndex) => (
                            <tr key={rowIndex} className="border-b !border-gray-300 dark:!border-gray-800">
                            {cols.map((column) => (
                                <td key={column.accessor} className={`${column.accessor == 'hourLabel' ? '' : "text-[#239164] "}!py-[3px] relative text-dark-white dark:text-white-dark`}>
                                {row && (
                                <>
                                    <div 
                                    className={`absolute inset-y-0 left-0  ${Number(row[column.accessor]) <= 0 ? "bg-[#e7cccc] dark:bg-[#2f1616]" : "bg-blue-100/50 dark:bg-blue-950/40"}` }
                                        style={{ width: `${getPercentage(Number(row[column.accessor]), column.accessor as string)}%` }}
                                        />
                                        <span className="relative">
                                        {column.accessor === "hourLabel" ? row[column.accessor] : 
                                         column.accessor === "grossMargin" ? formatValue(Number(row[column.accessor])) + "%" : 
                                         "$" + formatValue(Number(row[column.accessor]))}
                                        </span>
                                </>
                                )}
                            </td>
                            ))}
                            </tr>
                        )) : <tr><td colSpan={cols.length} className="text-center">No data found</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="w-full overflow-x-auto mt-10">
                    <h1 className="text-xl font-bold mb-4">Order Counts by Day & Time</h1>
                    <table className="w-full border-collapse table-hover">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left font-semibold">Hour</th>
                                <th className="p-2 text-left font-semibold">Sunday</th>
                                <th className="p-2 text-left font-semibold">Monday</th>
                                <th className="p-2 text-left font-semibold">Tuesday</th>
                                <th className="p-2 text-left font-semibold">Wednesday</th>
                                <th className="p-2 text-left font-semibold">Thursday</th>
                                <th className="p-2 text-left font-semibold">Friday</th>
                                <th className="p-2 text-left font-semibold">Saturday</th>
                                <th className="p-2 text-left font-semibold">Total (Sum)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dayAndTimeTableData.map((row: DayTimeTableRow, rowIndex: number) => (
                                <tr key={rowIndex} className="border-b !border-gray-300 dark:!border-gray-800">
                                    <td className="!py-[3px] text-left">{row.hour}</td>
                                    <td className="!py-[3px] text-[#239164] text-left">{row.Sun}</td>
                                    <td className="!py-[3px] text-[#239164] text-left">{row.Mon}</td>
                                    <td className="!py-[3px] text-[#239164] text-left">{row.Tue}</td>
                                    <td className="!py-[3px] text-[#239164] text-left">{row.Wed}</td>
                                    <td className="!py-[3px] text-[#239164] text-left">{row.Thu}</td>
                                    <td className="!py-[3px] text-[#239164] text-left">{row.Fri}</td>
                                    <td className="!py-[3px] text-[#239164] text-left">{row.Sat}</td>
                                    <td className="!py-[3px] text-[#239164] text-left bg-gray-100 dark:bg-black-medium">{row.SUM}</td>
                                </tr>
                            ))}
                            <tr className="border-b !border-gray-300 dark:!border-gray-800 bg-gray-100 dark:bg-black-medium">
                                <td className="!py-[3px] text-left">Total (Sum)</td>
                                <td className="!py-[3px] text-[#239164] text-left">{dayAndTimeTableData.reduce((acc: number, row: DayTimeTableRow) => acc + row.Sun, 0)}</td>
                                <td className="!py-[3px] text-[#239164] text-left">{dayAndTimeTableData.reduce((acc: number, row: DayTimeTableRow) => acc + row.Mon, 0)}</td>
                                <td className="!py-[3px] text-[#239164] text-left">{dayAndTimeTableData.reduce((acc: number, row: DayTimeTableRow) => acc + row.Tue, 0)}</td>
                                <td className="!py-[3px] text-[#239164] text-left">{dayAndTimeTableData.reduce((acc: number, row: DayTimeTableRow) => acc + row.Wed, 0)}</td>
                                <td className="!py-[3px] text-[#239164] text-left">{dayAndTimeTableData.reduce((acc: number, row: DayTimeTableRow) => acc + row.Thu, 0)}</td>
                                <td className="!py-[3px] text-[#239164] text-left">{dayAndTimeTableData.reduce((acc: number, row: DayTimeTableRow) => acc + row.Fri, 0)}</td>
                                <td className="!py-[3px] text-[#239164] text-left">{dayAndTimeTableData.reduce((acc: number, row: DayTimeTableRow) => acc + row.Sat, 0)}</td>
                                <td className="!py-[3px] text-[#239164] text-left bg-gray-100 dark:bg-black-medium">{dayAndTimeTableData.reduce((acc: number, row: DayTimeTableRow) => acc + row.SUM, 0)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
        </div>
    );
};

export default DayTimeTable;
