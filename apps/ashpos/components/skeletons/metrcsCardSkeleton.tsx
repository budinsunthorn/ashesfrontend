import React from 'react'

function MetrcsCardSkeleton() {
  return (
    <div className='flex flex-col p-3 mb-3 bg-white dark:bg-black shadow-sm rounded-lg'>
        {/* Metrics Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-8 mt-6">
          {/* Net Sales Card */}
          <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="h-4 bg-gray-200 dark:bg-dark rounded animate-pulse mb-3 w-16"></div>
            <div className="h-8 bg-gray-200 dark:bg-dark rounded animate-pulse w-24"></div>
          </div>
  
          {/* AOV Card */}
          <div className="bg-white rounded-lg border dark:bg-black dark:border-gray-800 border-gray-200 p-4">
            <div className="h-4 bg-gray-200 dark:bg-dark rounded animate-pulse mb-3 w-8"></div>
            <div className="h-8 bg-gray-200 dark:bg-dark rounded animate-pulse w-20"></div>
          </div>
  
          {/* Orders Card */}
          <div className="bg-white dark:bg-black rounded-lg border dark:border-gray-800 border-gray-200 p-4">
            <div className="h-4 bg-gray-200 dark:bg-dark rounded animate-pulse mb-3 w-16"></div>
            <div className="h-8 bg-gray-200 dark:bg-dark rounded animate-pulse w-8"></div>
          </div>
  
          {/* Customers Card */}
          <div className="bg-white dark:bg-black rounded-lg border dark:border-gray-800 border-gray-200 p-4">
            <div className="h-4 bg-gray-200 dark:bg-dark rounded animate-pulse mb-3 w-20"></div>
            <div className="h-8 bg-gray-200 dark:bg-dark rounded animate-pulse w-6"></div>
          </div>
  
          {/* Margin Card */}
          <div className="bg-white dark:bg-black rounded-lg border dark:border-gray-800 border-gray-200 p-4">
            <div className="h-4 bg-gray-200 dark:bg-dark rounded animate-pulse mb-3 w-16"></div>
            <div className="h-8 bg-gray-200 dark:bg-dark rounded animate-pulse w-16"></div>
          </div>
        </div>
    </div>
  )
}

export default MetrcsCardSkeleton