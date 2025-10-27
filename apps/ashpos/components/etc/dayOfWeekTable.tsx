import { formatCurrency, truncateToTwoDecimals } from '@/lib/utils';
import React from 'react';

interface ColumnDefinition {
  accessor: string;
  title: string;
  type: string;
}
interface DayOfWeekData {
  dayOfWeek: string;
  netSales: number;
  aov: number;
  orderCount: number;
  marginPercent: number;
  [key: string]: string | number; // Add index signature
}

interface TableProps {
  tableData: (DayOfWeekData | null)[];
  columns: ColumnDefinition[];
}

export default function DayOfWeekTable({ tableData, columns }: TableProps) {

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    return String(value);
  };

  const getColumnMax = (accessor: string): number => {
    return Math.max(...tableData.filter((row) => row !== null).map(row => {
      if (row !== null) {
        const value = row[accessor];
        return typeof value === 'number' ? value : 0;
      }
      else return 0;
    }));
  };
  const getColumnMin = (accessor: string): number => {
    return Math.min(...tableData.filter((row) => row !== null).map(row => {
      if (row !== null) {
        const value = row[accessor];
        return typeof value === 'number' ? value : 0;
      } else return 0;
    }));
  };
  const getPercentage = (value: any, accessor: string): number => {

    const max = getColumnMax(accessor);
    const min = getColumnMin(accessor);
    // If all values are 0, return 0
    if (max === 0 && min === 0) return 0;
    let range = 0
    // Calculate the range between min and max
    // if (min < 0) {
    //   range = max + min
    // } else range = max;

    // If range is 0 (all values are the same), return 50%
    // if (range === 0) return 50;

    // Calculate percentage relative to the range
    return (Number(value + Math.abs(min * 2)) / (max + Math.abs(min * 2))) * 100;

  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse table-hover">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th key={column.accessor} className={`p-2 ${column.accessor == 'dayOfWeek' ? 'text-left' : 'text-right'} font-semibold`}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b !border-gray-300 dark:!border-gray-800">
              {columns.map((column) => (
                <td key={column.accessor} className="p-2 relative text-dark-white dark:text-white-dark text-center">
                {row && (
                  <>
                    <div 
                      className={`flex justify-center text-center absolute inset-y-0 left-0  ${Number(row[column.accessor]) <= 0 ? "bg-[#e7cccc]/50 dark:bg-[#2f1616]/40" : "bg-blue-100/50 dark:bg-blue-950/40"}` }
                      style={{ width: `${getPercentage(row[column.accessor], column.accessor)}%` }}
                    />
                      <span className="relative">
                        {column.type === 'currency' ? 
                        <div className="flex justify-end items-center gap-2 z-10">
                          <p className="text-sm">$</p>
                          <p className="text-[16px]">{truncateToTwoDecimals(Number(row[column.accessor]))}</p> 
                        </div>
                        : column.type === 'percentage' 
                        ? <div className="flex justify-end items-center gap-2 z-10">
                          <p className="text-[16px]">{truncateToTwoDecimals(Number(row[column.accessor]))}</p> 
                          <p className="text-sm">%</p>
                        </div>
                        : column.type === 'number' 
                        ? <div className="flex justify-end items-center gap-2 z-10">
                            <p className="text-[16px] z-10">{truncateToTwoDecimals(Number(row[column.accessor]))}</p> 
                          </div>
                        : <div className='flex justify-start items-center z-10'><p className="">{row[column.accessor]}</p></div>}
                      </span>
                  </>
                )}
              </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

