import React from 'react';
import ProductCategory from './productCategory';
import { truncateToTwoDecimals } from '@/lib/utils';

interface ColumnDefinition {
  accessor: string;
  title: string;
}
interface SalesCategoryData {
  categoryName: string;
  totalAmount: number;
  totalDiscountedAmount: number;
  totalLoyaltyAmount: number;
  totalCostAmount: number;
  netSales: number;
  grossMargin: number;
  [key: string]: string | number; // Add index signature
}

interface TableProps {
  tableData: (SalesCategoryData | null)[];
  columns: ColumnDefinition[];
}

export default function MetricsTable({ tableData, columns }: TableProps) {

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    return String(value);
  };

  console.log("tableData", tableData)

  const getColumnMax = (accessor: string): number => {
    return Math.max(...tableData.filter((row): row is SalesCategoryData => row !== null).map(row => {
      const value = row[accessor];
      return typeof value === 'number' ? value : 0;
    }));
  };
  const getColumnMin = (accessor: string): number => {
    return Math.min(...tableData.filter((row): row is SalesCategoryData => row !== null).map(row => {
      const value = row[accessor];
      return typeof value === 'number' ? value : 0;
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
    return (Number(value + Math.abs(min * 2 )) / (max + Math.abs(min * 2))) * 100;

  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse table-hover">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th key={column.accessor} className={`p-2 ${column.accessor == 'categoryName' ? ' text-left' : 'text-right'} font-semibold`}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b !border-gray-300 dark:!border-gray-800">
              {columns.map((column) => (
                <td key={column.accessor} className="p-2 relative text-dark-white dark:text-white-dark">
                {row && (
                  <>
                    <div 
                      className={`absolute inset-y-0 left-0  ${Number(row[column.accessor]) <= 0 ? "bg-[#e7cccc] dark:bg-[#2f1616]" : "bg-blue-100/50 dark:bg-blue-950/40"}` }
                      style={{ width: `${getPercentage(row[column.accessor], column.accessor)}%` }}
                    />
                    <span className="relative">
                      {column.accessor == "categoryName" ? 
                      <div className=''><ProductCategory name={row['categoryName']} color={row['categoryColor'] as string} /></div> : 
                      column.accessor == "grossMargin" ? 
                      <div className="flex justify-end items-center gap-2">
                        <p className="text-[16px]">{truncateToTwoDecimals(Number(row[column.accessor]))}</p> 
                        <p className="text-sm">%</p>
                      </div>
                      : column.accessor == "netSales" ? 
                      <div className="flex justify-end items-center gap-2">
                        <p className="text-sm">$</p>
                        <p className="text-[16px]">{truncateToTwoDecimals(Number(row[column.accessor]))}</p> 
                      </div>
                      : <p className="text-[16px]">{row[column.accessor]}</p>}
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

