import React from 'react'

function TableSkeleton() {
  return <div className="w-full bg-white dark:bg-black rounded-lg border dark:border-gray-800 border-gray-200">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 dark:bg-dark rounded animate-pulse w-32"></div>
              <div className="h-6 bg-gray-200 dark:bg-dark rounded animate-pulse w-6"></div>
            </div>
          </div>
  
          {/* Table Content */}
          <div className="overflow-hidden">
            {/* Table Headers */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="h-4 bg-gray-200 dark:bg-dark rounded animate-pulse w-24"></div>
              <div className="h-4 bg-gray-200 dark:bg-dark rounded animate-pulse w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-dark rounded animate-pulse w-20"></div>
            </div>
  
            {/* Table Rows */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                {/* Category Name */}
                <div className="h-4 bg-gray-200 dark:bg-dark rounded animate-pulse w-20"></div>
  
                {/* Net Sales with colored background simulation */}
                <div
                  className={`h-4 rounded animate-pulse w-16 dark:bg-dark ${
                    index === 0
                      ? "bg-blue-200"
                      : index === 2
                        ? "bg-blue-200"
                        : index === 3
                          ? "bg-blue-200"
                          : "bg-gray-200"
                  }`}
                ></div>
  
                {/* Gross Margin with colored background simulation */}
                <div
                  className={`h-4 rounded animate-pulse w-12 dark:bg-dark ${
                    index === 0
                      ? "bg-pink-200"
                      : index === 1
                        ? "bg-pink-200"
                        : index === 3
                          ? "bg-pink-200"
                          : index === 4
                            ? "bg-pink-200"
                            : "bg-gray-200 dark:bg-dark"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>
}

export default TableSkeleton