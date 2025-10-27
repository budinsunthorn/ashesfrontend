import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { spinnerAtom } from '@/store/spinnerStatus';

import IconFile from '@/components/icon/icon-file';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns } from 'react-icons/bs';
import * as FileSaver from 'file-saver';
import ExcelJS, { Column, Worksheet } from 'exceljs';
import { IoCloudDownloadOutline } from 'react-icons/io5';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { formatDate } from '@/utils/datetime';
import { userDataSave } from '@/store/userData';
import { useAllPackagesByDispensaryIdWithPagesQuery } from '@/src/__generated__/operations';
import { PRINTLIMIT } from '@/utils/variables';
import { BiLoaderAlt } from 'react-icons/bi';

import Cookies from 'universal-cookie';

interface ExportTableProps {
    cols: any; // Replace 'any' with the appropriate type
    // recordsData: any; // Replace 'any' with the appropriate type
    hideCols?: any; // Optional property, replace 'any' with the appropriate type
    filename: string;
    query: string;
    variables: any;
}

function returnStringValue(value: any) {
    if (value === true || value === false) {
        return value == true ? 'True' : 'False';
    } else return value;
}

function TableExport({ cols, hideCols, filename, query, variables }: ExportTableProps) {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const cookies = new Cookies();
    const token = cookies.get('token');

    const fetchPackages = async () => {
        console.log('fetchPackage ---------->');
        setSpinnerStatus({
            isLoading: true,
            text: 'Exporting Table Data...',
        });

        // const variables = {
        //     dispensaryId: dispensaryId,
        //     packageStatus: packageStatus,
        //     assignedStatus: assignedStatus,
        //     pageNumber: 1,
        //     onePageRecords: PRINTLIMIT,
        //     searchField: searchField,
        //     searchParam: searchParam,
        //     sortField: sortField,
        //     sortDirection: sortDirection,
        // };

        try {
            const url = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://192.168.141.155:4000/ashpos';
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token // if needed
                },
                body: JSON.stringify({
                    query,
                    variables,
                }),
            });

            const json = await res.json();
            console.log('json.data', json.data);
            console.log("filename", filename)
            if(filename == 'package') {
                return json.data.allPackagesByDispensaryIdWithPages.packages;
            } else if(filename == 'transfer') {
                console.log('json.data.allTransfersByDispensaryIdAndTransferTypeAndStatusWithPages', json.data.allTransfersByDispensaryIdAndTransferTypeAndStatusWithPages);
                return json.data.allTransfersByDispensaryIdAndTransferTypeAndStatusWithPages?.transfers;
            } else if(filename == 'order') {
                return json.data.allOrdersByDispensaryIdAndStatusAndOrderTypeAndSearchParamWithPages?.orders
            }
        } catch (e) {
            console.error('Error in fetch GraphQL: ', e);
            setSpinnerStatus({});
        }
    };

    const export_filename = filename + '_table_data_' + formatDate(new Date(Date.now()));

    const [spinnerStatus, setSpinnerStatus] = useAtom(spinnerAtom);

    const capitalize = (text: any) => {
        return text
            .replace('_', ' ')
            .replace('-', ' ')
            .toLowerCase()
            .split(' ')
            .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    };
    const exportTable = async (type: any) => {
        const packageData = await fetchPackages();
        console.log("packageData ----------->", packageData);
        let columns: any = cols;
        let records = packageData;
        let newVariable: any;
        newVariable = window.navigator;
        if (type === 'csv') {
            let coldelimiter = ';';
            let linedelimiter = '\n';
            let result = '';
            columns.map((d: any) => {
                // if (!hideCols.includes(d.accessor)) {
                result += capitalize(d.title) + coldelimiter;
                // }
            });
            result += linedelimiter;
            records?.map((item: any, i: any) => {
                result += i + 1 + coldelimiter;
                columns.map((d: any, index: any) => {
                    // if (!hideCols.includes(d.accessor)) {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = ' ';
                    if (d.accessor.includes('.')) {
                        const accessorParts = d.accessor.split('.');
                        if (accessorParts.length === 2) {
                            // Handle single level nesting (e.g., package.name)

                            if (item[accessorParts[0]] && item[accessorParts[0]][accessorParts[1]]) {
                                // console.log("item ------>", item[accessorParts[0]][accessorParts[1]])
                                val = item[accessorParts[0]][accessorParts[1]];
                            } else val = item[d.accessor] ? item[d.accessor] : '';
                        } else if (accessorParts.length === 3) {
                            // Handle double level nesting (e.g., package.product.name)
                            if (item[accessorParts[0]] && item[accessorParts[0]][accessorParts[1]] && item[accessorParts[0]][accessorParts[1]][accessorParts[2]]) {
                                val = item[accessorParts[0]][accessorParts[1]][accessorParts[2]];
                            } else val = item[d.accessor] ? item[d.accessor] : '';
                        } else {
                            val = item[d.accessor] ? item[d.accessor] : '';
                        }
                    } else {
                        val = item[d.accessor] ? item[d.accessor] : '';
                    }
                    if(d.title.includes('Cost')) {
                        result += '$' + returnStringValue(val);
                    } else {
                        result += returnStringValue(val);
                    }
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/csv/i) && !newVariable.msSaveOrOpenBlob) {
                var data = 'data:application/csv;charset=utf-8,' + encodeURIComponent(result);
                var link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('download', export_filename + '.csv');
                link.click();
            } else {
                var blob = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob, export_filename + '.csv');
                }
            }
            setSpinnerStatus({});
        } else if (type === 'xls') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data');
            // Add header row with styles
            // const headerRow = worksheet.addRow(['#', ...columns.map((d: any) => (!hideCols.includes(d.accessor) ? d.title : null)).filter(Boolean)]);
            const headerRow = worksheet.addRow(['#', ...columns.map((d: any) => d.title).filter(Boolean)]);
            headerRow.font = { bold: true };
            headerRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.fill = {
                    // Background color for header
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFB7C9E8' }, // Light blue color
                };
            });

            // Add data rows with borders
            records.forEach((item: any, i: any) => {
                const rowData = [i + 1];
                columns.forEach((d: any) => {
                    // if (!hideCols.includes(d.accessor)) {
                    let val = ' ';
                    let result = '';

                    if (d.accessor.includes('.')) {
                        const accessorParts = d.accessor.split('.');
                        if (accessorParts.length === 2) {
                            // Handle single level nesting (e.g., package.name)
                            // console.log('accessor ------> ', accessorParts);
                            // console.log('item ------>', item[accessorParts[0]][accessorParts[1]]);
                            if (item[accessorParts[0]] && item[accessorParts[0]][accessorParts[1]]) {
                                val = item[accessorParts[0]][accessorParts[1]];
                            } else val = item[d.accessor] ? item[d.accessor] : '';
                        } else if (accessorParts.length === 3) {
                            // Handle double level nesting (e.g., package.product.name)
                            // console.log('item --------->', item[accessorParts[0]][accessorParts[1]][accessorParts[2]]);
                            if (item[accessorParts[0]] && item[accessorParts[0]][accessorParts[1]] && item[accessorParts[0]][accessorParts[1]][accessorParts[2]]) {
                                val = item[accessorParts[0]][accessorParts[1]][accessorParts[2]];
                            } else val = item[d.accessor] ? item[d.accessor] : '';


                        } else {
                            val = item[d.accessor] ? item[d.accessor] : '';
                        }
                    } else {
                        val = item[d.accessor] ? item[d.accessor] : '';
                    }

                    if(d.title.includes('Cost')) {
                        result += '$' + returnStringValue(val);
                    } else {
                        result += returnStringValue(val);
                    }

                    rowData.push(result);
                    // }
                });
                const row = worksheet.addRow(rowData);
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                });
            });

            // Set column widths
            worksheet.columns.forEach((column: Partial<Column>) => {
                let maxColumnLength = 0;
                column.eachCell?.({ includeEmpty: true }, (cell) => {
                    const cellValue = cell.value ? cell.value.toString() : '';
                    maxColumnLength = Math.max(maxColumnLength, cellValue.length);
                });
                column.width = maxColumnLength + 2;
                column.alignment = { horizontal: 'center' };
            });

            // Generate Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            const data = new Blob([buffer], { type: 'application/octet-stream' });
            FileSaver.saveAs(data, `${export_filename}.xlsx`);
            setSpinnerStatus({});
        } else if (type === 'txt') {
            let coldelimiter = ',';
            let linedelimiter = '\n';
            let result = '';
            columns.map((d: any) => {
                // if (!hideCols.includes(d.accessor)) {
                result += capitalize(d.title) + coldelimiter;
                // }
            });
            result += linedelimiter;
            records?.map((item: any, i: any) => {
                result += i + 1 + coldelimiter;
                columns.map((d: any, index: any) => {
                    // if (!hideCols.includes(d.accessor)) {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = ' ';
                    if (d.accessor.split('.').length > 1) {
                        const accessorParts = d.accessor.split('.');
                        if (accessorParts.length === 2) {
                            // Handle single level nesting (e.g., package.name)
                            if (item[accessorParts[0]] && item[accessorParts[0]][accessorParts[1]]) {
                                val = item[accessorParts[0]][accessorParts[1]];
                            } else val = item[d.accessor] ? item[d.accessor] : '';
                        } else if (accessorParts.length === 3) {
                            // Handle double level nesting (e.g., package.product.name)
                            if (item[accessorParts[0]] && item[accessorParts[0]][accessorParts[1]] && item[accessorParts[0]][accessorParts[1]][accessorParts[2]]) {
                                val = item[accessorParts[0]][accessorParts[1]][accessorParts[2]];
                            } else val = item[d.accessor] ? item[d.accessor] : '';
                        } else {
                            val = item[d.accessor] ? item[d.accessor] : '';
                        }
                    } else val = item[d.accessor] ? item[d.accessor] : '';
                    
                    if(d.title.includes('Cost')) {
                        result += '$' + returnStringValue(val);
                    } else {
                        result += returnStringValue(val);
                    }
                    // }
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/txt/i) && !newVariable.msSaveOrOpenBlob) {
                var data1 = 'data:application/txt;charset=utf-8,' + encodeURIComponent(result);
                var link1 = document.createElement('a');
                link1.setAttribute('href', data1);
                link1.setAttribute('download', export_filename + '.txt');
                link1.click();
            } else {
                var blob1 = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob1, export_filename + '.txt');
                }
            }
            setSpinnerStatus({});
        }
    };
    // <span className="ltr:mr-1 rtl:ml-1">Export</span>
    // <IconCaretDown className="h-5 w-5" />
    return (
        <Tippy content="Export" placement="top">
            <div className="dropdown">
                <Dropdown
                    placement="bottom-end"
                    btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-2 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                    button={
                        <>
                            <IoCloudDownloadOutline className="text-xl" />
                        </>
                    }
                >
                    <ul className="!min-w-[100px] !py-0">
                        <li className="relative flex items-center hover:bg-gray-100 dark:hover:bg-[#172742] ">
                            <button
                                className="disabled:text-gray-400 disabled:cursor-not-allowed"
                                onClick={() => {
                                    exportTable('xls');
                                }}
                            >
                                <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                <span className="ltr:ml-2 rtl:mr-2 cursor-pointer">EXCEL</span>
                            </button>
                        </li>
                        <li className="relative flex items-center hover:bg-gray-100 dark:hover:bg-[#172742]">
                            <button
                                className="disabled:text-gray-400 disabled:cursor-not-allowed"
                                onClick={() => {
                                    exportTable('csv');
                                }}
                            >
                                <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                <span className="ltr:ml-2 rtl:mr-2 cursor-pointer">CSV</span>
                            </button>
                        </li>
                        <li className="relative flex items-center hover:bg-gray-100 dark:hover:bg-[#172742]">
                            <button
                                className="disabled:text-gray-400 disabled:cursor-not-allowed"
                                onClick={() => {
                                    exportTable('txt');
                                }}
                            >
                                <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                <span className="ltr:ml-2 rtl:mr-2 cursor-pointer">Text</span>
                            </button>
                        </li>
                    </ul>
                </Dropdown>
            </div>
        </Tippy>
    );
}

export default TableExport;
