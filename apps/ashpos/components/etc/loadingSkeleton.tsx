import React from 'react'

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-[#0f1727] text-gray-700 dark:text-gray-300 p-4 mt-3 mx-auto rounded-md w-full max-w-md shadow-sm dark:shadow-none">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="h-7 w-1/2 bg-gray-200 dark:bg-[#1e263c] rounded animate-pulse mb-2"></div>

        {/* Product Title Bar */}
        <div className="bg-blue-50 dark:bg-[#1a3a2a] p-3 rounded-md">
          <div className="h-6 w-3/4 bg-blue-100 dark:bg-[#2a4a3a] rounded animate-pulse"></div>
        </div>

        {/* Product ID */}
        <div className="h-6 w-1/3 bg-gray-200 dark:bg-[#1e263c] rounded animate-pulse"></div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-4">
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index}>
              {/* Label column */}
              <div
                className={`h-5 w-${index % 2 === 0 ? "3/4" : "2/3"} bg-gray-200 dark:bg-[#1e263c] rounded animate-pulse`}
              ></div>

              {/* Value column */}
              <div
                className={`h-5 w-${index % 3 === 0 ? "full" : index % 2 === 0 ? "1/2" : "1/3"} bg-gray-200 dark:bg-[#1e263c] rounded animate-pulse`}
              ></div>
            </div>
          ))}
        </div>

        {/* Hide Details Button */}
        <div className="mt-4">
          <div className="h-8 w-24 bg-gray-200 dark:bg-[#1e263c] rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton

