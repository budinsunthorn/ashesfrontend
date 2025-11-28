'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from 'store';
import { MetricCard } from '../etc/metricsCard';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';
import MetricsTable from '../etc/metricsTable';
import ReactApexChart from 'react-apexcharts';
import { userDataSave } from '@/store/userData';
import { useAllDispensariesByOrganizationIdQuery, useInsightSummaryReportQuery, useSalesByCategoryQuery, useInsightSummaryReportByDayOfWeekQuery  } from '@/src/__generated__/operations';
import { truncateToTwoDecimals } from '@/lib/utils';
import { formatDate } from '@/utils/datetime';
import DayOfWeekTable from '../etc/dayOfWeekTable';
import { BiRefresh } from 'react-icons/bi';
import MetrcsCardSkeleton from '../skeletons/metrcsCardSkeleton';
import DayOfWeekSkeleton from '../skeletons/dayOfWeekSkeleton';
import CategoryBySalesChartSkeleton from '../skeletons/CategoryBySalesChartSkeleton';
import TableSkeleton from '../skeletons/TableSkeleton';


import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
  } from "chart.js"
  import "chart.js/auto"
  import { Bar, Doughnut, Line } from "react-chartjs-2"
  
  ChartJS.register(
    ArcElement,
    BarElement,
    Filler,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  )
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Doughnut } from 'react-chartjs-2';
    
interface SalesCategoryData {
    category: string;
    netSales: number;
    grossMargin: number;
}

type ApexChart = {
    width?: string | number;
    height?: string | number;
    type?: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap';
    foreColor?: string;
    fontFamily?: string;
    background?: string;
    offsetX?: number;
    offsetY?: number;
    dropShadow?: ApexDropShadow & {
        enabledOnSeries?: undefined | number[];
        color?: string | string[];
    };
};

export default function Summary() {
    const { userData } = userDataSave();
    const organizationId = userData.organizationId;
    const dispensaryId = userData.dispensaryId;

    const [storeFilter, setStoreFilter] = useState('1 Store Selected');
    const chartRef = useRef<HTMLCanvasElement>(null);
    const isDark = useSelector((state: IRootState) => state.themeConfig.isDarkMode);

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

    const dispensaryRowData = useAllDispensariesByOrganizationIdQuery({ organizationId: organizationId });
    const dispensaryData = dispensaryRowData.data?.allDispensariesByOrganizationId;

    const dayOfWeekRowData = useInsightSummaryReportByDayOfWeekQuery({ dispensaryId: dispensaryId, dateFrom: dateParam.dateFrom, dateTo: dateParam.dateTo });
    const dayOfWeekData = dayOfWeekRowData.data?.insightSummaryReportByDayOfWeek;
    // console.log('dayOfWeekData', dayOfWeekData);

    const insightSummaryRowData = useInsightSummaryReportQuery({ dispensaryId: dispensaryId, dateFrom: dateParam.dateFrom, dateTo: dateParam.dateTo });
    const insightSummaryData = insightSummaryRowData.data?.insightSummaryReport;
    // console.log('insghtSummary', insightSummaryData);
    const salesByCategoryRowData = useSalesByCategoryQuery({ dispensaryId: dispensaryId, dateFrom: dateParam.dateFrom, dateTo: dateParam.dateTo });
    const salesByCategoryData = salesByCategoryRowData.data?.salesByCategory;
    // console.log('salesByCategoryData', salesByCategoryData);

    useEffect(() => {
        // console.log('storeFilter', storeFilter);
        insightSummaryRowData.refetch();
        salesByCategoryRowData.refetch();
    }, [storeFilter]);
    // Draw chart function
    const drawChart = useCallback(() => {
        const canvas = chartRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Sample data
        const data = [
            { returning: 4000, reactivated: 0, new: 500, aov: 60 },
            { returning: 4200, reactivated: 0, new: 0, aov: 65 },
            { returning: 4500, reactivated: 0, new: 0, aov: 62 },
            { returning: 3800, reactivated: 0, new: 700, aov: 58 },
            { returning: 3500, reactivated: 0, new: 0, aov: 55 },
            { returning: 3000, reactivated: 200, new: 0, aov: 45 },
            { returning: 3200, reactivated: 0, new: 300, aov: 50 },
        ];

        // Chart dimensions
        const chartHeight = canvas.height - 40;
        const chartWidth = canvas.width - 60;
        const barWidth = (chartWidth / data.length) * 0.8;
        const gap = (chartWidth / data.length) * 0.2;

        // Draw bars
        data.forEach((item, i) => {
            const x = 40 + i * (barWidth + gap);
            const total = item.returning + item.reactivated + item.new;
            const scale = chartHeight / 5000; // Max value assumed 5000

            // Returning customers (blue)
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(x, chartHeight - item.returning * scale, barWidth, item.returning * scale);

            // Reactivated customers (light blue)
            if (item.reactivated > 0) {
                ctx.fillStyle = '#93c5fd';
                ctx.fillRect(x, chartHeight - (item.returning + item.reactivated) * scale, barWidth, item.reactivated * scale);
            }

            // New customers (orange)
            if (item.new > 0) {
                ctx.fillStyle = '#f97316';
                ctx.fillRect(x, chartHeight - total * scale, barWidth, item.new * scale);
            }
        });

        // Draw AOV line
        ctx.beginPath();
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        data.forEach((item, i) => {
            const x = 40 + i * (barWidth + gap) + barWidth / 2;
            const y = chartHeight - (item.aov * chartHeight) / 100;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw dots on AOV line
        data.forEach((item, i) => {
            const x = 40 + i * (barWidth + gap) + barWidth / 2;
            const y = chartHeight - (item.aov * chartHeight) / 100;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#666';
            ctx.stroke();
        });
    }, []);

    const salesCategoryColumns = [
        { accessor: 'categoryName', title: 'Category Name' },
        { accessor: 'netSales', title: 'Net Sales' },
        { accessor: 'grossMargin', title: 'Gross Margin' },
    ];
    const dayOfWeekColumns = [
        { accessor: 'dayOfWeek', title: 'Day of Week', type: 'string' },
        { accessor: 'netSales', title: 'Net Sales', type: 'currency' },
        { accessor: 'aov', title: 'AOV', type: 'currency' },
        { accessor: 'orderCount', title: 'Order Count', type: 'number' },
        // { accessor: 'customerCount', title: 'Customer Count' },
        { accessor: 'marginPercent', title: 'Margin %', type: 'percentage' },
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
    // Draw chart on mount and window resize
    useEffect(() => {
        drawChart();
        window.addEventListener('resize', drawChart);
        return () => window.removeEventListener('resize', drawChart);
    }, [drawChart]);

    // simpleColumnStackedOptions
    const combinedChartData: any = {
        series: [
            {
                name: 'PRODUCT A',
                type: 'bar',
                data: [44, 55, 41, 67, 22, 43],
            },
            {
                name: 'PRODUCT B',
                type: 'bar',
                data: [13, 23, 20, 8, 13, 27],
            },
            {
                name: 'Sales',
                type: 'line', // Specify the type for the line chart
                data: [45, 55, 75, 25, 45, 110],
            },
        ],
        options: {
            chart: {
                height: 300,
                type: 'line',
                stacked: false, // Set to false as we are mixing types
                zoom: { enabled: false },
                toolbar: { show: false },
            },
            colors: ['#2196f3', '#3b3f5c', '#4361EE'], // Include color for line chart
            plotOptions: {
                bar: {
                    horizontal: false,
                },
            },
            xaxis: {
                categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT', '01/05/2011 GMT', '01/06/2011 GMT'],
                axisBorder: {
                    color: '#e0e6ed', // Adjust based on isDark if needed
                },
            },
            yaxis: {
                opposite: true,
                labels: {
                    offsetX: -20,
                },
            },
            grid: {
                borderColor: '#e0e6ed', // Adjust based on isDark if needed
            },
            legend: {
                position: 'right',
                offsetY: 40,
            },
            tooltip: {
                shared: true, // Show tooltips for all series
                intersect: false,
                theme: 'light', // Adjust based on isDark if needed
            },
        },
    };

    //Revenue Chart
    const revenueChart: any = {
        series: [
            {
                name: 'Net Sales',
                data: dayOfWeekData?.map(item => truncateToTwoDecimals(item?.netSales)) || [],
            },
            {
                name: 'AOV',
                data: dayOfWeekData?.map(item => truncateToTwoDecimals(item?.aov)) || [],
            },
            {
                name: 'Order Count',
                data: dayOfWeekData?.map(item => truncateToTwoDecimals(item?.orderCount)) || [],
            },
            {
                name: 'Margin',
                data: dayOfWeekData?.map(item => truncateToTwoDecimals(item?.marginPercent)) || [],
            },
        ],
        options: {
            chart: {
                height: 325,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },

            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                curve: 'smooth',
                width: 2,
                lineCap: 'square',
            },
            dropShadow: {
                enabled: true,
                opacity: 0.2,
                blur: 10,
                left: -7,
                top: 22,
            },
            colors: isDark ? ['green', '#2196F3', '#E7515A', 'yellow' ] : ['green', '#1B55E2', '#E7515A', 'yellow'],
            markers: {
                discrete: [
                    {
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        fillColor: '#1B55E2',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                    {
                        seriesIndex: 1,
                        dataPointIndex: 5,
                        fillColor: '#E7515A',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                ],
            },
            // labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            labels: dayOfWeekData?.map(item => item?.dayOfWeek) || [],
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    show: true,
                },
                labels: {
                    offsetX: 0,
                    offsetY: 5,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-xaxis-title',
                    },
                },
            },
            yaxis: {
                tickAmount: 7,
                labels: {
                    formatter: (value: number) => {
                        return value;
                    },
                    offsetX: -10,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-yaxis-title',
                    },
                },
                opposite: false,
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '16px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5,
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                x: {
                    show: false,
                },
                y: {
                    formatter: function(value: number, { seriesIndex }: { seriesIndex: number }) {
                        // Add $ for Net Sales (seriesIndex 0)
                        return (seriesIndex == 1 || seriesIndex == 0) ? `$${value}` : seriesIndex == 3 ? `${value}%` : value;
                    }
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: isDark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: isDark ? [100, 100] : [45, 100],
                },
            },
        },
    };

    const donutChartData = {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
            },
        ],
        };

    //Sales By Category
    // const salesByCategory:{
    //     series: number[];
    //     options: any;
    // } = {
    //     series: salesByCategoryData?.map(item => Number(truncateToTwoDecimals(item?.netSales || 0))) || [],
    //     options: {
    //         chart: {
    //             type: 'bar',
    //             height: 460,
    //             fontFamily: 'Nunito, sans-serif',
    //             toolbar: {
    //                 show: false,
    //             },
    //         },
    //         plotOptions: {
    //             bar: {
    //                 horizontal: false,
    //                 columnWidth: '55%',
    //                 endingShape: 'rounded',
    //                 borderRadius: 6,
    //                 distributed: true,
    //             },
    //         },
    //         colors: salesByCategoryData?.map(item => item?.categoryColor || '#888ea8') || [],
    //         dataLabels: {
    //             enabled: false,
    //         },
    //         stroke: {
    //             show: true,
    //             width: 2,
    //             colors: ['transparent'],
    //         },
    //         xaxis: {
    //             categories: salesByCategoryData?.map(item => item?.categoryName || 'Unknown') || [],
    //             axisBorder: {
    //                 show: false,
    //             },
    //             axisTicks: {
    //                 show: false,
    //             },
    //             labels: {
    //                 style: {
    //                     colors: isDark ? '#bfc9d4' : '#888ea8',
    //                     fontSize: '12px',
    //                 },
    //             },
    //         },
    //         yaxis: {
    //             title: {
    //                 text: 'Net Sales ($)',
    //                 style: {
    //                     color: isDark ? '#bfc9d4' : '#888ea8',
    //                     fontSize: '14px',
    //                 },
    //             },
    //             labels: {
    //                 formatter: function(value: number) {
    //                     return `$${truncateToTwoDecimals(value)}`;
    //                 },
    //                 style: {
    //                     colors: isDark ? '#bfc9d4' : '#888ea8',
    //                     fontSize: '12px',
    //                 },
    //             },
    //         },
    //         fill: {
    //             opacity: 1,
    //         },
    //         tooltip: {
    //             y: {
    //                 formatter: function(value: number) {
    //                     return `$${truncateToTwoDecimals(value)}`;
    //                 },
    //             },
    //             theme: isDark ? 'dark' : 'light',
    //         },
    //         grid: {
    //             borderColor: isDark ? '#191E3A' : '#E0E6ED',
    //             strokeDashArray: 5,
    //             xaxis: {
    //                 lines: {
    //                     show: false,
    //                 },
    //             },
    //             yaxis: {
    //                 lines: {
    //                     show: true,
    //                 },
    //             },
    //         },
    //         legend: {
    //             show: false,
    //         },
    //         responsive: [{
    //             breakpoint: 480,
    //             options: {
    //                 chart: {
    //                     height: 300
    //                 },
    //                 plotOptions: {
    //                     bar: {
    //                         columnWidth: '70%',
    //                     }
    //                 }
    //             }
    //         }]
    //     },
    // };

    return (
        <div className="p-6 mx-auto">
            {/* Filters */}
            {/* <div className="flex gap-2 mb-6">
        <select 
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="border max-w-32 rounded px-3 py-1.5 form-select mr-2 text-dark dark:text-white-dark"
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="border max-w-40 rounded px-3 py-1.5 form-select mr-2 text-dark dark:text-white-dark"
        >
          <option>1 Store Selected</option>
          <option>All Stores</option>
        </select>
        <button className="btn btn-primary text-white py-1.5 px-3 !text-sm rounded">
          Go
        </button>
      </div> */}
            <div className="relative inline-flex align-middle mb-2 w-full">
                <button
                    type="button"
                    className={`btn ltr:rounded-r-none rtl:rounded-l-none ${
                        statusForFilter == 'yesterday' ? 'btn-primary' : 'btn-outline-primary '
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
                    className={`btn rounded-none ${
                        statusForFilter == 'today' ? 'btn-primary' : 'btn-outline-primary '
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
                    className={`btn ltr:rounded-l-none rtl:rounded-r-none ${
                        statusForFilter == 'custom' ? 'btn-primary' : 'btn-outline-primary'
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
                        <button className="btn btn-primary mx-2 block" onClick={getSalesIndexData}>
                            Submit
                        </button>
                    </div>
                )}
                <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="border rounded !w-60 px-3 py-1.5 form-select mr-2 text-dark dark:text-white-dark ml-2">
                    <option value="all">All</option>
                    {dispensaryData &&
                        dispensaryData.map((item) => {
                            return <option key={item?.id} id={item?.id}>{item?.name}</option>;
                        })}
                </select>
            </div>
            <div>
                {insightSummaryRowData.isFetching || insightSummaryRowData.isLoading ? <MetrcsCardSkeleton/> : 
                <div className='flex flex-col p-3 mb-3 bg-white dark:bg-black shadow-sm rounded-lg'>
                    <div className='flex justify-end items-center text-lg mb-1'>
                        <BiRefresh className='cursor-pointer text-2xl text-gray-400' onClick={() => insightSummaryRowData.refetch()}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                        <MetricCard title="Net Sales" value={`$${insightSummaryData?.netSales || '0'}`} />
                        <MetricCard title="AOV" value={`$${insightSummaryData?.aov || '0'}`} />
                        <MetricCard title="# Orders" value={(insightSummaryData?.orderCount || 0).toString()} />
                        <MetricCard title="# Customers" value={(insightSummaryData?.customerCount || 0).toString()} />
                        <MetricCard title="Margin %" value={`${insightSummaryData?.marginPercent.toFixed(1) || '0'}%`} />
                    </div>
                </div>}
                <div className=''>
                <div className="mb-6 grid gap-3 xl:grid-cols-3">
                    {dayOfWeekRowData.isFetching || dayOfWeekRowData.isLoading ? <DayOfWeekSkeleton/> :
                    <div className="panel h-full xl:col-span-2">
                        <div className="mb-5 flex items-center justify-between dark:text-white-light">
                            <h5 className="text-lg font-semibold text-dark dark:text-white-dark">Day of Week</h5>
                            {/* <div className="dropdown">
                                <Dropdown
                                    offset={[0, 1]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />}
                                >
                                    <ul>
                                        <li>
                                            <button type="button">Weekly</button>
                                        </li>
                                        <li>
                                            <button type="button">Monthly</button>
                                        </li>
                                        <li>
                                            <button type="button">Yearly</button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div> */}
                        <BiRefresh className='cursor-pointer text-2xl text-gray-400' onClick={() => dayOfWeekRowData.refetch()}/>
                        </div>
                        <p className="text-lg dark:text-white-light/90">
                            {/* Total Profit <span className="ml-2 text-primary">$10,840</span> */}
                        </p>
                        <div className="relative">
                            <div className="rounded-lg bg-white dark:bg-black">
                                {!dayOfWeekRowData?.isLoading ? (
                                    <ReactApexChart series={revenueChart.series} options={revenueChart.options} type="area" height={325} width={'100%'} />
                                ) : (
                                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>}

                    {salesByCategoryRowData.isFetching || salesByCategoryRowData.isLoading ? <CategoryBySalesChartSkeleton/> :
                    <div className="panel h-full">
                        <div className="mb-5 flex justify-between items-center">
                            <h5 className="text-lg font-semibold text-dark dark:text-white-dark">Sales By Category</h5>
                            <BiRefresh className='cursor-pointer text-2xl text-gray-400' onClick={() => salesByCategoryRowData.refetch()}/>
                        </div>
                        <div>
                            <div className="rounded-lg bg-white dark:bg-black">
                                {!dayOfWeekRowData?.isLoading ? (
                                    <DoughnutChart data={salesByCategoryData} isDark={isDark} />
                                ) : (
                                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>}
                    </div>
                </div>
                <div className="flex justify-between items-start">
                    {dayOfWeekRowData.isFetching || dayOfWeekRowData.isLoading ? <div className='w-4/6 mr-3'><TableSkeleton/></div> :
                    <div className="panel border rounded-lg dark:border-[#1b2e4b] w-4/6 mr-3">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-medium">Day of Week</h3>
                            <button className="text-gray-400">
                                <BiRefresh className='cursor-pointer text-2xl' onClick={() => dayOfWeekRowData.refetch()}/>
                            </button>
                        </div>
                            <DayOfWeekTable tableData={dayOfWeekData || []} columns={dayOfWeekColumns} />
                    </div>}
                    {salesByCategoryRowData.isFetching || salesByCategoryRowData.isLoading ? <div className='w-2/6'><TableSkeleton/></div> :
                    <div className="panel border rounded-lg p-4 dark:border-[#1b2e4b] w-2/6">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-medium">Sales by Category</h3>
                            <button className="text-gray-400">
                                <BiRefresh className='cursor-pointer text-2xl' onClick={() => salesByCategoryRowData.refetch()}/>
                            </button>
                        </div>
                            <MetricsTable tableData={salesByCategoryData || []} columns={salesCategoryColumns} />
                    </div>}
                </div>
            </div>

            {/* Chart */}
            {/* <div className="panel border rounded-lg p-4 dark:border-[#1b2e4b]">
                <div className="flex justify-between mb-4">
                <h3 className="font-medium">Sales, Status & AOV over Time</h3>
                <button className="text-gray-400">•••</button>
                </div>
                <div className="h-[300px]">
                <canvas ref={chartRef} className="w-full h-full" />
                </div>

                <ReactApexChart
                    series={combinedChartData.series}
                    options={combinedChartData.options}
                    className="rounded-lg bg-white dark:bg-black overflow-hidden"
                    type="line" // Set to line to allow both types
                    height={300}
                />
            </div> */}
        </div>
    );
}


const DoughnutChart = ({data, isDark}: any) => {
    // Transform salesByCategoryData to doughnut chart format
    const transformedData = (data?.map((item: any) => ({  
        label: item?.categoryName || 'Unknown',  
        value: Number(truncateToTwoDecimals(item?.netSales || 0)),  
        color: item?.categoryColor || '#888ea8',  
        cutout: "65%",  
    })) || []).sort((a: any, b: any) => a.value - b.value);  

    // Calculate total for center text
    const totalSales = transformedData.reduce((sum: number, item: any) => sum + item.value, 0);
   
    const options: any = {
        plugins: {
            responsive: true,
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    padding: 26,
                    boxWidth: 10,
                    boxHeight: 10,
                    color: isDark ? '#bfc9d4' : '#888ea8',
                    font: {
                        size: 12,
                    },
                },
            },
            centerText: {
                display: true,
                text: `$${truncateToTwoDecimals(totalSales)}`,
                font: {
                    size: 24,
                    weight: "bold",
                },
                color: isDark ? '#bfc9d4' : '#888ea8',
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const percentage = ((value / totalSales) * 100).toFixed(1);
                        return `${label}: $${truncateToTwoDecimals(value)} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: "65%",
    }
  
    const centerTextPlugin = {
        id: "centerText",
        beforeDraw: (chart: any) => {
            if (chart.config.options.plugins.centerText.display) {
                const width = chart.width
                const height = chart.height
                const ctx = chart.ctx
                ctx.restore()
                ctx.textBaseline = "middle"
                const { text, font, color } = chart.config.options.plugins.centerText
                ctx.font = `${font.weight} ${font.size}px sans-serif`
                ctx.fillStyle = color || '#888ea8'
                const textX = Math.round((width - ctx.measureText(text).width) / 2)
                const textY = height / 2 - 20

                ctx.fillText(text, textX, textY)
                ctx.save()
            }
        },
    }
  
    const finalData = {
        labels: transformedData.map((item: any) => item?.label),
        datasets: [
            {
                data: transformedData.map((item: any) => item?.value),
                backgroundColor: transformedData.map((item: any) => item?.color),
                borderColor: isDark ? '#0e1726' : '#fff',
                borderWidth: 2,
                dataVisibility: new Array(transformedData.length).fill(true),
            },
        ],
    }
  
    return <Doughnut data={finalData} options={options} plugins={[centerTextPlugin]} />
}